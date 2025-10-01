const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Create a new Stripe account
router.post("/create-account", async (req, res) => {
  try {
    const { type, country, email, business_type, capabilities } = req.body;

    // Validate required fields
    if (!type || !country || !email) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["type", "country", "email"],
      });
    }

    // Create Stripe account
    const account = await stripe.accounts.create({
      type: type,
      country: country,
      email: email,
      business_type: business_type || "individual",
      capabilities: capabilities || {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    res.json({
      success: true,
      account_id: account.id,
      account: {
        id: account.id,
        email: account.email,
        country: account.country,
        type: account.type,
        business_type: account.business_type,
        created: account.created,
      },
    });
  } catch (error) {
    console.error("Error creating Stripe account:", error);
    res.status(500).json({
      error: "Failed to create Stripe account",
      message: error.message,
    });
  }
});

// Create account link for onboarding
router.post("/create-account-link", async (req, res) => {
  try {
    const { account_id, refresh_url, return_url } = req.body;

    // Validate required fields
    if (!account_id) {
      return res.status(400).json({
        error: "Missing required field: account_id",
      });
    }

    // Create account link
    const accountLink = await stripe.accountLinks.create({
      account: account_id,
      refresh_url:
        refresh_url ||
        process.env.REFRESH_URL ||
        "https://localhost:3000/reauth",
      return_url:
        return_url || process.env.RETURN_URL || "https://localhost:3000/return",
      type: "account_onboarding",
    });

    res.json({
      success: true,
      url: accountLink.url,
      expires_at: accountLink.expires_at,
    });
  } catch (error) {
    console.error("Error creating account link:", error);
    res.status(500).json({
      error: "Failed to create account link",
      message: error.message,
    });
  }
});

// Direct merchant onboarding with complete details
router.post("/direct-onboard", async (req, res) => {
  try {
    const {
      account_id,
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
      tos_acceptance_date,
      tos_acceptance_ip,
      business_type,
      business_profile_mcc,
      business_profile_url,
      // Company fields (for company business_type)
      company_name,
      company_tax_id,
      company_structure,
      company_address_line1,
      company_address_line2,
      company_address_city,
      company_address_state,
      company_address_postal_code,
      company_address_country,
      // Representative fields (for company business_type)
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
      representative_relationship_owner,
      representative_relationship_title,
      representative_ssn_last_4,
      external_account_object,
      external_account_country,
      external_account_currency,
      external_account_account_number,
    } = req.body;

    // Validate required fields
    if (!account_id) {
      return res.status(400).json({
        error: "Missing required field: account_id",
      });
    }

    // Prepare the account update data based on business_type
    const accountUpdateData = {
      tos_acceptance: {
        date: tos_acceptance_date || Math.floor(Date.now() / 1000),
        ip: tos_acceptance_ip || req.ip,
      },
      business_type: business_type || "individual",
      business_profile: {
        mcc: business_profile_mcc,
        url: business_profile_url || undefined, // Only send if not empty
      },
    };

    // Add individual or company fields based on business_type
    if (business_type === "individual") {
      accountUpdateData.individual = {
        first_name: individual_first_name,
        last_name: individual_last_name,
        email: individual_email,
        phone: individual_phone ? (() => {
          let formatted = individual_phone.replace(/[^\d+]/g, ''); // Remove all non-digit characters except +
          if (formatted.startsWith('1') && !formatted.startsWith('+1')) {
            formatted = '+' + formatted;
          } else if (!formatted.startsWith('+1') && formatted.length === 10) {
            formatted = '+1' + formatted;
          }
          // Only return if properly formatted
          return (formatted.startsWith('+1') && formatted.length === 12) ? formatted : undefined;
        })() : undefined,
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
    } else if (business_type === "company") {
      // Add company information to account update data
      const companyAddress = {};
      
      // Only include address fields that have values
      if (company_address_line1) companyAddress.line1 = company_address_line1;
      if (company_address_line2) companyAddress.line2 = company_address_line2;
      if (company_address_city) companyAddress.city = company_address_city;
      if (company_address_state) companyAddress.state = company_address_state;
      if (company_address_postal_code) companyAddress.postal_code = company_address_postal_code;
      if (company_address_country) companyAddress.country = company_address_country;

      accountUpdateData.company = {
        name: company_name,
        structure: company_structure,
        owners_provided: true, // Indicates that all owner information has been provided
      };

      // Only add tax_id if it's a valid 9-digit number
      if (company_tax_id && company_tax_id.trim() !== '') {
        const cleanTaxId = company_tax_id.replace(/[^\d]/g, ''); // Remove all non-digit characters
        if (cleanTaxId.length === 9) {
          accountUpdateData.company.tax_id = cleanTaxId;
        }
      }

      // Only add phone if representative_phone has a value
      if (representative_phone && representative_phone.trim() !== '') {
        // Format US phone number for Stripe (E.164 format: +1XXXXXXXXXX)
        let formattedPhone = representative_phone.replace(/[^\d+]/g, ''); // Remove all non-digit characters except +
        
        // Ensure US phone number starts with +1
        if (formattedPhone.startsWith('1') && !formattedPhone.startsWith('+1')) {
          formattedPhone = '+' + formattedPhone;
        } else if (!formattedPhone.startsWith('+1') && formattedPhone.length === 10) {
          formattedPhone = '+1' + formattedPhone;
        } else if (formattedPhone.startsWith('+1') && formattedPhone.length === 12) {
          // Already properly formatted
        }
        
        if (formattedPhone.startsWith('+1') && formattedPhone.length === 12) {
          accountUpdateData.company.phone = formattedPhone;
        }
      }

      // Only add address if we have at least line1
      if (company_address_line1) {
        accountUpdateData.company.address = companyAddress;
      }

      // For company accounts, we need to handle representative person
      // First, check if there's already a representative
      let existingRepresentative = null;
      let representativePerson = null;
      try {
        const persons = await stripe.accounts.listPersons(account_id);
        existingRepresentative = persons.data.find(person => 
          person.relationship && person.relationship.representative === true
        );
      } catch (error) {
        // No existing persons found or error listing persons
      }

      if (existingRepresentative) {
        // Update existing representative
        representativePerson = await stripe.accounts.updatePerson(account_id, existingRepresentative.id, {
          first_name: representative_first_name,
          last_name: representative_last_name,
          email: representative_email,
          phone: representative_phone ? (() => {
            let formatted = representative_phone.replace(/[^\d+]/g, ''); // Remove all non-digit characters except +
            if (formatted.startsWith('1') && !formatted.startsWith('+1')) {
              formatted = '+' + formatted;
            } else if (!formatted.startsWith('+1') && formatted.length === 10) {
              formatted = '+1' + formatted;
            }
            // Only return if properly formatted
            return (formatted.startsWith('+1') && formatted.length === 12) ? formatted : undefined;
          })() : undefined,
          dob: {
            day: representative_dob_day,
            month: representative_dob_month,
            year: representative_dob_year,
          },
          address: {
            line1: representative_address_line1,
            city: representative_address_city,
            state: representative_address_state,
            postal_code: representative_address_postal_code,
            country: representative_address_country,
          },
          relationship: {
            representative: representative_relationship_representative,
            executive: representative_relationship_executive,
            owner: representative_relationship_owner,
            title: representative_relationship_title,
          },
          ssn_last_4: representative_ssn_last_4,
        });
      } else {
        // Create new representative person
        representativePerson = await stripe.accounts.createPerson(account_id, {
          first_name: representative_first_name,
          last_name: representative_last_name,
          email: representative_email,
          phone: representative_phone ? (() => {
            let formatted = representative_phone.replace(/[^\d+]/g, ''); // Remove all non-digit characters except +
            if (formatted.startsWith('1') && !formatted.startsWith('+1')) {
              formatted = '+' + formatted;
            } else if (!formatted.startsWith('+1') && formatted.length === 10) {
              formatted = '+1' + formatted;
            }
            // Only return if properly formatted
            return (formatted.startsWith('+1') && formatted.length === 12) ? formatted : undefined;
          })() : undefined,
          dob: {
            day: representative_dob_day,
            month: representative_dob_month,
            year: representative_dob_year,
          },
          address: {
            line1: representative_address_line1,
            city: representative_address_city,
            state: representative_address_state,
            postal_code: representative_address_postal_code,
            country: representative_address_country,
          },
          relationship: {
            representative: representative_relationship_representative,
            executive: representative_relationship_executive,
            owner: representative_relationship_owner,
            title: representative_relationship_title,
          },
          ssn_last_4: representative_ssn_last_4,
        });
      }

      // For company accounts, we don't send individual fields
      // The account owner information is handled through the person we just created/updated
      // We only need to ensure the account has the correct business_type
    }


    // Update the Stripe account with details
    const updatedAccount = await stripe.accounts.update(
      account_id,
      accountUpdateData,
    );

    // If external account details are provided, create external account
    let externalAccount = null;
    if (
      external_account_object &&
      external_account_country &&
      external_account_currency &&
      external_account_account_number
    ) {
      try {
        externalAccount = await stripe.accounts.createExternalAccount(
          account_id,
          {
            object: external_account_object,
            country: external_account_country,
            currency: external_account_currency,
            account_number: external_account_account_number,
          },
        );
      } catch (externalAccountError) {
        console.warn(
          "Failed to create external account:",
          externalAccountError.message,
        );
        // Don't fail the entire request if external account creation fails
      }
    }

    res.json({
      success: true,
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
    });
  } catch (error) {
    console.error("Error in direct onboarding:", error);
    res.status(500).json({
      error: "Failed to onboard merchant",
      message: error.message,
    });
  }
});

// Get account information
router.get("/account/:account_id", async (req, res) => {
  try {
    const { account_id } = req.params;

    const account = await stripe.accounts.retrieve(account_id);

    res.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        country: account.country,
        type: account.type,
        business_type: account.business_type,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        created: account.created,
      },
    });
  } catch (error) {
    console.error("Error retrieving account:", error);
    res.status(500).json({
      error: "Failed to retrieve account",
      message: error.message,
    });
  }
});

// Create external account (bank account)
router.post("/create-external-account", async (req, res) => {
  try {
    const {
      account_id,
      object,
      country,
      currency,
      account_number,
      default_for_currency = true,
    } = req.body;

    // Validate required fields
    if (!account_id || !object || !country || !currency || !account_number) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["account_id", "object", "country", "currency", "account_number"],
      });
    }

    // Create external account
    const externalAccount = await stripe.accounts.createExternalAccount(account_id, {
      object: object,
      country: country,
      currency: currency,
      account_number: account_number,
      default_for_currency: default_for_currency,
    });

    res.json({
      success: true,
      external_account: {
        id: externalAccount.id,
        object: externalAccount.object,
        country: externalAccount.country,
        currency: externalAccount.currency,
        last4: externalAccount.last4,
        bank_name: externalAccount.bank_name,
        default_for_currency: externalAccount.default_for_currency,
        created: externalAccount.created,
      },
    });
  } catch (error) {
    console.error("Error creating external account:", error);
    res.status(500).json({
      error: "Failed to create external account",
      message: error.message,
    });
  }
});

// Get all Stripe accounts with pagination
router.get("/accounts", async (req, res) => {
  try {
    const { limit = 10, starting_after, ending_before } = req.query;

    // Build query parameters for Stripe API
    const queryParams = {
      limit: parseInt(limit),
    };

    if (starting_after) {
      queryParams.starting_after = starting_after;
    }

    if (ending_before) {
      queryParams.ending_before = ending_before;
    }

    // Fetch accounts from Stripe
    const accounts = await stripe.accounts.list(queryParams);

    // Transform the response to match our interface
    const transformedAccounts = accounts.data.map(account => ({
      id: account.id,
      email: account.email,
      business_type: account.business_type,
      country: account.country,
      created: account.created,
      business_profile: {
        name: account.business_profile?.name || null,
        url: account.business_profile?.url || null,
        mcc: account.business_profile?.mcc || null,
      },
      capabilities: {
        card_payments: account.capabilities?.card_payments || "inactive",
        transfers: account.capabilities?.transfers || "inactive",
      },
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: {
        disabled_reason: account.requirements?.disabled_reason || null,
      },
      tos_acceptance: {
        date: account.tos_acceptance?.date || null,
        ip: account.tos_acceptance?.ip || null,
        user_agent: account.tos_acceptance?.user_agent || null,
      },
    }));

    res.json({
      success: true,
      data: {
        data: transformedAccounts,
        has_more: accounts.has_more,
        total_count: accounts.total_count,
        url: accounts.url,
      },
    });
  } catch (error) {
    console.error("Error fetching Stripe accounts:", error);
    res.status(500).json({
      error: "Failed to fetch Stripe accounts",
      message: error.message,
    });
  }
});

// Get a single Stripe account by ID
router.get("/accounts/:account_id", async (req, res) => {
  try {
    const { account_id } = req.params;

    const account = await stripe.accounts.retrieve(account_id);

    // Transform the response to match our interface
    const transformedAccount = {
      id: account.id,
      email: account.email,
      business_type: account.business_type,
      country: account.country,
      created: account.created,
      business_profile: {
        name: account.business_profile?.name || null,
        url: account.business_profile?.url || null,
        mcc: account.business_profile?.mcc || null,
      },
      capabilities: {
        card_payments: account.capabilities?.card_payments || "inactive",
        transfers: account.capabilities?.transfers || "inactive",
      },
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: {
        disabled_reason: account.requirements?.disabled_reason || null,
      },
      tos_acceptance: {
        date: account.tos_acceptance?.date || null,
        ip: account.tos_acceptance?.ip || null,
        user_agent: account.tos_acceptance?.user_agent || null,
      },
    };

    res.json({
      success: true,
      data: transformedAccount,
    });
  } catch (error) {
    console.error("Error retrieving Stripe account:", error);
    res.status(500).json({
      error: "Failed to retrieve Stripe account",
      message: error.message,
    });
  }
});

module.exports = router;
