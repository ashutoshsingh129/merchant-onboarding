import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Alert,
    CircularProgress,
    Grid2 as Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { StyledContainer } from './MerchantOnboarding.styles';
import SuccessModal from './SuccessModal';
import DirectOnboardForm from '../DirectOnboardForm';
import { createStripeAccount } from '../../services/stripeApi';

interface MerchantFormData {
    type: string;
    country: string;
    email: string;
    business_type: string;
    capabilities: {
        card_payments: boolean;
        transfers: boolean;
    };
}

const MerchantOnboarding: React.FC = () => {
    const [formData, setFormData] = useState<MerchantFormData>({
        type: 'custom',
        country: 'US',
        email: '',
        business_type: 'individual',
        capabilities: {
            card_payments: true,
            transfers: true,
        },
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [createdAccount, setCreatedAccount] = useState<any>(null);
    const [showDirectOnboard, setShowDirectOnboard] = useState(false);

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

    const handleInputChange = (field: string, value: any) => {
        if (field.startsWith('capabilities.')) {
            const capabilityField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                capabilities: {
                    ...prev.capabilities,
                    [capabilityField]: value,
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await createStripeAccount(formData);

            if (response.success) {
                setCreatedAccount(response.account);
                setSuccessModalOpen(true);
            } else {
                setError('Failed to create merchant account');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while creating the account');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDirectOnboard = () => {
        setShowDirectOnboard(true);
    };

    const handleDirectOnboardSuccess = () => {
        // Clear the MerchantOnboarding form
        setFormData({
            type: 'custom',
            country: 'US',
            email: '',
            business_type: 'individual',
            capabilities: {
                card_payments: true,
                transfers: true,
            },
        });
        setCreatedAccount(null);
        setShowDirectOnboard(false);
    };

    return (
        <StyledContainer>
            <Typography variant="h4" gutterBottom>
                Merchant Onboarding
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Create a new Stripe account for merchant onboarding
            </Typography>

            <Card>
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Account Type</InputLabel>
                                    <Select
                                        value={formData.type}
                                        label="Account Type"
                                        onChange={e => handleInputChange('type', e.target.value)}
                                    >
                                        <MenuItem value="custom">Custom</MenuItem>
                                        <MenuItem value="express">Express</MenuItem>
                                        <MenuItem value="standard">Standard</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Country</InputLabel>
                                    <Select
                                        value={formData.country}
                                        label="Country"
                                        onChange={e => handleInputChange('country', e.target.value)}
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
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={e => handleInputChange('email', e.target.value)}
                                    required
                                    placeholder="merchant@example.com"
                                />
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

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="h6" gutterBottom>
                                    Capabilities
                                </Typography>
                                <Box>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formData.capabilities.card_payments}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'capabilities.card_payments',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label="Card Payments"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formData.capabilities.transfers}
                                                onChange={e =>
                                                    handleInputChange(
                                                        'capabilities.transfers',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label="Transfers"
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box
                            sx={{
                                mt: 3,
                                display: 'flex',
                                gap: 2,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                                disabled={loading || !formData.email}
                                size="large"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <SuccessModal
                open={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                account={createdAccount}
                onDirectOnboard={handleOpenDirectOnboard}
            />

            {showDirectOnboard && createdAccount?.id && (
                <DirectOnboardForm
                    accountId={createdAccount.id}
                    email={createdAccount.email || formData.email}
                    onClose={() => setShowDirectOnboard(false)}
                    onSuccess={handleDirectOnboardSuccess}
                />
            )}
        </StyledContainer>
    );
};

export default MerchantOnboarding;
