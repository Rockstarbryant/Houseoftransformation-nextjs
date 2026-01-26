'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { tokenService } from '@/services/tokenService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ Prevent multiple simultaneous auth checks
  const isCheckingAuth = useRef(false);

  // ✅ Helper: Decode JWT and check expiry locally (no network call)
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      // Check if token expires in less than 5 minutes
      if (expiryTime - now < 5 * 60 * 1000) {
        console.log('[AUTH-CONTEXT] ⚠️ Token expires soon, will refresh');
        return false;
      }
      
      return expiryTime > now;
    } catch (error) {
      console.error('[AUTH-CONTEXT] ❌ Token decode error:', error);
      return false;
    }
  };

  // ===== AUTO-CHECK AUTH ON APP LOAD (RUNS ONCE) =====
  useEffect(() => {
    const initializeAuth = async () => {
      // ✅ Prevent multiple simultaneous checks
      if (isCheckingAuth.current) {
        console.log('[AUTH-CONTEXT] ⏳ Auth check already in progress, skipping...');
        return;
      }

      try {
        isCheckingAuth.current = true;
        console.log('[AUTH-CONTEXT] Initializing authentication...');
        await checkAuth();
      } catch (error) {
        console.error('[AUTH-CONTEXT] Initialization error:', error);
      } finally {
        setIsLoading(false);
        isCheckingAuth.current = false;
      }
    };

    initializeAuth();
  }, []); // ✅ Empty dependency array - runs ONCE

  // ===== CHECK AUTHENTICATION =====
  const checkAuth = async () => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      console.log('[AUTH-CONTEXT] Checking authentication...');

      const token = tokenService.getToken();

      // No token = not authenticated
      if (!token) {
        console.log('[AUTH-CONTEXT] ❌ No token found');
        setUser(null);
        tokenService.removeRole();
        return false;
      }

      // ✅ Check token validity locally FIRST (no network call)
      if (!isTokenValid(token)) {
        console.log('[AUTH-CONTEXT] ⚠️ Token invalid or expiring soon, attempting refresh...');
        
        const refreshToken = tokenService.getRefreshToken();
        
        if (!refreshToken) {
          console.log('[AUTH-CONTEXT] ❌ No refresh token available');
          tokenService.clearAll();
          setUser(null);
          return false;
        }

        try {
          console.log('[AUTH-CONTEXT] 🔄 Refreshing token...');
          const refreshResponse = await api.post('/auth/refresh', { refreshToken });

          if (!refreshResponse.data.token) {
            console.log('[AUTH-CONTEXT] ❌ Token refresh failed');
            tokenService.clearAll();
            setUser(null);
            return false;
          }

          console.log('[AUTH-CONTEXT] ✅ Token refreshed');
          tokenService.setToken(refreshResponse.data.token);
          
          if (refreshResponse.data.refreshToken) {
            tokenService.setRefreshToken(refreshResponse.data.refreshToken);
          }
        } catch (refreshError) {
          console.error('[AUTH-CONTEXT] ❌ Refresh failed:', refreshError.message);
          tokenService.clearAll();
          setUser(null);
          return false;
        }
      }

      // ✅ Token is valid, fetch user data (SINGLE API CALL)
      console.log('[AUTH-CONTEXT] ✅ Token valid, fetching user...');
      
      try {
        const response = await api.get('/auth/me');
        
        if (response.data.success && response.data.user) {
          console.log('[AUTH-CONTEXT] ✅ User verified:', response.data.user.email);
          
          const userData = {
            ...response.data.user,
            role: {
              ...response.data.user.role,
              permissions: Array.isArray(response.data.user.role?.permissions) 
                ? response.data.user.role.permissions 
                : []
            }
          };
          
          setUser(userData);
          tokenService.setRole(userData.role);
          console.log('[AUTH-CONTEXT] ✅ User role set:', userData.role.name);
          return true;
        } else {
          console.log('[AUTH-CONTEXT] ❌ Invalid user data');
          tokenService.clearAll();
          setUser(null);
          return false;
        }
      } catch (verifyError) {
        console.error('[AUTH-CONTEXT] ❌ User verification failed:', verifyError.message);
        tokenService.clearAll();
        setUser(null);
        return false;
      }

    } catch (err) {
      console.error('[AUTH-CONTEXT] ❌ Auth check error:', err);
      tokenService.clearAll();
      setUser(null);
      return false;
    }
  };

  // ===== LOGIN =====
  const login = async (email, password) => {
    setError(null);
    try {
      console.log('[AUTH-CONTEXT] Login attempt for:', email);

      const response = await api.post('/auth/login', { email, password });

      if (response.data.success && response.data.token) {
        console.log('[AUTH-CONTEXT] ✅ Login successful');

        tokenService.setToken(response.data.token);
        if (response.data.refreshToken) {
          tokenService.setRefreshToken(response.data.refreshToken);
        }

        const userData = {
          ...response.data.user,
          role: {
            ...response.data.user.role,
            permissions: Array.isArray(response.data.user.role?.permissions) 
              ? response.data.user.role.permissions 
              : []
          }
        };

        setUser(userData);
        tokenService.setRole(userData.role);
        console.log('[AUTH-CONTEXT] ✅ User role set:', userData.role.name);
        
        return { success: true, user: userData };
      }

      return { success: false, error: response.data.message || 'Login failed' };
    } catch (error) {
      console.error('[AUTH-CONTEXT] ❌ Login error:', error);

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

  // ===== SIGNUP =====
  const signup = async (userData) => {
    setError(null);
    try {
      const { name, email, password } = userData;

      console.log('[AUTH-CONTEXT] Signup attempt for:', email);

      const response = await api.post('/auth/signup', {
        name,
        email,
        password
      });

      if (response.data.success && response.data.user) {
        console.log('[AUTH-CONTEXT] ✅ Signup successful');
        return { success: true, user: response.data.user };
      }

      return { success: false, error: response.data.message || 'Signup failed' };
    } catch (error) {
      console.error('[AUTH-CONTEXT] ❌ Signup error:', error);

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

  // ===== LOGOUT =====
  const logout = async () => {
    try {
      console.log('[AUTH-CONTEXT] Logout initiated');

      try {
        await api.post('/auth/logout');
      } catch (err) {
        console.warn('[AUTH-CONTEXT] Backend logout failed, clearing local state anyway');
      }
    } catch (err) {
      console.error('[AUTH-CONTEXT] Logout error:', err);
    } finally {
      tokenService.clearAll();
      setUser(null);
      setError(null);
      console.log('[AUTH-CONTEXT] ✅ User logged out');
      router.push('/login');
    }
  };

  // ===== PERMISSION HELPERS ===== (Keep all your existing helpers)
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
    return user?.role?.name === 'admin';
  };

  const canManage = (feature) => {
    return hasPermission(`manage:${feature}`);
  };

  const canPostBlog = () => {
    if (!user) return false;
    const allowedRoles = ['member', 'volunteer', 'usher', 'worship_team', 'pastor', 'bishop', 'admin'];
    return allowedRoles.includes(user.role?.name);
  };

  const canEditBlog = (authorId) => {
    if (!user) return false;
    return user._id === authorId || isAdmin();
  };

  const canDeleteBlog = (authorId) => {
    if (!user) return false;
    return user._id === authorId || isAdmin();
  };

  const getAllowedBlogCategories = () => {
  // Check if user has manage:blog permission (object-based role)
  if (!user || !user.role) return [];
  
  // Check if manage:blog permission exists in user.role.permissions array
  const hasManageBlog = Array.isArray(user.role.permissions) && 
    user.role.permissions.includes('manage:blog');
  
  if (!hasManageBlog) return [];
  
  // Admin and those with manage:blog can post in all categories
  return ['testimonies', 'events', 'teaching', 'news'];
  };

  // ===== ADD THIS NEW FUNCTION (for backward compatibility) =====
const canPostBlogCategory = (category) => {
  // Check if user has manage:blog permission
  if (!user || !user.role) return false;
  
  const hasManageBlog = Array.isArray(user.role.permissions) && 
    user.role.permissions.includes('manage:blog');
  
  if (!hasManageBlog) return false;
  
  // If they have manage:blog, they can post in any category
  const allowedCategories = ['testimonies', 'events', 'teaching', 'news'];
  return allowedCategories.includes(category);
};

  const value = {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
    isAdmin,
    canManage,
    canViewAnalytics: () => hasPermission('view:analytics'),
    canManageEvents: () => hasPermission('manage:events'),
    canManageSermons: () => hasPermission('manage:sermons'),
    canManageUsers: () => hasPermission('manage:users'),
    canManageRoles: () => hasPermission('manage:roles'),
    canPostBlog,
    canPostBlogCategory,
    canPostSermon: () => hasPermission('manage:sermons'),
    canUploadPhoto: () => hasPermission('manage:gallery'),
    canEditBlog,
    canDeleteBlog,
    getAllowedBlogCategories,
    canReadFeedbackSermon: () => hasAnyPermission(['read:feedback:sermon', 'manage:feedback']),
    canRespondFeedbackSermon: () => hasAnyPermission(['respond:feedback:sermon', 'manage:feedback']),
    canReadFeedbackService: () => hasAnyPermission(['read:feedback:service', 'manage:feedback']),
    canRespondFeedbackService: () => hasAnyPermission(['respond:feedback:service', 'manage:feedback']),
    canReadFeedbackTestimony: () => hasAnyPermission(['read:feedback:testimony', 'manage:feedback']),
    canRespondFeedbackTestimony: () => hasAnyPermission(['respond:feedback:testimony', 'manage:feedback']),
    canPublishFeedbackTestimony: () => hasAnyPermission(['publish:feedback:testimony', 'manage:feedback']),
    canArchiveFeedbackTestimony: () => hasAnyPermission(['archive:feedback:testimony', 'manage:feedback']),
    canReadFeedbackSuggestion: () => hasAnyPermission(['read:feedback:suggestion', 'manage:feedback']),
    canRespondFeedbackSuggestion: () => hasAnyPermission(['respond:feedback:suggestion', 'manage:feedback']),
    canArchiveFeedbackSuggestion: () => hasAnyPermission(['archive:feedback:suggestion', 'manage:feedback']),
    canReadFeedbackPrayer: () => hasAnyPermission(['read:feedback:prayer', 'manage:feedback']),
    canRespondFeedbackPrayer: () => hasAnyPermission(['respond:feedback:prayer', 'manage:feedback']),
    canArchiveFeedbackPrayer: () => hasAnyPermission(['archive:feedback:prayer', 'manage:feedback']),
    canReadFeedbackGeneral: () => hasAnyPermission(['read:feedback:general', 'manage:feedback']),
    canRespondFeedbackGeneral: () => hasAnyPermission(['respond:feedback:general', 'manage:feedback']),
    canArchiveFeedbackGeneral: () => hasAnyPermission(['archive:feedback:general', 'manage:feedback']),
    canViewFeedbackStats: () => hasAnyPermission(['view:feedback:stats', 'manage:feedback']),
    canReadAnyFeedback: () => hasAnyPermission(['read:feedback:sermon', 'read:feedback:service', 'read:feedback:testimony', 'read:feedback:suggestion', 'read:feedback:prayer', 'read:feedback:general', 'manage:feedback']),
    canRespondAnyFeedback: () => hasAnyPermission(['respond:feedback:sermon', 'respond:feedback:service', 'respond:feedback:testimony', 'respond:feedback:suggestion', 'respond:feedback:prayer', 'respond:feedback:general', 'manage:feedback']),
    canArchiveAnyFeedback: () => hasAnyPermission(['archive:feedback:sermon', 'archive:feedback:service', 'archive:feedback:testimony', 'archive:feedback:suggestion', 'archive:feedback:prayer', 'archive:feedback:general', 'manage:feedback'])
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};