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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
    individual_address_city: string;
    individual_address_postal_code: string;
    individual_address_country: string;
    business_type: string;
    business_profile_mcc: string;
    business_profile_url: string;
    external_account_object: string;
    external_account_country: string;
    external_account_currency: string;
    external_account_account_number: string;
}

interface DirectOnboardFormProps {
    open: boolean;
    onClose: () => void;
    accountId: string;
}

const DirectOnboardForm: React.FC<DirectOnboardFormProps> = ({ open, onClose, accountId }) => {
    const [formData, setFormData] = useState<DirectOnboardFormData>({
        account_id: accountId,
        individual_first_name: '',
        individual_last_name: '',
        individual_email: '',
        individual_phone: '',
        individual_dob_day: 1,
        individual_dob_month: 1,
        individual_dob_year: 1990,
        individual_address_line1: '',
        individual_address_city: '',
        individual_address_postal_code: '',
        individual_address_country: 'NL',
        business_type: 'individual',
        business_profile_mcc: '5734',
        business_profile_url: '',
        external_account_object: 'bank_account',
        external_account_country: 'NL',
        external_account_currency: 'eur',
        external_account_account_number: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Update account_id when accountId prop changes
    useEffect(() => {
        if (accountId) {
            setFormData(prev => ({
                ...prev,
                account_id: accountId,
            }));
        }
    }, [accountId]);

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
                    onClose();
                    setSuccess(false);
                    // Reset form but preserve account_id
                    setFormData(prev => ({
                        ...prev,
                        individual_first_name: '',
                        individual_last_name: '',
                        individual_email: '',
                        individual_phone: '',
                        individual_dob_day: 1,
                        individual_dob_month: 1,
                        individual_dob_year: 1990,
                        individual_address_line1: '',
                        individual_address_city: '',
                        individual_address_postal_code: '',
                        individual_address_country: 'NL',
                        business_type: 'individual',
                        business_profile_mcc: '5734',
                        business_profile_url: '',
                        external_account_object: 'bank_account',
                        external_account_country: 'NL',
                        external_account_currency: 'eur',
                        external_account_account_number: '',
                    }));
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
        if (!loading) {
            onClose();
            setError(null);
            setSuccess(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { minHeight: '80vh' },
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <PersonAddIcon />
                    <Typography variant="h6">Direct Merchant Onboarding</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        {/* Account ID */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Account ID"
                                value={formData.account_id}
                                onChange={e => handleInputChange('account_id', e.target.value)}
                                required
                                placeholder="acct_1SAA85KHetaYuagI"
                                helperText={
                                    accountId
                                        ? 'Account ID from created account'
                                        : 'Enter the Stripe account ID to onboard'
                                }
                                InputProps={{
                                    readOnly: !!accountId,
                                }}
                                sx={{
                                    '& .MuiInputBase-input.Mui-readOnly': {
                                        backgroundColor: 'grey.100',
                                    },
                                }}
                            />
                        </Grid>

                        {/* Personal Information */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom>
                                Personal Information
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="First Name"
                                value={formData.individual_first_name}
                                onChange={e =>
                                    handleInputChange('individual_first_name', e.target.value)
                                }
                                required
                                placeholder="Ghanshyam"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                value={formData.individual_last_name}
                                onChange={e =>
                                    handleInputChange('individual_last_name', e.target.value)
                                }
                                required
                                placeholder="Mali"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.individual_email}
                                onChange={e =>
                                    handleInputChange('individual_email', e.target.value)
                                }
                                required
                                placeholder="merchant@example.com"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Phone"
                                value={formData.individual_phone}
                                onChange={e =>
                                    handleInputChange('individual_phone', e.target.value)
                                }
                                required
                                placeholder="+31612345678"
                            />
                        </Grid>

                        {/* Date of Birth */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Date of Birth
                            </Typography>
                        </Grid>

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

                        <Grid size={{ xs: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Month</InputLabel>
                                <Select
                                    value={formData.individual_dob_month}
                                    label="Month"
                                    onChange={e =>
                                        handleInputChange('individual_dob_month', e.target.value)
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
                                value={formData.individual_dob_year}
                                onChange={e =>
                                    handleInputChange(
                                        'individual_dob_year',
                                        parseInt(e.target.value)
                                    )
                                }
                                required
                                inputProps={{
                                    min: 1900,
                                    max: new Date().getFullYear(),
                                }}
                            />
                        </Grid>

                        {/* Address */}
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
                                    handleInputChange('individual_address_line1', e.target.value)
                                }
                                required
                                placeholder="San Fransis Road"
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
                                required
                                placeholder="Helmond"
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
                                required
                                placeholder="5708EA"
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
                                required
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
                            />
                        </Grid>

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
                                required
                                placeholder="NL91ABNA0417164300"
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
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose} disabled={loading} size="large">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                    disabled={
                        loading ||
                        !formData.account_id ||
                        !formData.individual_first_name ||
                        !formData.individual_last_name ||
                        !formData.individual_email
                    }
                    size="large"
                >
                    {loading ? 'Onboarding...' : 'Onboard Merchant'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DirectOnboardForm;
