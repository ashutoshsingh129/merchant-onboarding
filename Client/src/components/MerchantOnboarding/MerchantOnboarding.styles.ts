import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const StyledContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    maxWidth: 1200,
    margin: '0 auto',
    minHeight: '100vh',
}));
