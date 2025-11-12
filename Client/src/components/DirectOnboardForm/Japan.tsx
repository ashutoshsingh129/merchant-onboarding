import React, { useState, useEffect, useMemo } from 'react';
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
import { DirectOnboardFormData, DirectOnboardFormProps } from './types';
import { getDefaultCurrencyForCountry } from './utils';

// Japan-specific configuration
const DIRECTOR_EXECUTIVE_COUNTRIES: string[] = ['JP']; // Japan requires representative to be a director
const IBAN_COUNTRIES: string[] = []; // Japan uses bank_code and branch_code, not IBAN
const DEFAULT_COUNTRY = 'JP';

// DirectOnboardFormData and DirectOnboardFormProps are imported from types.ts

const JapanForm: React.FC<DirectOnboardFormProps> = ({
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
        individual_address_country: country || DEFAULT_COUNTRY,
        individual_address_town: '',
        individual_ssn_last_4: '',
        individual_id_number: '',
        // Japan-specific kana fields
        individual_first_name_kana: '',
        individual_last_name_kana: '',
        individual_first_name_kanji: '',
        individual_last_name_kanji: '',
        // Japan-specific address fields
        individual_address_kana_line1: '',
        individual_address_kana_line2: '',
        individual_address_kana_town: '',
        individual_address_kana_city: '',
        individual_address_kana_state: '',
        individual_address_kana_postal_code: '',
        individual_address_kana_country: '',
        individual_address_kanji_line1: '',
        individual_address_kanji_line2: '',
        individual_address_kanji_town: '',
        individual_address_kanji_city: '',
        individual_address_kanji_state: '',
        individual_address_kanji_postal_code: '',
        individual_address_kanji_country: '',
        business_type: businessType || 'individual',
        business_profile_mcc: '4816',
        business_profile_url: '',
        business_description: '',
        product_description: 'Computer Network Services',
        // Company fields
        company_name: '',
        company_name_kanji: '', // Japan-specific
        company_name_kana: '', // Japan-specific
        company_tax_id: '',
        company_registration_number: '', // Japan-specific (Corporate Number/Houjin Bangou)
        company_structure: '',
        company_address_line1: '',
        company_address_line2: '',
        company_address_city: '',
        company_address_state: '',
        company_address_postal_code: '',
        company_address_country: country || DEFAULT_COUNTRY,
        company_address_kana_postal_code: '',
        company_address_kana_state: '',
        company_address_kana_city: '',
        company_address_kana_line1: '',
        company_address_kana_line2: '',
        company_address_kanji_postal_code: '',
        company_address_kanji_state: '',
        company_address_kanji_city: '',
        company_address_kanji_line1: '',
        company_address_kanji_line2: '',
        company_directors_provided: false,
        company_executives_provided: false,
        // ToS Acceptance
        tos_acceptance_date: Math.floor(Date.now() / 1000),
        tos_acceptance_ip: detectedIP || '',
        // External Account fields
        external_account_object: 'bank_account',
        external_account_country: country || DEFAULT_COUNTRY,
        external_account_currency: getDefaultCurrencyForCountry(country),
        // Bank Account fields
        external_account_routing_number: '',
        external_account_account_number: '',
        external_account_account_number_confirm: '',
        external_account_account_holder_name: '',
        external_account_account_holder_type:
            businessType && businessType !== 'individual' ? 'company' : 'individual',
        // Japan-specific bank account fields
        external_account_bank_code: '',
        external_account_branch_code: '',
        external_account_account_type: 'futsu',
        external_account_account_holder_name_kana: '',
        // Debit Card fields
        external_account_card_number: '',
        external_account_exp_month: '01',
        external_account_exp_year: new Date().getFullYear().toString(),
        external_account_cvc: '',
        // Representative Person fields
        representative_first_name: '',
        representative_last_name: '',
        representative_first_name_kana: '', // Japan-specific
        representative_last_name_kana: '', // Japan-specific
        representative_first_name_kanji: '', // Japan-specific
        representative_last_name_kanji: '', // Japan-specific
        representative_email: '',
        representative_phone: '',
        representative_dob_day: 1,
        representative_dob_month: 1,
        representative_dob_year: 1990,
        representative_address_line1: '',
        representative_address_line2: '',
        representative_address_line2_kana: '',
        representative_address_kana_postal_code: '',
        representative_address_kana_state: '',
        representative_address_kana_city: '',
        representative_address_kana_line1: '',
        representative_address_kana_line2: '',
        representative_address_kanji_postal_code: '',
        representative_address_kanji_state: '',
        representative_address_kanji_city: '',
        representative_address_kanji_line1: '',
        representative_address_kanji_line2: '',
        representative_address_city: '',
        representative_address_state: '',
        representative_address_postal_code: '',
        representative_address_country: country || DEFAULT_COUNTRY,
        representative_address_town: '',
        representative_address_kana_town: '',
        representative_address_kanji_town: '',
        representative_relationship_representative: true,
        representative_relationship_executive: false,
        representative_relationship_director: false,
        representative_relationship_title: '',
        representative_ssn_last_4: '',
        representative_id_number: '',
        // Owner Person fields
        owner_first_name: '',
        owner_last_name: '',
        owner_first_name_kana: '', // Japan-specific
        owner_last_name_kana: '', // Japan-specific
        owner_email: '',
        owner_phone: '',
        owner_dob_day: 1,
        owner_dob_month: 1,
        owner_dob_year: 1990,
        owner_address_line1: '',
        owner_address_line2: '',
        owner_address_city: '',
        owner_address_state: '',
        owner_address_postal_code: '',
        owner_address_country: country || DEFAULT_COUNTRY,
        owner_address_town: '',
        owner_address_line2_kana: '',
        owner_address_kana_postal_code: '',
        owner_address_kana_state: '',
        owner_address_kana_city: '',
        owner_address_kana_town: '',
        owner_address_kana_line1: '',
        owner_address_kana_line2: '',
        owner_address_kanji_postal_code: '',
        owner_address_kanji_state: '',
        owner_address_kanji_city: '',
        owner_address_kanji_town: '',
        owner_address_kanji_line1: '',
        owner_address_kanji_line2: '',
        owner_relationship_owner: true,
        owner_relationship_director: false,
        owner_relationship_title: '',
        owner_ssn_last_4: '',
        owner_id_number: '',
        directors: [],
        executives: [],
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

    const normalizedCompanyCountry = useMemo(
        () => (formData.company_address_country || '').toUpperCase(),
        [formData.company_address_country]
    );

    const normalizedRepresentativeCountry = useMemo(
        () => (formData.representative_address_country || '').toUpperCase(),
        [formData.representative_address_country]
    );

    const shouldShowDirectorsExecutives = useMemo(() => {
        return (
            (formData.business_type === 'company' || formData.business_type === 'non_profit') &&
            DIRECTOR_EXECUTIVE_COUNTRIES.includes(normalizedCompanyCountry)
        );
    }, [formData.business_type, normalizedCompanyCountry]);

    const shouldShowRepresentativeFields = useMemo(() => {
        return (
            formData.business_type === 'individual' ||
            formData.business_type === 'company' ||
            formData.business_type === 'non_profit' ||
            formData.business_type === 'government_entity'
        );
    }, [formData.business_type]);

    const shouldShowOwnerFields = useMemo(() => {
        if (representativeIsOwner) {
            return false;
        }
        return (
            formData.business_type === 'individual' ||
            formData.business_type === 'company' ||
            formData.business_type === 'non_profit' ||
            formData.business_type === 'government_entity'
        );
    }, [formData.business_type, representativeIsOwner]);

    useEffect(() => {
        if (!shouldShowDirectorsExecutives) {
            setFormData(prev => {
                if (
                    !prev.company_directors_provided &&
                    !prev.company_executives_provided &&
                    (!prev.directors || prev.directors.length === 0) &&
                    (!prev.executives || prev.executives.length === 0)
                ) {
                    return prev;
                }
                return {
                    ...prev,
                    company_directors_provided: false,
                    company_executives_provided: false,
                    directors: [],
                    executives: [],
                };
            });
        }
    }, [shouldShowDirectorsExecutives]);

    const requiresSiren =
        formData.company_address_country === 'FR' &&
        (formData.business_type === 'company' ||
            formData.business_type === 'non_profit' ||
            formData.business_type === 'government_entity');

    const externalAccountCountryCode = (formData.external_account_country || '').toUpperCase();
    const isIbanCountry = IBAN_COUNTRIES.includes(externalAccountCountryCode);
    const isJapanBankAccount =
        formData.external_account_object === 'bank_account' && externalAccountCountryCode === 'JP';

    const jpBankCode = formData.external_account_bank_code || '';
    const jpBranchCode = formData.external_account_branch_code || '';
    const jpAccountNumber = formData.external_account_account_number || '';
    const jpAccountNumberConfirm = formData.external_account_account_number_confirm || '';

    const japanBankCodeHasError =
        isJapanBankAccount && jpBankCode !== '' && jpBankCode.length !== 4;
    const japanBranchCodeHasError =
        isJapanBankAccount && jpBranchCode !== '' && jpBranchCode.length !== 3;
    const japanAccountNumberHasError =
        isJapanBankAccount && jpAccountNumber !== '' && jpAccountNumber.length !== 7;
    const japanAccountNumberConfirmHasError =
        isJapanBankAccount &&
        jpAccountNumberConfirm !== '' &&
        jpAccountNumber !== jpAccountNumberConfirm;

    useEffect(() => {
        if (!isJapanBankAccount) return;

        if (formData.external_account_account_type === 'savings') {
            setFormData(prev => ({
                ...prev,
                external_account_account_type: 'futsu',
            }));
        } else if (formData.external_account_account_type === 'checking') {
            setFormData(prev => ({
                ...prev,
                external_account_account_type: 'toza',
            }));
        }
    }, [isJapanBankAccount, formData.external_account_account_type]);

    const renderPersonCard = (
        person: any,
        idx: number,
        onFieldChange: (index: number, field: string, value: any) => void,
        onRemove: (index: number) => void,
        singularLabel: string
    ) => (
        <Grid key={`${singularLabel}-${idx}`} size={{ xs: 12 }}>
            <Box
                sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 2,
                }}
            >
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    {`${singularLabel} #${idx + 1}`}
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="First Name"
                            value={person.first_name}
                            onChange={e => onFieldChange(idx, 'first_name', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            value={person.last_name}
                            onChange={e => onFieldChange(idx, 'last_name', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={person.email || ''}
                            onChange={e => onFieldChange(idx, 'email', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Job Title"
                            value={person.relationship_title || ''}
                            onChange={e => onFieldChange(idx, 'relationship_title', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth>
                            <InputLabel>Birth Month</InputLabel>
                            <Select
                                label="Birth Month"
                                value={person.dob_month || 1}
                                onChange={e =>
                                    onFieldChange(idx, 'dob_month', Number(e.target.value))
                                }
                            >
                                {months.map(m => (
                                    <MenuItem key={m.value} value={m.value}>
                                        {m.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                        <TextField
                            fullWidth
                            label="Birth Day"
                            type="number"
                            value={person.dob_day || 1}
                            onChange={e => onFieldChange(idx, 'dob_day', Number(e.target.value))}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                        <TextField
                            fullWidth
                            label="Birth Year"
                            type="number"
                            value={person.dob_year || 1990}
                            onChange={e => onFieldChange(idx, 'dob_year', Number(e.target.value))}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Address Line 1"
                            value={person.address_line1 || ''}
                            onChange={e => onFieldChange(idx, 'address_line1', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="City"
                            value={person.address_city || ''}
                            onChange={e => onFieldChange(idx, 'address_city', e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Postal Code"
                            value={person.address_postal_code || ''}
                            onChange={e =>
                                onFieldChange(idx, 'address_postal_code', e.target.value)
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Country</InputLabel>
                            <Select
                                label="Country"
                                value={person.address_country || country || DEFAULT_COUNTRY}
                                onChange={e =>
                                    onFieldChange(idx, 'address_country', String(e.target.value))
                                }
                            >
                                {countries.map(c => (
                                    <MenuItem key={c.code} value={c.code}>
                                        {c.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => onRemove(idx)}
                            startIcon={<CloseIcon />}
                        >
                            {`Remove ${singularLabel}`}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Grid>
    );

    const renderRoleSection = ({
        sectionTitle,
        singularLabel,
        list,
        onFieldChange,
        onRemove,
        onAdd,
        allProvidedValue,
        onAllProvidedChange,
        disableAllProvided,
        helperText,
    }: {
        sectionTitle: string;
        singularLabel: string;
        list: any[] | undefined;
        onFieldChange: (index: number, field: string, value: any) => void;
        onRemove: (index: number) => void;
        onAdd: () => void;
        allProvidedValue: boolean;
        onAllProvidedChange: (checked: boolean) => void;
        disableAllProvided: boolean;
        helperText: string;
    }) => (
        <>
            <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    {sectionTitle}
                </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={allProvidedValue}
                            onChange={e => onAllProvidedChange(e.target.checked)}
                            disabled={disableAllProvided}
                        />
                    }
                    label={`All ${sectionTitle.toLowerCase()} have been provided`}
                />
                {disableAllProvided && (
                    <Typography variant="caption" color="text.secondary">
                        {helperText}
                    </Typography>
                )}
            </Grid>
            {(list || []).map((person, idx) =>
                renderPersonCard(person, idx, onFieldChange, onRemove, singularLabel)
            )}
            <Grid size={{ xs: 12 }}>
                <Button variant="outlined" onClick={onAdd}>
                    {`Add ${singularLabel}`}
                </Button>
            </Grid>
        </>
    );

    const renderDirectorsExecutivesSection = () => {
        if (!shouldShowDirectorsExecutives) {
            return null;
        }

        return (
            <>
                {renderRoleSection({
                    sectionTitle: 'Directors',
                    singularLabel: 'Director',
                    list: formData.directors,
                    onFieldChange: updateDirectorField,
                    onRemove: removeDirector,
                    onAdd: addDirector,
                    allProvidedValue: !!formData.company_directors_provided,
                    onAllProvidedChange: checked =>
                        handleInputChange('company_directors_provided', checked),
                    disableAllProvided: !hasAtLeastOneDirectorPerson,
                    helperText:
                        'Add at least one Director (or mark the representative/owner as a Director) first.',
                })}
                {renderRoleSection({
                    sectionTitle: 'Executives',
                    singularLabel: 'Executive',
                    list: formData.executives,
                    onFieldChange: updateExecutiveField,
                    onRemove: removeExecutive,
                    onAdd: addExecutive,
                    allProvidedValue: !!formData.company_executives_provided,
                    onAllProvidedChange: checked =>
                        handleInputChange('company_executives_provided', checked),
                    disableAllProvided: !hasAtLeastOneExecutivePerson,
                    helperText:
                        'Add at least one Executive (or mark the representative as an Executive) first.',
                })}
            </>
        );
    };

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
        { code: 'JP', name: 'Japan' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'US', name: 'United States' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'CA', name: 'Canada' },
        { code: 'AU', name: 'Australia' },
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
        { code: 'ES', name: 'Spain' },
        { code: 'IT', name: 'Italy' },
        { code: 'SE', name: 'Sweden' },
    ];

    const businessTypes = [
        { value: 'individual', label: 'Individual' },
        { value: 'company', label: 'Company' },
        { value: 'non_profit', label: 'Non-profit' },
        { value: 'government_entity', label: 'Government Entity' },
    ];

    const baseCompanyStructures = [
        { value: 'government_instrumentality', label: 'Government Instrumentality' },
        { value: 'governmental_unit', label: 'Governmental Unit' },
        { value: 'incorporated_non_profit', label: 'Incorporated Non-profit' },
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

    const japanCompanyStructureOptions: Record<
        'company' | 'non_profit' | 'government_entity',
        { value: string; label: string }[]
    > = {
        company: [
            { value: 'private_company', label: 'Kabushiki Kaisha (KK) - Private Company' },
            { value: 'public_company', label: 'Public Kabushiki Kaisha (Public KK)' },
            { value: 'llc', label: 'Godo Kaisha (GK) - Limited Liability Company' },
        ],
        non_profit: [
            {
                value: 'incorporated_non_profit',
                label: 'Incorporated Association or Foundation (Shadan/Zaidan Hojin)',
            },
        ],
        government_entity: [
            { value: 'governmental_unit', label: 'Governmental Unit' },
            { value: 'government_instrumentality', label: 'Government Instrumentality' },
            {
                value: 'tax_exempt_government_instrumentality',
                label: 'Tax-exempt Government Instrumentality',
            },
        ],
    };

    const shouldCollectCompanyStructure = useMemo(() => {
        const companyCountry = formData.company_address_country || DEFAULT_COUNTRY;
        if (companyCountry === 'JP') {
            return !['company', 'non_profit'].includes(formData.business_type);
        }
        return true;
    }, [formData.business_type, formData.company_address_country]);

    const availableCompanyStructures = useMemo(() => {
        const businessType = formData.business_type;
        const companyCountry = formData.company_address_country || DEFAULT_COUNTRY;
        const isJapan = companyCountry === 'JP';

        if (!shouldCollectCompanyStructure) {
            return [];
        }

        if (isJapan && (businessType === 'non_profit' || businessType === 'government_entity')) {
            return japanCompanyStructureOptions[businessType];
        }

        return baseCompanyStructures.filter(structure => {
            if (businessType === 'non_profit') {
                return ['unincorporated_non_profit', 'incorporated_non_profit'].includes(
                    structure.value
                );
            }

            if (businessType === 'government_entity') {
                return [
                    'governmental_unit',
                    'government_instrumentality',
                    'tax_exempt_government_instrumentality',
                ].includes(structure.value);
            }

            if (businessType === 'company') {
                if (companyCountry === 'SE') {
                    const allowedSe = [
                        'private_corporation',
                        'public_corporation',
                        'private_partnership',
                        'public_partnership',
                    ];
                    return allowedSe.includes(structure.value);
                }

                return ![
                    'governmental_unit',
                    'government_instrumentality',
                    'tax_exempt_government_instrumentality',
                    'unincorporated_non_profit',
                    'incorporated_non_profit',
                ].includes(structure.value);
            }

            return true;
        });
    }, [formData.business_type, formData.company_address_country, shouldCollectCompanyStructure]);

    useEffect(() => {
        if (
            !shouldCollectCompanyStructure ||
            !['company', 'non_profit', 'government_entity'].includes(formData.business_type) ||
            availableCompanyStructures.length === 0
        ) {
            return;
        }

        const hasValidStructure = availableCompanyStructures.some(
            option => option.value === formData.company_structure
        );

        if (!hasValidStructure) {
            setFormData(prev => ({
                ...prev,
                company_structure: availableCompanyStructures[0].value,
            }));
        }
    }, [
        availableCompanyStructures,
        formData.business_type,
        formData.company_structure,
        setFormData,
        shouldCollectCompanyStructure,
    ]);

    useEffect(() => {
        if (!shouldCollectCompanyStructure && formData.company_structure) {
            setFormData(prev => ({
                ...prev,
                company_structure: '',
            }));
        }
    }, [shouldCollectCompanyStructure, formData.company_structure, setFormData]);

    const currencies = [
        { code: 'jpy', name: 'Japanese Yen (JPY)' },
        { code: 'eur', name: 'Euro (EUR)' },
        { code: 'usd', name: 'US Dollar (USD)' },
        { code: 'gbp', name: 'British Pound (GBP)' },
        { code: 'cad', name: 'Canadian Dollar (CAD)' },
        { code: 'sek', name: 'Swedish Krona (SEK)' },
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
        setFormData(prev => {
            const shouldUppercaseValue =
                field === 'external_account_country' ||
                field === 'company_address_country' ||
                field === 'representative_address_country' ||
                field === 'individual_address_country';

            const normalizedValue = shouldUppercaseValue ? String(value).toUpperCase() : value;

            const next = {
                ...prev,
                [field]: normalizedValue,
            };

            if (field === 'external_account_country') {
                next.external_account_country = normalizedValue as string;
            }

            const targetExternalAccountCountry =
                field === 'external_account_country'
                    ? String(value).toUpperCase()
                    : (prev.external_account_country || '').toUpperCase();

            if (targetExternalAccountCountry === 'JP') {
                if (field === 'external_account_bank_code') {
                    next.external_account_bank_code = String(value).replace(/\D/g, '').slice(0, 4);
                }

                if (field === 'external_account_branch_code') {
                    next.external_account_branch_code = String(value)
                        .replace(/\D/g, '')
                        .slice(0, 3);
                }

                if (field === 'external_account_account_number') {
                    next.external_account_account_number = String(value)
                        .replace(/\D/g, '')
                        .slice(0, 7);
                }

                if (field === 'external_account_account_number_confirm') {
                    next.external_account_account_number_confirm = String(value)
                        .replace(/\D/g, '')
                        .slice(0, 7);
                }

                if (field === 'external_account_account_holder_name_kana') {
                    next.external_account_account_holder_name_kana = String(value)
                        .replace(/\s+/g, '')
                        .replace(/[^\u30A0-\u30FF]/g, '');
                }
            }

            // For supported IBAN countries, default currency and routing behavior
            if (field === 'external_account_country' && IBAN_COUNTRIES.includes(value)) {
                next.external_account_currency = getDefaultCurrencyForCountry(value);
                next.external_account_routing_number = '';
            }

            if (field === 'individual_address_country' && IBAN_COUNTRIES.includes(value)) {
                next.external_account_currency = getDefaultCurrencyForCountry(value);
                next.external_account_country = value;
                next.external_account_routing_number = '';
            }

            if (field === 'company_address_country' && IBAN_COUNTRIES.includes(value)) {
                next.external_account_currency = getDefaultCurrencyForCountry(value);
                next.external_account_country = value;
                next.external_account_routing_number = '';
            }

            // When business type is not individual, external account holder type should be company
            if (field === 'business_type') {
                if (
                    value === 'company' ||
                    value === 'non_profit' ||
                    value === 'government_entity'
                ) {
                    next.external_account_account_holder_type = 'company';
                } else {
                    next.external_account_account_holder_type = 'individual';
                }
            }

            // Normalize IBAN for SE: strip spaces and uppercase
            if (
                field === 'external_account_account_number' &&
                (IBAN_COUNTRIES.includes(prev.external_account_country) ||
                    IBAN_COUNTRIES.includes(prev.company_address_country))
            ) {
                next.external_account_account_number = String(value)
                    .replace(/\s+/g, '')
                    .toUpperCase();
            }

            return next;
        });
    };

    // Derived role presence for validations
    const hasAtLeastOneDirectorPerson =
        !!formData.representative_relationship_director ||
        !!formData.owner_relationship_director ||
        (Array.isArray(formData.directors)
            ? formData.directors.some(d => !!(d.first_name?.trim() || d.last_name?.trim()))
            : false);

    const hasAtLeastOneExecutivePerson =
        !!formData.representative_relationship_executive ||
        (Array.isArray(formData.executives)
            ? formData.executives.some(e => !!(e.first_name?.trim() || e.last_name?.trim()))
            : false);

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

    // Directors helpers
    const addDirector = () => {
        setFormData(prev => ({
            ...prev,
            directors: [
                ...(prev.directors || []),
                {
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    dob_day: 1,
                    dob_month: 1,
                    dob_year: 1990,
                    address_line1: '',
                    address_city: '',
                    address_state: '',
                    address_postal_code: '',
                    address_country: prev.company_address_country || DEFAULT_COUNTRY,
                    relationship_title: '',
                    id_number: '',
                    ssn_last_4: '',
                },
            ],
        }));
    };

    const updateDirectorField = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const next = { ...(prev as any) } as DirectOnboardFormData;
            const arr = [...(next.directors || [])];
            arr[index] = { ...(arr[index] as any), [field]: value } as any;
            next.directors = arr as any;
            return next;
        });
    };

    const removeDirector = (index: number) => {
        setFormData(prev => {
            const next = { ...(prev as any) } as DirectOnboardFormData;
            next.directors = (next.directors || []).filter((_, i) => i !== index);
            return next;
        });
    };

    // Executives helpers
    const addExecutive = () => {
        setFormData(prev => ({
            ...prev,
            executives: [
                ...(prev.executives || []),
                {
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    dob_day: 1,
                    dob_month: 1,
                    dob_year: 1990,
                    address_line1: '',
                    address_city: '',
                    address_state: '',
                    address_postal_code: '',
                    address_country: prev.company_address_country || DEFAULT_COUNTRY,
                    relationship_title: '',
                    id_number: '',
                    ssn_last_4: '',
                },
            ],
        }));
    };

    const updateExecutiveField = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const next = { ...(prev as any) } as DirectOnboardFormData;
            const arr = [...(next.executives || [])];
            arr[index] = { ...(arr[index] as any), [field]: value } as any;
            next.executives = arr as any;
            return next;
        });
    };

    const removeExecutive = (index: number) => {
        setFormData(prev => {
            const next = { ...(prev as any) } as DirectOnboardFormData;
            next.executives = (next.executives || []).filter((_, i) => i !== index);
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Prepare payload with appropriate SSN fields based on toggle state
            const payload: any = { ...formData };
            payload.external_account_account_holder_type =
                payload.business_type !== 'individual' ? 'company' : 'individual';
            if (formData.representative_address_line1) {
                payload.representative_address_line1 = formData.representative_address_line1.trim();
            }
            if (formData.representative_address_line2) {
                payload.representative_address_line2 = formData.representative_address_line2.trim();
            }
            if (formData.representative_address_town) {
                payload.representative_address_town = formData.representative_address_town.trim();
            }
            const representativeAddressLine2Kana = (formData as Record<string, any>)
                .representative_address_line2_kana as string | undefined;
            if (representativeAddressLine2Kana) {
                payload.representative_address_line2_kana = representativeAddressLine2Kana.trim();
            }
            if (formData.representative_address_kana_postal_code) {
                payload.representative_address_kana_postal_code =
                    formData.representative_address_kana_postal_code.trim();
            }
            if (formData.representative_address_kana_state) {
                payload.representative_address_kana_state =
                    formData.representative_address_kana_state.trim();
            }
            if (formData.representative_address_kana_city) {
                payload.representative_address_kana_city =
                    formData.representative_address_kana_city.trim();
            }
            if (formData.representative_address_kana_town) {
                payload.representative_address_kana_town =
                    formData.representative_address_kana_town.trim();
            }
            if (formData.representative_address_kana_line1) {
                payload.representative_address_kana_line1 =
                    formData.representative_address_kana_line1.trim();
            }
            const representativeAddressKanaLine2 = (formData as Record<string, any>)
                .representative_address_kana_line2 as string | undefined;
            if (representativeAddressKanaLine2) {
                payload.representative_address_kana_line2 = representativeAddressKanaLine2.trim();
            }
            if (formData.representative_address_kanji_postal_code) {
                payload.representative_address_kanji_postal_code =
                    formData.representative_address_kanji_postal_code.trim();
            }
            if (formData.representative_address_kanji_state) {
                payload.representative_address_kanji_state =
                    formData.representative_address_kanji_state.trim();
            }
            if (formData.representative_address_kanji_city) {
                payload.representative_address_kanji_city =
                    formData.representative_address_kanji_city.trim();
            }
            if (formData.representative_address_kanji_town) {
                payload.representative_address_kanji_town =
                    formData.representative_address_kanji_town.trim();
            }
            if (formData.representative_address_kanji_line1) {
                payload.representative_address_kanji_line1 =
                    formData.representative_address_kanji_line1.trim();
            }
            const representativeAddressKanjiLine2 = (formData as Record<string, any>)
                .representative_address_kanji_line2 as string | undefined;
            if (representativeAddressKanjiLine2) {
                payload.representative_address_kanji_line2 = representativeAddressKanjiLine2.trim();
            }
            if (formData.external_account_bank_code) {
                payload.external_account_bank_code = formData.external_account_bank_code.trim();
            }
            if (formData.external_account_branch_code) {
                payload.external_account_branch_code = formData.external_account_branch_code.trim();
            }
            if (formData.external_account_account_number) {
                payload.external_account_account_number =
                    formData.external_account_account_number.trim();
            }
            if (formData.external_account_account_holder_name) {
                payload.external_account_account_holder_name =
                    formData.external_account_account_holder_name.trim();
            }
            if (formData.external_account_account_holder_name_kana) {
                payload.external_account_account_holder_name_kana =
                    formData.external_account_account_holder_name_kana.trim();
            }
            if (formData.representative_address_city) {
                payload.representative_address_city = formData.representative_address_city.trim();
            }
            if (formData.representative_address_state) {
                payload.representative_address_state = formData.representative_address_state.trim();
            }
            if (formData.representative_address_postal_code) {
                payload.representative_address_postal_code =
                    formData.representative_address_postal_code.trim();
            }
            if (formData.representative_address_country) {
                payload.representative_address_country =
                    formData.representative_address_country.trim();
            }
            const individualFirstNameKanji = (formData as Record<string, any>)
                .individual_first_name_kanji as string | undefined;
            if (individualFirstNameKanji) {
                payload.individual_first_name_kanji = individualFirstNameKanji.trim();
            }
            const individualLastNameKanji = (formData as Record<string, any>)
                .individual_last_name_kanji as string | undefined;
            if (individualLastNameKanji) {
                payload.individual_last_name_kanji = individualLastNameKanji.trim();
            }
            // Individual address kanji fields
            if ((formData as Record<string, any>).individual_address_kanji_line1) {
                payload.individual_address_kanji_line1 = (
                    (formData as Record<string, any>).individual_address_kanji_line1 as string
                ).trim();
            }
            if ((formData as Record<string, any>).individual_address_kanji_line2) {
                payload.individual_address_kanji_line2 = (
                    (formData as Record<string, any>).individual_address_kanji_line2 as string
                ).trim();
            }
            if ((formData as Record<string, any>).individual_address_kanji_town) {
                payload.individual_address_kanji_town = (
                    (formData as Record<string, any>).individual_address_kanji_town as string
                ).trim();
            }
            if ((formData as Record<string, any>).individual_address_kanji_city) {
                payload.individual_address_kanji_city = (
                    (formData as Record<string, any>).individual_address_kanji_city as string
                ).trim();
            }
            if ((formData as Record<string, any>).individual_address_kanji_state) {
                payload.individual_address_kanji_state = (
                    (formData as Record<string, any>).individual_address_kanji_state as string
                ).trim();
            }
            if ((formData as Record<string, any>).individual_address_kanji_postal_code) {
                payload.individual_address_kanji_postal_code = (
                    (formData as Record<string, any>).individual_address_kanji_postal_code as string
                ).trim();
            }
            if ((formData as Record<string, any>).individual_address_kanji_country) {
                payload.individual_address_kanji_country = (
                    (formData as Record<string, any>).individual_address_kanji_country as string
                ).trim();
            }
            // Individual address kana fields
            if ((formData as Record<string, any>).individual_address_kana_line1) {
                payload.individual_address_kana_line1 = (
                    (formData as Record<string, any>).individual_address_kana_line1 as string
                ).trim();
            }
            if ((formData as Record<string, any>).individual_address_kana_line2) {
                payload.individual_address_kana_line2 = (
                    (formData as Record<string, any>).individual_address_kana_line2 as string
                ).trim();
            }
            if ((formData as Record<string, any>).individual_address_kana_town) {
                payload.individual_address_kana_town = (
                    (formData as Record<string, any>).individual_address_kana_town as string
                ).trim();
            }
            if ((formData as Record<string, any>).individual_address_kana_city) {
                payload.individual_address_kana_city = (
                    (formData as Record<string, any>).individual_address_kana_city as string
                ).trim();
            }
            if ((formData as Record<string, any>).individual_address_kana_state) {
                payload.individual_address_kana_state = (
                    (formData as Record<string, any>).individual_address_kana_state as string
                ).trim();
            }
            if ((formData as Record<string, any>).individual_address_kana_postal_code) {
                payload.individual_address_kana_postal_code = (
                    (formData as Record<string, any>).individual_address_kana_postal_code as string
                ).trim();
            }
            if ((formData as Record<string, any>).individual_address_kana_country) {
                payload.individual_address_kana_country = (
                    (formData as Record<string, any>).individual_address_kana_country as string
                ).trim();
            }
            if (formData.owner_address_line1) {
                payload.owner_address_line1 = formData.owner_address_line1.trim();
            }
            if (formData.owner_address_line2) {
                payload.owner_address_line2 = formData.owner_address_line2.trim();
            }
            if (formData.owner_address_city) {
                payload.owner_address_city = formData.owner_address_city.trim();
            }
            if (formData.owner_address_state) {
                payload.owner_address_state = formData.owner_address_state.trim();
            }
            if (formData.owner_address_postal_code) {
                payload.owner_address_postal_code = formData.owner_address_postal_code.trim();
            }
            if (formData.owner_address_country) {
                payload.owner_address_country = formData.owner_address_country.trim();
            }
            if ((formData as Record<string, any>).owner_address_town) {
                payload.owner_address_town = (
                    (formData as Record<string, any>).owner_address_town as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_line2_kana) {
                payload.owner_address_line2_kana = (
                    (formData as Record<string, any>).owner_address_line2_kana as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_kana_postal_code) {
                payload.owner_address_kana_postal_code = (
                    (formData as Record<string, any>).owner_address_kana_postal_code as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_kana_state) {
                payload.owner_address_kana_state = (
                    (formData as Record<string, any>).owner_address_kana_state as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_kana_city) {
                payload.owner_address_kana_city = (
                    (formData as Record<string, any>).owner_address_kana_city as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_kana_town) {
                payload.owner_address_kana_town = (
                    (formData as Record<string, any>).owner_address_kana_town as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_kana_line1) {
                payload.owner_address_kana_line1 = (
                    (formData as Record<string, any>).owner_address_kana_line1 as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_kana_line2) {
                payload.owner_address_kana_line2 = (
                    (formData as Record<string, any>).owner_address_kana_line2 as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_kanji_postal_code) {
                payload.owner_address_kanji_postal_code = (
                    (formData as Record<string, any>).owner_address_kanji_postal_code as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_kanji_state) {
                payload.owner_address_kanji_state = (
                    (formData as Record<string, any>).owner_address_kanji_state as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_kanji_city) {
                payload.owner_address_kanji_city = (
                    (formData as Record<string, any>).owner_address_kanji_city as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_kanji_town) {
                payload.owner_address_kanji_town = (
                    (formData as Record<string, any>).owner_address_kanji_town as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_kanji_line1) {
                payload.owner_address_kanji_line1 = (
                    (formData as Record<string, any>).owner_address_kanji_line1 as string
                ).trim();
            }
            if ((formData as Record<string, any>).owner_address_kanji_line2) {
                payload.owner_address_kanji_line2 = (
                    (formData as Record<string, any>).owner_address_kanji_line2 as string
                ).trim();
            }
            if (formData.representative_first_name_kanji) {
                payload.representative_first_name_kanji =
                    formData.representative_first_name_kanji.trim();
            }
            if (formData.representative_last_name_kanji) {
                payload.representative_last_name_kanji =
                    formData.representative_last_name_kanji.trim();
            }
            if (formData.company_address_line1) {
                payload.company_address_line1 = formData.company_address_line1.trim();
            }
            if (formData.company_address_line2) {
                payload.company_address_line2 = formData.company_address_line2.trim();
            }
            if (formData.company_address_city) {
                payload.company_address_city = formData.company_address_city.trim();
            }
            if (formData.company_address_state) {
                payload.company_address_state = formData.company_address_state.trim();
            }
            if (formData.company_address_postal_code) {
                payload.company_address_postal_code = formData.company_address_postal_code.trim();
            }
            if (formData.company_address_kana_postal_code) {
                payload.company_address_kana_postal_code =
                    formData.company_address_kana_postal_code.trim();
            }
            if (formData.company_address_kana_state) {
                payload.company_address_kana_state = formData.company_address_kana_state.trim();
            }
            if (formData.company_address_kana_city) {
                payload.company_address_kana_city = formData.company_address_kana_city.trim();
            }
            if (formData.company_address_kana_line1) {
                payload.company_address_kana_line1 = formData.company_address_kana_line1.trim();
            }
            if (formData.company_address_kana_line2) {
                payload.company_address_kana_line2 = formData.company_address_kana_line2.trim();
            }
            if (formData.company_address_kanji_postal_code) {
                payload.company_address_kanji_postal_code =
                    formData.company_address_kanji_postal_code.trim();
            }
            if (formData.company_address_kanji_state) {
                payload.company_address_kanji_state = formData.company_address_kanji_state.trim();
            }
            if (formData.company_address_kanji_city) {
                payload.company_address_kanji_city = formData.company_address_kanji_city.trim();
            }
            if (formData.company_address_kanji_line1) {
                payload.company_address_kanji_line1 = formData.company_address_kanji_line1.trim();
            }
            if (formData.company_address_kanji_line2) {
                payload.company_address_kanji_line2 = formData.company_address_kanji_line2.trim();
            }
            if (formData.company_name_kanji) {
                payload.company_name_kanji = formData.company_name_kanji.trim();
            }

            if (formData.business_type === 'individual') {
                const payloadRecord = payload as Record<string, any>;
                const setRepresentativeFallback = (key: string, value: any) => {
                    if (value === undefined || value === null) {
                        return;
                    }
                    const existing = payloadRecord[key];
                    if (
                        existing === undefined ||
                        existing === null ||
                        (typeof existing === 'string' && existing.trim() === '')
                    ) {
                        payloadRecord[key] = value;
                    }
                };

                setRepresentativeFallback(
                    'representative_first_name',
                    payload.individual_first_name
                );
                setRepresentativeFallback('representative_last_name', payload.individual_last_name);
                setRepresentativeFallback(
                    'representative_first_name_kana',
                    payload.individual_first_name_kana
                );
                setRepresentativeFallback(
                    'representative_last_name_kana',
                    payload.individual_last_name_kana
                );
                setRepresentativeFallback(
                    'representative_first_name_kanji',
                    payload.individual_first_name_kanji
                );
                setRepresentativeFallback(
                    'representative_last_name_kanji',
                    payload.individual_last_name_kanji
                );
                setRepresentativeFallback('representative_email', payload.individual_email);
                setRepresentativeFallback('representative_phone', payload.individual_phone);
                setRepresentativeFallback('representative_id_number', payload.individual_id_number);
                setRepresentativeFallback('representative_dob_day', payload.individual_dob_day);
                setRepresentativeFallback('representative_dob_month', payload.individual_dob_month);
                setRepresentativeFallback('representative_dob_year', payload.individual_dob_year);
                setRepresentativeFallback(
                    'representative_address_line1',
                    payload.individual_address_line1
                );
                setRepresentativeFallback(
                    'representative_address_line2',
                    payload.individual_address_line2
                );
                setRepresentativeFallback(
                    'representative_address_city',
                    payload.individual_address_city
                );
                setRepresentativeFallback(
                    'representative_address_state',
                    payload.individual_address_state
                );
                setRepresentativeFallback(
                    'representative_address_postal_code',
                    payload.individual_address_postal_code
                );
                setRepresentativeFallback(
                    'representative_address_country',
                    payload.individual_address_country
                );
                // Include representative verification documents if they exist
                const formDataAny = formData as Record<string, any>;
                if (formDataAny.representative_verification_document_front) {
                    payload.representative_verification_document_front =
                        formDataAny.representative_verification_document_front;
                }
                if (formDataAny.representative_verification_document_back) {
                    payload.representative_verification_document_back =
                        formDataAny.representative_verification_document_back;
                }
                if (formDataAny.representative_verification_additional_document_front) {
                    payload.representative_verification_additional_document_front =
                        formDataAny.representative_verification_additional_document_front;
                }
                if (formDataAny.representative_verification_additional_document_back) {
                    payload.representative_verification_additional_document_back =
                        formDataAny.representative_verification_additional_document_back;
                }
                // Include representative address fields (kana/kanji) if they exist
                if (formDataAny.representative_address_kana_postal_code) {
                    payload.representative_address_kana_postal_code =
                        formDataAny.representative_address_kana_postal_code;
                }
                if (formDataAny.representative_address_kana_state) {
                    payload.representative_address_kana_state =
                        formDataAny.representative_address_kana_state;
                }
                if (formDataAny.representative_address_kana_city) {
                    payload.representative_address_kana_city =
                        formDataAny.representative_address_kana_city;
                }
                if (formDataAny.representative_address_kana_town) {
                    payload.representative_address_kana_town =
                        formDataAny.representative_address_kana_town;
                }
                if (formDataAny.representative_address_kana_line1) {
                    payload.representative_address_kana_line1 =
                        formDataAny.representative_address_kana_line1;
                }
                if (formDataAny.representative_address_kana_line2) {
                    payload.representative_address_kana_line2 =
                        formDataAny.representative_address_kana_line2;
                }
                if (formDataAny.representative_address_kanji_postal_code) {
                    payload.representative_address_kanji_postal_code =
                        formDataAny.representative_address_kanji_postal_code;
                }
                if (formDataAny.representative_address_kanji_state) {
                    payload.representative_address_kanji_state =
                        formDataAny.representative_address_kanji_state;
                }
                if (formDataAny.representative_address_kanji_city) {
                    payload.representative_address_kanji_city =
                        formDataAny.representative_address_kanji_city;
                }
                if (formDataAny.representative_address_kanji_town) {
                    payload.representative_address_kanji_town =
                        formDataAny.representative_address_kanji_town;
                }
                if (formDataAny.representative_address_kanji_line1) {
                    payload.representative_address_kanji_line1 =
                        formDataAny.representative_address_kanji_line1;
                }
                if (formDataAny.representative_address_kanji_line2) {
                    payload.representative_address_kanji_line2 =
                        formDataAny.representative_address_kanji_line2;
                }
                if (formDataAny.representative_address_town) {
                    payload.representative_address_town = formDataAny.representative_address_town;
                }
                if (formDataAny.representative_address_line2_kana) {
                    payload.representative_address_line2_kana =
                        formDataAny.representative_address_line2_kana;
                }
                if (!payload.representative_relationship_representative) {
                    payload.representative_relationship_representative = true;
                }
            }

            const removeEmptyStrings = (obj: Record<string, any>) =>
                Object.entries(obj).reduce<Record<string, any>>((acc, [key, value]) => {
                    if (value === undefined || value === null) {
                        return acc;
                    }
                    if (typeof value === 'string') {
                        const trimmedValue = value.trim();
                        if (trimmedValue === '') {
                            return acc;
                        }
                        acc[key] = trimmedValue;
                        return acc;
                    }
                    acc[key] = value;
                    return acc;
                }, {});

            const formDataAny = formData as Record<string, any>;

            const representativeDetails = removeEmptyStrings({
                first_name: payload.representative_first_name,
                last_name: payload.representative_last_name,
                first_name_kana: formData.representative_first_name_kana,
                last_name_kana: formData.representative_last_name_kana,
                first_name_kanji: formDataAny.representative_first_name_kanji,
                last_name_kanji: formDataAny.representative_last_name_kanji,
                email: payload.representative_email,
                phone: payload.representative_phone,
                id_number: payload.representative_id_number,
            }) as Record<string, any>;

            const representativeDob = {
                day: formData.representative_dob_day,
                month: formData.representative_dob_month,
                year: formData.representative_dob_year,
            };

            if (
                Number.isFinite(representativeDob.day) &&
                Number.isFinite(representativeDob.month) &&
                Number.isFinite(representativeDob.year)
            ) {
                representativeDetails.dob = representativeDob;
            }

            const representativeAddress = removeEmptyStrings({
                postal_code: payload.representative_address_postal_code,
                line1: payload.representative_address_line1,
                line2: payload.representative_address_line2,
                town: payload.representative_address_town,
                city: payload.representative_address_city,
                state: payload.representative_address_state,
                country: payload.representative_address_country,
            });

            if (Object.keys(representativeAddress).length > 0) {
                representativeDetails.address = representativeAddress;
            }

            const representativeAddressKana = removeEmptyStrings({
                postal_code: payload.representative_address_kana_postal_code,
                state: payload.representative_address_kana_state,
                city: payload.representative_address_kana_city,
                town: payload.representative_address_kana_town,
                line1: payload.representative_address_kana_line1,
                line2: payload.representative_address_kana_line2,
                country: payload.representative_address_country,
            });

            if (Object.keys(representativeAddressKana).length > 0) {
                representativeDetails.address_kana = representativeAddressKana;
            }

            const representativeAddressKanji = removeEmptyStrings({
                postal_code: payload.representative_address_kanji_postal_code,
                state: payload.representative_address_kanji_state,
                city: payload.representative_address_kanji_city,
                town: payload.representative_address_kanji_town,
                line1: payload.representative_address_kanji_line1,
                line2: payload.representative_address_kanji_line2,
                country: payload.representative_address_country,
            });

            if (Object.keys(representativeAddressKanji).length > 0) {
                representativeDetails.address_kanji = representativeAddressKanji;
            }

            const representativeRelationship: Record<string, any> = {};
            if (formData.representative_relationship_representative) {
                representativeRelationship.representative = true;
            }
            if (formData.representative_relationship_executive) {
                representativeRelationship.executive = true;
            }
            if (formData.representative_relationship_director) {
                representativeRelationship.director = true;
            }
            const representativeRelationshipTitle =
                payload.representative_relationship_title?.trim();
            if (representativeRelationshipTitle) {
                representativeRelationship.title = representativeRelationshipTitle;
            }

            if (Object.keys(representativeRelationship).length > 0) {
                representativeDetails.relationship = representativeRelationship;
            }

            if (Object.keys(representativeDetails).length > 0) {
                if (formData.business_type !== 'individual') {
                    payload.company = {
                        ...(payload.company || {}),
                        representative: representativeDetails,
                    };
                }
            }

            if (representativeIsOwner) {
                const ownerRecord = payload as Record<string, any>;
                const normalizeString = (value?: string) => {
                    if (value === undefined || value === null) {
                        return undefined;
                    }
                    const trimmed = value.trim();
                    return trimmed === '' ? undefined : trimmed;
                };
                const assignOwnerString = (key: string, value?: string) => {
                    const normalized = normalizeString(value);
                    if (normalized !== undefined) {
                        ownerRecord[key] = normalized;
                    }
                };
                const assignOwnerNumber = (key: string, value?: number) => {
                    if (typeof value === 'number' && Number.isFinite(value)) {
                        ownerRecord[key] = value;
                    }
                };

                assignOwnerString(
                    'owner_first_name',
                    formData.representative_first_name || formData.individual_first_name
                );
                assignOwnerString(
                    'owner_last_name',
                    formData.representative_last_name || formData.individual_last_name
                );
                assignOwnerString(
                    'owner_first_name_kana',
                    formData.representative_first_name_kana || formData.individual_first_name_kana
                );
                assignOwnerString(
                    'owner_last_name_kana',
                    formData.representative_last_name_kana || formData.individual_last_name_kana
                );
                assignOwnerString(
                    'owner_email',
                    formData.representative_email || formData.individual_email
                );
                assignOwnerString(
                    'owner_phone',
                    formData.representative_phone || formData.individual_phone
                );
                assignOwnerNumber('owner_dob_day', formData.representative_dob_day);
                assignOwnerNumber('owner_dob_month', formData.representative_dob_month);
                assignOwnerNumber('owner_dob_year', formData.representative_dob_year);
                assignOwnerString(
                    'owner_address_line1',
                    formData.representative_address_line1 || formData.individual_address_line1
                );
                assignOwnerString(
                    'owner_address_line2',
                    formData.representative_address_line2 || formData.individual_address_line2
                );
                assignOwnerString(
                    'owner_address_city',
                    formData.representative_address_city || formData.individual_address_city
                );
                assignOwnerString(
                    'owner_address_state',
                    formData.representative_address_state || formData.individual_address_state
                );
                assignOwnerString(
                    'owner_address_postal_code',
                    formData.representative_address_postal_code ||
                        formData.individual_address_postal_code
                );
                assignOwnerString(
                    'owner_address_country',
                    formData.representative_address_country ||
                        formData.individual_address_country ||
                        country ||
                        DEFAULT_COUNTRY
                );
                assignOwnerString('owner_address_town', formData.representative_address_town);
                assignOwnerString(
                    'owner_address_line2_kana',
                    formData.representative_address_line2_kana
                );
                assignOwnerString(
                    'owner_address_kana_postal_code',
                    formData.representative_address_kana_postal_code
                );
                assignOwnerString(
                    'owner_address_kana_state',
                    formData.representative_address_kana_state
                );
                assignOwnerString(
                    'owner_address_kana_city',
                    formData.representative_address_kana_city
                );
                assignOwnerString(
                    'owner_address_kana_town',
                    formData.representative_address_kana_town
                );
                assignOwnerString(
                    'owner_address_kana_line1',
                    formData.representative_address_kana_line1
                );
                assignOwnerString(
                    'owner_address_kana_line2',
                    formData.representative_address_kana_line2
                );
                assignOwnerString(
                    'owner_address_kanji_postal_code',
                    formData.representative_address_kanji_postal_code
                );
                assignOwnerString(
                    'owner_address_kanji_state',
                    formData.representative_address_kanji_state
                );
                assignOwnerString(
                    'owner_address_kanji_city',
                    formData.representative_address_kanji_city
                );
                assignOwnerString(
                    'owner_address_kanji_town',
                    formData.representative_address_kanji_town
                );
                assignOwnerString(
                    'owner_address_kanji_line1',
                    formData.representative_address_kanji_line1
                );
                assignOwnerString(
                    'owner_address_kanji_line2',
                    formData.representative_address_kanji_line2
                );
                ownerRecord.owner_relationship_owner = true;
                ownerRecord.owner_relationship_director =
                    !!formData.representative_relationship_director;
                assignOwnerString(
                    'owner_relationship_title',
                    formData.representative_relationship_title
                );
                assignOwnerString('owner_ssn_last_4', formData.representative_ssn_last_4);
                assignOwnerString('owner_id_number', formData.representative_id_number);
            }

            // If directors/executives are not required, drop related fields & flags
            if (!shouldShowDirectorsExecutives) {
                delete payload.company_directors_provided;
                delete payload.company_executives_provided;
                delete payload.directors;
                delete payload.executives;
                // Also ensure representative/owner role toggles don't accidentally set director/executive
                // outside SE flows unless explicitly chosen elsewhere
            }

            // Do not send confirm field to API
            delete payload.external_account_account_number_confirm;

            // Company-level role completion consistency checks (stricter flow)
            if (
                shouldShowDirectorsExecutives &&
                formData.company_directors_provided &&
                !hasAtLeastOneDirectorPerson
            ) {
                setLoading(false);
                setError(
                    'At least one person must be marked as Director before confirming all directors are provided.'
                );
                return;
            }
            if (
                shouldShowDirectorsExecutives &&
                formData.company_executives_provided &&
                !hasAtLeastOneExecutivePerson
            ) {
                setLoading(false);
                setError(
                    'At least one person must be marked as Executive before confirming all executives are provided.'
                );
                return;
            }

            // Handle individual ID number for Japan (My Number)
            // Japan uses My Number (12 digits) instead of SSN
            if (formData.individual_id_number) {
                payload.individual_id_number = formData.individual_id_number;
            }
            // Remove SSN fields for Japan
            delete payload.individual_ssn_last_4;

            // Handle representative SSN (for company, non-profit, and government_entity business type)
            if (
                formData.business_type === 'company' ||
                formData.business_type === 'non_profit' ||
                formData.business_type === 'government_entity'
            ) {
                // Ensure directors array is cleaned up (only send non-empty entries)
                if (Array.isArray(formData.directors)) {
                    payload.directors = formData.directors.filter(director => {
                        return (
                            !!director &&
                            (!!director.first_name?.trim() || !!director.last_name?.trim())
                        );
                    });
                }

                // Clean executives array
                if (Array.isArray(formData.executives)) {
                    payload.executives = formData.executives.filter(executive => {
                        return (
                            !!executive &&
                            (!!executive.first_name?.trim() || !!executive.last_name?.trim())
                        );
                    });
                }

                // Handle representative ID number for Japan (My Number)
                if (formData.representative_id_number) {
                    payload.representative_id_number = formData.representative_id_number;
                }
                // Remove SSN fields for Japan
                delete payload.representative_ssn_last_4;

                // Handle owner ID number for Japan (My Number)
                if (formData.owner_id_number) {
                    payload.owner_id_number = formData.owner_id_number;
                }
                // Remove SSN fields for Japan
                delete payload.owner_ssn_last_4;
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
                        individual_address_country: country || DEFAULT_COUNTRY,
                        individual_address_town: '',
                        individual_ssn_last_4: '',
                        individual_id_number: '',
                        individual_first_name_kana: '',
                        individual_last_name_kana: '',
                        individual_first_name_kanji: '',
                        individual_last_name_kanji: '',
                        // Japan-specific address fields
                        individual_address_kana_line1: '',
                        individual_address_kana_line2: '',
                        individual_address_kana_town: '',
                        individual_address_kana_city: '',
                        individual_address_kana_state: '',
                        individual_address_kana_postal_code: '',
                        individual_address_kana_country: '',
                        individual_address_kanji_line1: '',
                        individual_address_kanji_line2: '',
                        individual_address_kanji_town: '',
                        individual_address_kanji_city: '',
                        individual_address_kanji_state: '',
                        individual_address_kanji_postal_code: '',
                        individual_address_kanji_country: '',
                        business_type: businessType || 'individual',
                        business_profile_mcc: '',
                        business_profile_url: '',
                        business_description: '',
                        product_description: '',
                        // Company fields
                        company_name: '',
                        company_name_kanji: '',
                        company_name_kana: '',
                        company_tax_id: '',
                        company_registration_number: '',
                        company_structure: 'private_company',
                        company_address_line1: '',
                        company_address_line2: '',
                        company_address_city: '',
                        company_address_state: '',
                        company_address_postal_code: '',
                        company_address_country: country || DEFAULT_COUNTRY,
                        company_address_kana_postal_code: '',
                        company_address_kana_state: '',
                        company_address_kana_city: '',
                        company_address_kana_line1: '',
                        company_address_kana_line2: '',
                        company_address_kanji_postal_code: '',
                        company_address_kanji_state: '',
                        company_address_kanji_city: '',
                        company_address_kanji_line1: '',
                        company_address_kanji_line2: '',
                        company_directors_provided: false,
                        company_executives_provided: false,
                        // ToS Acceptance
                        tos_acceptance_date: Math.floor(Date.now() / 1000),
                        tos_acceptance_ip: '',
                        // External Account fields
                        external_account_object: 'bank_account',
                        external_account_country: country || DEFAULT_COUNTRY,
                        external_account_currency: getDefaultCurrencyForCountry(country),
                        // Bank Account fields
                        external_account_routing_number: '',
                        external_account_account_number: '',
                        external_account_account_number_confirm: '',
                        external_account_account_holder_name: '',
                        external_account_account_holder_type: 'individual',
                        external_account_bank_code: '',
                        external_account_branch_code: '',
                        external_account_account_type: 'futsu',
                        external_account_account_holder_name_kana: '',
                        // Debit Card fields
                        external_account_card_number: '',
                        external_account_exp_month: '01',
                        external_account_exp_year: new Date().getFullYear().toString(),
                        external_account_cvc: '',
                        // Representative Person fields
                        representative_first_name: '',
                        representative_last_name: '',
                        representative_first_name_kana: '',
                        representative_last_name_kana: '',
                        representative_first_name_kanji: '',
                        representative_last_name_kanji: '',
                        representative_email: '',
                        representative_phone: '',
                        representative_dob_day: 1,
                        representative_dob_month: 1,
                        representative_dob_year: 1990,
                        representative_address_line1: '',
                        representative_address_line2: '',
                        representative_address_city: '',
                        representative_address_state: '',
                        representative_address_postal_code: '',
                        representative_address_country: country || DEFAULT_COUNTRY,
                        representative_relationship_representative: true,
                        representative_relationship_executive: false,
                        representative_relationship_director: false,
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
                        owner_address_line2: '',
                        owner_address_city: '',
                        owner_address_state: '',
                        owner_address_postal_code: '',
                        owner_address_country: country || DEFAULT_COUNTRY,
                        owner_address_town: '',
                        owner_address_line2_kana: '',
                        owner_address_kana_postal_code: '',
                        owner_address_kana_state: '',
                        owner_address_kana_city: '',
                        owner_address_kana_town: '',
                        owner_address_kana_line1: '',
                        owner_address_kana_line2: '',
                        owner_address_kanji_postal_code: '',
                        owner_address_kanji_state: '',
                        owner_address_kanji_city: '',
                        owner_address_kanji_town: '',
                        owner_address_kanji_line1: '',
                        owner_address_kanji_line2: '',
                        owner_relationship_owner: true,
                        owner_relationship_director: false,
                        owner_relationship_title: '',
                        owner_ssn_last_4: '',
                        owner_id_number: '',
                        directors: [],
                        executives: [],
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
            individual_address_country: country || DEFAULT_COUNTRY,
            individual_address_town: '',
            individual_ssn_last_4: '',
            individual_id_number: '',
            individual_first_name_kana: '',
            individual_last_name_kana: '',
            individual_first_name_kanji: '',
            individual_last_name_kanji: '',
            // Japan-specific address fields
            individual_address_kana_line1: '',
            individual_address_kana_line2: '',
            individual_address_kana_town: '',
            individual_address_kana_city: '',
            individual_address_kana_state: '',
            individual_address_kana_postal_code: '',
            individual_address_kana_country: '',
            individual_address_kanji_line1: '',
            individual_address_kanji_line2: '',
            individual_address_kanji_town: '',
            individual_address_kanji_city: '',
            individual_address_kanji_state: '',
            individual_address_kanji_postal_code: '',
            individual_address_kanji_country: '',
            business_type: businessType || 'individual',
            business_profile_mcc: '',
            business_profile_url: '',
            business_description: '',
            product_description: '',
            company_name: '',
            company_name_kanji: '',
            company_name_kana: '',
            company_tax_id: '',
            company_structure: '',
            company_address_line1: '',
            company_address_line2: '',
            company_address_city: '',
            company_address_state: '',
            company_address_postal_code: '',
            company_address_country: country || DEFAULT_COUNTRY,
            company_directors_provided: false,
            company_executives_provided: false,
            tos_acceptance_date: Math.floor(Date.now() / 1000),
            tos_acceptance_ip: '',
            external_account_object: 'bank_account',
            external_account_country: country || DEFAULT_COUNTRY,
            external_account_currency: getDefaultCurrencyForCountry(country),
            external_account_routing_number: '',
            external_account_account_number: '',
            external_account_account_number_confirm: '',
            external_account_account_holder_name: '',
            external_account_account_holder_type: 'individual',
            external_account_card_number: '',
            external_account_exp_month: '01',
            external_account_exp_year: new Date().getFullYear().toString(),
            external_account_cvc: '',
            representative_first_name: '',
            representative_last_name: '',
            representative_first_name_kanji: '',
            representative_last_name_kanji: '',
            representative_email: '',
            representative_phone: '',
            representative_dob_day: 1,
            representative_dob_month: 1,
            representative_dob_year: 1990,
            representative_address_line1: '',
            representative_address_line2: '',
            representative_address_city: '',
            representative_address_state: '',
            representative_address_postal_code: '',
            representative_address_country: country || DEFAULT_COUNTRY,
            representative_relationship_representative: true,
            representative_relationship_executive: false,
            representative_relationship_director: false,
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
            owner_address_line2: '',
            owner_address_city: '',
            owner_address_state: '',
            owner_address_postal_code: '',
            owner_address_country: country || DEFAULT_COUNTRY,
            owner_address_town: '',
            owner_address_line2_kana: '',
            owner_address_kana_postal_code: '',
            owner_address_kana_state: '',
            owner_address_kana_city: '',
            owner_address_kana_town: '',
            owner_address_kana_line1: '',
            owner_address_kana_line2: '',
            owner_address_kanji_postal_code: '',
            owner_address_kanji_state: '',
            owner_address_kanji_city: '',
            owner_address_kanji_town: '',
            owner_address_kanji_line1: '',
            owner_address_kanji_line2: '',
            owner_relationship_owner: true,
            owner_relationship_director: false,
            owner_relationship_title: '',
            owner_ssn_last_4: '',
            owner_id_number: '',
            directors: [],
            executives: [],
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

                            {/* Business Information - Show immediately after Account ID for company, non-profit, and government_entity profiles */}
                            {(formData.business_type === 'company' ||
                                formData.business_type === 'non_profit' ||
                                formData.business_type === 'government_entity') && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Business Information
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
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

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Product/Business Description"
                                            value={formData.product_description}
                                            onChange={e =>
                                                handleInputChange(
                                                    'product_description',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Briefly describe your products or services"
                                            multiline
                                            rows={3}
                                            helperText="Describe what products or services you offer"
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

                            {/* Japan-specific: Kana fields for Individual */}
                            {formData.business_type === 'individual' && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="First Name (Katakana)"
                                        value={formData.individual_first_name_kana || ''}
                                        onChange={e =>
                                            handleInputChange(
                                                'individual_first_name_kana',
                                                e.target.value
                                            )
                                        }
                                        placeholder="タロウ"
                                        helperText="Enter name in Katakana (if available)"
                                    />
                                </Grid>
                            )}

                            {formData.business_type === 'individual' && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="First Name (Kanji)"
                                        value={formData.individual_first_name_kanji || ''}
                                        onChange={e =>
                                            handleInputChange(
                                                'individual_first_name_kanji',
                                                e.target.value
                                            )
                                        }
                                        placeholder="太郎"
                                        helperText="Enter name in Kanji (if available)"
                                    />
                                </Grid>
                            )}

                            {formData.business_type === 'individual' && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Last Name (Kanji)"
                                        value={formData.individual_last_name_kanji || ''}
                                        onChange={e =>
                                            handleInputChange(
                                                'individual_last_name_kanji',
                                                e.target.value
                                            )
                                        }
                                        placeholder="山田"
                                        helperText="Enter name in Kanji (if available)"
                                    />
                                </Grid>
                            )}

                            {formData.business_type === 'individual' && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Last Name (Katakana)"
                                        value={formData.individual_last_name_kana || ''}
                                        onChange={e =>
                                            handleInputChange(
                                                'individual_last_name_kana',
                                                e.target.value
                                            )
                                        }
                                        placeholder="ヤマダ"
                                        helperText="Enter name in Katakana (if available)"
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
                                        {formData.individual_address_country === 'US' ? (
                                            <>
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
                                                        <ToggleButton value="full">
                                                            Full SSN
                                                        </ToggleButton>
                                                        <ToggleButton value="both">
                                                            Both
                                                        </ToggleButton>
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
                                                                    e.target.value.replace(
                                                                        /\D/g,
                                                                        ''
                                                                    )
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
                                                                    e.target.value.replace(
                                                                        /\D/g,
                                                                        ''
                                                                    )
                                                                )
                                                            }
                                                            placeholder="123456789"
                                                            inputProps={{ maxLength: 9 }}
                                                            helperText="9-digit Social Security Number"
                                                        />
                                                    </Box>
                                                )}
                                            </>
                                        ) : (
                                            <TextField
                                                fullWidth
                                                label="My Number (マイナンバー)"
                                                value={formData.individual_id_number}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'individual_id_number',
                                                        e.target.value.replace(/\D/g, '')
                                                    )
                                                }
                                                placeholder="123456789012"
                                                helperText="Japan My Number - 12 digits"
                                                inputProps={{ maxLength: 12 }}
                                            />
                                        )}
                                    </Grid>

                                    {/* Japan-specific: Address in Kanji */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Address (Kanji) - 住所（漢字）
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Address Line 1 (Kanji)"
                                            value={formData.individual_address_kanji_line1 || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_kanji_line1',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="六本木３丁目５番７号"
                                            helperText="Enter address in Kanji"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Address Line 2 (Kanji)"
                                            value={formData.individual_address_kanji_line2 || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_kanji_line2',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="六本木ヒルズ森タワー３４階"
                                            helperText="Optional - Building name, floor, etc."
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Town (Kanji)"
                                            value={formData.individual_address_kanji_town || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_kanji_town',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="六本木"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="City (Kanji)"
                                            value={formData.individual_address_kanji_city || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_kanji_city',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="港区"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="State/Prefecture (Kanji)"
                                            value={formData.individual_address_kanji_state || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_kanji_state',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="東京都"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Postal Code (Kanji)"
                                            value={
                                                formData.individual_address_kanji_postal_code || ''
                                            }
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_kanji_postal_code',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="106-0032"
                                        />
                                    </Grid>

                                    {/* Japan-specific: Address in Kana */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Address (Katakana) - 住所（カタカナ）
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Address Line 1 (Katakana)"
                                            value={formData.individual_address_kana_line1 || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_kana_line1',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="ロッポンギ３－５－７"
                                            helperText="Enter address in Katakana"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Address Line 2 (Katakana)"
                                            value={formData.individual_address_kana_line2 || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_kana_line2',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="ロッポンギヒルズモリタワー３４Ｆ"
                                            helperText="Optional - Building name, floor, etc."
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Town (Katakana)"
                                            value={formData.individual_address_kana_town || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_kana_town',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="ロッポンギ"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="City (Katakana)"
                                            value={formData.individual_address_kana_city || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_kana_city',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="ミナトク"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="State/Prefecture (Katakana)"
                                            value={formData.individual_address_kana_state || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_kana_state',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="トウキョウト"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Postal Code (Katakana)"
                                            value={
                                                formData.individual_address_kana_postal_code || ''
                                            }
                                            onChange={e =>
                                                handleInputChange(
                                                    'individual_address_kana_postal_code',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="1060032"
                                        />
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

                                    <Grid size={{ xs: 12 }}>
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

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Product/Business Description"
                                            value={formData.product_description}
                                            onChange={e =>
                                                handleInputChange(
                                                    'product_description',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Briefly describe your products or services"
                                            multiline
                                            rows={3}
                                            helperText="Describe what products or services you offer"
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

                            {/* Company/Non-profit/Government Information - Show when business type is Company, Non-profit, or Government Entity */}
                            {(formData.business_type === 'company' ||
                                formData.business_type === 'non_profit' ||
                                formData.business_type === 'government_entity') && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            {formData.business_type === 'non_profit'
                                                ? 'Non-profit Information'
                                                : formData.business_type === 'government_entity'
                                                  ? 'Government Entity Information'
                                                  : 'Company Information'}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label={
                                                formData.business_type === 'non_profit'
                                                    ? 'Non-profit Name'
                                                    : formData.business_type === 'government_entity'
                                                      ? 'Government Entity Name'
                                                      : 'Company Name'
                                            }
                                            value={formData.company_name}
                                            onChange={e =>
                                                handleInputChange('company_name', e.target.value)
                                            }
                                            placeholder={
                                                formData.business_type === 'non_profit'
                                                    ? 'ABC Non-profit Organization'
                                                    : formData.business_type === 'government_entity'
                                                      ? 'City of Springfield'
                                                      : 'ABC Technologies LLC'
                                            }
                                        />
                                    </Grid>

                                    {/* Japan-specific: Company Name Kanji */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Company Name (Kanji)"
                                            value={formData.company_name_kanji || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_name_kanji',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="株式会社ABC"
                                            helperText="Enter company name in Kanji (if available)"
                                        />
                                    </Grid>

                                    {/* Japan-specific: Company Name Kana */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Company Name (Katakana)"
                                            value={formData.company_name_kana || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_name_kana',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="カブシキガイシャエービーシー"
                                            helperText="Enter company name in Katakana (if available)"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Corporate Number (法人番号)"
                                            value={formData.company_registration_number || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_registration_number',
                                                    e.target.value.replace(/\D/g, '')
                                                )
                                            }
                                            placeholder="1234567890123"
                                            helperText="Japan Corporate Number (13 digits) - Houjin Bangou"
                                            inputProps={{ maxLength: 13 }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Tax ID (Corporate Number)"
                                            value={formData.company_tax_id}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_tax_id',
                                                    e.target.value.replace(/\D/g, '')
                                                )
                                            }
                                            placeholder="1234567890123"
                                            helperText="Japan Corporate Number (13 digits) - Houjin Bangou"
                                            inputProps={{ maxLength: 13 }}
                                        />
                                    </Grid>

                                    {shouldCollectCompanyStructure && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>
                                                    {formData.business_type === 'non_profit'
                                                        ? 'Non-profit Structure'
                                                        : formData.business_type ===
                                                            'government_entity'
                                                          ? 'Government Entity Structure'
                                                          : 'Company Structure'}
                                                </InputLabel>
                                                <Select
                                                    value={formData.company_structure}
                                                    label={
                                                        formData.business_type === 'non_profit'
                                                            ? 'Non-profit Structure'
                                                            : formData.business_type ===
                                                                'government_entity'
                                                              ? 'Government Entity Structure'
                                                              : 'Company Structure'
                                                    }
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'company_structure',
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    {availableCompanyStructures.map(structure => (
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
                                    )}

                                    {/* Company/Non-profit/Government Address */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                            {formData.business_type === 'non_profit'
                                                ? 'Non-profit Address'
                                                : formData.business_type === 'government_entity'
                                                  ? 'Government Entity Address'
                                                  : 'Business Address'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Provide the primary business location in Latin
                                            characters.
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 4 }}>
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
                                            placeholder="123-4567"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="Prefecture"
                                            value={formData.company_address_state}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_address_state',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Tokyo"
                                            helperText="Enter the prefecture (e.g., Tokyo, Osaka)"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="City / Ward"
                                            value={formData.company_address_city}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_address_city',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Shibuya-ku"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Block number (e.g. 1-1)"
                                            value={formData.company_address_line1}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_address_line1',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="1-1"
                                            helperText="Include chōme and block numbers, if applicable"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Building name + unit number"
                                            value={formData.company_address_line2}
                                            onChange={e =>
                                                handleInputChange(
                                                    'company_address_line2',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Sunrise Midtown 1503"
                                            helperText="Optional"
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

                                    {formData.company_address_country === 'JP' && (
                                        <>
                                            <Grid size={{ xs: 12 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    gutterBottom
                                                    sx={{ mt: 2 }}
                                                >
                                                    Kana business address
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Enter the address in full-width Katakana as
                                                    required by Stripe for Japanese verification.
                                                </Typography>
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Postal code (digits only)"
                                                    value={
                                                        formData.company_address_kana_postal_code
                                                    }
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'company_address_kana_postal_code',
                                                            e.target.value.replace(/\D/g, '')
                                                        )
                                                    }
                                                    placeholder="1234567"
                                                    helperText="Use digits only; no hyphen"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Prefecture (カナ)"
                                                    value={formData.company_address_kana_state}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'company_address_kana_state',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="トウキョウト"
                                                    helperText="Full-width Katakana"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    label="City / Ward (カナ)"
                                                    value={formData.company_address_kana_city}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'company_address_kana_city',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="シブヤク"
                                                    helperText="Full-width Katakana"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Block number (カナ)"
                                                    value={formData.company_address_kana_line1}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'company_address_kana_line1',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="１－１"
                                                    helperText="Use full-width numbers and Katakana where needed"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Building name + unit number (カナ)"
                                                    value={formData.company_address_kana_line2}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'company_address_kana_line2',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="サンライズミッドタウン１５０３"
                                                    helperText="Optional"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    gutterBottom
                                                    sx={{ mt: 2 }}
                                                >
                                                    Kanji business address
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Provide the address using Kanji characters
                                                    exactly as registered.
                                                </Typography>
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    label="郵便番号"
                                                    value={
                                                        formData.company_address_kanji_postal_code
                                                    }
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'company_address_kanji_postal_code',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="123-4567"
                                                    helperText="７桁の郵便番号"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    label="都道府県"
                                                    value={formData.company_address_kanji_state}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'company_address_kanji_state',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="東京都"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    label="市区町村"
                                                    value={formData.company_address_kanji_city}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'company_address_kanji_city',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="渋谷区"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="番地"
                                                    value={formData.company_address_kanji_line1}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'company_address_kanji_line1',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="１丁目１番"
                                                    helperText="丁目・番・号を含めて入力"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="建物名・部屋番号"
                                                    value={formData.company_address_kanji_line2}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'company_address_kanji_line2',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="サンライズミッドタウン１５０３"
                                                    helperText="任意"
                                                />
                                            </Grid>
                                        </>
                                    )}

                                    {/* Company/Non-profit/Government Verification Documents */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            {formData.business_type === 'non_profit'
                                                ? 'Non-profit Verification Documents'
                                                : formData.business_type === 'government_entity'
                                                  ? 'Government Entity Verification Documents (Recommended)'
                                                  : 'Company Verification Documents (Optional)'}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color={
                                                formData.business_type === 'non_profit' ||
                                                formData.business_type === 'government_entity'
                                                    ? 'warning.main'
                                                    : 'text.secondary'
                                            }
                                            gutterBottom
                                        >
                                            {formData.business_type === 'non_profit'
                                                ? 'Upload tax-exempt status documents (IRS 501(c)(3) determination letter, tax-exempt certificate, etc.) - Recommended for verification'
                                                : formData.business_type === 'government_entity'
                                                  ? 'Upload government entity documentation (charter, incorporation documents, tax-exempt status, etc.) - Recommended for verification'
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
                                                    : formData.business_type === 'government_entity'
                                                      ? 'Upload Government Document (Front)'
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
                                                    : formData.business_type === 'government_entity'
                                                      ? 'Upload Government Document (Back)'
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

                            {/* Representative Person Fields */}
                            {shouldShowRepresentativeFields && (
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

                                    {/* Japan-specific: Representative Kanji fields */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Representative First Name (Kanji)"
                                            value={formData.representative_first_name_kanji || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_first_name_kanji',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="太郎"
                                            helperText="Enter name in Kanji (if available)"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Representative Last Name (Kanji)"
                                            value={formData.representative_last_name_kanji || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_last_name_kanji',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="山田"
                                            helperText="Enter name in Kanji (if available)"
                                        />
                                    </Grid>

                                    {/* Japan-specific: Representative Kana fields */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Representative First Name (Katakana)"
                                            value={formData.representative_first_name_kana || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_first_name_kana',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="タロウ"
                                            helperText="Enter name in Katakana (if available)"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Representative Last Name (Katakana)"
                                            value={formData.representative_last_name_kana || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_last_name_kana',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="ヤマダ"
                                            helperText="Enter name in Katakana (if available)"
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

                                    {/* Representative relationship toggles for director/executive countries */}
                                    {formData.business_type !== 'individual' &&
                                        DIRECTOR_EXECUTIVE_COUNTRIES.includes(
                                            normalizedRepresentativeCountry
                                        ) && (
                                            <Grid size={{ xs: 12 }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 3,
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={
                                                                    !!formData.representative_relationship_representative
                                                                }
                                                                onChange={e =>
                                                                    handleInputChange(
                                                                        'representative_relationship_representative',
                                                                        e.target.checked
                                                                    )
                                                                }
                                                            />
                                                        }
                                                        label="Business Representative"
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={
                                                                    !!formData.representative_relationship_executive
                                                                }
                                                                onChange={e =>
                                                                    handleInputChange(
                                                                        'representative_relationship_executive',
                                                                        e.target.checked
                                                                    )
                                                                }
                                                            />
                                                        }
                                                        label="Executive"
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={
                                                                    !!formData.representative_relationship_director
                                                                }
                                                                onChange={e =>
                                                                    handleInputChange(
                                                                        'representative_relationship_director',
                                                                        e.target.checked
                                                                    )
                                                                }
                                                            />
                                                        }
                                                        label="Director"
                                                    />
                                                </Box>
                                            </Grid>
                                        )}

                                    <Grid size={{ xs: 12 }}>
                                        {formData.representative_address_country === 'US' ? (
                                            <>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                        Social Security Number (SSN)
                                                    </Typography>
                                                    <ToggleButtonGroup
                                                        value={representativeSsnType}
                                                        exclusive
                                                        onChange={(e, newValue) => {
                                                            if (newValue !== null) {
                                                                setRepresentativeSsnType(newValue);
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
                                                        <ToggleButton value="full">
                                                            Full SSN
                                                        </ToggleButton>
                                                        <ToggleButton value="both">
                                                            Both
                                                        </ToggleButton>
                                                    </ToggleButtonGroup>
                                                    {representativeSsnType === 'last4' ? (
                                                        <TextField
                                                            fullWidth
                                                            label="SSN Last 4 Digits"
                                                            value={
                                                                formData.representative_ssn_last_4
                                                            }
                                                            onChange={e =>
                                                                handleInputChange(
                                                                    'representative_ssn_last_4',
                                                                    e.target.value.replace(
                                                                        /\D/g,
                                                                        ''
                                                                    )
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
                                                            value={
                                                                formData.representative_id_number
                                                            }
                                                            onChange={e =>
                                                                handleInputChange(
                                                                    'representative_id_number',
                                                                    e.target.value.replace(
                                                                        /\D/g,
                                                                        ''
                                                                    )
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
                                                                value={
                                                                    formData.representative_ssn_last_4
                                                                }
                                                                onChange={e =>
                                                                    handleInputChange(
                                                                        'representative_ssn_last_4',
                                                                        e.target.value.replace(
                                                                            /\D/g,
                                                                            ''
                                                                        )
                                                                    )
                                                                }
                                                                placeholder="1234"
                                                                inputProps={{ maxLength: 4 }}
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                label="Full SSN"
                                                                value={
                                                                    formData.representative_id_number
                                                                }
                                                                onChange={e =>
                                                                    handleInputChange(
                                                                        'representative_id_number',
                                                                        e.target.value.replace(
                                                                            /\D/g,
                                                                            ''
                                                                        )
                                                                    )
                                                                }
                                                                placeholder="123456789"
                                                                inputProps={{ maxLength: 9 }}
                                                            />
                                                        </Box>
                                                    )}
                                                </Box>
                                            </>
                                        ) : (
                                            <TextField
                                                fullWidth
                                                label="National ID Number"
                                                value={formData.representative_id_number}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'representative_id_number',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g., Swedish personnummer"
                                                helperText="Provide full national ID number"
                                            />
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
                                            label="Postal code"
                                            value={formData.representative_address_postal_code}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_postal_code',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="123-4567"
                                            helperText="Format: 123-4567"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Block number (e.g. 1-1)"
                                            value={formData.representative_address_line1}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_line1',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="1-1"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Town / District"
                                            value={formData.representative_address_town || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_town',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Roppongi"
                                            helperText="Neighborhood or town (e.g., Roppongi)"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Prefecture"
                                            value={formData.representative_address_state}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_state',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Tokyo"
                                            helperText="Enter the prefecture or province"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="City / Ward"
                                            value={formData.representative_address_city}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_city',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Minato"
                                            helperText="Enter the municipality"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Country</InputLabel>
                                            <Select
                                                value={
                                                    formData.representative_address_country ||
                                                    DEFAULT_COUNTRY
                                                }
                                                label="Country"
                                                onChange={e =>
                                                    handleInputChange(
                                                        'representative_address_country',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {countries.map(countryOption => (
                                                    <MenuItem
                                                        key={countryOption.code}
                                                        value={countryOption.code}
                                                    >
                                                        {countryOption.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Building name + unit number"
                                            value={formData.representative_address_line2 || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_line2',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Roppongi Hills Mori Tower 34F"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                            Representative Address (Kana)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Enter the address in full-width Katakana as required by
                                            Stripe.
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="Postal code (digits only)"
                                            value={
                                                formData.representative_address_kana_postal_code ||
                                                ''
                                            }
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_kana_postal_code',
                                                    e.target.value.replace(/\D/g, '')
                                                )
                                            }
                                            placeholder="1234567"
                                            helperText="Use digits only; no hyphen"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="Prefecture (カナ)"
                                            value={formData.representative_address_kana_state || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_kana_state',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="トウキョウト"
                                            helperText="Full-width Katakana"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="City / Ward (カナ)"
                                            value={formData.representative_address_kana_city || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_kana_city',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="ミナトク"
                                            helperText="Full-width Katakana"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Town / District (カナ)"
                                            value={formData.representative_address_kana_town || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_kana_town',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="ロッポンギ"
                                            helperText="Full-width Katakana"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Block number (カナ)"
                                            value={formData.representative_address_kana_line1 || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_kana_line1',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="３－５－７"
                                            helperText="Use full-width numbers and Katakana where needed"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Building name + unit number (カナ)"
                                            value={formData.representative_address_kana_line2 || ''}
                                            onChange={e => {
                                                const value = e.target.value;
                                                handleInputChange(
                                                    'representative_address_kana_line2',
                                                    value
                                                );
                                                handleInputChange(
                                                    'representative_address_line2_kana',
                                                    value
                                                );
                                            }}
                                            placeholder="ロッポンギヒルズモリタワー ３４Ｆ"
                                            helperText="Optional – enter in Katakana"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                            Representative Address (Kanji)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Provide the legally registered address using Kanji
                                            characters.
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="郵便番号"
                                            value={
                                                formData.representative_address_kanji_postal_code ||
                                                ''
                                            }
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_kanji_postal_code',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="106-0032"
                                            helperText="７桁の郵便番号"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="都道府県"
                                            value={
                                                formData.representative_address_kanji_state || ''
                                            }
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_kanji_state',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="東京都"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="市区町村"
                                            value={formData.representative_address_kanji_city || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_kanji_city',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="港区"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="町域"
                                            value={formData.representative_address_kanji_town || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_kanji_town',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="六本木"
                                            helperText="町名を入力"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="番地"
                                            value={
                                                formData.representative_address_kanji_line1 || ''
                                            }
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_kanji_line1',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="３丁目５番７号"
                                            helperText="丁目・番・号を含めて入力"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="建物名・部屋番号"
                                            value={
                                                formData.representative_address_kanji_line2 || ''
                                            }
                                            onChange={e =>
                                                handleInputChange(
                                                    'representative_address_kanji_line2',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="六本木ヒルズ森タワー３４階"
                                            helperText="任意項目"
                                        />
                                    </Grid>

                                    {/* Owner Checkbox */}
                                    <Grid size={{ xs: 12 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={representativeIsOwner}
                                                    onChange={e => {
                                                        const isChecked = e.target.checked;
                                                        setRepresentativeIsOwner(isChecked);

                                                        if (isChecked) {
                                                            setFormData(prev => {
                                                                const pickString = (
                                                                    ...values: (
                                                                        | string
                                                                        | undefined
                                                                    )[]
                                                                ) => {
                                                                    for (const value of values) {
                                                                        if (
                                                                            value &&
                                                                            value.trim() !== ''
                                                                        ) {
                                                                            return value.trim();
                                                                        }
                                                                    }
                                                                    const last =
                                                                        values[values.length - 1];
                                                                    return last ?? '';
                                                                };

                                                                return {
                                                                    ...prev,
                                                                    owner_first_name: pickString(
                                                                        prev.representative_first_name,
                                                                        prev.individual_first_name,
                                                                        prev.owner_first_name
                                                                    ),
                                                                    owner_last_name: pickString(
                                                                        prev.representative_last_name,
                                                                        prev.individual_last_name,
                                                                        prev.owner_last_name
                                                                    ),
                                                                    owner_first_name_kana:
                                                                        pickString(
                                                                            prev.representative_first_name_kana,
                                                                            prev.individual_first_name_kana,
                                                                            prev.owner_first_name_kana
                                                                        ),
                                                                    owner_last_name_kana:
                                                                        pickString(
                                                                            prev.representative_last_name_kana,
                                                                            prev.individual_last_name_kana,
                                                                            prev.owner_last_name_kana
                                                                        ),
                                                                    owner_email: pickString(
                                                                        prev.representative_email,
                                                                        prev.individual_email,
                                                                        prev.owner_email
                                                                    ),
                                                                    owner_phone: pickString(
                                                                        prev.representative_phone,
                                                                        prev.individual_phone,
                                                                        prev.owner_phone
                                                                    ),
                                                                    owner_dob_day:
                                                                        prev.representative_dob_day ||
                                                                        prev.owner_dob_day ||
                                                                        1,
                                                                    owner_dob_month:
                                                                        prev.representative_dob_month ||
                                                                        prev.owner_dob_month ||
                                                                        1,
                                                                    owner_dob_year:
                                                                        prev.representative_dob_year ||
                                                                        prev.owner_dob_year ||
                                                                        1990,
                                                                    owner_address_line1: pickString(
                                                                        prev.representative_address_line1,
                                                                        prev.individual_address_line1,
                                                                        prev.owner_address_line1
                                                                    ),
                                                                    owner_address_line2: pickString(
                                                                        prev.representative_address_line2,
                                                                        prev.owner_address_line2,
                                                                        prev.individual_address_line2
                                                                    ),
                                                                    owner_address_city: pickString(
                                                                        prev.representative_address_city,
                                                                        prev.individual_address_city,
                                                                        prev.owner_address_city
                                                                    ),
                                                                    owner_address_state: pickString(
                                                                        prev.representative_address_state,
                                                                        prev.individual_address_state,
                                                                        prev.owner_address_state
                                                                    ),
                                                                    owner_address_postal_code:
                                                                        pickString(
                                                                            prev.representative_address_postal_code,
                                                                            prev.individual_address_postal_code,
                                                                            prev.owner_address_postal_code
                                                                        ),
                                                                    owner_address_country:
                                                                        pickString(
                                                                            prev.representative_address_country,
                                                                            prev.individual_address_country,
                                                                            prev.owner_address_country,
                                                                            country ||
                                                                                DEFAULT_COUNTRY
                                                                        ),
                                                                    owner_address_town: pickString(
                                                                        prev.representative_address_town,
                                                                        prev.owner_address_town
                                                                    ),
                                                                    owner_address_line2_kana:
                                                                        pickString(
                                                                            prev.representative_address_line2_kana,
                                                                            prev.owner_address_line2_kana
                                                                        ),
                                                                    owner_address_kana_postal_code:
                                                                        pickString(
                                                                            prev.representative_address_kana_postal_code,
                                                                            prev.owner_address_kana_postal_code
                                                                        ),
                                                                    owner_address_kana_state:
                                                                        pickString(
                                                                            prev.representative_address_kana_state,
                                                                            prev.owner_address_kana_state
                                                                        ),
                                                                    owner_address_kana_city:
                                                                        pickString(
                                                                            prev.representative_address_kana_city,
                                                                            prev.owner_address_kana_city
                                                                        ),
                                                                    owner_address_kana_town:
                                                                        pickString(
                                                                            prev.representative_address_kana_town,
                                                                            prev.owner_address_kana_town
                                                                        ),
                                                                    owner_address_kana_line1:
                                                                        pickString(
                                                                            prev.representative_address_kana_line1,
                                                                            prev.owner_address_kana_line1
                                                                        ),
                                                                    owner_address_kana_line2:
                                                                        pickString(
                                                                            prev.representative_address_kana_line2,
                                                                            prev.owner_address_kana_line2
                                                                        ),
                                                                    owner_address_kanji_postal_code:
                                                                        pickString(
                                                                            prev.representative_address_kanji_postal_code,
                                                                            prev.owner_address_kanji_postal_code
                                                                        ),
                                                                    owner_address_kanji_state:
                                                                        pickString(
                                                                            prev.representative_address_kanji_state,
                                                                            prev.owner_address_kanji_state
                                                                        ),
                                                                    owner_address_kanji_city:
                                                                        pickString(
                                                                            prev.representative_address_kanji_city,
                                                                            prev.owner_address_kanji_city
                                                                        ),
                                                                    owner_address_kanji_town:
                                                                        pickString(
                                                                            prev.representative_address_kanji_town,
                                                                            prev.owner_address_kanji_town
                                                                        ),
                                                                    owner_address_kanji_line1:
                                                                        pickString(
                                                                            prev.representative_address_kanji_line1,
                                                                            prev.owner_address_kanji_line1
                                                                        ),
                                                                    owner_address_kanji_line2:
                                                                        pickString(
                                                                            prev.representative_address_kanji_line2,
                                                                            prev.owner_address_kanji_line2
                                                                        ),
                                                                    owner_relationship_owner: true,
                                                                    owner_relationship_director:
                                                                        !!prev.representative_relationship_director,
                                                                    owner_relationship_title:
                                                                        pickString(
                                                                            prev.representative_relationship_title,
                                                                            prev.owner_relationship_title
                                                                        ),
                                                                    owner_ssn_last_4: pickString(
                                                                        prev.representative_ssn_last_4,
                                                                        prev.owner_ssn_last_4
                                                                    ),
                                                                    owner_id_number: pickString(
                                                                        prev.representative_id_number,
                                                                        prev.owner_id_number
                                                                    ),
                                                                };
                                                            });
                                                        }
                                                    }}
                                                />
                                            }
                                            label="This representative is also the owner"
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Owner Person Fields */}
                            {shouldShowOwnerFields && (
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

                                    {/* Japan-specific: Owner Kana fields */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Owner First Name (Katakana)"
                                            value={formData.owner_first_name_kana || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'owner_first_name_kana',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="タロウ"
                                            helperText="Enter name in Katakana (if available)"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Owner Last Name (Katakana)"
                                            value={formData.owner_last_name_kana || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'owner_last_name_kana',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="ヤマダ"
                                            helperText="Enter name in Katakana (if available)"
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
                                        {formData.owner_address_country === 'US' ? (
                                            <>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                        Social Security Number (SSN)
                                                    </Typography>
                                                    <ToggleButtonGroup
                                                        value={ownerSsnType}
                                                        exclusive
                                                        onChange={(e, newValue) => {
                                                            if (newValue !== null) {
                                                                setOwnerSsnType(newValue);
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
                                                        <ToggleButton value="full">
                                                            Full SSN
                                                        </ToggleButton>
                                                        <ToggleButton value="both">
                                                            Both
                                                        </ToggleButton>
                                                    </ToggleButtonGroup>
                                                    {ownerSsnType === 'last4' ? (
                                                        <TextField
                                                            fullWidth
                                                            label="SSN Last 4 Digits"
                                                            value={formData.owner_ssn_last_4}
                                                            onChange={e =>
                                                                handleInputChange(
                                                                    'owner_ssn_last_4',
                                                                    e.target.value.replace(
                                                                        /\D/g,
                                                                        ''
                                                                    )
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
                                                                    e.target.value.replace(
                                                                        /\D/g,
                                                                        ''
                                                                    )
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
                                                                        e.target.value.replace(
                                                                            /\D/g,
                                                                            ''
                                                                        )
                                                                    )
                                                                }
                                                                placeholder="1234"
                                                                inputProps={{ maxLength: 4 }}
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                label="Full SSN"
                                                                value={formData.owner_id_number}
                                                                onChange={e =>
                                                                    handleInputChange(
                                                                        'owner_id_number',
                                                                        e.target.value.replace(
                                                                            /\D/g,
                                                                            ''
                                                                        )
                                                                    )
                                                                }
                                                                placeholder="123456789"
                                                                inputProps={{ maxLength: 9 }}
                                                            />
                                                        </Box>
                                                    )}
                                                </Box>
                                            </>
                                        ) : (
                                            <TextField
                                                fullWidth
                                                label="National ID Number"
                                                value={formData.owner_id_number}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'owner_id_number',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g., Swedish personnummer"
                                                helperText="Provide full national ID number"
                                            />
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

                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Building name + unit number"
                                            value={formData.owner_address_line2 || ''}
                                            onChange={e =>
                                                handleInputChange(
                                                    'owner_address_line2',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Apartment 4B"
                                            helperText="Optional"
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

                                    {formData.owner_address_country === 'JP' && (
                                        <>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Town / District"
                                                    value={formData.owner_address_town || ''}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_address_town',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="六本木"
                                                    helperText="町名・地区名を入力"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    gutterBottom
                                                    sx={{ mt: 2 }}
                                                >
                                                    Owner Address (Kana)
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    住所を全角カタカナで入力してください
                                                </Typography>
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    label="郵便番号（カナ）"
                                                    value={
                                                        formData.owner_address_kana_postal_code ||
                                                        ''
                                                    }
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_address_kana_postal_code',
                                                            e.target.value.replace(/\D/g, '')
                                                        )
                                                    }
                                                    placeholder="1234567"
                                                    helperText="ハイフンなし７桁"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    label="都道府県（カナ）"
                                                    value={formData.owner_address_kana_state || ''}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_address_kana_state',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="トウキョウト"
                                                    helperText="全角カタカナ"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    label="市区町村（カナ）"
                                                    value={formData.owner_address_kana_city || ''}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_address_kana_city',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="ミナトク"
                                                    helperText="全角カタカナ"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="町名（カナ）"
                                                    value={formData.owner_address_kana_town || ''}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_address_kana_town',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="ロッポンギ"
                                                    helperText="全角カタカナ"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="番地（カナ）"
                                                    value={formData.owner_address_kana_line1 || ''}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_address_kana_line1',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="３−５−７"
                                                    helperText="全角表記"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    label="建物名・部屋番号（カナ）"
                                                    value={formData.owner_address_kana_line2 || ''}
                                                    onChange={e => {
                                                        const value = e.target.value;
                                                        handleInputChange(
                                                            'owner_address_kana_line2',
                                                            value
                                                        );
                                                        handleInputChange(
                                                            'owner_address_line2_kana',
                                                            value
                                                        );
                                                    }}
                                                    placeholder="ロッポンギヒルズモリタワー３４Ｆ"
                                                    helperText="任意項目"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    gutterBottom
                                                    sx={{ mt: 2 }}
                                                >
                                                    Owner Address (Kanji)
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    登記上の住所を漢字で入力してください
                                                </Typography>
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    label="郵便番号（漢字）"
                                                    value={
                                                        formData.owner_address_kanji_postal_code ||
                                                        ''
                                                    }
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_address_kanji_postal_code',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="106-0032"
                                                    helperText="７桁の郵便番号"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    label="都道府県（漢字）"
                                                    value={formData.owner_address_kanji_state || ''}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_address_kanji_state',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="東京都"
                                                    helperText="正式名称で入力"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    label="市区町村（漢字）"
                                                    value={formData.owner_address_kanji_city || ''}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_address_kanji_city',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="港区"
                                                    helperText="正式名称で入力"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="町名（漢字）"
                                                    value={formData.owner_address_kanji_town || ''}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_address_kanji_town',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="六本木"
                                                    helperText="正式名称で入力"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="番地（漢字）"
                                                    value={formData.owner_address_kanji_line1 || ''}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_address_kanji_line1',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="３丁目５番７号"
                                                    helperText="丁目・番・号まで入力"
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    label="建物名・部屋番号（漢字）"
                                                    value={formData.owner_address_kanji_line2 || ''}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'owner_address_kanji_line2',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="六本木ヒルズ森タワー３４階"
                                                    helperText="任意項目"
                                                />
                                            </Grid>
                                        </>
                                    )}

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

                            {renderDirectorsExecutivesSection()}

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

                                        {/* Japan-specific: Bank Code and Branch Code instead of Routing Number */}
                                        {formData.external_account_country === 'JP' && (
                                            <>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Bank Code (銀行コード)"
                                                        error={japanBankCodeHasError}
                                                        value={
                                                            formData.external_account_bank_code ||
                                                            ''
                                                        }
                                                        onChange={e =>
                                                            handleInputChange(
                                                                'external_account_bank_code',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Find your bank…"
                                                        helperText={
                                                            japanBankCodeHasError
                                                                ? 'Bank code must be exactly 4 digits.'
                                                                : "Enter the 4-digit bank code (use Stripe's bank finder if unsure)."
                                                        }
                                                        inputProps={{
                                                            maxLength: 4,
                                                            inputMode: 'numeric',
                                                            pattern: '[0-9]*',
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Branch Code (支店コード)"
                                                        error={japanBranchCodeHasError}
                                                        value={
                                                            formData.external_account_branch_code ||
                                                            ''
                                                        }
                                                        onChange={e =>
                                                            handleInputChange(
                                                                'external_account_branch_code',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Find your branch…"
                                                        helperText={
                                                            japanBranchCodeHasError
                                                                ? 'Branch code must be exactly 3 digits.'
                                                                : 'Enter the 3-digit branch code from your passbook.'
                                                        }
                                                        inputProps={{
                                                            maxLength: 3,
                                                            inputMode: 'numeric',
                                                            pattern: '[0-9]*',
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Account Type</InputLabel>
                                                        <Select
                                                            value={
                                                                formData.external_account_account_type ||
                                                                'futsu'
                                                            }
                                                            label="Account Type"
                                                            onChange={e =>
                                                                handleInputChange(
                                                                    'external_account_account_type',
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <MenuItem value="futsu">
                                                                Futsu (普通預金)
                                                            </MenuItem>
                                                            <MenuItem value="toza">
                                                                Toza (当座預金)
                                                            </MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </>
                                        )}
                                        {/* Routing number for non-Japan countries */}
                                        {!isIbanCountry &&
                                            formData.external_account_country !== 'JP' && (
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Routing Number"
                                                        value={
                                                            formData.external_account_routing_number
                                                        }
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
                                            )}

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label={
                                                    isIbanCountry
                                                        ? 'IBAN'
                                                        : isJapanBankAccount
                                                          ? 'Account Number (口座番号)'
                                                          : 'Account Number'
                                                }
                                                error={
                                                    isJapanBankAccount && japanAccountNumberHasError
                                                }
                                                value={formData.external_account_account_number}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'external_account_account_number',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={
                                                    isIbanCountry
                                                        ? `${formData.external_account_country || ''}… (IBAN)`
                                                        : isJapanBankAccount
                                                          ? '0001234'
                                                          : '000123456789'
                                                }
                                                helperText={
                                                    isIbanCountry
                                                        ? 'IBAN (no routing number required)'
                                                        : isJapanBankAccount
                                                          ? japanAccountNumberHasError
                                                              ? 'Account number must be exactly 7 digits.'
                                                              : 'Enter the 7-digit account number from your passbook.'
                                                          : 'Bank account number'
                                                }
                                                inputProps={
                                                    isJapanBankAccount
                                                        ? {
                                                              maxLength: 7,
                                                              inputMode: 'numeric',
                                                              pattern: '[0-9]*',
                                                          }
                                                        : undefined
                                                }
                                            />
                                        </Grid>

                                        {(isIbanCountry || isJapanBankAccount) && (
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label={
                                                        isJapanBankAccount
                                                            ? 'Confirm Account Number'
                                                            : 'Confirm IBAN'
                                                    }
                                                    error={
                                                        isJapanBankAccount &&
                                                        japanAccountNumberConfirmHasError
                                                    }
                                                    value={
                                                        formData.external_account_account_number_confirm ||
                                                        ''
                                                    }
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'external_account_account_number_confirm',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder={
                                                        isJapanBankAccount
                                                            ? '0001234'
                                                            : 'Re-enter IBAN'
                                                    }
                                                    helperText={
                                                        isJapanBankAccount
                                                            ? japanAccountNumberConfirmHasError
                                                                ? 'Account numbers must match.'
                                                                : 'Re-enter the 7-digit account number to confirm.'
                                                            : 'Re-enter IBAN to confirm'
                                                    }
                                                    inputProps={
                                                        isJapanBankAccount
                                                            ? {
                                                                  maxLength: 7,
                                                                  inputMode: 'numeric',
                                                                  pattern: '[0-9]*',
                                                              }
                                                            : undefined
                                                    }
                                                />
                                            </Grid>
                                        )}

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

                                        {/* Japan-specific: Account Holder Name Kana */}
                                        {formData.external_account_country === 'JP' && (
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Account Holder Name (カタカナ)"
                                                    value={
                                                        formData.external_account_account_holder_name_kana ||
                                                        ''
                                                    }
                                                    onChange={e =>
                                                        handleInputChange(
                                                            'external_account_account_holder_name_kana',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="タナカハルト"
                                                    helperText="Must match the individual or legal entity name registered on the account (full-width Katakana)."
                                                />
                                            </Grid>
                                        )}

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

export default JapanForm;
