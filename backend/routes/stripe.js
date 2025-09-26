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
      individual_address_city,
      individual_address_postal_code,
      individual_address_country,
      tos_acceptance_date,
      tos_acceptance_ip,
      business_type,
      business_profile_mcc,
      business_profile_url,
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

    // Prepare the account update data
    const accountUpdateData = {
      individual: {
        first_name: individual_first_name,
        last_name: individual_last_name,
        email: individual_email,
        phone: individual_phone,
        dob: {
          day: individual_dob_day,
          month: individual_dob_month,
          year: individual_dob_year,
        },
        address: {
          line1: individual_address_line1,
          city: individual_address_city,
          postal_code: individual_address_postal_code,
          country: individual_address_country,
        },
      },
      tos_acceptance: {
        date: tos_acceptance_date || Math.floor(Date.now() / 1000),
        ip: tos_acceptance_ip || req.ip,
      },
      business_type: business_type || "individual",
      business_profile: {
        mcc: business_profile_mcc,
        url: business_profile_url,
      },
    };

    // Update the Stripe account with individual details
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
        charges_enabled: updatedAccount.charges_enabled,
        payouts_enabled: updatedAccount.payouts_enabled,
        details_submitted: updatedAccount.details_submitted,
        created: updatedAccount.created,
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

module.exports = router;
