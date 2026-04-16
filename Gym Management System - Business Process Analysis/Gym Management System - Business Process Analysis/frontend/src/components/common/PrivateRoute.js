// src/components/common/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/auth/authContext';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = ({ component: Component, roles, ...rest }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, user, loading } = authContext;
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login and remember where user was trying to go
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check if user has required role
  if (roles && !roles.includes(user.role)) {
    // Redirect to dashboard if user doesn't have permission
    return <Navigate to="/dashboard" />;
  }

  return <Component {...rest} />;
};

export default PrivateRoute;