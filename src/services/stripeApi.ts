const API_BASE_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface CreateAccountRequest {
    type: string;
    country: string;
    email: string;
    business_type?: string;
    capabilities?: {
        card_payments?: boolean;
        transfers?: boolean;
    };
}

interface CreateAccountResponse {
    success: boolean;
    account_id?: string;
    account?: any;
    error?: string;
    message?: string;
}

interface CreateAccountLinkRequest {
    account_id: string;
    refresh_url?: string;
    return_url?: string;
}

interface CreateAccountLinkResponse {
    success: boolean;
    url?: string;
    expires_at?: number;
    error?: string;
    message?: string;
}

export const createStripeAccount = async (
    data: CreateAccountRequest
): Promise<CreateAccountResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/stripe/create-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: data.type,
                country: data.country,
                email: data.email,
                business_type: data.business_type || 'individual',
                capabilities: {
                    card_payments: {
                        requested: data.capabilities?.card_payments || true,
                    },
                    transfers: {
                        requested: data.capabilities?.transfers || true,
                    },
                },
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || 'Failed to create Stripe account'
            );
        }

        return result;
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error creating Stripe account:', error);
        throw error;
    }
};

export const createAccountLink = async (
    data: CreateAccountLinkRequest
): Promise<CreateAccountLinkResponse> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/stripe/create-account-link`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account_id: data.account_id,
                    refresh_url:
                        data.refresh_url || 'http://localhost:3000/reauth',
                    return_url:
                        data.return_url || 'http://localhost:3000/return',
                }),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to create account link');
        }

        return result;
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error creating account link:', error);
        throw error;
    }
};

export const getAccountInfo = async (accountId: string) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/stripe/account/${accountId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || 'Failed to retrieve account information'
            );
        }

        return result;
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error retrieving account info:', error);
        throw error;
    }
};
