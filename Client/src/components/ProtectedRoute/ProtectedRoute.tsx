import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import ErrorPage from '../ErrorPage';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
    const location = useLocation();

    if (isLoading) {
        return (
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
        );
    }

    if (!isAuthenticated) {
        // Show unauthorized error page instead of redirecting
        return <ErrorPage type="unauthorized" />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
