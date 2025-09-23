import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './store';
import { lightTheme, darkTheme } from './theme';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';

const AppRoutes: React.FC = () => {
    const theme = useAppSelector(state => state.app.theme);
    const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

    return (
        <ThemeProvider theme={currentTheme}>
            <CssBaseline />
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </Layout>
            </Router>
        </ThemeProvider>
    );
};

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <AppRoutes />
        </Provider>
    );
};

export default App;
