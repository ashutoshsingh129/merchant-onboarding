export const getEnvironmentConfig = () => {
    return {
        API_BASE_URL:
            process.env.REACT_APP_API_BASE_URL || 'https://merchant-onboarding-api.onrender.com',
        FRONTEND_URL:
            process.env.REACT_APP_FRONTEND_URL || 'https://merchant-onboarding.onrender.com',
        ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'production',
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
