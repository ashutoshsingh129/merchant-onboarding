import { styled } from '@mui/material/styles';
import { Box, AppBar, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';

export const StyledRoot = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
}));

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : theme.palette.primary.main,
    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#ffffff',
    boxShadow:
        theme.palette.mode === 'dark'
            ? '0px 2px 4px rgba(0, 0, 0, 0.3)'
            : '0px 2px 4px rgba(0, 0, 0, 0.1)',
}));

export const StyledTitleContainer = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    '&:hover': {
        opacity: 0.8,
    },
    transition: 'opacity 0.2s ease-in-out',
}));

export const StyledTitle = styled(Typography)(() => ({
    fontWeight: 600,
    letterSpacing: '0.5px',
})) as typeof Typography;

export const StyledThemeToggle = styled(Box)(({ theme }) => ({
    marginLeft: theme.spacing(2),
}));

export const StyledContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
})) as typeof Container;
