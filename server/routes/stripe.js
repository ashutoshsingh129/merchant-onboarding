const express = require("express");
const multer = require("multer");
const fs = require("fs");
const stripeKeysCache = require("../utils/stripeKeysCache");
const { pool } = require("../config/database");
const { decrypt } = require("../utils/encryption");
const { authenticateToken } = require("../middleware/auth");
const { routeDirectOnboard } = require("./handlers");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Helper: ensure keys are present in cache, else load from DB
const ensureKeysInCache = async (userId) => {
    const keys = stripeKeysCache.getKeys(userId);
    if (keys.secretKey) return keys;
    // Attempt lazy load from DB
    try {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT secret_key, publishable_key FROM stripe_keys WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
                [userId]
            );
            if (result.rows.length === 0) {
                return { secretKey: null };
            }
            const decryptedSecretKey = decrypt(result.rows[0].secret_key);
            stripeKeysCache.updateKeys(userId, decryptedSecretKey, result.rows[0].publishable_key);
            return { secretKey: decryptedSecretKey };
        } finally {
            client.release();
        }
    } catch (e) {
        return { secretKey: null };
    }
};

// Helper function to get Stripe instance with cached keys for specific user (lazy-load from DB if needed)
const getStripeInstance = (userId) => {
    const keys = stripeKeysCache.getKeys(userId);
    if (!keys.secretKey) {
        throw new Error('No Stripe secret key available for this user. Please configure your Stripe keys first.');
    }
    return require("stripe")(keys.secretKey);
};

// Middleware to auto-load keys into cache if missing
router.use(async (req, res, next) => {
    try {
        const userId = req.user && req.user.id;
        if (userId) {
            const keys = stripeKeysCache.getKeys(userId);
            if (!keys.secretKey) {
                await ensureKeysInCache(userId);
            }
        }
    } catch (e) {
        // Non-fatal: proceed; downstream handlers will surface precise errors
    }
    next();
});

// Upload identity document to Stripe
router.post("/upload-document", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const { purpose } = req.body;
    const userId = req.user.id; // Get user ID from authenticated token
    const stripe = getStripeInstance(userId);

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
    const userId = req.user.id; // Get user ID from authenticated token
    const stripe = getStripeInstance(userId);

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
    const userId = req.user.id; // Get user ID from authenticated token
    const stripe = getStripeInstance(userId);

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
    const userId = req.user.id; // Get user ID from authenticated token
    const stripe = getStripeInstance(userId);
    const { account_id } = req.body;

    // Validate required fields
    if (!account_id) {
      return res.status(400).json({
        error: "Missing required field: account_id",
      });
    }

    // Route to country-specific handler
    const result = await routeDirectOnboard(stripe, account_id, req.body, req.ip);

    res.json({
      success: true,
      account: result.account,
      external_account: result.external_account,
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
    const userId = req.user.id; // Get user ID from authenticated token
    const stripe = getStripeInstance(userId);

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
    const userId = req.user.id; // Get user ID from authenticated token
    const stripe = getStripeInstance(userId);
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
    const userId = req.user.id; // Get user ID from authenticated token
    const stripe = getStripeInstance(userId);
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
    const userId = req.user.id; // Get user ID from authenticated token
    const stripe = getStripeInstance(userId);

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
    const userId = req.user.id; // Get user ID from authenticated token
    const stripe = getStripeInstance(userId);

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
    const userId = req.user.id; // Get user ID from authenticated token
    const stripe = getStripeInstance(userId);

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
