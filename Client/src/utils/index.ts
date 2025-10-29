export const getEnvironmentConfig = () => {
    const requiredEnvVars = {
        API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
        FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL,
        ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT,
    };

    const missingVars = Object.entries(requiredEnvVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}. ` +
                `Please set REACT_APP_${missingVars[0]}, REACT_APP_${missingVars[1]}, etc. ` +
                `in your .env file or deployment environment.`
        );
    }

    return {
        API_BASE_URL: requiredEnvVars.API_BASE_URL!,
        FRONTEND_URL: requiredEnvVars.FRONTEND_URL!,
        ENVIRONMENT: requiredEnvVars.ENVIRONMENT!,
        APP_NAME: process.env.REACT_APP_APP_NAME || 'Merchant Onboarding',
        VERSION: process.env.REACT_APP_VERSION || '1.0.0',
    };
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};
