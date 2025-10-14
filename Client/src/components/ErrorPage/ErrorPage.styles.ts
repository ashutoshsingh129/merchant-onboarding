import styled from '@mui/material/styles/styled';
import { Container, Card, Button } from '@mui/material';

export const StyledErrorContainer = styled(Container)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: theme.spacing(2),
}));

export const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 500,
    width: '100%',
    boxShadow: theme.shadows[8],
    borderRadius: 16,
}));

export const StyledButton = styled(Button)(({ theme }) => ({
    minWidth: 140,
    borderRadius: 8,
}));
