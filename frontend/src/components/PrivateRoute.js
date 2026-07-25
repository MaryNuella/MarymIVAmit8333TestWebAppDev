import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LinearProgress, Box } from '@mui/material';

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ width: '100%' }}>
                <LinearProgress />
            </Box>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
