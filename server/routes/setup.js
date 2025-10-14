const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const router = express.Router();

// Setup users table and add admin user
const setupUsers = async () => {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');

        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT true
            )
        `);

        // Create index for email
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email 
            ON users(email)
        `);

        // Check if admin user already exists
        const existingUser = await client.query(
            'SELECT id FROM users WHERE email = $1',
            ['admin@example.com']
        );

        let result = {
            success: true,
            message: '',
            userCreated: false,
            userExists: false
        };

        if (existingUser.rows.length === 0) {
            // Hash the password
            const hashedPassword = await bcrypt.hash('password123', 10);

            // Insert admin user
            await client.query(
                'INSERT INTO users (email, password_hash, name, role, is_active) VALUES ($1, $2, $3, $4, $5)',
                ['admin@example.com', hashedPassword, 'Admin User', 'admin', true]
            );

            result.message = 'Admin user created successfully!';
            result.userCreated = true;
        } else {
            result.message = 'Admin user already exists in database';
            result.userExists = true;
        }

        // Commit transaction
        await client.query('COMMIT');
        
        return result;
        
    } catch (error) {
        // Rollback transaction
        await client.query('ROLLBACK');
        console.error('❌ Error setting up users:', error);
        throw error;
    } finally {
        client.release();
    }
};

// Route to setup users
router.post('/setup-users', async (req, res) => {
    try {
        console.log('🚀 Setting up users table and demo user...');
        const result = await setupUsers();
        
        res.json({
            success: true,
            message: 'Setup completed successfully!',
            data: {
                message: result.message,
                userCreated: result.userCreated,
                userExists: result.userExists,
                credentials: {
                    email: 'admin@example.com',
                    password: 'password123'
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        res.status(500).json({
            success: false,
            message: 'Setup failed',
            error: error.message
        });
    }
});

// Route to check if users table exists and admin user status
router.get('/setup-status', async (req, res) => {
    try {
        const client = await pool.connect();
        
        try {
            // Check if users table exists
            const tableCheck = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'users'
                )
            `);
            
            const tableExists = tableCheck.rows[0].exists;
            
            let adminUserExists = false;
            if (tableExists) {
                const userCheck = await client.query(
                    'SELECT id, email, name, role, created_at FROM users WHERE email = $1',
                    ['admin@example.com']
                );
                adminUserExists = userCheck.rows.length > 0;
            }
            
            res.json({
                success: true,
                data: {
                    tableExists,
                    adminUserExists,
                    needsSetup: !tableExists || !adminUserExists,
                    credentials: adminUserExists ? {
                        email: 'admin@example.com',
                        password: 'password123'
                    } : null
                }
            });
            
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('Error checking setup status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check setup status',
            error: error.message
        });
    }
});

module.exports = router;
