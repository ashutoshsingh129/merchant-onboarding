import React, { useEffect } from 'react';
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
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { TableColumn } from '../../types';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchUsers, clearError } from '../../store/slices/usersSlice';
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
    const { users, loading, error } = useAppSelector(state => state.users);

    // Fetch users on component mount
    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    // Handle refresh button click
    const handleRefresh = () => {
        dispatch(clearError());
        dispatch(fetchUsers());
    };

    // Handle error alert close
    const handleErrorClose = () => {
        dispatch(clearError());
    };

    const columns: TableColumn[] = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'email', label: 'Email', minWidth: 200 },
        { id: 'role', label: 'Role', minWidth: 100 },
        { id: 'createdAt', label: 'Created At', minWidth: 120 },
    ];

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'error';
            case 'moderator':
                return 'warning';
            case 'user':
                return 'success';
            default:
                return 'default';
        }
    };

    return (
        <StyledContainer>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Welcome to your React Template Frontend Application
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
                            Users Table ({users.length} users)
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
                        <Alert
                            severity="error"
                            onClose={handleErrorClose}
                            sx={{ marginBottom: 2 }}
                        >
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
                        <StyledTableContainer component={Paper}>
                            <StyledTable stickyHeader aria-label="users table">
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
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <StyledTableCell
                                                colSpan={columns.length}
                                                align="center"
                                            >
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    No users found
                                                </Typography>
                                            </StyledTableCell>
                                        </TableRow>
                                    ) : (
                                        users.map(user => (
                                            <TableRow hover key={user.id}>
                                                <StyledTableCell>
                                                    {user.name}
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    {user.email}
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    <Chip
                                                        label={user.role}
                                                        color={
                                                            getRoleColor(
                                                                user.role
                                                            ) as any
                                                        }
                                                        size="small"
                                                    />
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    {new Date(
                                                        user.createdAt
                                                    ).toLocaleDateString()}
                                                </StyledTableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </StyledTable>
                        </StyledTableContainer>
                    )}
                </CardContent>
            </StyledCard>
        </StyledContainer>
    );
};

export default Dashboard;
