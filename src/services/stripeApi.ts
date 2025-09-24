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
                        data.refresh_url || 'https://localhost:3000/reauth',
                    return_url:
                        data.return_url || 'https://localhost:3000/return',
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

interface DirectOnboardRequest {
    account_id: string;
    individual_first_name: string;
    individual_last_name: string;
    individual_email: string;
    individual_phone: string;
    individual_dob_day: number;
    individual_dob_month: number;
    individual_dob_year: number;
    individual_address_line1: string;
    individual_address_city: string;
    individual_address_postal_code: string;
    individual_address_country: string;
    tos_acceptance_date?: number;
    tos_acceptance_ip?: string;
    business_type: string;
    business_profile_mcc: string;
    business_profile_url: string;
    external_account_object: string;
    external_account_country: string;
    external_account_currency: string;
    external_account_account_number: string;
}

interface DirectOnboardResponse {
    success: boolean;
    account?: any;
    external_account?: any;
    error?: string;
    message?: string;
}

export const directOnboardMerchant = async (
    data: DirectOnboardRequest
): Promise<DirectOnboardResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/stripe/direct-onboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to onboard merchant');
        }

        return result;
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error in direct onboarding:', error);
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
