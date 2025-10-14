import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, Container } from '@mui/material';
import { Login, Home, Error as ErrorIcon } from '@mui/icons-material';
import { StyledErrorContainer, StyledCard, StyledButton } from './ErrorPage.styles';

interface ErrorPageProps {
    type?: 'not-found' | 'unauthorized' | 'server-error';
    message?: string;
    showLoginButton?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
    type = 'not-found',
    message,
    showLoginButton = true,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const getErrorContent = () => {
        switch (type) {
            case 'not-found':
                return {
                    icon: <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />,
                    title: 'Page Not Found',
                    description: message || 'The page you are looking for does not exist.',
                    primaryButton: {
                        text: 'Go to Dashboard',
                        action: () => navigate('/dashboard'),
                        icon: <Home />,
                    },
                    secondaryButton: showLoginButton
                        ? {
                              text: 'Login',
                              action: () => navigate('/login'),
                              icon: <Login />,
                          }
                        : null,
                };
            case 'unauthorized':
                return {
                    icon: <Login sx={{ fontSize: 80, color: 'warning.main' }} />,
                    title: 'Authentication Required',
                    description: message || 'Please login to access this page.',
                    primaryButton: {
                        text: 'Login',
                        action: () => navigate('/login'),
                        icon: <Login />,
                    },
                    secondaryButton: null,
                };
            case 'server-error':
                return {
                    icon: <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />,
                    title: 'Server Error',
                    description: message || 'Something went wrong. Please try again later.',
                    primaryButton: {
                        text: 'Login',
                        action: () => navigate('/login'),
                        icon: <Login />,
                    },
                    secondaryButton: null,
                };
            default:
                return {
                    icon: <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />,
                    title: 'Error',
                    description: message || 'An unexpected error occurred.',
                    primaryButton: {
                        text: 'Login',
                        action: () => navigate('/login'),
                        icon: <Login />,
                    },
                    secondaryButton: null,
                };
        }
    };

    const content = getErrorContent();

    return (
        <StyledErrorContainer>
            <Container maxWidth="sm">
                <StyledCard>
                    <CardContent>
                        <Box textAlign="center" mb={3}>
                            {content.icon}
                        </Box>

                        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                            {content.title}
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            textAlign="center"
                            mb={4}
                        >
                            {content.description}
                        </Typography>

                        {location.pathname && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                textAlign="center"
                                mb={3}
                            >
                                Requested path: <code>{location.pathname}</code>
                            </Typography>
                        )}

                        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                            <StyledButton
                                variant="contained"
                                startIcon={content.primaryButton.icon}
                                onClick={content.primaryButton.action}
                            >
                                {content.primaryButton.text}
                            </StyledButton>

                            {content.secondaryButton && (
                                <StyledButton
                                    variant="outlined"
                                    startIcon={content.secondaryButton.icon}
                                    onClick={content.secondaryButton.action}
                                >
                                    {content.secondaryButton.text}
                                </StyledButton>
                            )}
                        </Box>
                    </CardContent>
                </StyledCard>
            </Container>
        </StyledErrorContainer>
    );
};

export default ErrorPage;
