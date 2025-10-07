const express = require("express");
const multer = require("multer");
const fs = require("fs");
const stripeKeysCache = require("../utils/stripeKeysCache");

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Helper function to get Stripe instance with cached keys
const getStripeInstance = () => {
    const keys = stripeKeysCache.getKeys();
    
    if (!keys.secretKey) {
        throw new Error('No Stripe secret key available. Please configure your Stripe keys first.');
    }
    
    return require("stripe")(keys.secretKey);
};

// Upload identity document to Stripe
router.post("/upload-document", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const { purpose } = req.body;
    const stripe = getStripeInstance();

    // Upload file to Stripe
    const file = await stripe.files.create({
      purpose: purpose || "identity_document",
      file: {
        data: fs.readFileSync(req.file.path),
        name: req.file.originalname,
        type: req.file.mimetype,
      },
    });

    // Clean up the temporary file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      file_id: file.id,
      file: {
        id: file.id,
        object: file.object,
        purpose: file.purpose,
        filename: file.filename,
        size: file.size,
        type: file.type,
        created: file.created,
      },
    });
  } catch (error) {
    console.error("Error uploading file to Stripe:", error);
    
    // Clean up the temporary file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Failed to upload file to Stripe",
      message: error.message,
    });
  }
});

// Create a new Stripe account
router.post("/create-account", async (req, res) => {
  try {
    const { type, country, email, business_type, capabilities } = req.body;
    const stripe = getStripeInstance();

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
    const stripe = getStripeInstance();

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
    const stripe = getStripeInstance();
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
      representative_relationship_title,
      representative_ssn_last_4,
      // Owner fields (for company business_type)
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
      owner_relationship_title,
      owner_ssn_last_4,
      external_account_object,
      external_account_country,
      external_account_currency,
      // Bank Account fields
      external_account_routing_number,
      external_account_account_number,
      // File IDs for identity verification
      individual_verification_document_front,
      individual_verification_document_back,
      individual_verification_additional_document_front,
      individual_verification_additional_document_back,
      company_verification_document_front,
      company_verification_document_back,
      representative_verification_document_front,
      representative_verification_document_back,
      representative_verification_additional_document_front,
      representative_verification_additional_document_back,
      owner_verification_document_front,
      owner_verification_document_back,
      owner_verification_additional_document_front,
      owner_verification_additional_document_back,
      external_account_account_holder_name,
      external_account_account_holder_type,
      // Debit Card fields
      external_account_card_number,
      external_account_exp_month,
      external_account_exp_year,
      external_account_cvc,
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

      // Add identity verification documents if provided
      if (individual_verification_document_front || individual_verification_document_back || 
          individual_verification_additional_document_front || individual_verification_additional_document_back) {
        accountUpdateData.individual.verification = {};
        
        // Identity document (ID)
        if (individual_verification_document_front || individual_verification_document_back) {
          accountUpdateData.individual.verification.document = {};
          if (individual_verification_document_front) {
            accountUpdateData.individual.verification.document.front = individual_verification_document_front;
          }
          if (individual_verification_document_back) {
            accountUpdateData.individual.verification.document.back = individual_verification_document_back;
          }
        }
        
        // Additional document (address proof)
        if (individual_verification_additional_document_front || individual_verification_additional_document_back) {
          accountUpdateData.individual.verification.additional_document = {};
          if (individual_verification_additional_document_front) {
            accountUpdateData.individual.verification.additional_document.front = individual_verification_additional_document_front;
          }
          if (individual_verification_additional_document_back) {
            accountUpdateData.individual.verification.additional_document.back = individual_verification_additional_document_back;
          }
        }
      }
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

      // Add company verification documents if provided
      if (company_verification_document_front || company_verification_document_back) {
        accountUpdateData.company.verification = {
          document: {},
        };
        if (company_verification_document_front) {
          accountUpdateData.company.verification.document.front = company_verification_document_front;
        }
        if (company_verification_document_back) {
          accountUpdateData.company.verification.document.back = company_verification_document_back;
        }
      }

      // For company accounts, we need to handle representative person
      // First, check if there's already a representative
      let existingRepresentative = null;
      let representativePerson = null;
      
      // Check if owner information is provided separately
      // If not, the representative should also be marked as owner
      const isRepresentativeAlsoOwner = !owner_first_name || owner_first_name.trim() === '';
      
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
        const representativeData = {
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
            owner: isRepresentativeAlsoOwner,
            title: representative_relationship_title,
          },
          ssn_last_4: representative_ssn_last_4,
        };

        // Add identity verification documents if provided
        if (representative_verification_document_front || representative_verification_document_back ||
            representative_verification_additional_document_front || representative_verification_additional_document_back) {
          representativeData.verification = {};
          
          // Identity document (ID)
          if (representative_verification_document_front || representative_verification_document_back) {
            representativeData.verification.document = {};
            if (representative_verification_document_front) {
              representativeData.verification.document.front = representative_verification_document_front;
            }
            if (representative_verification_document_back) {
              representativeData.verification.document.back = representative_verification_document_back;
            }
          }
          
          // Additional document (address proof)
          if (representative_verification_additional_document_front || representative_verification_additional_document_back) {
            representativeData.verification.additional_document = {};
            if (representative_verification_additional_document_front) {
              representativeData.verification.additional_document.front = representative_verification_additional_document_front;
            }
            if (representative_verification_additional_document_back) {
              representativeData.verification.additional_document.back = representative_verification_additional_document_back;
            }
          }
        }

        representativePerson = await stripe.accounts.updatePerson(account_id, existingRepresentative.id, representativeData);
      } else {
        // Create new representative person
        const representativeData = {
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
            owner: isRepresentativeAlsoOwner,
            title: representative_relationship_title,
          },
          ssn_last_4: representative_ssn_last_4,
        };

        // Add identity verification documents if provided
        if (representative_verification_document_front || representative_verification_document_back ||
            representative_verification_additional_document_front || representative_verification_additional_document_back) {
          representativeData.verification = {};
          
          // Identity document (ID)
          if (representative_verification_document_front || representative_verification_document_back) {
            representativeData.verification.document = {};
            if (representative_verification_document_front) {
              representativeData.verification.document.front = representative_verification_document_front;
            }
            if (representative_verification_document_back) {
              representativeData.verification.document.back = representative_verification_document_back;
            }
          }
          
          // Additional document (address proof)
          if (representative_verification_additional_document_front || representative_verification_additional_document_back) {
            representativeData.verification.additional_document = {};
            if (representative_verification_additional_document_front) {
              representativeData.verification.additional_document.front = representative_verification_additional_document_front;
            }
            if (representative_verification_additional_document_back) {
              representativeData.verification.additional_document.back = representative_verification_additional_document_back;
            }
          }
        }

        representativePerson = await stripe.accounts.createPerson(account_id, representativeData);
      }

      // Handle owner person separately if owner details are provided
      // Check if owner_first_name is provided to determine if we should create/update owner
      if (owner_first_name && owner_first_name.trim() !== '') {
        // Check if there's already an owner person
        let existingOwner = null;
        let ownerPerson = null;
        try {
          const persons = await stripe.accounts.listPersons(account_id);
          existingOwner = persons.data.find(person => 
            person.relationship && person.relationship.owner === true && person.id !== representativePerson.id
          );
        } catch (error) {
          // No existing owner found or error listing persons
        }

        if (existingOwner) {
          // Update existing owner
          const ownerData = {
            first_name: owner_first_name,
            last_name: owner_last_name,
            email: owner_email,
            phone: owner_phone ? (() => {
              let formatted = owner_phone.replace(/[^\d+]/g, ''); // Remove all non-digit characters except +
              if (formatted.startsWith('1') && !formatted.startsWith('+1')) {
                formatted = '+' + formatted;
              } else if (!formatted.startsWith('+1') && formatted.length === 10) {
                formatted = '+1' + formatted;
              }
              // Only return if properly formatted
              return (formatted.startsWith('+1') && formatted.length === 12) ? formatted : undefined;
            })() : undefined,
            dob: {
              day: owner_dob_day,
              month: owner_dob_month,
              year: owner_dob_year,
            },
            address: {
              line1: owner_address_line1,
              city: owner_address_city,
              state: owner_address_state,
              postal_code: owner_address_postal_code,
              country: owner_address_country,
            },
            relationship: {
              owner: owner_relationship_owner,
              title: owner_relationship_title,
            },
            ssn_last_4: owner_ssn_last_4,
          };

          // Add identity verification documents if provided
          if (owner_verification_document_front || owner_verification_document_back ||
              owner_verification_additional_document_front || owner_verification_additional_document_back) {
            ownerData.verification = {};
            
            // Identity document (ID)
            if (owner_verification_document_front || owner_verification_document_back) {
              ownerData.verification.document = {};
              if (owner_verification_document_front) {
                ownerData.verification.document.front = owner_verification_document_front;
              }
              if (owner_verification_document_back) {
                ownerData.verification.document.back = owner_verification_document_back;
              }
            }
            
            // Additional document (address proof)
            if (owner_verification_additional_document_front || owner_verification_additional_document_back) {
              ownerData.verification.additional_document = {};
              if (owner_verification_additional_document_front) {
                ownerData.verification.additional_document.front = owner_verification_additional_document_front;
              }
              if (owner_verification_additional_document_back) {
                ownerData.verification.additional_document.back = owner_verification_additional_document_back;
              }
            }
          }

          ownerPerson = await stripe.accounts.updatePerson(account_id, existingOwner.id, ownerData);
        } else {
          // Create new owner person
          const ownerData = {
            first_name: owner_first_name,
            last_name: owner_last_name,
            email: owner_email,
            phone: owner_phone ? (() => {
              let formatted = owner_phone.replace(/[^\d+]/g, ''); // Remove all non-digit characters except +
              if (formatted.startsWith('1') && !formatted.startsWith('+1')) {
                formatted = '+' + formatted;
              } else if (!formatted.startsWith('+1') && formatted.length === 10) {
                formatted = '+1' + formatted;
              }
              // Only return if properly formatted
              return (formatted.startsWith('+1') && formatted.length === 12) ? formatted : undefined;
            })() : undefined,
            dob: {
              day: owner_dob_day,
              month: owner_dob_month,
              year: owner_dob_year,
            },
            address: {
              line1: owner_address_line1,
              city: owner_address_city,
              state: owner_address_state,
              postal_code: owner_address_postal_code,
              country: owner_address_country,
            },
            relationship: {
              owner: owner_relationship_owner,
              title: owner_relationship_title,
            },
            ssn_last_4: owner_ssn_last_4,
          };

          // Add identity verification documents if provided
          if (owner_verification_document_front || owner_verification_document_back ||
              owner_verification_additional_document_front || owner_verification_additional_document_back) {
            ownerData.verification = {};
            
            // Identity document (ID)
            if (owner_verification_document_front || owner_verification_document_back) {
              ownerData.verification.document = {};
              if (owner_verification_document_front) {
                ownerData.verification.document.front = owner_verification_document_front;
              }
              if (owner_verification_document_back) {
                ownerData.verification.document.back = owner_verification_document_back;
              }
            }
            
            // Additional document (address proof)
            if (owner_verification_additional_document_front || owner_verification_additional_document_back) {
              ownerData.verification.additional_document = {};
              if (owner_verification_additional_document_front) {
                ownerData.verification.additional_document.front = owner_verification_additional_document_front;
              }
              if (owner_verification_additional_document_back) {
                ownerData.verification.additional_document.back = owner_verification_additional_document_back;
              }
            }
          }

          ownerPerson = await stripe.accounts.createPerson(account_id, ownerData);
        }
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
    if (external_account_object) {
      try {
        if (external_account_object === 'bank_account') {
          // Create bank account
          if (external_account_account_number && external_account_country && external_account_currency) {
            const bankAccountData = {
              object: 'bank_account',
              country: external_account_country,
              currency: external_account_currency,
              account_number: external_account_account_number,
            };
            
            // Add optional fields if provided
            if (external_account_routing_number) {
              bankAccountData.routing_number = external_account_routing_number;
            }
            if (external_account_account_holder_name) {
              bankAccountData.account_holder_name = external_account_account_holder_name;
            }
            if (external_account_account_holder_type) {
              bankAccountData.account_holder_type = external_account_account_holder_type;
            }
            
            externalAccount = await stripe.accounts.createExternalAccount(
              account_id,
              { external_account: bankAccountData }
            );
          }
        } else if (external_account_object === 'card') {
          // Create debit card
          if (external_account_card_number && external_account_exp_month && external_account_exp_year && external_account_cvc) {
            const cardData = {
              object: 'card',
              number: external_account_card_number,
              exp_month: external_account_exp_month,
              exp_year: external_account_exp_year,
              cvc: external_account_cvc,
            };
            
            externalAccount = await stripe.accounts.createExternalAccount(
              account_id,
              { external_account: cardData }
            );
          }
        }
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
    const stripe = getStripeInstance();

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
    const stripe = getStripeInstance();
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
    const stripe = getStripeInstance();
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
    const stripe = getStripeInstance();

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

// Delete a Stripe account
router.delete("/accounts/:account_id", async (req, res) => {
  try {
    const { account_id } = req.params;
    const stripe = getStripeInstance();

    // Delete the account from Stripe
    const deletedAccount = await stripe.accounts.del(account_id);

    res.json({
      success: true,
      deleted: true,
      account_id: deletedAccount.id,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Stripe account:", error);
    res.status(500).json({
      error: "Failed to delete Stripe account",
      message: error.message,
    });
  }
});

// Reject a Stripe account
router.post("/accounts/:account_id/reject", async (req, res) => {
  try {
    const { account_id } = req.params;
    const { reason } = req.body;
    const stripe = getStripeInstance();

    // Validate required fields
    if (!reason) {
      return res.status(400).json({
        error: "Missing required field: reason",
        required: ["reason"],
        valid_reasons: ["fraud", "terms_of_service", "other"],
      });
    }

    // Validate reason
    const validReasons = ["fraud", "terms_of_service", "other"];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        error: "Invalid reason",
        valid_reasons: validReasons,
      });
    }

    // Reject the account
    const rejectedAccount = await stripe.accounts.reject(account_id, {
      reason: reason,
    });

    res.json({
      success: true,
      account: {
        id: rejectedAccount.id,
        email: rejectedAccount.email,
        country: rejectedAccount.country,
        type: rejectedAccount.type,
        business_type: rejectedAccount.business_type,
        charges_enabled: rejectedAccount.charges_enabled,
        payouts_enabled: rejectedAccount.payouts_enabled,
        details_submitted: rejectedAccount.details_submitted,
        requirements: rejectedAccount.requirements,
        created: rejectedAccount.created,
      },
      message: "Account rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting Stripe account:", error);
    res.status(500).json({
      error: "Failed to reject Stripe account",
      message: error.message,
    });
  }
});

module.exports = router;
