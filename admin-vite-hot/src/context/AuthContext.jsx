import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { tokenService } from '../services/tokenService';
import api from '../services/api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Normalize user data - convert role to consistent object format
   * Handles: string roles ('admin'), object roles ({_id, name, permissions}), etc.
   */
  const normalizeUser = (userData) => {
    if (!userData) return null;

    let role = null;

    // Extract role information
    if (userData.role) {
      if (typeof userData.role === 'string') {
        // Old format: role is just a string
        role = {
          name: userData.role,
          permissions: []
        };
      } else if (typeof userData.role === 'object') {
        // New format: role is an object
        role = {
          id: userData.role._id || userData.role.id,
          name: userData.role.name || 'member',
          permissions: Array.isArray(userData.role.permissions) 
            ? userData.role.permissions 
            : []
        };
      }
    }

    return {
      id: userData.id || userData._id,
      _id: userData._id || userData.id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar || null,
      role: role || { name: 'member', permissions: [] }
    };
  };

  const checkAuth = async () => {
    try {
      console.log('[AUTH-CONTEXT] Checking authentication...');
      
      const token = tokenService.getToken();
      
      if (token) {
        console.log('[AUTH-CONTEXT] Token found, verifying...');
        
        try {
          const response = await api.get('/auth/verify');
          if (response.data.success && response.data.user) {
            console.log('[AUTH-CONTEXT] User verified:', response.data.user.email);
            const userData = normalizeUser(response.data.user);
            console.log('[AUTH-CONTEXT] Normalized user:', userData);
            setUser(userData);
          } else {
            console.log('[AUTH-CONTEXT] Token verification failed');
            tokenService.removeToken();
            setUser(null);
          }
        } catch (err) {
          console.error('[AUTH-CONTEXT] Verification error:', err);
          tokenService.removeToken();
          setUser(null);
        }
      } else {
        console.log('[AUTH-CONTEXT] No token found');
        setUser(null);
      }
    } catch (err) {
      console.error('[AUTH-CONTEXT] Auth check error:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      console.log('[AUTH-CONTEXT] Login attempt for:', email);

      const response = await api.post('/auth/login', { email, password });

      if (response.data.success && response.data.token) {
        console.log('[AUTH-CONTEXT] Login successful');
        
        tokenService.setToken(response.data.token);
        
        const userData = normalizeUser(response.data.user);
        console.log('[AUTH-CONTEXT] User logged in:', userData.email, 'Role:', userData.role?.name);
        setUser(userData);
        
        return { success: true, user: userData };
      }
      
      return { success: false, error: response.data.message || 'Login failed' };
    } catch (error) {
      console.error('[AUTH-CONTEXT] Login error:', error);
      
      if (error.response?.status === 429) {
        const errorMsg = 'Too many login attempts. Please try again in 15 minutes.';
        setError(errorMsg);
        return { success: false, error: errorMsg, rateLimited: true };
      }
      
      if (error.response?.status === 401) {
        const errorMsg = 'Invalid email or password';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      if (error.response?.status === 400) {
        const data = error.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          const fieldErrors = data.errors.map(e => ({ 
            field: e.param, 
            message: e.msg 
          }));
          return { success: false, validationErrors: fieldErrors };
        }
        return { success: false, error: data.message || 'Login failed' };
      }
      
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const signup = async (userData) => {
    setError(null);
    try {
      const { name, email, password } = userData;
      console.log('[AUTH-CONTEXT] Signup attempt for:', email);

      const response = await api.post('/auth/signup', { name, email, password });

      if (response.data.success && response.data.user) {
        console.log('[AUTH-CONTEXT] Signup successful');
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: response.data.message || 'Signup failed' };
    } catch (error) {
      console.error('[AUTH-CONTEXT] Signup error:', error);
      
      if (error.response?.status === 429) {
        const errorMsg = 'Too many signup attempts. Please try again later.';
        setError(errorMsg);
        return { success: false, error: errorMsg, rateLimited: true };
      }
      
      if (error.response?.status === 400) {
        const data = error.response.data;
        
        if (data.message?.includes('already') || data.message?.includes('Email')) {
          const errorMsg = 'Email already registered. Please login instead.';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
        
        if (data.errors && Array.isArray(data.errors)) {
          const fieldErrors = data.errors.map(e => ({ 
            field: e.param, 
            message: e.msg 
          }));
          return { success: false, validationErrors: fieldErrors };
        }
        return { success: false, error: data.message || 'Signup failed' };
      }
      
      const errorMsg = error.response?.data?.message || error.message || 'Signup failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      console.log('[AUTH-CONTEXT] Logout initiated');
      
      try {
        await api.post('/auth/logout');
      } catch (err) {
        console.warn('[AUTH-CONTEXT] Backend logout failed');
      }
    } finally {
      tokenService.removeToken();
      setUser(null);
      setError(null);
      console.log('[AUTH-CONTEXT] User logged out');
    }
  };

  // ===== PERMISSION HELPERS =====

  /**
   * Get role name - handles both string and object formats
   */
  const getRoleName = () => {
    if (!user || !user.role) return null;
    return typeof user.role === 'string' ? user.role : user.role.name;
  };

  const hasPermission = (permission) => {
    if (!user || !user.role || !Array.isArray(user.role.permissions)) {
      return false;
    }
    return user.role.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.every(p => hasPermission(p));
  };

  const getPermissions = () => {
    return Array.isArray(user?.role?.permissions) ? user.role.permissions : [];
  };

  const isAdmin = () => {
    const roleName = getRoleName();
    return roleName === 'admin';
  };

  const canManage = (feature) => {
    return hasPermission(`manage:${feature}`);
  };

  const canViewAnalytics = () => hasPermission('view:analytics');
  const canManageUsers = () => hasPermission('manage:users');
  const canManageRoles = () => hasPermission('manage:roles');
  const canViewAuditLogs = () => hasPermission('view:audit_logs');
  const canManageSettings = () => hasPermission('manage:settings');

  // Blog helpers
  const canPostBlog = () => {
    const allowedRoles = ['member', 'volunteer', 'usher', 'worship_team', 'pastor', 'bishop', 'admin'];
    return allowedRoles.includes(getRoleName());
  };

  const canPostBlogCategory = (category) => {
    if (!user || !user.role) return false;

    const permissions = {
      member: ['testimonies'],
      volunteer: ['testimonies', 'events'],
      usher: ['testimonies', 'events'],
      worship_team: ['testimonies', 'events'],
      pastor: ['testimonies', 'events', 'teaching', 'news'],
      bishop: ['testimonies', 'events', 'teaching', 'news'],
      admin: ['testimonies', 'events', 'teaching', 'news']
    };

    const roleName = getRoleName();
    const allowedCategories = permissions[roleName] || [];
    return allowedCategories.includes(category);
  };

  const getAllowedBlogCategories = () => {
    if (!user || !user.role) return [];

    const permissions = {
      member: ['testimonies'],
      volunteer: ['testimonies', 'events'],
      usher: ['testimonies', 'events'],
      worship_team: ['testimonies', 'events'],
      pastor: ['testimonies', 'events', 'teaching', 'news'],
      bishop: ['testimonies', 'events', 'teaching', 'news'],
      admin: ['testimonies', 'events', 'teaching', 'news']
    };

    const roleName = getRoleName();
    return permissions[roleName] || [];
  };

  const canPostSermon = () => {
    const roleName = getRoleName();
    return roleName && ['pastor', 'bishop', 'admin'].includes(roleName);
  };

  const canUploadPhoto = () => {
    const roleName = getRoleName();
    return roleName && ['pastor', 'bishop', 'admin'].includes(roleName);
  };

  const canEditBlog = (authorId) => {
    if (!user) return false;
    if (isAdmin()) return true;
    return user.id === authorId || user._id === authorId;
  };

  const canDeleteBlog = (authorId) => {
    if (!user) return false;
    if (isAdmin()) return true;
    return user.id === authorId || user._id === authorId;
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    getRoleName,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
    isAdmin,
    canManage,
    canViewAnalytics,
    canManageUsers,
    canManageRoles,
    canViewAuditLogs,
    canManageSettings,
    canPostBlog,
    canPostBlogCategory,
    getAllowedBlogCategories,
    canPostSermon,
    canUploadPhoto,
    canEditBlog,
    canDeleteBlog
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;