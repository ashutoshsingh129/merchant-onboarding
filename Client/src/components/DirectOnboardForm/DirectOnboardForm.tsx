import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Grid2 as Grid,
    Card,
    CardContent,
    CardActions,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    CloudUpload as CloudUploadIcon,
    CheckCircle as CheckCircleIcon,
    AccountBalance as AccountBalanceIcon,
    CreditCard as CreditCardIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { directOnboardMerchant, uploadDocument } from '../../services/stripeApi';
import { useIPDetection } from '../../services/ipService';

interface DirectOnboardFormData {
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
    individual_ssn_last_4: string;
    individual_id_number: string;
    business_type: string;
    business_profile_mcc: string;
    business_profile_url: string;
    business_description: string; // For non-profit mission/description
    // Company fields (when business_type is 'company')
    company_name: string;
    company_tax_id: string;
    company_structure: string;
    company_address_line1: string;
    company_address_line2: string;
    company_address_city: string;
    company_address_state: string;
    company_address_postal_code: string;
    company_address_country: string;
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
    external_account_account_holder_name: string;
    external_account_account_holder_type: string;
    // Debit Card fields
    external_account_card_number: string;
    external_account_exp_month: string;
    external_account_exp_year: string;
    external_account_cvc: string;
    // Representative Person fields (when business_type is 'company')
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
    representative_ssn_last_4: string;
    representative_id_number: string;
    // Owner Person fields (when business_type is 'company')
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
}

interface DirectOnboardFormProps {
    accountId: string;
    email: string;
    businessType?: string;
    country?: string;
    onClose?: () => void;
    onSuccess?: () => void;
}

const DirectOnboardForm: React.FC<DirectOnboardFormProps> = ({
    accountId,
    email,
    businessType,
    country,
    onClose,
    onSuccess,
}) => {
    // Auto-detect user's IP address
    const {
        ip: detectedIP,
        isLoading: ipLoading,
        error: ipError,
        retry: retryIP,
    } = useIPDetection();

    const STORAGE_KEY = `directOnboardForm_${accountId || 'new'}`;

    const [formData, setFormData] = useState<DirectOnboardFormData>({
        account_id: accountId,
        individual_first_name: '',
        individual_last_name: '',
        individual_email: email,
        individual_phone: '',
        individual_dob_day: 1,
        individual_dob_month: 1,
        individual_dob_year: 1990,
        individual_address_line1: '',
        individual_address_line2: '',
        individual_address_city: '',
        individual_address_state: '',
        individual_address_postal_code: '',
        individual_address_country: country || 'US',
        individual_ssn_last_4: '',
        individual_id_number: '',
        business_type: businessType || 'individual',
        business_profile_mcc: '4816',
        business_profile_url: '',
        business_description: '',
        // Company fields
        company_name: '',
        company_tax_id: '',
        company_structure: 'private_corporation',
        company_address_line1: '',
        company_address_line2: '',
        company_address_city: '',
        company_address_state: '',
        company_address_postal_code: '',
        company_address_country: country || 'US',
        // ToS Acceptance
        tos_acceptance_date: Math.floor(Date.now() / 1000),
        tos_acceptance_ip: detectedIP || '',
        // External Account fields
        external_account_object: 'bank_account',
        external_account_country: country || 'US',
        external_account_currency: 'usd',
        // Bank Account fields
        external_account_routing_number: '',
        external_account_account_number: '',
        external_account_account_holder_name: '',
        external_account_account_holder_type: 'individual',
        // Debit Card fields
        external_account_card_number: '',
        external_account_exp_month: '01',
        external_account_exp_year: new Date().getFullYear().toString(),
        external_account_cvc: '',
        // Representative Person fields
        representative_first_name: '',
        representative_last_name: '',
        representative_email: '',
        representative_phone: '',
        representative_dob_day: 1,
        representative_dob_month: 1,
        representative_dob_year: 1990,
        representative_address_line1: '',
        representative_address_city: '',
        representative_address_state: '',
        representative_address_postal_code: '',
        representative_address_country: country || 'US',
        representative_relationship_representative: true,
        representative_relationship_executive: false,
        representative_relationship_title: '',
        representative_ssn_last_4: '',
        representative_id_number: '',
        // Owner Person fields
        owner_first_name: '',
        owner_last_name: '',
        owner_email: '',
        owner_phone: '',
        owner_dob_day: 1,
        owner_dob_month: 1,
        owner_dob_year: 1990,
        owner_address_line1: '',
        owner_address_city: '',
        owner_address_state: '',
        owner_address_postal_code: '',
        owner_address_country: country || 'US',
        owner_relationship_owner: true,
        owner_relationship_title: '',
        owner_ssn_last_4: '',
        owner_id_number: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [representativeIsOwner, setRepresentativeIsOwner] = useState(false);

    // SSN type toggles: 'last4', 'full', or 'both'
    const [individualSsnType, setIndividualSsnType] = useState<'last4' | 'full' | 'both'>('last4');
    const [representativeSsnType, setRepresentativeSsnType] = useState<'last4' | 'full' | 'both'>(
        'last4'
    );
    const [ownerSsnType, setOwnerSsnType] = useState<'last4' | 'full' | 'both'>('last4');
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
    const [showExternalAccount, setShowExternalAccount] = useState(false);

    // File upload states
    const [uploadingFile, setUploadingFile] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<{
        individual_front?: { id: string; name: string };
        individual_back?: { id: string; name: string };
        individual_additional_front?: { id: string; name: string };
        individual_additional_back?: { id: string; name: string };
        company_front?: { id: string; name: string };
        company_back?: { id: string; name: string };
        representative_front?: { id: string; name: string };
        representative_back?: { id: string; name: string };
        representative_additional_front?: { id: string; name: string };
        representative_additional_back?: { id: string; name: string };
        owner_front?: { id: string; name: string };
        owner_back?: { id: string; name: string };
        owner_additional_front?: { id: string; name: string };
        owner_additional_back?: { id: string; name: string };
    }>({});

    // Load saved form data on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed }));
            }
        } catch {
            // ignore storage errors
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist form data on change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        } catch {
            // ignore storage errors
        }
    }, [STORAGE_KEY, formData]);

    // Check if form has unsaved changes
    const hasUnsavedChanges =
        formData.individual_first_name !== '' ||
        formData.individual_last_name !== '' ||
        formData.individual_phone !== '' ||
        formData.individual_address_line1 !== '' ||
        formData.company_name !== '' ||
        formData.external_account_routing_number !== '' ||
        formData.external_account_account_number !== '';

    // Handle beforeunload event to warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return 'You have unsaved changes. Are you sure you want to leave?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Update IP address when detection completes
    useEffect(() => {
        if (detectedIP && detectedIP !== formData.tos_acceptance_ip) {
            setFormData(prev => ({
                ...prev,
                tos_acceptance_ip: detectedIP,
            }));
        }
    }, [detectedIP, formData.tos_acceptance_ip]);

    // Update default company_structure when business_type changes to non_profit
    useEffect(() => {
        if (
            formData.business_type === 'non_profit' &&
            (formData.company_structure === 'private_corporation' || !formData.company_structure)
        ) {
            setFormData(prev => ({
                ...prev,
                company_structure: 'unincorporated_non_profit',
            }));
        } else if (
            formData.business_type === 'company' &&
            (formData.company_structure === 'unincorporated_non_profit' ||
                formData.company_structure === 'incorporated_non_profit')
        ) {
            setFormData(prev => ({
                ...prev,
                company_structure: 'private_corporation',
            }));
        }
    }, [formData.business_type]);

    // Update account_id and email when props change
    useEffect(() => {
        if (accountId) {
            setFormData(prev => ({
                ...prev,
                account_id: accountId,
            }));
        }
    }, [accountId]);

    useEffect(() => {
        if (email) {
            setFormData(prev => ({
                ...prev,
                individual_email: email,
            }));
        }
    }, [email]);

    const countries = [
        { code: 'NL', name: 'Netherlands' },
        { code: 'US', name: 'United States' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'CA', name: 'Canada' },
        { code: 'AU', name: 'Australia' },
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
        { code: 'ES', name: 'Spain' },
        { code: 'IT', name: 'Italy' },
    ];

    const businessTypes = [
        { value: 'individual', label: 'Individual' },
        { value: 'company', label: 'Company' },
        { value: 'non_profit', label: 'Non-profit' },
        { value: 'government_entity', label: 'Government Entity' },
    ];

    const companyStructures = [
        { value: 'government_instrumentality', label: 'Government Instrumentality' },
        { value: 'governmental_unit', label: 'Governmental Unit' },
        { value: 'incorporated_non_profit', label: 'Incorporated Non-profit' },
        { value: 'single_member_llc', label: 'Single-member LLC' },
        { value: 'multi_member_llc', label: 'Multi-member LLC' },
        { value: 'private_corporation', label: 'Private Corporation' },
        { value: 'private_partnership', label: 'Private Partnership' },
        { value: 'public_corporation', label: 'Public Corporation' },
        { value: 'public_partnership', label: 'Public Partnership' },
        {
            value: 'tax_exempt_government_instrumentality',
            label: 'Tax Exempt Government Instrumentality',
        },
        { value: 'unincorporated_association', label: 'Unincorporated Association' },
        { value: 'unincorporated_non_profit', label: 'Unincorporated Non-profit' },
    ];

    const currencies = [
        { code: 'eur', name: 'Euro (EUR)' },
        { code: 'usd', name: 'US Dollar (USD)' },
        { code: 'gbp', name: 'British Pound (GBP)' },
        { code: 'cad', name: 'Canadian Dollar (CAD)' },
    ];

    const months = [
        { value: 1, name: 'January' },
        { value: 2, name: 'February' },
        { value: 3, name: 'March' },
        { value: 4, name: 'April' },
        { value: 5, name: 'May' },
        { value: 6, name: 'June' },
        { value: 7, name: 'July' },
        { value: 8, name: 'August' },
        { value: 9, name: 'September' },
        { value: 10, name: 'October' },
        { value: 11, name: 'November' },
        { value: 12, name: 'December' },
    ];

    const handleInputChange = (field: keyof DirectOnboardFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileUpload = async (
        file: File,
        type:
            | 'individual_front'
            | 'individual_back'
            | 'individual_additional_front'
            | 'individual_additional_back'
            | 'company_front'
            | 'company_back'
            | 'representative_front'
            | 'representative_back'
            | 'representative_additional_front'
            | 'representative_additional_back'
            | 'owner_front'
            | 'owner_back'
            | 'owner_additional_front'
            | 'owner_additional_back'
    ) => {
        try {
            setUploadingFile(type);
            setError(null);

            const response = await uploadDocument(file, 'identity_document');

            if (response.success && response.file_id) {
                // Update uploaded files state
                setUploadedFiles(prev => ({
                    ...prev,
                    [type]: { id: response.file_id!, name: file.name },
                }));

                // Update form data with file ID
                const fieldMapping = {
                    individual_front: 'individual_verification_document_front',
                    individual_back: 'individual_verification_document_back',
                    individual_additional_front:
                        'individual_verification_additional_document_front',
                    individual_additional_back: 'individual_verification_additional_document_back',
                    company_front: 'company_verification_document_front',
                    company_back: 'company_verification_document_back',
                    representative_front: 'representative_verification_document_front',
                    representative_back: 'representative_verification_document_back',
                    representative_additional_front:
                        'representative_verification_additional_document_front',
                    representative_additional_back:
                        'representative_verification_additional_document_back',
                    owner_front: 'owner_verification_document_front',
                    owner_back: 'owner_verification_document_back',
                    owner_additional_front: 'owner_verification_additional_document_front',
                    owner_additional_back: 'owner_verification_additional_document_back',
                } as const;

                setFormData(prev => ({
                    ...prev,
                    [fieldMapping[type]]: response.file_id,
                }));
            }
        } catch (err: any) {
            setError(err.message || 'Failed to upload document');
        } finally {
            setUploadingFile(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Prepare payload with appropriate SSN fields based on toggle state
            const payload: any = { ...formData };

            // Handle individual SSN
            if (individualSsnType === 'last4') {
                // Only send last 4 digits
                if (formData.individual_ssn_last_4) {
                    payload.individual_ssn_last_4 = formData.individual_ssn_last_4;
                }
                delete payload.individual_id_number;
            } else if (individualSsnType === 'full') {
                // Only send full SSN
                if (formData.individual_id_number) {
                    payload.individual_id_number = formData.individual_id_number;
                }
                delete payload.individual_ssn_last_4;
            } else if (individualSsnType === 'both') {
                // Send both if provided
                if (!formData.individual_ssn_last_4) delete payload.individual_ssn_last_4;
                if (!formData.individual_id_number) delete payload.individual_id_number;
            }

            // Handle representative SSN (for company and non-profit business type)
            if (formData.business_type === 'company' || formData.business_type === 'non_profit') {
                if (representativeSsnType === 'last4') {
                    // Only send last 4 digits
                    if (formData.representative_ssn_last_4) {
                        payload.representative_ssn_last_4 = formData.representative_ssn_last_4;
                    }
                    delete payload.representative_id_number;
                } else if (representativeSsnType === 'full') {
                    // Only send full SSN
                    if (formData.representative_id_number) {
                        payload.representative_id_number = formData.representative_id_number;
                    }
                    delete payload.representative_ssn_last_4;
                } else if (representativeSsnType === 'both') {
                    // Send both if provided
                    if (!formData.representative_ssn_last_4)
                        delete payload.representative_ssn_last_4;
                    if (!formData.representative_id_number) delete payload.representative_id_number;
                }

                // Handle owner SSN (for company business type)
                if (ownerSsnType === 'last4') {
                    // Only send last 4 digits
                    if (formData.owner_ssn_last_4) {
                        payload.owner_ssn_last_4 = formData.owner_ssn_last_4;
                    }
                    delete payload.owner_id_number;
                } else if (ownerSsnType === 'full') {
                    // Only send full SSN
                    if (formData.owner_id_number) {
                        payload.owner_id_number = formData.owner_id_number;
                    }
                    delete payload.owner_ssn_last_4;
                } else if (ownerSsnType === 'both') {
                    // Send both if provided
                    if (!formData.owner_ssn_last_4) delete payload.owner_ssn_last_4;
                    if (!formData.owner_id_number) delete payload.owner_id_number;
                }
            }

            const response = await directOnboardMerchant(payload);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    if (onClose) {
                        onClose();
                    }
                    if (onSuccess) {
                        onSuccess();
                    }
                    setSuccess(false);
                    try {
                        localStorage.removeItem(STORAGE_KEY);
                    } catch {}
                    // Reset uploaded files
                    setUploadedFiles({});
                    // Reset form completely
                    setFormData({
                        account_id: accountId,
                        individual_first_name: '',
                        individual_last_name: '',
                        individual_email: email,
                        individual_phone: '',
                        individual_dob_day: 1,
                        individual_dob_month: 1,
                        individual_dob_year: 1990,
                        individual_address_line1: '',
                        individual_address_line2: '',
                        individual_address_city: '',
                        individual_address_state: '',
                        individual_address_postal_code: '',
                        individual_address_country: country || 'US',
                        individual_ssn_last_4: '',
                        individual_id_number: '',
                        business_type: businessType || 'individual',
                        business_profile_mcc: '',
                        business_profile_url: '',
                        business_description: '',
                        // Company fields
                        company_name: '',
                        company_tax_id: '',
                        company_structure: 'private_corporation',
                        company_address_line1: '',
                        company_address_line2: '',
                        company_address_city: '',
                        company_address_state: '',
                        company_address_postal_code: '',
                        company_address_country: country || 'US',
                        // ToS Acceptance
                        tos_acceptance_date: Math.floor(Date.now() / 1000),
                        tos_acceptance_ip: '',
                        // External Account fields
                        external_account_object: 'bank_account',
                        external_account_country: country || 'US',
                        external_account_currency: 'usd',
                        // Bank Account fields
                        external_account_routing_number: '',
                        external_account_account_number: '',
                        external_account_account_holder_name: '',
                        external_account_account_holder_type: 'individual',
                        // Debit Card fields
                        external_account_card_number: '',
                        external_account_exp_month: '01',
                        external_account_exp_year: new Date().getFullYear().toString(),
                        external_account_cvc: '',
                        // Representative Person fields
                        representative_first_name: '',
                        representative_last_name: '',
                        representative_email: '',
                        representative_phone: '',
                        representative_dob_day: 1,
                        representative_dob_month: 1,
                        representative_dob_year: 1990,
                        representative_address_line1: '',
                        representative_address_city: '',
                        representative_address_state: '',
                        representative_address_postal_code: '',
                        representative_address_country: country || 'US',
                        representative_relationship_representative: true,
                        representative_relationship_executive: false,
                        representative_relationship_title: '',
                        representative_ssn_last_4: '',
                        representative_id_number: '',
                        // Owner Person fields
                        owner_first_name: '',
                        owner_last_name: '',
                        owner_email: '',
                        owner_phone: '',
                        owner_dob_day: 1,
                        owner_dob_month: 1,
                        owner_dob_year: 1990,
                        owner_address_line1: '',
                        owner_address_city: '',
                        owner_address_state: '',
                        owner_address_postal_code: '',
                        owner_address_country: country || 'US',
                        owner_relationship_owner: true,
                        owner_relationship_title: '',
                        owner_ssn_last_4: '',
                        owner_id_number: '',
                    });
                    setRepresentativeIsOwner(false);
                }, 2000);
            } else {
                setError('Failed to onboard merchant');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while onboarding the merchant');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading && onClose) {
            onClose();
            setError(null);
            setSuccess(false);
        }
    };

    const handleReset = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {}
        setUploadedFiles({});
        setFormData(prev => ({
            ...prev,
            account_id: accountId,
            individual_first_name: '',
            individual_last_name: '',
            individual_email: email,
            individual_phone: '',
            individual_dob_day: 1,
            individual_dob_month: 1,
            individual_dob_year: 1990,
            individual_address_line1: '',
            individual_address_line2: '',
            individual_address_city: '',
            individual_address_state: '',
            individual_address_postal_code: '',
            individual_address_country: country || 'US',
            individual_ssn_last_4: '',
            individual_id_number: '',
            business_type: businessType || 'individual',
            business_profile_mcc: '',
            business_profile_url: '',
            business_description: '',
            company_name: '',
            company_tax_id: '',
            company_structure: 'private_corporation',
            company_address_line1: '',
            company_address_line2: '',
            company_address_city: '',
            company_address_state: '',
            company_address_postal_code: '',
            company_address_country: country || 'US',
            tos_acceptance_date: Math.floor(Date.now() / 1000),
            tos_acceptance_ip: '',
            external_account_object: 'bank_account',
            external_account_country: country || 'US',
            external_account_currency: 'usd',
            external_account_routing_number: '',
            external_account_account_number: '',
            external_account_account_holder_name: '',
            external_account_account_holder_type: 'individual',
            external_account_card_number: '',
            external_account_exp_month: '01',
            external_account_exp_year: new Date().getFullYear().toString(),
            external_account_cvc: '',
            representative_first_name: '',
            representative_last_name: '',
            representative_email: '',
            representative_phone: '',
            representative_dob_day: 1,
            representative_dob_month: 1,
            representative_dob_year: 1990,
            representative_address_line1: '',
            representative_address_city: '',
            representative_address_state: '',
            representative_address_postal_code: '',
            representative_address_country: country || 'US',
            representative_relationship_representative: true,
            representative_relationship_executive: false,
            representative_relationship_title: '',
            representative_ssn_last_4: '',
            representative_id_number: '',
            owner_first_name: '',
            owner_last_name: '',
            owner_email: '',
            owner_phone: '',
            owner_dob_day: 1,
            owner_dob_month: 1,
            owner_dob_year: 1990,
            owner_address_line1: '',
            owner_address_city: '',
            owner_address_state: '',
            owner_address_postal_code: '',
            owner_address_country: country || 'US',
            owner_relationship_owner: true,
            owner_relationship_title: '',
            owner_ssn_last_4: '',
            owner_id_number: '',
        }));
        setError(null);
        setSuccess(false);
    };

    return (
        <>
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
                        <PersonAddIcon />
                        <Typography variant="h6">Direct Merchant Onboarding</Typography>
                    </Box>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            {/* Account ID */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Account ID"
                                    value={formData.account_id}
                                    onChange={e => handleInputChange('account_id', e.target.value)}
                                    placeholder="acct_1SAA85KHetaYuagI"
                                    helperText="Account ID from created account"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{
                                        '& .MuiInputBase-input.Mui-readOnly': {
                                            backgroundColor: 'grey.100',
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Business Information - Show immediately after Account ID for company and non-profit profiles */}
                            {(formData.business_type === 'company' ||
                                formData.business_type === 'non_profit') && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Business Information
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Business Type</InputLabel>
                                            <Select
                                                value={formData.business_type}
                                                label="Business Type"
                                                onChange={e =>
                                                    handleInputChange(
                                                        'business_type',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {businessTypes.map(type => (
                                                    <MenuItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="MCC (Merchant Category Code)"
                                            value={formData.business_profile_mcc}
                                            onChange={e =>
                                                handleInputChange(
                                                    'business_profile_mcc',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="4816"
                                            helperText="4-digit merchant category code"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Business URL"
                                            value={formData.business_profile_url}
                                            onChange={e =>
                                                handleInputChange(
                                                    'business_profile_url',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="https://example-merchant.com"
                                        />
                                    </Grid>

                                    {/* Business Description - Only for Non-profit */}
                                    {formData.business_type === 'non_profit' && (
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                label="Organization Mission & Activities"
                                                value={formData.business_description}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'business_description',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Describe your non-profit's mission, purpose, and main activities"
                                                multiline
                                                rows={4}
                                                helperText="Provide a brief description of your organization's mission and activities (recommended for non-profit verification)"
                                            />
                                        </Grid>
                                    )}
                                </>
                            )}

                            {/* Personal Information - Only show when business type is Individual */}
                            {/* {formData.business_type === 'individual' && (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="h6" gutterBottom sx={{ color: 'green' }}>
                                        ✅ Individual Information (VISIBLE)
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 2, color: 'blue' }}
                                    >
                                        DEBUG: Business type is: {formData.business_type} -
                                        Individual fields should be visible
                                    </Typography>
                                </Grid>
                            </>
                        )} */}

                            {/* Individual Fields - Only show when business type is Individual */}
                            {formData.business_type === 'individual' && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        value={formData.individual_first_name}
                                        onChange={e =>
                                            handleInputChange(
                                                'individual_first_name',
                                                e.target.value
                                            )
                                        }
                                        placeholder="First Name"
                                    />
                                </Grid>
                            )}

                            {formData.business_type === 'individual' && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        value={formData.individual_last_name}
                                        onChange={e =>
                                            handleInputChange(
                                                'individual_last_name',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Last Name"
                                    />
                                </Grid>
                            )}

                            {formData.business_type === 'individual' && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={formData.individual_email}
                                        onChange={e =>
                                            handleInputChange('individual_email', e.target.value)
                                        }
                                        placeholder="merchant@example.com"
                                        InputProps={{
                                            readOnly: !!email,
                                        }}
                                        sx={{
                                            '& .MuiInputBase-input.Mui-readOnly': {
                                                backgroundColor: 'grey.100',
                                            },
                                        }}
                                    />
                                </Grid>
                            )}

                            {formData.business_type === 'individual' && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={formData.individual_phone}
                                        onChange={e =>
                                            handleInputChange('individual_phone', e.target.value)
                                        }
                                        placeholder="+15551234567"
                                    />
                                </Grid>
                            )}

                            {/* Date of Birth - Only show when business type is Individual */}
                            {formData.business_type === 'individual' && (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Date of Birth
                                    </Typography>
                                </Grid>
                            )}

                            {formData.business_type === 'individual' && (
                                <Grid size={{ xs: 4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Day</InputLabel>
                                        <Select
                                            value={formData.individual_dob_day}
                                            label="Day"
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_dob_day',
                                                    e.target.value
                                                )
                                            }
                                        >
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                                                day => (
                                                    <MenuItem key={day} value={day}>
                                                        {day}
                                                    </MenuItem>
                                                )
                                            )}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {formData.business_type === 'individual' && (
                                <Grid size={{ xs: 4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Month</InputLabel>
                                        <Select
                                            value={formData.individual_dob_month}
                                            label="Month"
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_dob_month',
                                                    e.target.value
                                                )
                                            }
                                        >
                                            {months.map(month => (
                                                <MenuItem key={month.value} value={month.value}>
                                                    {month.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {formData.business_type === 'individual' && (
                                <Grid size={{ xs: 4 }}>
                                    <TextField
                                        fullWidth
                                        label="Year"
                                        type="number"
                                        value={formData.individual_dob_year}
                                        onChange={e =>
                                            handleInputChange(
                                                'individual_dob_year',
                                                parseInt(e.target.value)
                                            )
                                        }
                                        inputProps={{
                                            min: 1900,
                                            max: new Date().getFullYear(),
                                        }}
                                    />
                                </Grid>
                            )}

                            {/* Address - Only show when business type is Individual */}
                            {formData.business_type === 'individual' && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Address
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Address Line 1"
                                            value={formData.individual_address_line1}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_line1',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="123 Main Street"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Address Line 2"
                                            value={formData.individual_address_line2}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_line2',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Apartment, suite, unit, or building"
                                            helperText="Optional"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="City"
                                            value={formData.individual_address_city}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_city',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="New York"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="State"
                                            value={formData.individual_address_state}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_state',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="NY"
                                            helperText="State, county, province, or region"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Country</InputLabel>
                                            <Select
                                                value={formData.individual_address_country}
                                                label="Country"
                                                onChange={e =>
                                                    handleInputChange(
                                                        'individual_address_country',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {countries.map(country => (
                                                    <MenuItem
                                                        key={country.code}
                                                        value={country.code}
                                                    >
                                                        {country.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 4, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="Postal Code"
                                            value={formData.individual_address_postal_code}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_postal_code',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="12345"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                Social Security Number (SSN)
                                            </Typography>
                                            <ToggleButtonGroup
                                                value={individualSsnType}
                                                exclusive
                                                onChange={(e, newValue) => {
                                                    if (newValue !== null) {
                                                        setIndividualSsnType(newValue);
                                                        // Clear both fields when switching
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            individual_ssn_last_4: '',
                                                            individual_id_number: '',
                                                        }));
                                                    }
                                                }}
                                                size="small"
                                                fullWidth
                                            >
                                                <ToggleButton value="last4">
                                                    Last 4 Digits
                                                </ToggleButton>
                                                <ToggleButton value="full">Full SSN</ToggleButton>
                                                <ToggleButton value="both">Both</ToggleButton>
                                            </ToggleButtonGroup>
                                        </Box>
                                        {individualSsnType === 'last4' ? (
                                            <TextField
                                                fullWidth
                                                label="SSN Last 4 Digits"
                                                value={formData.individual_ssn_last_4}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'individual_ssn_last_4',
                                                        e.target.value.replace(/\D/g, '')
                                                    )
                                                }
                                                placeholder="1234"
                                                inputProps={{ maxLength: 4 }}
                                                helperText="Last 4 digits of Social Security Number (US only)"
                                            />
                                        ) : individualSsnType === 'full' ? (
                                            <TextField
                                                fullWidth
                                                label="Full SSN"
                                                value={formData.individual_id_number}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'individual_id_number',
                                                        e.target.value.replace(/\D/g, '')
                                                    )
                                                }
                                                placeholder="123456789"
                                                inputProps={{ maxLength: 9 }}
                                                helperText="9-digit Social Security Number (US only)"
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 2,
                                                }}
                                            >
                                                <TextField
                                                    fullWidth
                                                    label="SSN Last 4 Digits"
                                                    value={formData.individual_ssn_last_4}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'individual_ssn_last_4',
                                                            e.target.value.replace(/\D/g, '')
                                                        )
                                                    }
                                                    placeholder="1234"
                                                    inputProps={{ maxLength: 4 }}
                                                    helperText="Last 4 digits of Social Security Number"
                                                />
                                                <TextField
                                                    fullWidth
                                                    label="Full SSN"
                                                    value={formData.individual_id_number}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'individual_id_number',
                                                            e.target.value.replace(/\D/g, '')
                                                        )
                                                    }
                                                    placeholder="123456789"
                                                    inputProps={{ maxLength: 9 }}
                                                    helperText="9-digit Social Security Number"
                                                />
                                            </Box>
                                        )}
                                    </Grid>
                                </>
                            )}

                            {/* Identity Document Upload - Only show when business type is Individual */}
                            {formData.business_type === 'individual' && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Identity Verification (Optional)
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            Upload an identity document (driver's license, passport,
                                            etc.) to verify your identity
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.individual_front ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={uploadingFile === 'individual_front'}
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'individual_front'
                                                ? 'Uploading...'
                                                : uploadedFiles.individual_front
                                                  ? `Uploaded: ${uploadedFiles.individual_front.name}`
                                                  : 'Upload ID Document (Front)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(file, 'individual_front');
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.individual_back ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={uploadingFile === 'individual_back'}
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'individual_back'
                                                ? 'Uploading...'
                                                : uploadedFiles.individual_back
                                                  ? `Uploaded: ${uploadedFiles.individual_back.name}`
                                                  : 'Upload ID Document (Back)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(file, 'individual_back');
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                            Additional Document (Address Proof - Optional)
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            Upload a utility bill, bank statement, or official
                                            correspondence
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.individual_additional_front ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={
                                                uploadingFile === 'individual_additional_front'
                                            }
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'individual_additional_front'
                                                ? 'Uploading...'
                                                : uploadedFiles.individual_additional_front
                                                  ? `Uploaded: ${uploadedFiles.individual_additional_front.name}`
                                                  : 'Upload Address Proof (Front)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(
                                                            file,
                                                            'individual_additional_front'
                                                        );
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.individual_additional_back ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={
                                                uploadingFile === 'individual_additional_back'
                                            }
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'individual_additional_back'
                                                ? 'Uploading...'
                                                : uploadedFiles.individual_additional_back
                                                  ? `Uploaded: ${uploadedFiles.individual_additional_back.name}`
                                                  : 'Upload Address Proof (Back)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(
                                                            file,
                                                            'individual_additional_back'
                                                        );
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>
                                </>
                            )}

                            {/* Business Information - Show for individual profiles after address */}
                            {formData.business_type === 'individual' && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Business Information
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Business Type</InputLabel>
                                            <Select
                                                value={formData.business_type}
                                                label="Business Type"
                                                onChange={e =>
                                                    handleInputChange(
                                                        'business_type',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {businessTypes.map(type => (
                                                    <MenuItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="MCC (Merchant Category Code)"
                                            value={formData.business_profile_mcc}
                                            onChange={e =>
                                                handleInputChange(
                                                    'business_profile_mcc',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="4816"
                                            helperText="4-digit merchant category code"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Business URL"
                                            value={formData.business_profile_url}
                                            onChange={e =>
                                                handleInputChange(
                                                    'business_profile_url',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="https://example-merchant.com"
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Company/Non-profit Information - Show when business type is Company or Non-profit */}
                            {(formData.business_type === 'company' ||
                                formData.business_type === 'non_profit') && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            {formData.business_type === 'non_profit'
                                                ? 'Non-profit Information'
                                                : 'Company Information'}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label={
                                                formData.business_type === 'non_profit'
                                                    ? 'Non-profit Name'
                                                    : 'Company Name'
                                            }
                                            value={formData.company_name}
                                            onChange={e =>
                                                handleInputChange('company_name', e.target.value)
                                            }
                                            placeholder={
                                                formData.business_type === 'non_profit'
                                                    ? 'ABC Non-profit Organization'
                                                    : 'ABC Technologies LLC'
                                            }
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Tax ID"
                                            value={formData.company_tax_id}
                                            onChange={e =>
                                                handleInputChange('company_tax_id', e.target.value)
                                            }
                                            placeholder="12-3456789"
                                            helperText="EIN or Tax Identification Number"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>
                                                {formData.business_type === 'non_profit'
                                                    ? 'Non-profit Structure'
                                                    : 'Company Structure'}
                                            </InputLabel>
                                            <Select
                                                value={formData.company_structure}
                                                label={
                                                    formData.business_type === 'non_profit'
                                                        ? 'Non-profit Structure'
                                                        : 'Company Structure'
                                                }
                                                onChange={e =>
                                                    handleInputChange(
                                                        'company_structure',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {companyStructures.map(structure => (
                                                    <MenuItem
                                                        key={structure.value}
                                                        value={structure.value}
                                                    >
                                                        {structure.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Company/Non-profit Address */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                            {formData.business_type === 'non_profit'
                                                ? 'Non-profit Address'
                                                : 'Company Address'}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Street Address"
                                            value={formData.company_address_line1}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_address_line1',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="123 Main St"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Apartment, unit, or other (optional)"
                                            value={formData.company_address_line2}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_address_line2',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Apt 4B, Suite 200, etc."
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="City"
                                            value={formData.company_address_city}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_address_city',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="New York"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="State"
                                            value={formData.company_address_state}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_address_state',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="NY"
                                            helperText="State, county, province, or region"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Postal Code"
                                            value={formData.company_address_postal_code}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_address_postal_code',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="10001"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Country</InputLabel>
                                            <Select
                                                value={formData.company_address_country}
                                                label="Country"
                                                onChange={e =>
                                                    handleInputChange(
                                                        'company_address_country',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {countries.map(country => (
                                                    <MenuItem
                                                        key={country.code}
                                                        value={country.code}
                                                    >
                                                        {country.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Company/Non-profit Verification Documents */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            {formData.business_type === 'non_profit'
                                                ? 'Non-profit Verification Documents'
                                                : 'Company Verification Documents (Optional)'}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color={
                                                formData.business_type === 'non_profit'
                                                    ? 'warning.main'
                                                    : 'text.secondary'
                                            }
                                            gutterBottom
                                        >
                                            {formData.business_type === 'non_profit'
                                                ? 'Upload tax-exempt status documents (IRS 501(c)(3) determination letter, tax-exempt certificate, etc.) - Recommended for verification'
                                                : 'Upload company legal documents (IRS Letter 147C, EIN Assistance Letter, etc.)'}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.company_front ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={uploadingFile === 'company_front'}
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'company_front'
                                                ? 'Uploading...'
                                                : uploadedFiles.company_front
                                                  ? `Uploaded: ${uploadedFiles.company_front.name}`
                                                  : formData.business_type === 'non_profit'
                                                    ? 'Upload Non-profit Document (Front)'
                                                    : 'Upload Company Document (Front)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(file, 'company_front');
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.company_back ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={uploadingFile === 'company_back'}
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'company_back'
                                                ? 'Uploading...'
                                                : uploadedFiles.company_back
                                                  ? `Uploaded: ${uploadedFiles.company_back.name}`
                                                  : formData.business_type === 'non_profit'
                                                    ? 'Upload Non-profit Document (Back)'
                                                    : 'Upload Company Document (Back)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(file, 'company_back');
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>
                                </>
                            )}

                            {/* ToS Acceptance */}
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Terms of Service Acceptance
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Acceptance Date (Unix Timestamp)"
                                    type="number"
                                    value={formData.tos_acceptance_date}
                                    onChange={e =>
                                        handleInputChange(
                                            'tos_acceptance_date',
                                            parseInt(e.target.value)
                                        )
                                    }
                                    helperText="Unix timestamp of when ToS was accepted"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{
                                        '& .MuiInputBase-input.Mui-readOnly': {
                                            backgroundColor: 'grey.100',
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="IP Address"
                                    value={formData.tos_acceptance_ip}
                                    onChange={e =>
                                        handleInputChange('tos_acceptance_ip', e.target.value)
                                    }
                                    placeholder={ipLoading ? 'Detecting IP...' : '203.0.113.1'}
                                    helperText={
                                        ipLoading
                                            ? 'Auto-detecting your IP address...'
                                            : ipError
                                              ? `Auto-detection failed: ${ipError}. You can enter manually.`
                                              : 'IP address of the user accepting ToS (auto-detected)'
                                    }
                                    InputProps={{
                                        endAdornment: ipLoading ? (
                                            <CircularProgress size={20} />
                                        ) : ipError ? (
                                            <Button
                                                size="small"
                                                onClick={retryIP}
                                                sx={{ minWidth: 'auto', px: 1 }}
                                            >
                                                Retry
                                            </Button>
                                        ) : null,
                                    }}
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            color:
                                                detectedIP && !ipError ? 'success.main' : 'inherit',
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Representative Person Fields - Show when business type is Company or Non-profit */}
                            {(formData.business_type === 'company' ||
                                formData.business_type === 'non_profit') && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Representative Person Information
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="First Name"
                                            value={formData.representative_first_name}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_first_name',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Representative First Name"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Last Name"
                                            value={formData.representative_last_name}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_last_name',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Representative Last Name"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            type="email"
                                            value={formData.representative_email}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_email',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="representative@example.com"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            value={formData.representative_phone}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_phone',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="+31612345678"
                                            helperText="Include country code (e.g., +1 for US, +31 for Netherlands)"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Job Title"
                                            value={formData.representative_relationship_title}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_relationship_title',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="CEO, Manager, etc."
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                Representative Social Security Number (SSN)
                                            </Typography>
                                            <ToggleButtonGroup
                                                value={representativeSsnType}
                                                exclusive
                                                onChange={(e, newValue) => {
                                                    if (newValue !== null) {
                                                        setRepresentativeSsnType(newValue);
                                                        // Clear both fields when switching
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            representative_ssn_last_4: '',
                                                            representative_id_number: '',
                                                        }));
                                                    }
                                                }}
                                                size="small"
                                                fullWidth
                                            >
                                                <ToggleButton value="last4">
                                                    Last 4 Digits
                                                </ToggleButton>
                                                <ToggleButton value="full">Full SSN</ToggleButton>
                                                <ToggleButton value="both">Both</ToggleButton>
                                            </ToggleButtonGroup>
                                        </Box>
                                        {representativeSsnType === 'last4' ? (
                                            <TextField
                                                fullWidth
                                                label="SSN Last 4 Digits"
                                                value={formData.representative_ssn_last_4}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'representative_ssn_last_4',
                                                        e.target.value.replace(/\D/g, '')
                                                    )
                                                }
                                                placeholder="1234"
                                                inputProps={{ maxLength: 4 }}
                                                helperText="Last 4 digits of Social Security Number (US only)"
                                            />
                                        ) : representativeSsnType === 'full' ? (
                                            <TextField
                                                fullWidth
                                                label="Full SSN"
                                                value={formData.representative_id_number}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'representative_id_number',
                                                        e.target.value.replace(/\D/g, '')
                                                    )
                                                }
                                                placeholder="123456789"
                                                inputProps={{ maxLength: 9 }}
                                                helperText="9-digit Social Security Number (US only)"
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 2,
                                                }}
                                            >
                                                <TextField
                                                    fullWidth
                                                    label="SSN Last 4 Digits"
                                                    value={formData.representative_ssn_last_4}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'representative_ssn_last_4',
                                                            e.target.value.replace(/\D/g, '')
                                                        )
                                                    }
                                                    placeholder="1234"
                                                    inputProps={{ maxLength: 4 }}
                                                    helperText="Last 4 digits of Social Security Number"
                                                />
                                                <TextField
                                                    fullWidth
                                                    label="Full SSN"
                                                    value={formData.representative_id_number}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'representative_id_number',
                                                            e.target.value.replace(/\D/g, '')
                                                        )
                                                    }
                                                    placeholder="123456789"
                                                    inputProps={{ maxLength: 9 }}
                                                    helperText="9-digit Social Security Number"
                                                />
                                            </Box>
                                        )}
                                    </Grid>

                                    {/* Representative Date of Birth */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Representative Date of Birth
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 4 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Day</InputLabel>
                                            <Select
                                                value={formData.representative_dob_day}
                                                label="Day"
                                                onChange={e =>
                                                    handleInputChange(
                                                        'representative_dob_day',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map(
                                                    day => (
                                                        <MenuItem key={day} value={day}>
                                                            {day}
                                                        </MenuItem>
                                                    )
                                                )}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 4 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Month</InputLabel>
                                            <Select
                                                value={formData.representative_dob_month}
                                                label="Month"
                                                onChange={e =>
                                                    handleInputChange(
                                                        'representative_dob_month',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {months.map(month => (
                                                    <MenuItem key={month.value} value={month.value}>
                                                        {month.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="Year"
                                            type="number"
                                            value={formData.representative_dob_year}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_dob_year',
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            inputProps={{
                                                min: 1900,
                                                max: new Date().getFullYear(),
                                            }}
                                        />
                                    </Grid>

                                    {/* Representative Address */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Representative Address
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Street Address"
                                            value={formData.representative_address_line1}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_line1',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="123 Main Street"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="City"
                                            value={formData.representative_address_city}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_city',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="New York"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="State Code"
                                            value={formData.representative_address_state}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_state',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="NY"
                                            helperText="2-letter state code"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="ZIP Code"
                                            value={formData.representative_address_postal_code}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_postal_code',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="12345"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Country Code</InputLabel>
                                            <Select
                                                value={formData.representative_address_country}
                                                label="Country Code"
                                                onChange={e =>
                                                    handleInputChange(
                                                        'representative_address_country',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {countries.map(country => (
                                                    <MenuItem
                                                        key={country.code}
                                                        value={country.code}
                                                    >
                                                        {country.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Identity Document Upload for Representative */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Representative Identity Verification (Optional)
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            Upload an identity document (driver's license, passport,
                                            etc.) for the representative
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.representative_front ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={uploadingFile === 'representative_front'}
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'representative_front'
                                                ? 'Uploading...'
                                                : uploadedFiles.representative_front
                                                  ? `Uploaded: ${uploadedFiles.representative_front.name}`
                                                  : 'Upload ID Document (Front)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(
                                                            file,
                                                            'representative_front'
                                                        );
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.representative_back ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={uploadingFile === 'representative_back'}
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'representative_back'
                                                ? 'Uploading...'
                                                : uploadedFiles.representative_back
                                                  ? `Uploaded: ${uploadedFiles.representative_back.name}`
                                                  : 'Upload ID Document (Back)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(
                                                            file,
                                                            'representative_back'
                                                        );
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                            Additional Document (Address Proof - Optional)
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            Upload utility bill, bank statement, or official
                                            correspondence for the representative
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.representative_additional_front ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={
                                                uploadingFile === 'representative_additional_front'
                                            }
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'representative_additional_front'
                                                ? 'Uploading...'
                                                : uploadedFiles.representative_additional_front
                                                  ? `Uploaded: ${uploadedFiles.representative_additional_front.name}`
                                                  : 'Upload Address Proof (Front)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(
                                                            file,
                                                            'representative_additional_front'
                                                        );
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.representative_additional_back ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={
                                                uploadingFile === 'representative_additional_back'
                                            }
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'representative_additional_back'
                                                ? 'Uploading...'
                                                : uploadedFiles.representative_additional_back
                                                  ? `Uploaded: ${uploadedFiles.representative_additional_back.name}`
                                                  : 'Upload Address Proof (Back)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(
                                                            file,
                                                            'representative_additional_back'
                                                        );
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>

                                    {/* Owner Checkbox - Only show for company, not non-profit */}
                                    {formData.business_type === 'company' && (
                                        <Grid size={{ xs: 12 }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={representativeIsOwner}
                                                        onChange={e => {
                                                            const isChecked = e.target.checked;
                                                            setRepresentativeIsOwner(isChecked);

                                                            // Clear owner fields when representative is also owner
                                                            if (isChecked) {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    owner_first_name: '',
                                                                    owner_last_name: '',
                                                                    owner_email: '',
                                                                    owner_phone: '',
                                                                    owner_dob_day: 1,
                                                                    owner_dob_month: 1,
                                                                    owner_dob_year: 1990,
                                                                    owner_address_line1: '',
                                                                    owner_address_city: '',
                                                                    owner_address_state: '',
                                                                    owner_address_postal_code: '',
                                                                    owner_address_country:
                                                                        country || 'US',
                                                                    owner_relationship_owner: true,
                                                                    owner_relationship_title: '',
                                                                    owner_ssn_last_4: '',
                                                                    owner_id_number: '',
                                                                }));
                                                            }
                                                        }}
                                                    />
                                                }
                                                label="This representative is also the owner"
                                            />
                                        </Grid>
                                    )}
                                </>
                            )}

                            {/* Owner Person Fields - Only show when business type is Company and representative is NOT owner */}
                            {formData.business_type === 'company' && !representativeIsOwner && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Owner Information
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="First Name"
                                            value={formData.owner_first_name}
                                            onChange={e =>
                                                handleInputChange(
                                                    'owner_first_name',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Owner First Name"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Last Name"
                                            value={formData.owner_last_name}
                                            onChange={e =>
                                                handleInputChange('owner_last_name', e.target.value)
                                            }
                                            placeholder="Owner Last Name"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            type="email"
                                            value={formData.owner_email}
                                            onChange={e =>
                                                handleInputChange('owner_email', e.target.value)
                                            }
                                            placeholder="owner@example.com"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            value={formData.owner_phone}
                                            onChange={e =>
                                                handleInputChange('owner_phone', e.target.value)
                                            }
                                            placeholder="+31612345678"
                                            helperText="Include country code (e.g., +1 for US, +31 for Netherlands)"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Job Title"
                                            value={formData.owner_relationship_title}
                                            onChange={e =>
                                                handleInputChange(
                                                    'owner_relationship_title',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Owner, Founder, etc."
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                Owner Social Security Number (SSN)
                                            </Typography>
                                            <ToggleButtonGroup
                                                value={ownerSsnType}
                                                exclusive
                                                onChange={(e, newValue) => {
                                                    if (newValue !== null) {
                                                        setOwnerSsnType(newValue);
                                                        // Clear both fields when switching
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            owner_ssn_last_4: '',
                                                            owner_id_number: '',
                                                        }));
                                                    }
                                                }}
                                                size="small"
                                                fullWidth
                                            >
                                                <ToggleButton value="last4">
                                                    Last 4 Digits
                                                </ToggleButton>
                                                <ToggleButton value="full">Full SSN</ToggleButton>
                                                <ToggleButton value="both">Both</ToggleButton>
                                            </ToggleButtonGroup>
                                        </Box>
                                        {ownerSsnType === 'last4' ? (
                                            <TextField
                                                fullWidth
                                                label="SSN Last 4 Digits"
                                                value={formData.owner_ssn_last_4}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'owner_ssn_last_4',
                                                        e.target.value.replace(/\D/g, '')
                                                    )
                                                }
                                                placeholder="1234"
                                                inputProps={{ maxLength: 4 }}
                                                helperText="Last 4 digits of Social Security Number (US only)"
                                            />
                                        ) : ownerSsnType === 'full' ? (
                                            <TextField
                                                fullWidth
                                                label="Full SSN"
                                                value={formData.owner_id_number}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'owner_id_number',
                                                        e.target.value.replace(/\D/g, '')
                                                    )
                                                }
                                                placeholder="123456789"
                                                inputProps={{ maxLength: 9 }}
                                                helperText="9-digit Social Security Number (US only)"
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 2,
                                                }}
                                            >
                                                <TextField
                                                    fullWidth
                                                    label="SSN Last 4 Digits"
                                                    value={formData.owner_ssn_last_4}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_ssn_last_4',
                                                            e.target.value.replace(/\D/g, '')
                                                        )
                                                    }
                                                    placeholder="1234"
                                                    inputProps={{ maxLength: 4 }}
                                                    helperText="Last 4 digits of Social Security Number"
                                                />
                                                <TextField
                                                    fullWidth
                                                    label="Full SSN"
                                                    value={formData.owner_id_number}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_id_number',
                                                            e.target.value.replace(/\D/g, '')
                                                        )
                                                    }
                                                    placeholder="123456789"
                                                    inputProps={{ maxLength: 9 }}
                                                    helperText="9-digit Social Security Number"
                                                />
                                            </Box>
                                        )}
                                    </Grid>

                                    {/* Owner Date of Birth */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Owner Date of Birth
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 4 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Day</InputLabel>
                                            <Select
                                                value={formData.owner_dob_day}
                                                label="Day"
                                                onChange={e =>
                                                    handleInputChange(
                                                        'owner_dob_day',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map(
                                                    day => (
                                                        <MenuItem key={day} value={day}>
                                                            {day}
                                                        </MenuItem>
                                                    )
                                                )}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 4 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Month</InputLabel>
                                            <Select
                                                value={formData.owner_dob_month}
                                                label="Month"
                                                onChange={e =>
                                                    handleInputChange(
                                                        'owner_dob_month',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {months.map(month => (
                                                    <MenuItem key={month.value} value={month.value}>
                                                        {month.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="Year"
                                            type="number"
                                            value={formData.owner_dob_year}
                                            onChange={e =>
                                                handleInputChange(
                                                    'owner_dob_year',
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            inputProps={{
                                                min: 1900,
                                                max: new Date().getFullYear(),
                                            }}
                                        />
                                    </Grid>

                                    {/* Owner Address */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Owner Address
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Street Address"
                                            value={formData.owner_address_line1}
                                            onChange={e =>
                                                handleInputChange(
                                                    'owner_address_line1',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="123 Main Street"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="City"
                                            value={formData.owner_address_city}
                                            onChange={e =>
                                                handleInputChange(
                                                    'owner_address_city',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="New York"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="State Code"
                                            value={formData.owner_address_state}
                                            onChange={e =>
                                                handleInputChange(
                                                    'owner_address_state',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="NY"
                                            helperText="2-letter state code"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="ZIP Code"
                                            value={formData.owner_address_postal_code}
                                            onChange={e =>
                                                handleInputChange(
                                                    'owner_address_postal_code',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="12345"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Country Code</InputLabel>
                                            <Select
                                                value={formData.owner_address_country}
                                                label="Country Code"
                                                onChange={e =>
                                                    handleInputChange(
                                                        'owner_address_country',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {countries.map(country => (
                                                    <MenuItem
                                                        key={country.code}
                                                        value={country.code}
                                                    >
                                                        {country.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Owner Identity Verification Documents */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Owner Identity Verification (Optional)
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            Upload identity document for the owner (driver's
                                            license, passport, etc.)
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.owner_front ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={uploadingFile === 'owner_front'}
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'owner_front'
                                                ? 'Uploading...'
                                                : uploadedFiles.owner_front
                                                  ? `Uploaded: ${uploadedFiles.owner_front.name}`
                                                  : 'Upload Owner ID (Front)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(file, 'owner_front');
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.owner_back ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={uploadingFile === 'owner_back'}
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'owner_back'
                                                ? 'Uploading...'
                                                : uploadedFiles.owner_back
                                                  ? `Uploaded: ${uploadedFiles.owner_back.name}`
                                                  : 'Upload Owner ID (Back)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(file, 'owner_back');
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                            Additional Document (Address Proof - Optional)
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            Upload utility bill, bank statement, or official
                                            correspondence for the owner
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.owner_additional_front ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={uploadingFile === 'owner_additional_front'}
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'owner_additional_front'
                                                ? 'Uploading...'
                                                : uploadedFiles.owner_additional_front
                                                  ? `Uploaded: ${uploadedFiles.owner_additional_front.name}`
                                                  : 'Upload Address Proof (Front)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(
                                                            file,
                                                            'owner_additional_front'
                                                        );
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            startIcon={
                                                uploadedFiles.owner_additional_back ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CloudUploadIcon />
                                                )
                                            }
                                            disabled={uploadingFile === 'owner_additional_back'}
                                            sx={{ height: '56px' }}
                                        >
                                            {uploadingFile === 'owner_additional_back'
                                                ? 'Uploading...'
                                                : uploadedFiles.owner_additional_back
                                                  ? `Uploaded: ${uploadedFiles.owner_additional_back.name}`
                                                  : 'Upload Address Proof (Back)'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(
                                                            file,
                                                            'owner_additional_back'
                                                        );
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Grid>
                                </>
                            )}

                            {/* External Account */}
                            <Grid size={{ xs: 12 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mt: 2,
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        External Account Information
                                    </Typography>
                                    {showExternalAccount && (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<CloseIcon />}
                                            onClick={() => {
                                                setShowExternalAccount(false);
                                                // Clear external account fields
                                                setFormData(prev => ({
                                                    ...prev,
                                                    external_account_object: 'bank_account',
                                                    external_account_routing_number: '',
                                                    external_account_account_number: '',
                                                    external_account_account_holder_name: '',
                                                    external_account_account_holder_type:
                                                        'individual',
                                                    external_account_card_number: '',
                                                    external_account_exp_month: '01',
                                                    external_account_exp_year: new Date()
                                                        .getFullYear()
                                                        .toString(),
                                                    external_account_cvc: '',
                                                }));
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </Box>
                            </Grid>

                            {!showExternalAccount && (
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<AccountBalanceIcon />}
                                            onClick={() => {
                                                setShowExternalAccount(true);
                                                handleInputChange(
                                                    'external_account_object',
                                                    'bank_account'
                                                );
                                            }}
                                        >
                                            Attach Bank Account
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<CreditCardIcon />}
                                            onClick={() => {
                                                setShowExternalAccount(true);
                                                handleInputChange(
                                                    'external_account_object',
                                                    'card'
                                                );
                                            }}
                                        >
                                            Attach Card
                                        </Button>
                                    </Box>
                                </Grid>
                            )}

                            {/* Bank Account Fields */}
                            {showExternalAccount &&
                                formData.external_account_object === 'bank_account' && (
                                    <>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Country</InputLabel>
                                                <Select
                                                    value={formData.external_account_country}
                                                    label="Country"
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'external_account_country',
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    {countries.map(country => (
                                                        <MenuItem
                                                            key={country.code}
                                                            value={country.code}
                                                        >
                                                            {country.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Currency</InputLabel>
                                                <Select
                                                    value={formData.external_account_currency}
                                                    label="Currency"
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'external_account_currency',
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    {currencies.map(currency => (
                                                        <MenuItem
                                                            key={currency.code}
                                                            value={currency.code}
                                                        >
                                                            {currency.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Routing Number"
                                                value={formData.external_account_routing_number}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'external_account_routing_number',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="110000000"
                                                helperText="Bank routing number (US: 9 digits)"
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Account Number"
                                                value={formData.external_account_account_number}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'external_account_account_number',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="000123456789"
                                                helperText="Bank account number"
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Account Holder Name"
                                                value={
                                                    formData.external_account_account_holder_name
                                                }
                                                onChange={e =>
                                                    handleInputChange(
                                                        'external_account_account_holder_name',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="John Doe"
                                                helperText="Name on the bank account"
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Account Holder Type</InputLabel>
                                                <Select
                                                    value={
                                                        formData.external_account_account_holder_type
                                                    }
                                                    label="Account Holder Type"
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'external_account_account_holder_type',
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <MenuItem value="individual">
                                                        Individual
                                                    </MenuItem>
                                                    <MenuItem value="company">Company</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </>
                                )}

                            {/* Debit Card Fields */}
                            {showExternalAccount && formData.external_account_object === 'card' && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Card Number"
                                            value={formData.external_account_card_number}
                                            onChange={e =>
                                                handleInputChange(
                                                    'external_account_card_number',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="4242424242424242"
                                            helperText="16-digit card number"
                                            inputProps={{ maxLength: 16 }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 4 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Exp. Month</InputLabel>
                                            <Select
                                                value={formData.external_account_exp_month}
                                                label="Exp. Month"
                                                onChange={e =>
                                                    handleInputChange(
                                                        'external_account_exp_month',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                                    month => (
                                                        <MenuItem
                                                            key={month}
                                                            value={month
                                                                .toString()
                                                                .padStart(2, '0')}
                                                        >
                                                            {month.toString().padStart(2, '0')}
                                                        </MenuItem>
                                                    )
                                                )}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="Exp. Year"
                                            type="number"
                                            value={formData.external_account_exp_year}
                                            onChange={e =>
                                                handleInputChange(
                                                    'external_account_exp_year',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="2030"
                                            inputProps={{
                                                min: new Date().getFullYear(),
                                                max: new Date().getFullYear() + 20,
                                            }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="CVC"
                                            value={formData.external_account_cvc}
                                            onChange={e =>
                                                handleInputChange(
                                                    'external_account_cvc',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="123"
                                            helperText="3-4 digit security code"
                                            inputProps={{ maxLength: 4 }}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                Merchant onboarded successfully!
                            </Alert>
                        )}
                    </Box>
                </CardContent>
                <CardActions sx={{ p: 3 }}>
                    {onClose && (
                        <Button onClick={handleClose} disabled={loading} size="large">
                            Cancel
                        </Button>
                    )}
                    <Button
                        onClick={handleReset}
                        disabled={loading}
                        size="large"
                        variant="outlined"
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                        disabled={loading}
                        size="large"
                    >
                        {loading ? 'Onboarding...' : 'Onboard Merchant'}
                    </Button>
                </CardActions>
            </Card>

            {/* Unsaved Changes Warning Dialog */}
            <Dialog
                open={showUnsavedWarning}
                onClose={() => setShowUnsavedWarning(false)}
                aria-labelledby="unsaved-warning-title"
            >
                <DialogTitle id="unsaved-warning-title">Unsaved Changes</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You have unsaved changes in the form. If you refresh the page or navigate
                        away, your progress will be lost. Do you want to continue?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowUnsavedWarning(false)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            setShowUnsavedWarning(false);
                            window.location.reload();
                        }}
                        color="primary"
                        autoFocus
                    >
                        Continue Anyway
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DirectOnboardForm;
