const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const stripeRoutes = require("./routes/stripe");
const stripeKeysRoutes = require("./routes/stripeKeys");
const authRoutes = require("./routes/auth");
const { authenticateToken } = require("./middleware/auth");
const {
  testConnection,
  initializeDatabase,
  pool,
} = require("./config/database");
const stripeKeysCache = require("./utils/stripeKeysCache");
const { decrypt } = require("./utils/encryption");
const { setupUsers } = require("./scripts/setupUsers");

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (required for platforms like Render)
app.set("trust proxy", 1);

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
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000",
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Debug middleware for CORS issues
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("Origin:", req.headers.origin);
  console.log("User-Agent:", req.headers["user-agent"]);
  next();
});

// Body parsing middleware - increased limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
      // Load all active Stripe keys for all users
      const result = await client.query(
        "SELECT user_id, secret_key, publishable_key FROM stripe_keys WHERE is_active = true"
      );

      if (result.rows.length > 0) {
        let loadedCount = 0;
        for (const row of result.rows) {
          const {
            user_id,
            secret_key: encryptedSecretKey,
            publishable_key,
          } = row;
          // Decrypt the secret key before caching
          const decryptedSecretKey = decrypt(encryptedSecretKey);
          // Update cache with user-specific keys
          stripeKeysCache.updateUserKeys(
            user_id,
            decryptedSecretKey,
            publishable_key
          );
          loadedCount++;
        }
        console.log(`Stripe keys loaded into cache for ${loadedCount} user(s)`);
      } else {
        console.log("No active Stripe keys found in database");
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error loading keys into cache:", error.message);
    // Don't fail server startup if keys can't be loaded
  }
};

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("Failed to connect to database. Server will not start.");
      process.exit(1);
    }

    // Initialize database tables
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error(
        "Failed to initialize database tables. Server will not start."
      );
      process.exit(1);
    }

    // Setup users table, admin user, and run Stripe keys migration
    try {
      console.log(
        "🚀 Setting up users table, admin user, and running migrations..."
      );
      await setupUsers();
      console.log("✅ Users setup and migrations completed successfully!");
    } catch (error) {
      console.error(
        "⚠️  Users setup or migration failed, but continuing server startup:",
        error.message
      );
      // Don't fail server startup if users setup or migration fails
    }

    // Load Stripe keys into cache
    await loadKeysIntoCache();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log("Database connection established and tables initialized");
      console.log(
        "📧 Admin credentials: sal@simplypaymentsgroup.com / stripe2025!"
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
