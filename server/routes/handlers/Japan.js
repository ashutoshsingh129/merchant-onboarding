/**
 * Japan-specific handler for direct onboarding
 */
const BaseHandler = require('./BaseHandler');
const {
  cleanPhoneNumber,
  formatTaxId,
  createVerification,
  buildPersonData,
  createOrUpdatePerson,
} = require('./utils');

class JapanHandler extends BaseHandler {
  constructor() {
    super('JP');
    this.requiresDirectors = false;
    this.requiresExecutives = false;
    this.usesIBAN = false;
  }

  /**
   * Handle company business type for Japan
   */
  async handleCompany(accountUpdateData, reqBody, stripe, accountId) {
    const {
      company_name,
      company_name_kana,
      company_tax_id,
      company_registration_number,
      company_structure,
      company_address_line1,
      company_address_line2,
      company_address_city,
      company_address_state,
      company_address_postal_code,
      company_address_country,
      company_directors_provided,
      company_executives_provided,
      company_verification_document_front,
      company_verification_document_back,
      representative_first_name,
      representative_last_name,
      representative_first_name_kana,
      representative_last_name_kana,
      representative_email,
      representative_phone,
      representative_dob_day,
      representative_dob_month,
      representative_dob_year,
      representative_address_line1,
      representative_address_city,
      representative_address_state,
      representative_address_postal_code,
      representative_address_country,
      representative_relationship_representative,
      representative_relationship_executive,
      representative_relationship_director,
      representative_relationship_title,
      representative_id_number,
      representative_verification_document_front,
      representative_verification_document_back,
      representative_verification_additional_document_front,
      representative_verification_additional_document_back,
      owner_first_name,
      owner_last_name,
      owner_first_name_kana,
      owner_last_name_kana,
      owner_email,
      owner_phone,
      owner_dob_day,
      owner_dob_month,
      owner_dob_year,
      owner_address_line1,
      owner_address_city,
      owner_address_state,
      owner_address_postal_code,
      owner_address_country,
      owner_relationship_owner,
      owner_relationship_director,
      owner_relationship_title,
      owner_id_number,
      owner_verification_document_front,
      owner_verification_document_back,
      owner_verification_additional_document_front,
      owner_verification_additional_document_back,
      directors,
      executives,
    } = reqBody;

    const companyAddress = {};
    if (company_address_line1) companyAddress.line1 = company_address_line1;
    if (company_address_line2) companyAddress.line2 = company_address_line2;
    if (company_address_city) companyAddress.city = company_address_city;
    if (company_address_state) companyAddress.state = company_address_state;
    if (company_address_postal_code) companyAddress.postal_code = company_address_postal_code;
    if (company_address_country) companyAddress.country = company_address_country;

    accountUpdateData.company = {
      name: company_name,
      structure: company_structure || 'private_corporation',
      owners_provided: true,
    };

    if (company_name_kana) {
      accountUpdateData.company.name_kana = company_name_kana;
    }

    if (company_directors_provided === true) {
      accountUpdateData.company.directors_provided = true;
    }
    if (company_executives_provided === true) {
      accountUpdateData.company.executives_provided = true;
    }

    const taxIdCandidates = [company_registration_number, company_tax_id];
    for (const candidate of taxIdCandidates) {
      if (candidate && candidate.trim() !== '') {
        const formattedTaxId = formatTaxId(candidate, 'JP');
        if (formattedTaxId) {
          accountUpdateData.company.tax_id = formattedTaxId;
          break;
        }
      }
    }

    if (representative_phone && representative_phone.trim() !== '') {
      const cleaned = cleanPhoneNumber(representative_phone);
      if (cleaned) {
        accountUpdateData.company.phone = cleaned;
      }
    }

    if (company_address_line1) {
      accountUpdateData.company.address = companyAddress;
    }

    const companyVerification = createVerification(
      company_verification_document_front,
      company_verification_document_back,
      null,
      null
    );
    if (companyVerification) {
      accountUpdateData.company.verification = companyVerification;
    }

    const isRepresentativeAlsoOwner = !owner_first_name || owner_first_name.trim() === '';
    const existingRepresentative = await this.getExistingPerson(stripe, accountId, 'representative');

    const representativeData = buildPersonData({
      first_name: representative_first_name,
      last_name: representative_last_name,
      first_name_kana: representative_first_name_kana,
      last_name_kana: representative_last_name_kana,
      email: representative_email,
      phone: representative_phone,
      dob_day: representative_dob_day,
      dob_month: representative_dob_month,
      dob_year: representative_dob_year,
      address_line1: representative_address_line1,
      address_city: representative_address_city,
      address_state: representative_address_state,
      address_postal_code: representative_address_postal_code,
      address_country: representative_address_country,
      id_number: representative_id_number,
      verification_document_front: representative_verification_document_front,
      verification_document_back: representative_verification_document_back,
      verification_additional_document_front: representative_verification_additional_document_front,
      verification_additional_document_back: representative_verification_additional_document_back,
      relationship: {
        representative: representative_relationship_representative,
        executive: representative_relationship_executive,
        director: !!representative_relationship_director,
        owner: isRepresentativeAlsoOwner,
        title: representative_relationship_title,
      },
    });

    const representativePerson = await createOrUpdatePerson(
      stripe,
      accountId,
      existingRepresentative,
      representativeData
    );

    if (Array.isArray(directors) && directors.length > 0) {
      await this.createDirectors(stripe, accountId, directors);
      accountUpdateData.company.directors_provided = true;
    }

    if (Array.isArray(executives) && executives.length > 0) {
      await this.createExecutives(stripe, accountId, executives);
      accountUpdateData.company.executives_provided = true;
    }

    if (owner_first_name && owner_first_name.trim() !== '') {
      const existingOwner = await this.getExistingPerson(stripe, accountId, 'owner');
      const ownerToCheck =
        existingOwner && representativePerson && existingOwner.id === representativePerson.id
          ? null
          : existingOwner;

      const ownerData = buildPersonData({
        first_name: owner_first_name,
        last_name: owner_last_name,
        first_name_kana: owner_first_name_kana,
        last_name_kana: owner_last_name_kana,
        email: owner_email,
        phone: owner_phone,
        dob_day: owner_dob_day,
        dob_month: owner_dob_month,
        dob_year: owner_dob_year,
        address_line1: owner_address_line1,
        address_city: owner_address_city,
        address_state: owner_address_state,
        address_postal_code: owner_address_postal_code,
        address_country: owner_address_country,
        id_number: owner_id_number,
        verification_document_front: owner_verification_document_front,
        verification_document_back: owner_verification_document_back,
        verification_additional_document_front: owner_verification_additional_document_front,
        verification_additional_document_back: owner_verification_additional_document_back,
        relationship: {
          owner: owner_relationship_owner,
          director: !!owner_relationship_director,
          title: owner_relationship_title,
        },
      });

      await createOrUpdatePerson(stripe, accountId, ownerToCheck, ownerData);
    }
  }

  /**
   * Override external account handling for Japan-specific bank fields
   */
  async handleExternalAccount(stripe, accountId, object, country, currency, reqBody) {
    if (object === 'bank_account' && country === 'JP') {
      const {
        external_account_account_number,
        external_account_bank_code,
        external_account_branch_code,
        external_account_account_holder_name,
        external_account_account_holder_type,
        external_account_account_type,
        external_account_account_holder_name_kana,
      } = reqBody;

      if (!external_account_account_number) {
        return null;
      }

      const bankAccountData = {
        object: 'bank_account',
        country: 'JP',
        currency: currency || 'jpy',
        account_number: external_account_account_number,
      };

      if (external_account_bank_code) {
        bankAccountData.bank_code = external_account_bank_code;
      }
      if (external_account_branch_code) {
        bankAccountData.branch_code = external_account_branch_code;
      }
      if (external_account_account_holder_name) {
        bankAccountData.account_holder_name = external_account_account_holder_name;
      }
      if (external_account_account_holder_type) {
        bankAccountData.account_holder_type = external_account_account_holder_type;
      }
      if (external_account_account_holder_name_kana) {
        bankAccountData.account_holder_name_kana = external_account_account_holder_name_kana;
      }
      if (external_account_account_type) {
        const mappedType = this.mapJapanAccountType(external_account_account_type);
        if (mappedType) {
          bankAccountData.account_type = mappedType;
        }
      }

      try {
        return await stripe.accounts.createExternalAccount(accountId, {
          external_account: bankAccountData,
        });
      } catch (error) {
        console.warn('Failed to create Japan bank account:', error.message);
        return null;
      }
    }

    return await super.handleExternalAccount(stripe, accountId, object, country, currency, reqBody);
  }

  mapJapanAccountType(accountType) {
    const normalized = (accountType || '').toLowerCase();
    if (normalized === 'savings' || normalized === 'ordinary' || normalized === 'futsu') {
      return 'futsu';
    }
    if (normalized === 'checking' || normalized === 'current' || normalized === 'toza') {
      return 'toza';
    }
    return undefined;
  }
}

module.exports = JapanHandler;


