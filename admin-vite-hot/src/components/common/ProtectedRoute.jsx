// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return <Loader fullScreen text="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;