/**
 * Base handler for common direct-onboard logic
 */
const {
  cleanPhoneNumber,
  formatTaxId,
  createVerification,
  buildPersonData,
  createOrUpdatePerson,
  getDefaultCurrency,
} = require('./utils');

class BaseHandler {
  constructor(countryCode) {
    this.countryCode = countryCode;
    this.requiresDirectors = false;
    this.requiresExecutives = false;
    this.usesIBAN = false;
  }

  /**
   * Main handler function
   */
  async handleDirectOnboard(stripe, accountId, reqBody, reqIp) {
    const {
      tos_acceptance_date,
      tos_acceptance_ip,
      business_type,
      business_profile_mcc,
      business_profile_url,
      business_description,
      product_description,
      external_account_object,
      external_account_country,
      external_account_currency,
      external_account_account_number,
      external_account_routing_number,
      external_account_account_holder_name,
      external_account_account_holder_type,
      external_account_card_number,
      external_account_exp_month,
      external_account_exp_year,
      external_account_cvc,
    } = reqBody;

    // Prepare base account update data
    const defaultDescForMcc = (business_profile_mcc === '4816') ? 'Computer Network Services' : undefined;
    const productDescValue = product_description || defaultDescForMcc || business_description || undefined;
    
    const accountUpdateData = {
      tos_acceptance: {
        date: tos_acceptance_date || Math.floor(Date.now() / 1000),
        ip: tos_acceptance_ip || reqIp,
      },
      business_type: business_type || "individual",
      business_profile: {
        mcc: business_profile_mcc,
        url: business_profile_url || undefined,
        product_description: productDescValue,
      },
    };

    // Handle based on business type
    if (business_type === "individual") {
      await this.handleIndividual(accountUpdateData, reqBody);
    } else if (["company", "non_profit", "government_entity"].includes(business_type)) {
      await this.handleCompany(accountUpdateData, reqBody, stripe, accountId);
    }

    // Update the Stripe account
    const updatedAccount = await stripe.accounts.update(accountId, accountUpdateData);

    // Handle external account
    const externalAccount = await this.handleExternalAccount(
      stripe,
      accountId,
      external_account_object,
      external_account_country,
      external_account_currency || getDefaultCurrency(this.countryCode),
      reqBody
    );

    return {
      account: {
        id: updatedAccount.id,
        email: updatedAccount.email,
        country: updatedAccount.country,
        type: updatedAccount.type,
        business_type: updatedAccount.business_type,
        individual: updatedAccount.individual,
        company: updatedAccount.company,
        charges_enabled: updatedAccount.charges_enabled,
        payouts_enabled: updatedAccount.payouts_enabled,
        details_submitted: updatedAccount.details_submitted,
        created: updatedAccount.created,
        requirements: updatedAccount.requirements,
      },
      external_account: externalAccount,
    };
  }

  /**
   * Handle individual business type
   */
  async handleIndividual(accountUpdateData, reqBody) {
    const {
      individual_first_name,
      individual_last_name,
      individual_email,
      individual_phone,
      individual_dob_day,
      individual_dob_month,
      individual_dob_year,
      individual_address_line1,
      individual_address_line2,
      individual_address_city,
      individual_address_state,
      individual_address_postal_code,
      individual_address_country,
      individual_ssn_last_4,
      individual_id_number,
      individual_verification_document_front,
      individual_verification_document_back,
      individual_verification_additional_document_front,
      individual_verification_additional_document_back,
    } = reqBody;

    accountUpdateData.individual = {
      first_name: individual_first_name,
      last_name: individual_last_name,
      email: individual_email,
      phone: cleanPhoneNumber(individual_phone),
      dob: {
        day: individual_dob_day,
        month: individual_dob_month,
        year: individual_dob_year,
      },
      address: {
        line1: individual_address_line1,
        line2: individual_address_line2,
        city: individual_address_city,
        state: individual_address_state,
        postal_code: individual_address_postal_code,
        country: individual_address_country,
      },
    };

    if (reqBody.individual_first_name_kana) {
      accountUpdateData.individual.first_name_kana = reqBody.individual_first_name_kana;
    }
    if (reqBody.individual_last_name_kana) {
      accountUpdateData.individual.last_name_kana = reqBody.individual_last_name_kana;
    }
    if (reqBody.individual_first_name_kanji) {
      accountUpdateData.individual.first_name_kanji = reqBody.individual_first_name_kanji;
    }
    if (reqBody.individual_last_name_kanji) {
      accountUpdateData.individual.last_name_kanji = reqBody.individual_last_name_kanji;
    }

    if (individual_id_number) {
      accountUpdateData.individual.id_number = individual_id_number;
    } else if (individual_ssn_last_4) {
      accountUpdateData.individual.ssn_last_4 = individual_ssn_last_4;
    }

    const verification = createVerification(
      individual_verification_document_front,
      individual_verification_document_back,
      individual_verification_additional_document_front,
      individual_verification_additional_document_back
    );
    if (verification) {
      accountUpdateData.individual.verification = verification;
    }
  }

  /**
   * Handle company business type - to be overridden by country-specific handlers
   */
  async handleCompany(accountUpdateData, reqBody, stripe, accountId) {
    throw new Error('handleCompany must be implemented by country-specific handler');
  }

  /**
   * Handle external account creation
   */
  async handleExternalAccount(stripe, accountId, object, country, currency, reqBody) {
    if (!object) return null;

    try {
      if (object === 'bank_account') {
        const {
          external_account_account_number,
          external_account_routing_number,
          external_account_account_holder_name,
          external_account_account_holder_type,
        } = reqBody;

        if (!external_account_account_number || !country || !currency) {
          return null;
        }

        const bankAccountData = {
          object: 'bank_account',
          country: country,
          currency: currency,
          account_number: external_account_account_number,
        };

        if (external_account_routing_number) {
          bankAccountData.routing_number = external_account_routing_number;
        }
        if (external_account_account_holder_name) {
          bankAccountData.account_holder_name = external_account_account_holder_name;
        }
        if (external_account_account_holder_type) {
          bankAccountData.account_holder_type = external_account_account_holder_type;
        }

        return await stripe.accounts.createExternalAccount(accountId, {
          external_account: bankAccountData,
        });
      } else if (object === 'card') {
        const {
          external_account_card_number,
          external_account_exp_month,
          external_account_exp_year,
          external_account_cvc,
        } = reqBody;

        if (!external_account_card_number || !external_account_exp_month || 
            !external_account_exp_year || !external_account_cvc) {
          return null;
        }

        const cardData = {
          object: 'card',
          number: external_account_card_number,
          exp_month: external_account_exp_month,
          exp_year: external_account_exp_year,
          cvc: external_account_cvc,
        };

        return await stripe.accounts.createExternalAccount(accountId, {
          external_account: cardData,
        });
      }
    } catch (error) {
      console.warn('Failed to create external account:', error.message);
      return null;
    }

    return null;
  }

  /**
   * Helper to get existing person from Stripe account
   */
  async getExistingPerson(stripe, accountId, relationshipType) {
    try {
      const persons = await stripe.accounts.listPersons(accountId);
      return persons.data.find(person => 
        person.relationship && person.relationship[relationshipType] === true
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Helper to create or update directors
   */
  async createDirectors(stripe, accountId, directors) {
    if (!Array.isArray(directors) || directors.length === 0) return;

    for (const d of directors) {
      try {
        const directorData = buildPersonData({
          ...d,
          relationship: {
            director: true,
            title: d.relationship_title,
          },
        });

        await stripe.accounts.createPerson(accountId, directorData);
      } catch (e) {
        // Continue with other directors even if one fails
      }
    }
  }

  /**
   * Helper to create or update executives
   */
  async createExecutives(stripe, accountId, executives) {
    if (!Array.isArray(executives) || executives.length === 0) return;

    for (const ex of executives) {
      try {
        const executiveData = buildPersonData({
          ...ex,
          relationship: {
            executive: true,
            title: ex.relationship_title,
          },
        });

        await stripe.accounts.createPerson(accountId, executiveData);
      } catch (e) {
        // Continue with other executives even if one fails
      }
    }
  }
}

module.exports = BaseHandler;

