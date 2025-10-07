// Simple in-memory cache for Stripe keys (no encryption)
class StripeKeysCache {
    constructor() {
        this.cache = {
            secretKey: null,
            publishableKey: null,
            lastUpdated: null,
        };
    }

    // Update cache with new keys
    updateKeys(secretKey, publishableKey) {
        try {
            this.cache = {
                secretKey,
                publishableKey,
                lastUpdated: new Date(),
            };
            
            console.log('Stripe keys cache updated successfully');
            return true;
        } catch (error) {
            console.error('Failed to update Stripe keys cache:', error);
            return false;
        }
    }

    // Get current keys from cache
    getKeys() {
        return {
            secretKey: this.cache.secretKey,
            publishableKey: this.cache.publishableKey,
            lastUpdated: this.cache.lastUpdated,
        };
    }

    // Check if cache has valid keys
    hasValidKeys() {
        return this.cache.secretKey && this.cache.publishableKey;
    }

    // Clear cache
    clearCache() {
        this.cache = {
            secretKey: null,
            publishableKey: null,
            lastUpdated: null,
        };
        console.log('Stripe keys cache cleared');
    }

    // Get cache status
    getStatus() {
        return {
            hasKeys: this.hasValidKeys(),
            lastUpdated: this.cache.lastUpdated,
            age: this.cache.lastUpdated ? 
                Math.floor((new Date() - this.cache.lastUpdated) / 1000) : null,
        };
    }
}

// Create singleton instance
const stripeKeysCache = new StripeKeysCache();

module.exports = stripeKeysCache;
