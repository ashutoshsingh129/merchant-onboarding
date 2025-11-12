export interface DirectOnboardFormData {
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
    individual_address_town?: string; // Japan-specific
    individual_ssn_last_4: string;
    individual_id_number: string;
    // Japan-specific fields
    individual_first_name_kana?: string;
    individual_last_name_kana?: string;
    individual_first_name_kanji?: string;
    individual_last_name_kanji?: string;
    // Japan-specific address fields
    individual_address_kana_line1?: string;
    individual_address_kana_line2?: string;
    individual_address_kana_town?: string;
    individual_address_kana_city?: string;
    individual_address_kana_state?: string;
    individual_address_kana_postal_code?: string;
    individual_address_kana_country?: string;
    individual_address_kanji_line1?: string;
    individual_address_kanji_line2?: string;
    individual_address_kanji_town?: string;
    individual_address_kanji_city?: string;
    individual_address_kanji_state?: string;
    individual_address_kanji_postal_code?: string;
    individual_address_kanji_country?: string;
    business_type: string;
    business_profile_mcc: string;
    business_profile_url: string;
    business_description: string; // For non-profit mission/description
    product_description: string; // Product/Business Description
    // Company fields (when business_type is 'company')
    company_name: string;
    company_name_kanji?: string; // Japan-specific
    company_name_kana?: string; // Japan-specific
    company_tax_id: string;
    company_vat_number?: string;
    company_organisation_number?: string;
    company_registration_number?: string; // Japan-specific (Corporate Number)
    company_structure: string;
    company_address_line1: string;
    company_address_line2: string;
    company_address_city: string;
    company_address_state: string;
    company_address_postal_code: string;
    company_address_country: string;
    company_address_kana_postal_code?: string;
    company_address_kana_state?: string;
    company_address_kana_city?: string;
    company_address_kana_line1?: string;
    company_address_kana_line2?: string;
    company_address_kanji_postal_code?: string;
    company_address_kanji_state?: string;
    company_address_kanji_city?: string;
    company_address_kanji_line1?: string;
    company_address_kanji_line2?: string;
    // Company confirmations
    company_directors_provided?: boolean;
    company_executives_provided?: boolean;
    // ToS Acceptance
    tos_acceptance_date: number;
    tos_acceptance_ip: string;
    // External Account fields
    external_account_object: string;
    external_account_country: string;
    external_account_currency: string;
    // Bank Account fields
    external_account_routing_number: string;
    external_account_account_number: string;
    external_account_account_number_confirm?: string;
    external_account_account_holder_name: string;
    external_account_account_holder_type: string;
    // Japan-specific bank account fields
    external_account_bank_code?: string; // 4 digits
    external_account_branch_code?: string; // 3 digits
    external_account_account_type?: string; // 'savings' or 'checking'
    external_account_account_holder_name_kana?: string;
    // Debit Card fields
    external_account_card_number: string;
    external_account_exp_month: string;
    external_account_exp_year: string;
    external_account_cvc: string;
    // Representative Person fields (when business_type is 'company')
    representative_first_name: string;
    representative_last_name: string;
    representative_first_name_kana?: string; // Japan-specific
    representative_last_name_kana?: string; // Japan-specific
    representative_first_name_kanji?: string; // Japan-specific
    representative_last_name_kanji?: string; // Japan-specific
    representative_email: string;
    representative_phone: string;
    representative_dob_day: number;
    representative_dob_month: number;
    representative_dob_year: number;
    representative_address_line1: string;
    representative_address_line2?: string;
    representative_address_line2_kana?: string;
    representative_address_kana_postal_code?: string;
    representative_address_kana_state?: string;
    representative_address_kana_city?: string;
    representative_address_kana_line1?: string;
    representative_address_kana_line2?: string;
    representative_address_kanji_postal_code?: string;
    representative_address_kanji_state?: string;
    representative_address_kanji_city?: string;
    representative_address_kanji_line1?: string;
    representative_address_kanji_line2?: string;
    representative_address_city: string;
    representative_address_state: string;
    representative_address_postal_code: string;
    representative_address_country: string;
    representative_address_town?: string;
    representative_address_kana_town?: string;
    representative_address_kanji_town?: string;
    representative_relationship_representative: boolean;
    representative_relationship_executive: boolean;
    representative_relationship_director?: boolean;
    representative_relationship_title: string;
    representative_ssn_last_4: string;
    representative_id_number: string;
    // Owner Person fields (when business_type is 'company')
    owner_first_name: string;
    owner_last_name: string;
    owner_first_name_kana?: string; // Japan-specific
    owner_last_name_kana?: string; // Japan-specific
    owner_email: string;
    owner_phone: string;
    owner_dob_day: number;
    owner_dob_month: number;
    owner_dob_year: number;
    owner_address_line1: string;
    owner_address_line2?: string;
    owner_address_city: string;
    owner_address_state: string;
    owner_address_postal_code: string;
    owner_address_country: string;
    owner_address_town?: string;
    owner_address_line2_kana?: string;
    owner_address_kana_postal_code?: string;
    owner_address_kana_state?: string;
    owner_address_kana_city?: string;
    owner_address_kana_town?: string;
    owner_address_kana_line1?: string;
    owner_address_kana_line2?: string;
    owner_address_kanji_postal_code?: string;
    owner_address_kanji_state?: string;
    owner_address_kanji_city?: string;
    owner_address_kanji_town?: string;
    owner_address_kanji_line1?: string;
    owner_address_kanji_line2?: string;
    owner_relationship_owner: boolean;
    owner_relationship_director?: boolean;
    owner_relationship_title: string;
    owner_ssn_last_4: string;
    owner_id_number: string;
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
}

export interface DirectOnboardFormProps {
    accountId: string;
    email: string;
    businessType?: string;
    country?: string;
    onClose?: () => void;
    onSuccess?: () => void;
}
