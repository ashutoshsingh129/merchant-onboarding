import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';
import { Warning, Delete, Block } from '@mui/icons-material';

interface ConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason?: string) => void;
    type: 'delete' | 'reject';
    accountId: string;
    businessName: string;
    loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    open,
    onClose,
    onConfirm,
    type,
    accountId,
    businessName,
    loading = false,
}) => {
    const [reason, setReason] = React.useState<string>('');

    const isReject = type === 'reject';
    const title = isReject ? 'Reject Account' : 'Delete Account';
    const icon = isReject ? <Block color="warning" /> : <Delete color="error" />;
    const confirmText = isReject ? 'Reject' : 'Delete';
    const confirmColor = isReject ? 'warning' : 'error';

    const handleConfirm = () => {
        if (isReject && !reason) {
            return;
        }
        onConfirm(isReject ? reason : undefined);
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    {icon}
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box mb={2}>
                    <Alert severity={isReject ? 'warning' : 'error'} sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            {isReject
                                ? 'This action will reject the merchant account and mark it as rejected in Stripe.'
                                : 'This action will permanently delete the merchant account from Stripe. This cannot be undone.'}
                        </Typography>
                    </Alert>
                </Box>

                <Typography variant="body1" gutterBottom>
                    <strong>Account ID:</strong> {accountId}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>Business Name:</strong> {businessName || 'N/A'}
                </Typography>

                {isReject && (
                    <Box mt={3}>
                        <FormControl fullWidth required>
                            <InputLabel>Rejection Reason</InputLabel>
                            <Select
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                label="Rejection Reason"
                            >
                                <MenuItem value="fraud">Fraud</MenuItem>
                                <MenuItem value="terms_of_service">Terms of Service</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                )}

                <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                        {isReject
                            ? 'Please select a reason for rejecting this account. The merchant will be notified of the rejection.'
                            : 'Please confirm that you want to permanently delete this merchant account. All associated data will be lost.'}
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button onClick={handleClose} disabled={loading} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    color={confirmColor as any}
                    variant="contained"
                    disabled={loading || (isReject && !reason)}
                    startIcon={isReject ? <Block /> : <Delete />}
                >
                    {loading ? 'Processing...' : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationModal;
