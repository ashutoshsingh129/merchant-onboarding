const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'merchant_onboarding',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Test database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Database connected successfully');
        client.release();
        return true;
    } catch (err) {
        console.error('Database connection failed:', err);
        return false;
    }
};

// Initialize database tables
const initializeDatabase = async () => {
    try {
        const client = await pool.connect();
        
        // Create stripe_keys table
        await client.query(`
            CREATE TABLE IF NOT EXISTS stripe_keys (
                id SERIAL PRIMARY KEY,
                secret_key TEXT NOT NULL,
                publishable_key TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT true
            )
        `);

        // Create index for active keys
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_stripe_keys_active 
            ON stripe_keys(is_active) 
            WHERE is_active = true
        `);

        client.release();
        console.log('Database tables initialized successfully');
        return true;
    } catch (err) {
        console.error('Database initialization failed:', err);
        return false;
    }
};

module.exports = {
    pool,
    testConnection,
    initializeDatabase,
};
