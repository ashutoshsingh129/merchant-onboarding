const crypto = require('crypto');

// Generate a random 32-byte key for AES-256-GCM
const generateEncryptionKey = () => {
    return crypto.randomBytes(32);
};

// Get encryption key from environment or generate one
const getEncryptionKey = () => {
    const envKey = process.env.ENCRYPTION_KEY;
    if (envKey) {
        // Convert hex string to buffer if it's a hex string
        if (envKey.length === 64) {
            return Buffer.from(envKey, 'hex');
        }
        // Otherwise use as-is (should be 32 bytes)
        return Buffer.from(envKey);
    }
    
    // Generate a new key if none exists (for development)
    console.warn('No ENCRYPTION_KEY found in environment. Generating a new key for this session.');
    return generateEncryptionKey();
};

const ENCRYPTION_KEY = getEncryptionKey();

// Encrypt data using AES-256-CBC (more compatible)
const encrypt = (text) => {
    try {
        // Generate a random IV (16 bytes for CBC)
        const iv = crypto.randomBytes(16);
        
        // Create cipher using the correct method
        const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        
        // Encrypt the text
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Combine IV and encrypted data
        const combined = iv.toString('hex') + ':' + encrypted;
        
        return combined;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

// Decrypt data using AES-256-CBC
const decrypt = (encryptedData) => {
    try {
        // Split the combined data
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted data format');
        }
        
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        // Create decipher using the correct method
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        
        // Decrypt the data
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

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

// Validate Stripe keys by making a test API call
const validateStripeKeysWithAPI = async (secretKey, publishableKey) => {
    try {
        const stripe = require('stripe')(secretKey);
        
        // Make a simple API call to validate the keys
        const account = await stripe.accounts.retrieve();
        
        // Check if the account is accessible
        if (account && account.id) {
            return {
                isValid: true,
                accountId: account.id,
                accountType: account.type,
                country: account.country,
                message: 'Keys are valid and account is accessible'
            };
        } else {
            return {
                isValid: false,
                error: 'Account not accessible with provided keys',
                message: 'The provided keys do not have access to a valid Stripe account'
            };
        }
    } catch (error) {
        console.error('Stripe API validation error:', error);
        
        // Handle specific Stripe errors
        if (error.type === 'StripeAuthenticationError') {
            return {
                isValid: false,
                error: 'Authentication failed',
                message: 'Invalid secret key. Please check your Stripe secret key.'
            };
        } else if (error.type === 'StripePermissionError') {
            return {
                isValid: false,
                error: 'Permission denied',
                message: 'The provided keys do not have sufficient permissions.'
            };
        } else if (error.type === 'StripeAPIError') {
            return {
                isValid: false,
                error: 'API error',
                message: 'Stripe API error: ' + error.message
            };
        } else {
            return {
                isValid: false,
                error: 'Validation failed',
                message: 'Unable to validate keys: ' + error.message
            };
        }
    }
};

module.exports = {
    encrypt,
    decrypt,
    validateStripeKey,
    validateStripeKeysWithAPI,
    generateEncryptionKey,
};
