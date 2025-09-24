import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Box,
    Alert,
    CircularProgress,
    Chip,
    TextField,
    InputAdornment,
    IconButton,
    Divider,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    ContentCopy as CopyIcon,
    Link as LinkIcon,
    PersonAdd as PersonAddIcon,
} from '@mui/icons-material';

interface CreateAccountLinkResponse {
    success: boolean;
    url?: string;
    expires_at?: number;
    error?: string;
    message?: string;
}

interface SuccessModalProps {
    open: boolean;
    onClose: () => void;
    account: any;
    onGenerateLink: () => Promise<CreateAccountLinkResponse | null>;
    onDirectOnboard: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    open,
    onClose,
    account,
    onGenerateLink,
    onDirectOnboard,
}) => {
    const [onboardingLink, setOnboardingLink] = useState<string>('');
    const [generatingLink, setGeneratingLink] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);

    const handleGenerateLink = async () => {
        setGeneratingLink(true);
        setLinkError(null);

        try {
            const response = await onGenerateLink();
            if (response && response.url) {
                setOnboardingLink(response.url);
            } else {
                setLinkError('No link received from server');
            }
        } catch (error: any) {
            setLinkError(error.message || 'Failed to generate onboarding link');
        } finally {
            setGeneratingLink(false);
        }
    };

    const handleCopyLink = async () => {
        if (onboardingLink) {
            try {
                await navigator.clipboard.writeText(onboardingLink);
                // You could show a snackbar here for better UX
                alert('Link copied to clipboard!');
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Failed to copy link:', error);
            }
        }
    };

    const getStatusColor = (status: boolean) => {
        return status ? 'success' : 'default';
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 },
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircleIcon color="success" fontSize="large" />
                    <Typography variant="h5" component="div">
                        Account Created Successfully!
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                {account && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Account Details
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Account ID
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontFamily: 'monospace',
                                    backgroundColor: 'grey.100',
                                    padding: 1,
                                    borderRadius: 1,
                                    wordBreak: 'break-all',
                                }}
                            >
                                {account.id}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Email
                            </Typography>
                            <Typography variant="body1">{account.email}</Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Country
                            </Typography>
                            <Chip label={account.country} size="small" />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Business Type
                            </Typography>
                            <Chip label={account.business_type} size="small" color="primary" />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Status
                            </Typography>
                            <Box display="flex" gap={1}>
                                <Chip
                                    label={`Charges: ${account.charges_enabled ? 'Enabled' : 'Disabled'}`}
                                    size="small"
                                    color={getStatusColor(account.charges_enabled) as any}
                                />
                                <Chip
                                    label={`Payouts: ${account.payouts_enabled ? 'Enabled' : 'Disabled'}`}
                                    size="small"
                                    color={getStatusColor(account.payouts_enabled) as any}
                                />
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" gutterBottom>
                            Generate Onboarding Link
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Generate a secure link for the merchant to complete their onboarding
                            process.
                        </Typography>

                        {onboardingLink && (
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Onboarding Link"
                                    value={onboardingLink}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleCopyLink}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    <CopyIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>
                        )}

                        {linkError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {linkError}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Button
                                variant="contained"
                                startIcon={
                                    generatingLink ? <CircularProgress size={20} /> : <LinkIcon />
                                }
                                onClick={handleGenerateLink}
                                disabled={generatingLink}
                                fullWidth
                                size="large"
                            >
                                {generatingLink ? 'Generating Link...' : 'Generate Onboarding Link'}
                            </Button>

                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<PersonAddIcon />}
                                onClick={onDirectOnboard}
                                fullWidth
                                size="large"
                            >
                                Onboard Merchant Directly
                            </Button>
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
                {onboardingLink && (
                    <Button onClick={handleCopyLink} variant="contained" startIcon={<CopyIcon />}>
                        Copy Link
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default SuccessModal;
