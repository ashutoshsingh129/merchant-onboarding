import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
} from '@mui/material';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationModalProps {
    open: boolean;
    onClose: () => void;
    type: NotificationType;
    title: string;
    message: string;
    details?: string;
    loading?: boolean;
    showDetails?: boolean;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
    open,
    onClose,
    type,
    title,
    message,
    details,
    loading = false,
    showDetails = false,
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle color="success" />;
            case 'error':
                return <Error color="error" />;
            case 'warning':
                return <Warning color="warning" />;
            case 'info':
                return <Info color="info" />;
            default:
                return <Info color="info" />;
        }
    };

    const getAlertSeverity = () => {
        switch (type) {
            case 'success':
                return 'success';
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            default:
                return 'info';
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'success':
                return 'success';
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'info':
                return 'primary';
            default:
                return 'primary';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                    {loading ? <CircularProgress size={24} /> : getIcon()}
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Alert severity={getAlertSeverity() as any} sx={{ mb: 2 }}>
                    <Typography variant="body1">{message}</Typography>
                </Alert>

                {details && showDetails && (
                    <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Details:</strong>
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 1,
                                p: 2,
                                bgcolor: 'grey.50',
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                wordBreak: 'break-all',
                            }}
                        >
                            {details}
                        </Typography>
                    </Box>
                )}

                {loading && (
                    <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={1}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">
                            Processing...
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    color={getButtonColor() as any}
                    variant="contained"
                    fullWidth
                >
                    {loading ? 'Processing...' : 'OK'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NotificationModal;
