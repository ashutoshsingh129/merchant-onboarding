const express = require('express');
const { pool } = require('../config/database');
const stripeKeysCache = require('../utils/stripeKeysCache');

const router = express.Router();

// Validate Stripe key format
const validateStripeKey = (key, type) => {
    if (!key || typeof key !== 'string') {
        return false;
    }
    
    const trimmedKey = key.trim();
    
    if (type === 'secret') {
        return trimmedKey.startsWith('sk_test_') || trimmedKey.startsWith('sk_live_');
    } else if (type === 'publishable') {
        return trimmedKey.startsWith('pk_test_') || trimmedKey.startsWith('pk_live_');
    }
    
    return false;
};

// Store Stripe keys
router.post('/keys', async (req, res) => {
    try {
        const { secret_key, publishable_key } = req.body;

        // Validate input
        if (!secret_key || !publishable_key) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Both secret_key and publishable_key are required',
            });
        }

        // Validate key formats
        if (!validateStripeKey(secret_key, 'secret')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid secret key format',
                message: 'Secret key must start with sk_test_ or sk_live_',
            });
        }

        if (!validateStripeKey(publishable_key, 'publishable')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid publishable key format',
                message: 'Publishable key must start with pk_test_ or pk_live_',
            });
        }

        const client = await pool.connect();
        
        try {
            // Start transaction
            await client.query('BEGIN');

            // Deactivate existing keys
            await client.query(
                'UPDATE stripe_keys SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE is_active = true'
            );

            // Insert new keys
            const result = await client.query(
                'INSERT INTO stripe_keys (secret_key, publishable_key) VALUES ($1, $2) RETURNING id, created_at',
                [secret_key.trim(), publishable_key.trim()]
            );

            // Commit transaction
            await client.query('COMMIT');

            // Update cache with new keys
            const cacheUpdated = stripeKeysCache.updateKeys(secret_key.trim(), publishable_key.trim());

            if (!cacheUpdated) {
                console.warn('Failed to update cache, but keys were saved to database');
            }

            res.json({
                success: true,
                message: 'Stripe keys saved successfully',
                data: {
                    id: result.rows[0].id,
                    created_at: result.rows[0].created_at,
                    cache_updated: cacheUpdated,
                },
            });

        } catch (error) {
            // Rollback transaction
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error saving Stripe keys:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save Stripe keys',
            message: error.message,
        });
    }
});

// Get current Stripe keys (without secret key)
router.get('/keys', async (req, res) => {
    try {
        const client = await pool.connect();
        
        try {
            const result = await client.query(
                'SELECT id, publishable_key, created_at, updated_at FROM stripe_keys WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
            );

            if (result.rows.length === 0) {
                return res.json({
                    success: true,
                    message: 'No active Stripe keys found',
                    data: null,
                    hasKeys: false,
                });
            }

            const cacheStatus = stripeKeysCache.getStatus();

            res.json({
                success: true,
                data: {
                    id: result.rows[0].id,
                    publishable_key: result.rows[0].publishable_key,
                    created_at: result.rows[0].created_at,
                    updated_at: result.rows[0].updated_at,
                    cache_status: cacheStatus,
                },
                hasKeys: true,
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error retrieving Stripe keys:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve Stripe keys',
            message: error.message,
        });
    }
});

// Check if keys exist (simple endpoint for frontend)
router.get('/keys/status', async (req, res) => {
    try {
        const client = await pool.connect();
        
        try {
            const result = await client.query(
                'SELECT COUNT(*) as count FROM stripe_keys WHERE is_active = true'
            );

            const hasKeys = parseInt(result.rows[0].count) > 0;

            res.json({
                success: true,
                hasKeys,
                message: hasKeys ? 'Keys are configured' : 'No keys configured',
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error checking keys status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check keys status',
            message: error.message,
        });
    }
});

// Get cache status
router.get('/keys/cache-status', async (req, res) => {
    try {
        const cacheStatus = stripeKeysCache.getStatus();
        
        res.json({
            success: true,
            data: cacheStatus,
        });
    } catch (error) {
        console.error('Error getting cache status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cache status',
            message: error.message,
        });
    }
});

// Load keys from database into cache
router.post('/keys/load-cache', async (req, res) => {
    try {
        const client = await pool.connect();
        
        try {
            const result = await client.query(
                'SELECT secret_key, publishable_key FROM stripe_keys WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No active Stripe keys found',
                    message: 'No keys available to load into cache',
                });
            }

            const { secret_key, publishable_key } = result.rows[0];
            const cacheUpdated = stripeKeysCache.updateKeys(secret_key, publishable_key);

            res.json({
                success: true,
                message: cacheUpdated ? 'Cache updated successfully' : 'Failed to update cache',
                data: {
                    cache_updated: cacheUpdated,
                },
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error loading keys into cache:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load keys into cache',
            message: error.message,
        });
    }
});

// Clear/Delete all Stripe keys (logout functionality)
router.delete('/keys', async (req, res) => {
    try {
        const client = await pool.connect();
        
        try {
            // Start transaction
            await client.query('BEGIN');

            // Delete all keys from database
            const result = await client.query('DELETE FROM stripe_keys');

            // Commit transaction
            await client.query('COMMIT');

            // Clear cache
            stripeKeysCache.clearCache();

            res.json({
                success: true,
                message: 'All Stripe keys cleared successfully',
                data: {
                    deleted_count: result.rowCount,
                },
            });

        } catch (error) {
            // Rollback transaction
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error clearing Stripe keys:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear Stripe keys',
            message: error.message,
        });
    }
});

module.exports = router;
