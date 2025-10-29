import { styled } from '@mui/material/styles';
import { Container, Card } from '@mui/material';

export const StyledLoginContainer = styled(Container)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
}));

export const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 400,
    width: '100%',
    boxShadow:
        theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.5)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
    borderRadius: 16,
    backdropFilter: 'blur(10px)',
    background:
        theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
}));

export const StyledForm = styled('form')(({ theme }) => ({
    width: '100%',
}));
