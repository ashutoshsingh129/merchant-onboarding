import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { StyledLoginContainer, StyledCard, StyledForm } from './Login.styles';

const Login: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const [validationErrors, setValidationErrors] = useState({
        email: '',
        password: '',
    });

    // Don't automatically clear errors on mount - this causes errors to disappear immediately
    // useEffect(() => {
    //     dispatch(clearError());
    // }, [dispatch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Clear validation error for this field
        if (validationErrors[name as keyof typeof validationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const errors = {
            email: '',
            password: '',
        };

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password.trim()) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setValidationErrors(errors);
        return !errors.email && !errors.password;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await dispatch(loginUser(formData)).unwrap();
        } catch (error) {
            // Error is handled by the auth slice and will be displayed in the UI
            console.error('Login failed:', error);
        }
    };

    return (
        <StyledLoginContainer>
            <Container maxWidth="sm">
                <StyledCard>
                    <CardContent>
                        <Box textAlign="center" mb={3}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Merchant Onboarding
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Sign in to your account
                            </Typography>
                        </Box>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{ mb: 2 }}
                                onClose={() => dispatch(clearError())}
                            >
                                {error}
                            </Alert>
                        )}

                        <StyledForm onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                error={!!validationErrors.email}
                                helperText={validationErrors.email}
                                disabled={isLoading}
                                margin="normal"
                                autoComplete="email"
                                autoFocus
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                error={!!validationErrors.password}
                                helperText={validationErrors.password}
                                disabled={isLoading}
                                margin="normal"
                                autoComplete="current-password"
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isLoading}
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </StyledForm>
                    </CardContent>
                </StyledCard>
            </Container>
        </StyledLoginContainer>
    );
};

export default Login;
