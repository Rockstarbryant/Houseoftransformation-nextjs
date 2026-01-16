import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  const { user, isLoading, getRoleName } = useAuthContext();

  console.log('[PROTECTED-ROUTE] Checking access...');
  console.log('[PROTECTED-ROUTE] User:', user);
  console.log('[PROTECTED-ROUTE] isLoading:', isLoading);
  console.log('[PROTECTED-ROUTE] Required role:', requiredRole);

  // While loading, show loading screen
  if (isLoading) {
    return (
      <div className="w-full h-dvh flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Loading...</h2>
          <p className="text-gray-600 mt-2">Verifying your access</p>
        </div>
      </div>
    );
  }

  // No user logged in
  if (!user) {
    console.log('[PROTECTED-ROUTE] No user - redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Check if user has required role
  const userRole = getRoleName();
  const hasRequiredRole = userRole === requiredRole || userRole === 'admin';

  console.log('[PROTECTED-ROUTE] User role:', userRole);
  console.log('[PROTECTED-ROUTE] Has required role:', hasRequiredRole);

  if (!hasRequiredRole) {
    console.log('[PROTECTED-ROUTE] Insufficient permissions - redirecting to home');
    return (
      <div className="w-full h-dvh flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="mb-4 text-6xl">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel. Your role is: <strong>{userRole || 'Unknown'}</strong>
          </p>
          <a 
            href="/" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role
  console.log('[PROTECTED-ROUTE] Access granted');
  return children;
};

export default ProtectedRoute;