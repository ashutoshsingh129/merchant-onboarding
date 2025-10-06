import React from 'react';
import { Toolbar, Switch, FormControlLabel, Button, Box } from '@mui/material';
import { Brightness4, Brightness7, Dashboard, Business } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { setTheme } from '../../store/slices/appSlice';
import {
    StyledRoot,
    StyledAppBar,
    StyledTitle,
    StyledThemeToggle,
    StyledContainer,
} from './Layout.styles';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const dispatch = useAppDispatch();
    const theme = useAppSelector(state => state.app.theme);
    const location = useLocation();

    const handleThemeChange = () => {
        dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
    };

    return (
        <StyledRoot>
            <StyledAppBar position="static">
                <Toolbar>
                    <StyledTitle variant="h6" component="div">
                        Merchant Onboarding
                    </StyledTitle>

                    <Box
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Button
                            component={Link}
                            to="/dashboard"
                            startIcon={<Dashboard />}
                            color="inherit"
                            sx={{
                                mx: 1,
                                backgroundColor:
                                    location.pathname === '/dashboard'
                                        ? 'rgba(255,255,255,0.1)'
                                        : 'transparent',
                            }}
                        >
                            Dashboard
                        </Button>
                        <Button
                            component={Link}
                            to="/merchant-onboarding"
                            state={{ newForm: true }}
                            startIcon={<Business />}
                            color="inherit"
                            sx={{
                                mx: 1,
                                backgroundColor:
                                    location.pathname === '/merchant-onboarding'
                                        ? 'rgba(255,255,255,0.1)'
                                        : 'transparent',
                            }}
                        >
                            Merchant Onboarding
                        </Button>
                    </Box>

                    <StyledThemeToggle>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={theme === 'dark'}
                                    onChange={handleThemeChange}
                                    icon={<Brightness7 />}
                                    checkedIcon={<Brightness4 />}
                                />
                            }
                            label=""
                        />
                    </StyledThemeToggle>
                </Toolbar>
            </StyledAppBar>
            <StyledContainer maxWidth="lg">{children}</StyledContainer>
        </StyledRoot>
    );
};

export default Layout;
