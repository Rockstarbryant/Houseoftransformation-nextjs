import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  const { user, isLoading, getRoleName } = useAuthContext();

  console.log('[PROTECTED-ROUTE] Checking access...');
  console.log('[PROTECTED-ROUTE] User:', user ? `${user.email} (${user.name})` : 'null');
  console.log('[PROTECTED-ROUTE] User object:', user);
  console.log('[PROTECTED-ROUTE] isLoading:', isLoading);
  console.log('[PROTECTED-ROUTE] Required role:', requiredRole);

  // CRITICAL: While loading OR if user is undefined, show loading screen
  if (isLoading || user === undefined) {
    console.log('[PROTECTED-ROUTE] Still loading authentication...');
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

  // No user logged in (explicitly null, not undefined)
  if (user === null) {
    console.log('[PROTECTED-ROUTE] No user - redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Get user role safely
  const userRole = getRoleName();
  console.log('[PROTECTED-ROUTE] User role from getRoleName():', userRole);
  console.log('[PROTECTED-ROUTE] User.role raw:', user?.role);

  // If we still don't have a role, something is wrong
  if (!userRole) {
    console.error('[PROTECTED-ROUTE] ERROR: User exists but no role found!');
    console.error('[PROTECTED-ROUTE] User object:', JSON.stringify(user, null, 2));
    return (
      <div className="w-full h-dvh flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Role Not Found</h2>
          <p className="text-gray-600 mb-6">
            Your account doesn't have a role assigned. Please contact an administrator.
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

  // Check if user has required role (admin can access everything)
  const hasRequiredRole = userRole === requiredRole || userRole === 'admin';

  console.log('[PROTECTED-ROUTE] Has required role:', hasRequiredRole);
  console.log('[PROTECTED-ROUTE] Comparison:', `"${userRole}" === "${requiredRole}"`, userRole === requiredRole);

  if (!hasRequiredRole) {
    console.log('[PROTECTED-ROUTE] Insufficient permissions - showing access denied');
    return (
      <div className="w-full h-dvh flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="mb-4 text-6xl">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel. 
            <br />
            Your role: <strong className="text-blue-600">{userRole}</strong>
            <br />
            Required: <strong className="text-red-600">{requiredRole}</strong>
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
  console.log('[PROTECTED-ROUTE] ✅ Access granted! Rendering children...');
  return children;
};

export default ProtectedRoute;