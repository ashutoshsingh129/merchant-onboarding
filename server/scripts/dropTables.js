const { Pool } = require('pg');
require('dotenv').config();

// Database configuration (same as in database.js)
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'merchant_onboarding',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Drop tables script - can accept an external pool or use its own
const dropTables = async (externalPool = null) => {
    const usePool = externalPool || pool;
    const shouldClosePool = !externalPool; // Only close pool if we created it
    
    const client = await usePool.connect();
    
    try {
        console.log('🗑️  Starting table cleanup...');
        
        // Drop tables in reverse order (due to foreign key constraints)
        // First drop stripe_keys table (it references users)
        console.log('Dropping stripe_keys table...');
        await client.query('DROP TABLE IF EXISTS stripe_keys CASCADE');
        console.log('✅ stripe_keys table dropped successfully');
        
        // Then drop users table
        console.log('Dropping users table...');
        await client.query('DROP TABLE IF EXISTS users CASCADE');
        console.log('✅ users table dropped successfully');
        
        console.log('🎉 All tables dropped successfully!');
        
    } catch (error) {
        console.error('❌ Error dropping tables:', error);
        throw error;
    } finally {
        client.release();
        if (shouldClosePool) {
            await usePool.end();
        }
    }
};

// Run the script
if (require.main === module) {
    dropTables()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { dropTables };
