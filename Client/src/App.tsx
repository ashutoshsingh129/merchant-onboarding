import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector, useAppDispatch } from './store';
import { lightTheme, darkTheme } from './theme';
import { verifyToken } from './store/slices/authSlice';
import Layout from './components/Layout/Layout';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorPage from './components/ErrorPage';
import Dashboard from './components/Dashboard/Dashboard';
import MerchantOnboarding from './components/MerchantOnboarding/MerchantOnboarding';

const AppRoutes: React.FC = () => {
    const dispatch = useAppDispatch();
    const theme = useAppSelector(state => state.app.theme);
    const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
    const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

    useEffect(() => {
        // Check if user is authenticated on app load
        const token = localStorage.getItem('authToken');
        if (token && !isAuthenticated) {
            dispatch(verifyToken());
        }
    }, [dispatch, isAuthenticated]);

    if (isLoading) {
        return (
            <ThemeProvider theme={currentTheme}>
                <CssBaseline />
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                    }}
                >
                    <div>Loading...</div>
                </div>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={currentTheme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Routes>
                                        <Route
                                            path="/"
                                            element={<Navigate to="/dashboard" replace />}
                                        />
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route
                                            path="/merchant-onboarding"
                                            element={<MerchantOnboarding />}
                                        />
                                    </Routes>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/merchant-onboarding"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <MerchantOnboarding />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    {/* Catch-all route for 404 errors */}
                    <Route path="*" element={<ErrorPage type="not-found" />} />
                </Routes>
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
