const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const stripeRoutes = require("./routes/stripe");
const stripeKeysRoutes = require("./routes/stripeKeys");
const authRoutes = require("./routes/auth");
const { authenticateToken } = require("./middleware/auth");
const { testConnection, initializeDatabase, pool } = require("./config/database");
const stripeKeysCache = require("./utils/stripeKeysCache");
const { decrypt } = require("./utils/encryption");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Body parsing middleware - increased limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stripe", authenticateToken, stripeRoutes);
app.use("/api/stripe", authenticateToken, stripeKeysRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Load Stripe keys from database into cache on startup
const loadKeysIntoCache = async () => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT secret_key, publishable_key FROM stripe_keys WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
      );

      if (result.rows.length > 0) {
        const { secret_key: encryptedSecretKey, publishable_key } = result.rows[0];
        // Decrypt the secret key before caching
        const decryptedSecretKey = decrypt(encryptedSecretKey);
        stripeKeysCache.updateKeys(decryptedSecretKey, publishable_key);
        console.log('Stripe keys loaded into cache successfully');
      } else {
        console.log('No active Stripe keys found in database');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error loading keys into cache:', error.message);
    // Don't fail server startup if keys can't be loaded
  }
};

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    // Initialize database tables
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('Failed to initialize database tables. Server will not start.');
      process.exit(1);
    }

    // Load Stripe keys into cache
    await loadKeysIntoCache();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log('Database connection established and tables initialized');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
