/**
 * Sweden-specific handler for direct onboarding
 */
const BaseHandler = require('./BaseHandler');
const {
  cleanPhoneNumber,
  formatTaxId,
  createVerification,
  buildPersonData,
  createOrUpdatePerson,
} = require('./utils');

class SwedenHandler extends BaseHandler {
  constructor() {
    super('SE');
    this.requiresDirectors = true;
    this.requiresExecutives = true;
    this.usesIBAN = true;
  }

  /**
   * Handle company business type for Sweden
   */
  async handleCompany(accountUpdateData, reqBody, stripe, accountId) {
    const {
      company_name,
      company_tax_id,
      company_organisation_number,
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
      representative_ssn_last_4,
      representative_id_number,
      representative_verification_document_front,
      representative_verification_document_back,
      representative_verification_additional_document_front,
      representative_verification_additional_document_back,
      owner_first_name,
      owner_last_name,
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
      owner_ssn_last_4,
      owner_id_number,
      owner_verification_document_front,
      owner_verification_document_back,
      owner_verification_additional_document_front,
      owner_verification_additional_document_back,
      directors,
      executives,
    } = reqBody;

    // Build company address
    const companyAddress = {};
    if (company_address_line1) companyAddress.line1 = company_address_line1;
    if (company_address_line2) companyAddress.line2 = company_address_line2;
    if (company_address_city) companyAddress.city = company_address_city;
    if (company_address_state) companyAddress.state = company_address_state;
    if (company_address_postal_code) companyAddress.postal_code = company_address_postal_code;
    if (company_address_country) companyAddress.country = company_address_country;

    accountUpdateData.company = {
      name: company_name,
      structure: company_structure,
      owners_provided: true,
    };

    if (company_directors_provided === true) {
      accountUpdateData.company.directors_provided = true;
    }
    if (company_executives_provided === true) {
      accountUpdateData.company.executives_provided = true;
    }

    // Format tax ID - Sweden uses SE + 12 digits format
    const taxIdToUse = company_tax_id || company_organisation_number;
    if (taxIdToUse && taxIdToUse.trim() !== '') {
      const formattedTaxId = formatTaxId(taxIdToUse, 'SE');
      if (formattedTaxId) {
        accountUpdateData.company.tax_id = formattedTaxId;
      }
    }

    // Add company phone
    if (representative_phone && representative_phone.trim() !== '') {
      const cleaned = cleanPhoneNumber(representative_phone);
      if (cleaned) {
        accountUpdateData.company.phone = cleaned;
      }
    }

    // Add company address
    if (company_address_line1) {
      accountUpdateData.company.address = companyAddress;
    }

    // Add company verification documents
    const companyVerification = createVerification(
      company_verification_document_front,
      company_verification_document_back,
      null,
      null
    );
    if (companyVerification) {
      accountUpdateData.company.verification = companyVerification;
    }

    // Handle representative person
    const isRepresentativeAlsoOwner = !owner_first_name || owner_first_name.trim() === '';
    const existingRepresentative = await this.getExistingPerson(stripe, accountId, 'representative');

    const representativeData = buildPersonData({
      first_name: representative_first_name,
      last_name: representative_last_name,
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
      ssn_last_4: representative_ssn_last_4,
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

    // Handle additional directors (Sweden requires directors)
    if (Array.isArray(directors) && directors.length > 0) {
      await this.createDirectors(stripe, accountId, directors);
      accountUpdateData.company.directors_provided = true;
    }

    // Handle additional executives (Sweden requires executives)
    if (Array.isArray(executives) && executives.length > 0) {
      await this.createExecutives(stripe, accountId, executives);
      accountUpdateData.company.executives_provided = true;
    }

    // Handle owner person separately if provided
    if (owner_first_name && owner_first_name.trim() !== '') {
      const existingOwner = await this.getExistingPerson(stripe, accountId, 'owner');
      const ownerToCheck = existingOwner && existingOwner.id !== representativePerson.id 
        ? existingOwner 
        : null;

      const ownerData = buildPersonData({
        first_name: owner_first_name,
        last_name: owner_last_name,
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
        ssn_last_4: owner_ssn_last_4,
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
   * Override external account handling to use SEK currency for Sweden
   */
  async handleExternalAccount(stripe, accountId, object, country, currency, reqBody) {
    // Force SEK currency for Sweden
    return await super.handleExternalAccount(stripe, accountId, object, country, 'sek', reqBody);
  }
}

module.exports = SwedenHandler;

