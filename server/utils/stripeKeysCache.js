// User-specific in-memory cache for Stripe keys (no encryption)
class StripeKeysCache {
    constructor() {
        // Cache structure: { userId: { secretKey, publishableKey, lastUpdated } }
        this.cache = new Map();
    }

    // Update cache with new keys for a specific user
    updateKeys(userId, secretKey, publishableKey) {
        try {
            this.cache.set(userId, {
                secretKey,
                publishableKey,
                lastUpdated: new Date(),
            });
            
            console.log(`Stripe keys cache updated successfully for user ${userId}`);
            return true;
        } catch (error) {
            console.error(`Failed to update Stripe keys cache for user ${userId}:`, error);
            return false;
        }
    }

    // Alias for updateKeys for consistency
    updateUserKeys(userId, secretKey, publishableKey) {
        return this.updateKeys(userId, secretKey, publishableKey);
    }

    // Get current keys from cache for a specific user
    getKeys(userId) {
        const userCache = this.cache.get(userId);
        if (!userCache) {
            return {
                secretKey: null,
                publishableKey: null,
                lastUpdated: null,
            };
        }
        return {
            secretKey: userCache.secretKey,
            publishableKey: userCache.publishableKey,
            lastUpdated: userCache.lastUpdated,
        };
    }

    // Check if cache has valid keys for a specific user
    hasValidKeys(userId) {
        const userCache = this.cache.get(userId);
        return userCache && userCache.secretKey && userCache.publishableKey;
    }

    // Clear cache for a specific user
    clearUserCache(userId) {
        this.cache.delete(userId);
        console.log(`Stripe keys cache cleared for user ${userId}`);
    }

    // Clear all cache
    clearCache() {
        this.cache.clear();
        console.log('All Stripe keys cache cleared');
    }

    // Get cache status for a specific user
    getStatus(userId) {
        const userCache = this.cache.get(userId);
        if (!userCache) {
            return {
                hasKeys: false,
                lastUpdated: null,
                age: null,
            };
        }
        return {
            hasKeys: this.hasValidKeys(userId),
            lastUpdated: userCache.lastUpdated,
            age: userCache.lastUpdated ? 
                Math.floor((new Date() - userCache.lastUpdated) / 1000) : null,
        };
    }

    // Get all cached users (for debugging)
    getCachedUsers() {
        return Array.from(this.cache.keys());
    }
}

// Create singleton instance
const stripeKeysCache = new StripeKeysCache();

module.exports = stripeKeysCache;
