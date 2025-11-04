/**
 * Common utility functions for country-specific handlers
 */

/**
 * Clean phone number to E.164 format
 */
const cleanPhoneNumber = (phone) => {
  if (!phone || phone.trim() === '') return undefined;
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.startsWith('+') && cleaned.replace(/\D/g, '').length >= 8 ? cleaned : undefined;
};

/**
 * Format tax ID based on country
 */
const formatTaxId = (taxId, country) => {
  if (!taxId || taxId.trim() === '') return undefined;
  
  const upperTaxId = taxId.trim().toUpperCase();
  
  if (country === 'SE') {
    // Swedish format: SE followed by 12 digits
    if (upperTaxId.startsWith('SE') && upperTaxId.length === 14) {
      const digits = upperTaxId.substring(2).replace(/\D/g, '');
      if (digits.length === 12) {
        return upperTaxId;
      }
    } else {
      // Try to parse as organisation number and add SE prefix
      const digits = upperTaxId.replace(/\D/g, '');
      if (digits.length === 12) {
        return 'SE' + digits;
      }
    }
  } else {
    // For other countries: 8-12 digit number
    const cleanTaxId = taxId.replace(/[^\d]/g, '');
    if (cleanTaxId.length >= 8 && cleanTaxId.length <= 12) {
      return cleanTaxId;
    }
  }
  
  return undefined;
};

/**
 * Create verification document object
 */
const createVerificationDoc = (front, back) => {
  if (!front && !back) return undefined;
  const doc = {};
  if (front) doc.front = front;
  if (back) doc.back = back;
  return doc;
};

/**
 * Create verification object with document and additional document
 */
const createVerification = (docFront, docBack, additionalDocFront, additionalDocBack) => {
  if (!docFront && !docBack && !additionalDocFront && !additionalDocBack) return undefined;
  
  const verification = {};
  
  const document = createVerificationDoc(docFront, docBack);
  if (document) verification.document = document;
  
  const additionalDocument = createVerificationDoc(additionalDocFront, additionalDocBack);
  if (additionalDocument) verification.additional_document = additionalDocument;
  
  return verification;
};

/**
 * Build person data object
 */
const buildPersonData = (data) => {
  const personData = {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: cleanPhoneNumber(data.phone),
    dob: data.dob_day && data.dob_month && data.dob_year ? {
      day: data.dob_day,
      month: data.dob_month,
      year: data.dob_year,
    } : undefined,
    address: data.address_line1 ? {
      line1: data.address_line1,
      city: data.address_city,
      state: data.address_state,
      postal_code: data.address_postal_code,
      country: data.address_country,
    } : undefined,
    relationship: data.relationship || {},
  };

  // Add ID number or SSN
  if (data.id_number) {
    personData.id_number = data.id_number;
  } else if (data.ssn_last_4) {
    personData.ssn_last_4 = data.ssn_last_4;
  }

  // Add verification documents
  const verification = createVerification(
    data.verification_document_front,
    data.verification_document_back,
    data.verification_additional_document_front,
    data.verification_additional_document_back
  );
  if (verification) {
    personData.verification = verification;
  }

  return personData;
};

/**
 * Create or update a person
 */
const createOrUpdatePerson = async (stripe, accountId, existingPerson, personData) => {
  if (existingPerson) {
    return await stripe.accounts.updatePerson(accountId, existingPerson.id, personData);
  } else {
    return await stripe.accounts.createPerson(accountId, personData);
  }
};

/**
 * Get default currency for country
 */
const getDefaultCurrency = (country) => {
  const code = (country || '').toUpperCase();
  if (code === 'SE') return 'sek';
  if (code === 'FR') return 'eur';
  return 'usd';
};

module.exports = {
  cleanPhoneNumber,
  formatTaxId,
  createVerificationDoc,
  createVerification,
  buildPersonData,
  createOrUpdatePerson,
  getDefaultCurrency,
};

