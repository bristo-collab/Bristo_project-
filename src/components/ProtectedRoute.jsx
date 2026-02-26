import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based blocking
    if (adminOnly && user?.role !== 'admin') {
        // Redirection for normal users trying to access admin
        return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }

    if (!adminOnly && user?.role === 'admin') {
        // Block admins from customer-specific routes (Cart, Profile, etc.)
        // Ensure they are sent to their dashboard
        return <Navigate to="/admin-dashboard" replace />;
    }


    return children;
};

export default ProtectedRoute;
