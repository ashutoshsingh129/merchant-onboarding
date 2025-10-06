import React, { useEffect, useState } from 'react';
import {
    CardContent,
    Typography,
    TableBody,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    Box,
    Button,
    TablePagination,
    Tooltip,
    IconButton,
} from '@mui/material';
import {
    Refresh,
    CheckCircle,
    Cancel,
    Pending,
    Business,
    Person,
    Warning,
    Delete,
    Block,
} from '@mui/icons-material';
import { TableColumn, MerchantAccount } from '../../types';
import { useAppSelector, useAppDispatch } from '../../store';
import {
    fetchMerchantAccounts,
    clearError,
    deleteAccount,
    rejectAccount,
} from '../../store/slices/merchantAccountsSlice';
import ConfirmationModal from '../ConfirmationModal';
import NotificationModal, { NotificationType } from '../NotificationModal';
import {
    StyledContainer,
    StyledCard,
    StyledTableContainer,
    StyledTable,
    StyledTableCell,
    StyledTableHead,
} from './Dashboard.styles';

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { accounts, loading, error, pagination, deleteLoading, rejectLoading } = useAppSelector(
        state => state.merchantAccounts
    );
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Modal states
    const [confirmationModal, setConfirmationModal] = useState({
        open: false,
        type: 'delete' as 'delete' | 'reject',
        accountId: '',
        businessName: '',
    });
    const [notificationModal, setNotificationModal] = useState({
        open: false,
        type: 'success' as NotificationType,
        title: '',
        message: '',
        details: '',
    });

    // Fetch merchant accounts on component mount
    useEffect(() => {
        dispatch(fetchMerchantAccounts({ limit: rowsPerPage }));
    }, [dispatch, rowsPerPage]);

    // Handle refresh button click
    const handleRefresh = () => {
        dispatch(clearError());
        dispatch(fetchMerchantAccounts({ limit: rowsPerPage }));
    };

    // Handle error alert close
    const handleErrorClose = () => {
        dispatch(clearError());
    };

    // Handle page change
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
        const startingAfter = newPage > page ? accounts[accounts.length - 1]?.id : undefined;
        const endingBefore = newPage < page ? accounts[0]?.id : undefined;

        dispatch(
            fetchMerchantAccounts({
                limit: rowsPerPage,
                starting_after: startingAfter,
                ending_before: endingBefore,
            })
        );
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
        dispatch(fetchMerchantAccounts({ limit: newRowsPerPage }));
    };

    // Modal handlers
    const handleDeleteClick = (accountId: string, businessName: string) => {
        setConfirmationModal({
            open: true,
            type: 'delete',
            accountId,
            businessName,
        });
    };

    const handleRejectClick = (accountId: string, businessName: string) => {
        setConfirmationModal({
            open: true,
            type: 'reject',
            accountId,
            businessName,
        });
    };

    const handleConfirmationClose = () => {
        setConfirmationModal({
            open: false,
            type: 'delete',
            accountId: '',
            businessName: '',
        });
    };

    const handleConfirmationConfirm = async (reason?: string) => {
        try {
            if (confirmationModal.type === 'delete') {
                await dispatch(deleteAccount(confirmationModal.accountId)).unwrap();
                setNotificationModal({
                    open: true,
                    type: 'success',
                    title: 'Account Deleted',
                    message: 'The merchant account has been successfully deleted.',
                    details: '',
                });
            } else if (confirmationModal.type === 'reject' && reason) {
                await dispatch(
                    rejectAccount({
                        accountId: confirmationModal.accountId,
                        reason: reason as 'fraud' | 'terms_of_service' | 'other',
                    })
                ).unwrap();
                setNotificationModal({
                    open: true,
                    type: 'success',
                    title: 'Account Rejected',
                    message: 'The merchant account has been successfully rejected.',
                    details: `Reason: ${reason}`,
                });
            }
            handleConfirmationClose();
        } catch (error) {
            setNotificationModal({
                open: true,
                type: 'error',
                title: `${confirmationModal.type === 'delete' ? 'Delete' : 'Reject'} Failed`,
                message: error instanceof Error ? error.message : 'An unexpected error occurred.',
                details: '',
            });
            handleConfirmationClose();
        }
    };

    const handleNotificationClose = () => {
        setNotificationModal({
            open: false,
            type: 'success',
            title: '',
            message: '',
            details: '',
        });
    };

    const columns: TableColumn[] = [
        { id: 'id', label: 'Account ID', minWidth: 300 },
        { id: 'business_name', label: 'Business Name', minWidth: 200 },
        { id: 'email', label: 'Email', minWidth: 200 },
        { id: 'business_type', label: 'Business Type', minWidth: 120 },
        { id: 'country', label: 'Country', minWidth: 100 },
        { id: 'status', label: 'Status', minWidth: 120 },
        { id: 'capabilities', label: 'Capabilities', minWidth: 150 },
        { id: 'tos_acceptance', label: 'TOS Accepted', minWidth: 120 },
        { id: 'created', label: 'Created', minWidth: 120 },
        { id: 'actions', label: 'Actions', minWidth: 120 },
    ];

    const getBusinessTypeIcon = (businessType: string) => {
        return null;
    };

    const getBusinessTypeColor = (businessType: string) => {
        switch (businessType) {
            case 'company':
                return 'primary';
            case 'individual':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (account: MerchantAccount) => {
        return null;
    };

    const getStatusText = (account: MerchantAccount) => {
        if (account.charges_enabled && account.payouts_enabled) {
            return 'Active';
        } else {
            return 'Pending';
        }
    };

    const getStatusColor = (account: MerchantAccount) => {
        if (account.charges_enabled && account.payouts_enabled) {
            return 'success';
        } else {
            return 'warning';
        }
    };

    const getCapabilityStatus = (capability: string) => {
        switch (capability) {
            case 'active':
                return <CheckCircle color="success" fontSize="small" />;
            case 'inactive':
                return <Cancel color="error" fontSize="small" />;
            case 'pending':
                return <Pending color="warning" fontSize="small" />;
            default:
                return <Cancel color="error" fontSize="small" />;
        }
    };

    const getTosAcceptanceStatus = (account: MerchantAccount) => {
        if (account.tos_acceptance?.date) {
            return (
                <Tooltip
                    title={`Accepted on ${new Date(account.tos_acceptance.date * 1000).toLocaleDateString()}`}
                >
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <CheckCircle color="success" fontSize="small" />
                        <Typography variant="caption">Yes</Typography>
                    </Box>
                </Tooltip>
            );
        } else {
            return (
                <Tooltip title="Terms of Service not accepted">
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Warning color="warning" fontSize="small" />
                        <Typography variant="caption">No</Typography>
                    </Box>
                </Tooltip>
            );
        }
    };

    return (
        <StyledContainer>
            <Typography variant="h4" gutterBottom>
                Merchant Accounts Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Manage and monitor Stripe merchant accounts
            </Typography>

            <StyledCard>
                <CardContent>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        marginBottom={2}
                    >
                        <Typography variant="h6">
                            Merchant Accounts ({accounts.length} accounts)
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" onClose={handleErrorClose} sx={{ marginBottom: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            minHeight={200}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <StyledTableContainer component={Paper}>
                                <StyledTable stickyHeader aria-label="merchant accounts table">
                                    <StyledTableHead>
                                        <TableRow>
                                            {columns.map(column => (
                                                <StyledTableCell
                                                    key={column.id}
                                                    align={column.align || 'left'}
                                                    style={{
                                                        minWidth: column.minWidth,
                                                    }}
                                                >
                                                    {column.label}
                                                </StyledTableCell>
                                            ))}
                                        </TableRow>
                                    </StyledTableHead>
                                    <TableBody>
                                        {accounts.length === 0 ? (
                                            <TableRow>
                                                <StyledTableCell
                                                    colSpan={columns.length}
                                                    align="center"
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        No merchant accounts found
                                                    </Typography>
                                                </StyledTableCell>
                                            </TableRow>
                                        ) : (
                                            accounts.map(account => (
                                                <TableRow hover key={account.id}>
                                                    <StyledTableCell>
                                                        <Typography
                                                            variant="body2"
                                                            fontFamily="monospace"
                                                        >
                                                            {account.id}
                                                        </Typography>
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {account.business_profile?.name || 'N/A'}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {account.email || 'N/A'}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        <Box
                                                            display="flex"
                                                            alignItems="center"
                                                            gap={0.5}
                                                        >
                                                            {getBusinessTypeIcon(
                                                                account.business_type
                                                            )}
                                                            <Chip
                                                                label={account.business_type}
                                                                color={
                                                                    getBusinessTypeColor(
                                                                        account.business_type
                                                                    ) as any
                                                                }
                                                                size="small"
                                                            />
                                                        </Box>
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {account.country.toUpperCase()}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        <Box
                                                            display="flex"
                                                            alignItems="center"
                                                            gap={0.5}
                                                        >
                                                            {getStatusIcon(account)}
                                                            <Chip
                                                                label={getStatusText(account)}
                                                                color={
                                                                    getStatusColor(account) as any
                                                                }
                                                                size="small"
                                                            />
                                                        </Box>
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        <Box
                                                            display="flex"
                                                            flexDirection="column"
                                                            gap={0.5}
                                                        >
                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                gap={0.5}
                                                            >
                                                                {getCapabilityStatus(
                                                                    account.capabilities
                                                                        ?.card_payments ||
                                                                        'inactive'
                                                                )}
                                                                <Typography variant="caption">
                                                                    Cards
                                                                </Typography>
                                                            </Box>
                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                gap={0.5}
                                                            >
                                                                {getCapabilityStatus(
                                                                    account.capabilities
                                                                        ?.transfers || 'inactive'
                                                                )}
                                                                <Typography variant="caption">
                                                                    Transfers
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {getTosAcceptanceStatus(account)}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {new Date(
                                                            account.created * 1000
                                                        ).toLocaleDateString('en-GB')}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        <Box display="flex" gap={1}>
                                                            <Tooltip title="Delete Account">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() =>
                                                                        handleDeleteClick(
                                                                            account.id,
                                                                            account.business_profile
                                                                                ?.name || 'Unknown'
                                                                        )
                                                                    }
                                                                    disabled={deleteLoading}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Reject Account">
                                                                <IconButton
                                                                    size="small"
                                                                    color="warning"
                                                                    onClick={() =>
                                                                        handleRejectClick(
                                                                            account.id,
                                                                            account.business_profile
                                                                                ?.name || 'Unknown'
                                                                        )
                                                                    }
                                                                    disabled={rejectLoading}
                                                                >
                                                                    <Block fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </StyledTableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </StyledTable>
                            </StyledTableContainer>

                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={pagination.total_count || -1}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Rows per page:"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
                                }
                            />
                        </>
                    )}
                </CardContent>
            </StyledCard>

            {/* Confirmation Modal */}
            <ConfirmationModal
                open={confirmationModal.open}
                onClose={handleConfirmationClose}
                onConfirm={handleConfirmationConfirm}
                type={confirmationModal.type}
                accountId={confirmationModal.accountId}
                businessName={confirmationModal.businessName}
                loading={deleteLoading || rejectLoading}
            />

            {/* Notification Modal */}
            <NotificationModal
                open={notificationModal.open}
                onClose={handleNotificationClose}
                type={notificationModal.type}
                title={notificationModal.title}
                message={notificationModal.message}
                details={notificationModal.details}
                showDetails={!!notificationModal.details}
            />
        </StyledContainer>
    );
};

export default Dashboard;
