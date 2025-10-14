import React, { useState } from 'react';
import {
    Toolbar,
    Switch,
    FormControlLabel,
    Button,
    Box,
    Menu,
    MenuItem,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
} from '@mui/material';
import {
    Brightness4,
    Brightness7,
    Dashboard,
    Business,
    AccountCircle,
    Logout,
    Settings,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { setTheme } from '../../store/slices/appSlice';
import { logoutUser, clearKeys } from '../../store/slices/authSlice';
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
    const { user, isLoading } = useAppSelector(state => state.auth);
    const location = useLocation();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [clearKeysDialogOpen, setClearKeysDialogOpen] = useState(false);

    const handleThemeChange = () => {
        dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            handleMenuClose();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleClearKeys = async () => {
        try {
            await dispatch(clearKeys()).unwrap();
            setClearKeysDialogOpen(false);
            handleMenuClose();
        } catch (error) {
            console.error('Clear keys failed:', error);
        }
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

                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenuOpen}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem disabled>
                            <Typography variant="body2">{user?.email}</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => setClearKeysDialogOpen(true)}>
                            <Settings sx={{ mr: 1 }} />
                            Clear Configured Keys
                        </MenuItem>
                        <MenuItem onClick={handleLogout} disabled={isLoading}>
                            <Logout sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </StyledAppBar>
            <StyledContainer maxWidth="lg">{children}</StyledContainer>

            {/* Clear Keys Confirmation Dialog */}
            <Dialog
                open={clearKeysDialogOpen}
                onClose={() => setClearKeysDialogOpen(false)}
                aria-labelledby="clear-keys-dialog-title"
            >
                <DialogTitle id="clear-keys-dialog-title">Clear Configured Keys</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to clear all configured Stripe keys? This action
                        cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearKeysDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleClearKeys}
                        color="error"
                        variant="contained"
                        disabled={isLoading}
                    >
                        Clear Keys
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledRoot>
    );
};

export default Layout;
