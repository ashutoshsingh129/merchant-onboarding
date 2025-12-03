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

// Greece-specific configuration
const DIRECTOR_EXECUTIVE_COUNTRIES: string[] = ['GR']; // Greece requires directors/executives
const IBAN_COUNTRIES: string[] = ['GR']; // Greece uses IBAN
const DEFAULT_COUNTRY = 'GR';

// DirectOnboardFormData and DirectOnboardFormProps are imported from types.ts

const GreeceForm: React.FC<DirectOnboardFormProps> = ({
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
        individual_ssn_last_4: '',
        individual_id_number: '',
        business_type: businessType || 'individual',
        business_profile_mcc: '4816',
        business_profile_url: '',
        business_description: '',
        product_description: 'Computer Network Services',
        // Company fields
        company_name: '',
        company_tax_id: '',
        company_structure: 'private_corporation',
        company_address_line1: '',
        company_address_line2: '',
        company_address_city: '',
        company_address_state: '',
        company_address_postal_code: '',
        company_address_country: country || DEFAULT_COUNTRY,
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
        owner_address_city: '',
        owner_address_state: '',
        owner_address_postal_code: '',
        owner_address_country: country || DEFAULT_COUNTRY,
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

    const shouldShowDirectorsExecutives = useMemo(() => {
        return (
            (formData.business_type === 'company' || formData.business_type === 'non_profit') &&
            DIRECTOR_EXECUTIVE_COUNTRIES.includes(formData.company_address_country)
        );
    }, [formData.business_type, formData.company_address_country]);

    const requiresSiren =
        formData.company_address_country === 'FR' &&
        (formData.business_type === 'company' ||
            formData.business_type === 'non_profit' ||
            formData.business_type === 'government_entity');

    const externalAccountCountryCode = (formData.external_account_country || '').toUpperCase();
    const isIbanCountry = IBAN_COUNTRIES.includes(externalAccountCountryCode);

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

    // Update default company_structure when business_type changes to non_profit or government_entity
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
            formData.business_type === 'government_entity' &&
            ![
                'governmental_unit',
                'government_instrumentality',
                'tax_exempt_government_instrumentality',
            ].includes(formData.company_structure)
        ) {
            setFormData(prev => ({
                ...prev,
                company_structure: 'governmental_unit',
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
        { code: 'GR', name: 'Greece' },
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
            const next = {
                ...prev,
                [field]: value,
            };

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

            // Normalize IBAN for IBAN countries (SE, FR, CY, GR): strip spaces and uppercase
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
            // For IBAN countries, require IBAN confirmation match
            if (isIbanCountry) {
                const iban = (formData.external_account_account_number || '')
                    .replace(/\s+/g, '')
                    .toUpperCase();
                const ibanConfirm = (formData.external_account_account_number_confirm || '')
                    .replace(/\s+/g, '')
                    .toUpperCase();
                if (iban !== ibanConfirm) {
                    const accountCountryName =
                        countries.find(c => c.code === formData.external_account_country)?.name ||
                        formData.external_account_country;
                    setLoading(false);
                    setError(
                        `IBAN and Confirm IBAN must match for accounts in ${accountCountryName}.`
                    );
                    return;
                }
            }

            // Validate director requirement for Greece
            if (shouldShowDirectorsExecutives) {
                if (!hasAtLeastOneDirectorPerson) {
                    setLoading(false);
                    setError(
                        'Provide a valid business director to avoid disruptions to capabilities. At least one person must be marked as Director (either the representative, owner, or an additional director).'
                    );
                    return;
                }
                if (!formData.company_directors_provided) {
                    setLoading(false);
                    setError(
                        'Provide a valid business director to avoid disruptions to capabilities. Please confirm that all directors have been provided by checking the "All directors provided" checkbox.'
                    );
                    return;
                }
            }

            // Validate business representative for company, non-profit, and government_entity business types
            if (
                formData.business_type === 'company' ||
                formData.business_type === 'non_profit' ||
                formData.business_type === 'government_entity'
            ) {
                const missingFields: string[] = [];

                if (!formData.representative_first_name?.trim()) {
                    missingFields.push('first name');
                }
                if (!formData.representative_last_name?.trim()) {
                    missingFields.push('last name');
                }
                if (!formData.representative_email?.trim()) {
                    missingFields.push('email');
                }
                if (!formData.representative_phone?.trim()) {
                    missingFields.push('phone');
                }
                if (!formData.representative_address_line1?.trim()) {
                    missingFields.push('address line 1');
                }
                if (!formData.representative_address_city?.trim()) {
                    missingFields.push('city');
                }
                if (!formData.representative_address_postal_code?.trim()) {
                    missingFields.push('postal code');
                }
                if (!formData.representative_address_country?.trim()) {
                    missingFields.push('country');
                }
                if (!formData.representative_relationship_representative) {
                    missingFields.push('representative relationship');
                }

                if (missingFields.length > 0) {
                    setLoading(false);
                    setError(
                        `We couldn't confirm your business representative. Review and update this information to continue using Stripe. Missing fields: ${missingFields.join(', ')}.`
                    );
                    return;
                }
            }

            // Prepare payload with appropriate SSN fields based on toggle state
            const payload: any = { ...formData };
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

            // Handle representative SSN (for all business types in Greece - individual, company, non-profit, and government_entity)
            if (
                formData.business_type === 'individual' ||
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

                // Handle owner SSN (for company, non-profit, and government_entity business type - not for individual)
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
                        individual_address_country: country || DEFAULT_COUNTRY,
                        individual_ssn_last_4: '',
                        individual_id_number: '',
                        business_type: businessType || 'individual',
                        business_profile_mcc: '',
                        business_profile_url: '',
                        business_description: '',
                        product_description: '',
                        // Company fields
                        company_name: '',
                        company_tax_id: '',
                        company_structure: 'private_corporation',
                        company_address_line1: '',
                        company_address_line2: '',
                        company_address_city: '',
                        company_address_state: '',
                        company_address_postal_code: '',
                        company_address_country: country || DEFAULT_COUNTRY,
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
                        owner_address_city: '',
                        owner_address_state: '',
                        owner_address_postal_code: '',
                        owner_address_country: country || DEFAULT_COUNTRY,
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
            individual_ssn_last_4: '',
            individual_id_number: '',
            business_type: businessType || 'individual',
            business_profile_mcc: '',
            business_profile_url: '',
            business_description: '',
            product_description: '',
            company_name: '',
            company_tax_id: '',
            company_structure: 'private_corporation',
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
            representative_email: '',
            representative_phone: '',
            representative_dob_day: 1,
            representative_dob_month: 1,
            representative_dob_year: 1990,
            representative_address_line1: '',
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
            owner_address_city: '',
            owner_address_state: '',
            owner_address_postal_code: '',
            owner_address_country: country || DEFAULT_COUNTRY,
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
                                                label="National ID Number"
                                                value={formData.individual_id_number}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'individual_id_number',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g., Greece ID card number"
                                                helperText="Provide full national ID number (Greece ID card number)"
                                            />
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

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label={requiresSiren ? 'SIREN (9 digits)' : 'Tax ID'}
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
                                                    : formData.business_type === 'government_entity'
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
                                                {companyStructures
                                                    .filter(structure => {
                                                        // Filter structures based on business type
                                                        if (
                                                            formData.business_type === 'non_profit'
                                                        ) {
                                                            return [
                                                                'unincorporated_non_profit',
                                                                'incorporated_non_profit',
                                                            ].includes(structure.value);
                                                        } else if (
                                                            formData.business_type ===
                                                            'government_entity'
                                                        ) {
                                                            return [
                                                                'governmental_unit',
                                                                'government_instrumentality',
                                                                'tax_exempt_government_instrumentality',
                                                            ].includes(structure.value);
                                                        } else if (
                                                            formData.business_type === 'company'
                                                        ) {
                                                            // For Sweden company, restrict to supported structures
                                                            if (
                                                                formData.company_address_country ===
                                                                'SE'
                                                            ) {
                                                                const allowedSe = [
                                                                    'private_corporation',
                                                                    'public_corporation',
                                                                    'private_partnership',
                                                                    'public_partnership',
                                                                ];
                                                                return allowedSe.includes(
                                                                    structure.value
                                                                );
                                                            }
                                                            // For other countries, exclude non-company-only structures
                                                            return ![
                                                                'governmental_unit',
                                                                'government_instrumentality',
                                                                'tax_exempt_government_instrumentality',
                                                                'unincorporated_non_profit',
                                                                'incorporated_non_profit',
                                                            ].includes(structure.value);
                                                        }
                                                        return true;
                                                    })
                                                    .map(structure => (
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

                                    {/* Company/Non-profit/Government Address */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                            {formData.business_type === 'non_profit'
                                                ? 'Non-profit Address'
                                                : formData.business_type === 'government_entity'
                                                  ? 'Government Entity Address'
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

                            {/* Representative Person Fields - Only show for company, non_profit, and government_entity (NOT for individual) */}
                            {(formData.business_type === 'company' ||
                                formData.business_type === 'non_profit' ||
                                formData.business_type === 'government_entity') && (
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

                                    {/* Representative relationship toggles for director/executive countries */}
                                    {DIRECTOR_EXECUTIVE_COUNTRIES.includes(
                                        formData.representative_address_country
                                    ) && (
                                        <Grid size={{ xs: 12 }}>
                                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
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

                                    {/* Owner Checkbox */}
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
                                                                    country || DEFAULT_COUNTRY,
                                                                owner_relationship_owner: true,
                                                                owner_relationship_director: false,
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
                                </>
                            )}

                            {/* Owner Person Fields - Only show when business type is Company, Non-Profit, or Government Entity and representative is NOT owner */}
                            {(formData.business_type === 'company' ||
                                formData.business_type === 'non_profit' ||
                                formData.business_type === 'government_entity') &&
                                !representativeIsOwner && (
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
                                                    handleInputChange(
                                                        'owner_last_name',
                                                        e.target.value
                                                    )
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
                                            {formData.owner_address_country === 'US' ? (
                                                <>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{ mb: 1 }}
                                                        >
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
                                                                    value={
                                                                        formData.owner_ssn_last_4
                                                                    }
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
                                                    {Array.from(
                                                        { length: 31 },
                                                        (_, i) => i + 1
                                                    ).map(day => (
                                                        <MenuItem key={day} value={day}>
                                                            {day}
                                                        </MenuItem>
                                                    ))}
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
                                                        <MenuItem
                                                            key={month.value}
                                                            value={month.value}
                                                        >
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
                                            <Typography
                                                variant="subtitle1"
                                                gutterBottom
                                                sx={{ mt: 2 }}
                                            >
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
                                                disabled={
                                                    uploadingFile === 'owner_additional_front'
                                                }
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

                                        {/* Routing number hidden for IBAN countries like SE */}
                                        {!isIbanCountry && (
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
                                        )}

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label={isIbanCountry ? 'IBAN' : 'Account Number'}
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
                                                        : '000123456789'
                                                }
                                                helperText={
                                                    isIbanCountry
                                                        ? 'IBAN (no routing number required)'
                                                        : 'Bank account number'
                                                }
                                            />
                                        </Grid>

                                        {isIbanCountry && (
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Confirm IBAN"
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
                                                    placeholder="Re-enter IBAN"
                                                    helperText="Re-enter IBAN to confirm"
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

export default GreeceForm;
