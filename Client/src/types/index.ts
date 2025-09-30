export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface TableColumn {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'right' | 'left' | 'center';
    format?: (value: any) => string;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

export interface EnvironmentConfig {
    API_BASE_URL: string;
    ENVIRONMENT: string;
    APP_NAME: string;
    VERSION: string;
}

export interface MerchantAccount {
    id: string;
    email: string | null;
    business_type: 'individual' | 'company' | string;
    country: string;
    created: number; // UNIX timestamp

    business_profile: {
        name: string | null;
        url: string | null;
        mcc: string | null;
    };

    capabilities: {
        card_payments: 'active' | 'inactive' | 'pending';
        transfers: 'active' | 'inactive' | 'pending';
    };

    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;

    requirements: {
        disabled_reason: string | null;
    };

    tos_acceptance: {
        date: number | null; // UNIX timestamp
        ip: string | null;
        user_agent: string | null;
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    has_more: boolean;
    total_count?: number;
    url?: string;
}

export interface PaginationParams {
    limit?: number;
    starting_after?: string;
    ending_before?: string;
}
