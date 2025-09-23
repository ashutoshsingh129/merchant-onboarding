import React from 'react';
import { Toolbar, Switch, FormControlLabel } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
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

    const handleThemeChange = () => {
        dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
    };

    return (
        <StyledRoot>
            <StyledAppBar position="static">
                <Toolbar>
                    <StyledTitle variant="h6" component="div">
                        React Template FE
                    </StyledTitle>
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
