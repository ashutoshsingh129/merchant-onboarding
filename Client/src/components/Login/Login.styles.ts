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
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    borderRadius: 16,
    backdropFilter: 'blur(10px)',
    background: 'rgba(255, 255, 255, 0.95)',
}));

export const StyledForm = styled('form')(({ theme }) => ({
    width: '100%',
}));
