import { getEnvironmentConfig } from '../utils';

const config = getEnvironmentConfig();
const API_BASE_URL = `${config.API_BASE_URL}/api`;

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

interface UploadDocumentResponse {
    success: boolean;
    file_id?: string;
    file?: {
        id: string;
        object: string;
        purpose: string;
        filename: string;
        size: number;
        type: string;
        created: number;
    };
    error?: string;
    message?: string;
}

export const uploadDocument = async (
    file: File,
    purpose: string = 'identity_document'
): Promise<UploadDocumentResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', purpose);

        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/stripe/upload-document`, {
            method: 'POST',
            headers,
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to upload document');
        }

        return result;
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error uploading document:', error);
        throw error;
    }
};

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
            headers: getAuthHeaders(),
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
            throw new Error(result.message || 'Failed to create Stripe account');
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
        const response = await fetch(`${API_BASE_URL}/stripe/create-account-link`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                account_id: data.account_id,
                refresh_url: data.refresh_url || `${config.FRONTEND_URL}/reauth`,
                return_url: data.return_url || `${config.FRONTEND_URL}/return`,
            }),
        });

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
    individual_address_line2: string;
    individual_address_city: string;
    individual_address_state: string;
    individual_address_postal_code: string;
    individual_address_country: string;
    individual_ssn_last_4?: string;
    individual_id_number?: string;
    tos_acceptance_date?: number;
    tos_acceptance_ip?: string;
    business_type: string;
    business_profile_mcc: string;
    business_profile_url: string;
    // Company fields (for company business_type)
    company_name: string;
    company_tax_id: string;
    company_vat_id?: string;
    company_organisation_number?: string;
    company_structure: string;
    company_address_line1: string;
    company_address_line2: string;
    company_address_city: string;
    company_address_state: string;
    company_address_postal_code: string;
    company_address_country: string;
    // Company confirmations
    company_directors_provided?: boolean;
    company_executives_provided?: boolean;
    // Representative fields (for company business_type)
    representative_first_name: string;
    representative_last_name: string;
    representative_email: string;
    representative_phone: string;
    representative_dob_day: number;
    representative_dob_month: number;
    representative_dob_year: number;
    representative_address_line1: string;
    representative_address_city: string;
    representative_address_state: string;
    representative_address_postal_code: string;
    representative_address_country: string;
    representative_relationship_representative: boolean;
    representative_relationship_executive: boolean;
    representative_relationship_title: string;
    representative_ssn_last_4?: string;
    representative_id_number?: string;
    representative_relationship_director?: boolean;
    // Owner fields (for company business_type)
    owner_first_name: string;
    owner_last_name: string;
    owner_email: string;
    owner_phone: string;
    owner_dob_day: number;
    owner_dob_month: number;
    owner_dob_year: number;
    owner_address_line1: string;
    owner_address_city: string;
    owner_address_state: string;
    owner_address_postal_code: string;
    owner_address_country: string;
    owner_relationship_owner: boolean;
    owner_relationship_title: string;
    owner_ssn_last_4?: string;
    owner_id_number?: string;
    owner_relationship_director?: boolean;
    // External Account fields
    external_account_object: string;
    external_account_country: string;
    external_account_currency: string;
    // Bank Account fields
    external_account_routing_number?: string;
    external_account_account_number: string;
    external_account_account_holder_name?: string;
    external_account_account_holder_type?: string;
    // Debit Card fields
    external_account_card_number?: string;
    external_account_exp_month?: string;
    external_account_exp_year?: string;
    external_account_cvc?: string;
    // File IDs for identity verification
    individual_verification_document_front?: string;
    individual_verification_document_back?: string;
    individual_verification_additional_document_front?: string;
    individual_verification_additional_document_back?: string;
    company_verification_document_front?: string;
    company_verification_document_back?: string;
    representative_verification_document_front?: string;
    representative_verification_document_back?: string;
    representative_verification_additional_document_front?: string;
    representative_verification_additional_document_back?: string;
    owner_verification_document_front?: string;
    owner_verification_document_back?: string;
    owner_verification_additional_document_front?: string;
    owner_verification_additional_document_back?: string;
    // Additional executives (optional)
    executives?: Array<{
        first_name: string;
        last_name: string;
        email?: string;
        phone?: string;
        dob_day?: number;
        dob_month?: number;
        dob_year?: number;
        address_line1?: string;
        address_city?: string;
        address_state?: string;
        address_postal_code?: string;
        address_country?: string;
        relationship_title?: string;
        id_number?: string;
        ssn_last_4?: string;
    }>;
    // Additional directors (optional)
    directors?: Array<{
        first_name: string;
        last_name: string;
        email?: string;
        phone?: string;
        dob_day?: number;
        dob_month?: number;
        dob_year?: number;
        address_line1?: string;
        address_city?: string;
        address_state?: string;
        address_postal_code?: string;
        address_country?: string;
        relationship_title?: string;
        id_number?: string;
        ssn_last_4?: string;
    }>;
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
            headers: getAuthHeaders(),
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
        const response = await fetch(`${API_BASE_URL}/stripe/account/${accountId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to retrieve account information');
        }

        return result;
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error retrieving account info:', error);
        throw error;
    }
};

interface CreateExternalAccountRequest {
    account_id: string;
    object: string;
    country: string;
    currency: string;
    account_number: string;
    default_for_currency?: boolean;
}

interface CreateExternalAccountResponse {
    success: boolean;
    external_account?: any;
    error?: string;
    message?: string;
}

export const createExternalAccount = async (
    data: CreateExternalAccountRequest
): Promise<CreateExternalAccountResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/stripe/create-external-account`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to create external account');
        }

        return result;
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error creating external account:', error);
        throw error;
    }
};

interface DeleteAccountResponse {
    success: boolean;
    deleted?: boolean;
    account_id?: string;
    error?: string;
    message?: string;
}

interface RejectAccountRequest {
    account_id: string;
    reason: 'fraud' | 'terms_of_service' | 'other';
}

interface RejectAccountResponse {
    success: boolean;
    account?: any;
    error?: string;
    message?: string;
}

export const deleteMerchantAccount = async (accountId: string): Promise<DeleteAccountResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/stripe/accounts/${accountId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete account');
        }

        return result;
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error deleting account:', error);
        throw error;
    }
};

export const rejectMerchantAccount = async (
    data: RejectAccountRequest
): Promise<RejectAccountResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/stripe/accounts/${data.account_id}/reject`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                reason: data.reason,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to reject account');
        }

        return result;
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error rejecting account:', error);
        throw error;
    }
};

interface ClearKeysResponse {
    success: boolean;
    message?: string;
    data?: {
        deleted_count: number;
    };
    error?: string;
}

export const clearStripeKeys = async (): Promise<ClearKeysResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/stripe/keys`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to clear Stripe keys');
        }

        return result;
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error clearing Stripe keys:', error);
        throw error;
    }
};

interface KeysStatusResponse {
    success: boolean;
    hasKeys: boolean;
    message?: string;
    error?: string;
}

export const checkKeysStatus = async (): Promise<KeysStatusResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/stripe/keys/status`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to check keys status');
        }

        return result;
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error checking keys status:', error);
        throw error;
    }
};
