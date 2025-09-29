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
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { directOnboardMerchant } from '../../services/stripeApi';

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
    business_type: string;
    business_profile_mcc: string;
    business_profile_url: string;
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
    external_account_object: string;
    external_account_country: string;
    external_account_currency: string;
    external_account_account_number: string;
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
        business_type: businessType || 'individual',
        business_profile_mcc: '5734',
        business_profile_url: '',
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
        external_account_object: 'bank_account',
        external_account_country: country || 'US',
        external_account_currency: 'usd',
        external_account_account_number: '',
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
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await directOnboardMerchant(formData);

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
                        business_type: businessType || 'individual',
                        business_profile_mcc: '5734',
                        business_profile_url: '',
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
                        external_account_object: 'bank_account',
                        external_account_country: country || 'US',
                        external_account_currency: 'usd',
                        external_account_account_number: '',
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
                    });
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

    return (
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

                        {/* Personal Information - Only show when business type is Individual */}
                        {formData.business_type === 'individual' && (
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
                        )}

                        {/* Individual Fields - Only show when business type is Individual */}
                        {formData.business_type === 'individual' && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    value={formData.individual_first_name}
                                    onChange={e =>
                                        handleInputChange('individual_first_name', e.target.value)
                                    }
                                    placeholder="First Name"
                                    required
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
                                        handleInputChange('individual_last_name', e.target.value)
                                    }
                                    placeholder="Last Name"
                                    required
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
                                    required
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
                                            handleInputChange('individual_dob_day', e.target.value)
                                        }
                                    >
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                            <MenuItem key={day} value={day}>
                                                {day}
                                            </MenuItem>
                                        ))}
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
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Address
                                </Typography>
                            </Grid>
                        )}

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Address Line 1"
                                value={formData.individual_address_line1}
                                onChange={e =>
                                    handleInputChange('individual_address_line1', e.target.value)
                                }
                                placeholder="123 Main Street"
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Address Line 2"
                                value={formData.individual_address_line2}
                                onChange={e =>
                                    handleInputChange('individual_address_line2', e.target.value)
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
                                    handleInputChange('individual_address_city', e.target.value)
                                }
                                placeholder="New York"
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="State"
                                value={formData.individual_address_state}
                                onChange={e =>
                                    handleInputChange('individual_address_state', e.target.value)
                                }
                                placeholder="NY"
                                helperText="State, county, province, or region"
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
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
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
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
                                        <MenuItem key={country.code} value={country.code}>
                                            {country.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Business Information */}
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
                                        handleInputChange('business_type', e.target.value)
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
                                    handleInputChange('business_profile_mcc', e.target.value)
                                }
                                placeholder="5734"
                                helperText="4-digit merchant category code"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Business URL"
                                value={formData.business_profile_url}
                                onChange={e =>
                                    handleInputChange('business_profile_url', e.target.value)
                                }
                                placeholder="https://example-merchant.com"
                                required
                            />
                        </Grid>

                        {/* Company Information - Only show when business type is Company */}
                        {formData.business_type === 'company' && (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{ mt: 2, color: 'green' }}
                                    >
                                        ✅ Company Information (VISIBLE)
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 2, color: 'blue' }}
                                    >
                                        DEBUG: Business type is: {formData.business_type} - Company
                                        fields should be visible
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Company Name"
                                        value={formData.company_name}
                                        onChange={e =>
                                            handleInputChange('company_name', e.target.value)
                                        }
                                        placeholder="ABC Technologies LLC"
                                        required
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
                                        required
                                        helperText="EIN or Tax Identification Number"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Company Structure</InputLabel>
                                        <Select
                                            value={formData.company_structure}
                                            label="Company Structure"
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

                                {/* Company Address */}
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                        Company Address
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
                                        required
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
                                        required
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
                                        required
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
                                        required
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
                                                <MenuItem key={country.code} value={country.code}>
                                                    {country.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
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
                                placeholder="203.0.113.1"
                                helperText="IP address of the user accepting ToS"
                            />
                        </Grid>

                        {/* Representative Person Fields - Only show when business type is Company */}
                        {formData.business_type === 'company' && (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{ mt: 2, color: 'green' }}
                                    >
                                        ✅ Representative Person Information (VISIBLE)
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 2, color: 'blue' }}
                                    >
                                        DEBUG: Business type is: {formData.business_type} -
                                        Representative fields should be visible
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
                                        required
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
                                        required
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
                                        required
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
                                        required
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
                                        required
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="SSN Last 4 Digits"
                                        value={formData.representative_ssn_last_4}
                                        onChange={e =>
                                            handleInputChange(
                                                'representative_ssn_last_4',
                                                e.target.value
                                            )
                                        }
                                        placeholder="1234"
                                        required
                                        inputProps={{ maxLength: 4 }}
                                        helperText="Last 4 digits of Social Security Number (US only)"
                                    />
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
                                        required
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
                                        required
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
                                        required
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
                                        required
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
                                                <MenuItem key={country.code} value={country.code}>
                                                    {country.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Representative Role */}
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Representative Role
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={
                                                    formData.representative_relationship_representative
                                                }
                                                onChange={e =>
                                                    handleInputChange(
                                                        'representative_relationship_representative',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label="Is this person a company representative?"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={
                                                    formData.representative_relationship_executive
                                                }
                                                onChange={e =>
                                                    handleInputChange(
                                                        'representative_relationship_executive',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label="Is this person an owner/executive with significant control?"
                                    />
                                </Grid>
                            </>
                        )}

                        {/* External Account */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Bank Account Information
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Account Type</InputLabel>
                                <Select
                                    value={formData.external_account_object}
                                    label="Account Type"
                                    onChange={e =>
                                        handleInputChange('external_account_object', e.target.value)
                                    }
                                >
                                    <MenuItem value="bank_account">Bank Account</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

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
                                        <MenuItem key={country.code} value={country.code}>
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
                                        <MenuItem key={currency.code} value={currency.code}>
                                            {currency.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
                                placeholder="1234567890"
                                helperText="IBAN or account number"
                            />
                        </Grid>
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
                    onClick={handleSubmit}
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                    disabled={
                        loading ||
                        !formData.account_id ||
                        !formData.business_profile_url ||
                        (formData.business_type === 'individual' &&
                            (!formData.individual_first_name ||
                                !formData.individual_last_name ||
                                !formData.individual_email ||
                                !formData.individual_phone ||
                                !formData.individual_address_line1 ||
                                !formData.individual_address_city ||
                                !formData.individual_address_state ||
                                !formData.individual_address_postal_code)) ||
                        (formData.business_type === 'company' &&
                            (!formData.company_name ||
                                !formData.company_tax_id ||
                                !formData.company_address_line1 ||
                                !formData.company_address_city ||
                                !formData.company_address_state ||
                                !formData.company_address_postal_code ||
                                !formData.representative_first_name ||
                                !formData.representative_last_name ||
                                !formData.representative_email ||
                                !formData.representative_phone ||
                                !formData.representative_relationship_title ||
                                !formData.representative_ssn_last_4 ||
                                !formData.representative_address_line1 ||
                                !formData.representative_address_city ||
                                !formData.representative_address_state ||
                                !formData.representative_address_postal_code))
                    }
                    size="large"
                >
                    {loading ? 'Onboarding...' : 'Onboard Merchant'}
                </Button>
            </CardActions>
        </Card>
    );
};

export default DirectOnboardForm;
