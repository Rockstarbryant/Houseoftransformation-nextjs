'use client';

import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { tokenService } from '@/services/tokenService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check authentication - ONLY called by protected routes
  const checkAuth = async () => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      console.log('[AUTH-CONTEXT] Checking authentication...');

      const token = tokenService.getToken();

      if (token) {
        console.log('[AUTH-CONTEXT] Token found, verifying...');

        try {
          const response = await api.get('/auth/me');
          if (response.data.success && response.data.user) {
            console.log('[AUTH-CONTEXT] User verified:', response.data.user.email);
            
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
            // ===== SET ROLE COOKIE FOR MIDDLEWARE =====
            tokenService.setRole(userData.role);
            console.log('[AUTH-CONTEXT] User role cookie set:', userData.role.name);
            return true;
          } else {
            console.log('[AUTH-CONTEXT] Token verification failed');
            tokenService.clearAll();
            setUser(null);
            return false;
          }
        } catch (err) {
          console.error('[AUTH-CONTEXT] Verification error:', err);
          
          // Try to refresh token
          try {
            const refreshToken = tokenService.getRefreshToken();
            if (refreshToken) {
              console.log('[AUTH-CONTEXT] Attempting token refresh...');
              const refreshResponse = await api.post('/auth/refresh', { refreshToken });

              if (refreshResponse.data.token) {
                tokenService.setToken(refreshResponse.data.token);
                if (refreshResponse.data.refreshToken) {
                  tokenService.setRefreshToken(refreshResponse.data.refreshToken);
                }

                const retryResponse = await api.get('/auth/me');
                if (retryResponse.data.user) {
                  const userData = {
                    ...retryResponse.data.user,
                    role: {
                      ...retryResponse.data.user.role,
                      permissions: Array.isArray(retryResponse.data.user.role?.permissions) 
                        ? retryResponse.data.user.role.permissions 
                        : []
                    }
                  };
                  setUser(userData);
                  // ===== SET ROLE COOKIE FOR MIDDLEWARE =====
                  tokenService.setRole(userData.role);
                  console.log('[AUTH-CONTEXT] Token refreshed and user verified');
                  return true;
                }
              }
            }
            
            tokenService.clearAll();
            setUser(null);
            return false;
          } catch (refreshErr) {
            console.error('[AUTH-CONTEXT] Token refresh failed:', refreshErr);
            tokenService.clearAll();
            setUser(null);
            return false;
          }
        }
      } else {
        console.log('[AUTH-CONTEXT] No token found');
        setUser(null);
        tokenService.removeRole();
        return false;
      }
    } catch (err) {
      console.error('[AUTH-CONTEXT] Auth check error:', err);
      setUser(null);
      tokenService.removeRole();
      return false;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      console.log('[AUTH-CONTEXT] Login attempt for:', email);

      const response = await api.post('/auth/login', { email, password });

      if (response.data.success && response.data.token) {
        console.log('[AUTH-CONTEXT] Login successful');

        // Store tokens in localStorage + cookies
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
        
        // ===== SET ROLE COOKIE FOR MIDDLEWARE =====
        tokenService.setRole(userData.role);
        console.log('[AUTH-CONTEXT] User role cookie set:', userData.role.name);
        
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

      const response = await api.post('/auth/signup', {
        name,
        email,
        password
      });

      if (response.data.success && response.data.user) {
        console.log('[AUTH-CONTEXT] Signup successful, user created');
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
        console.warn('[AUTH-CONTEXT] Backend logout failed, clearing local state anyway');
      }
    } catch (err) {
      console.error('[AUTH-CONTEXT] Logout error:', err);
    } finally {
      // ===== CLEAR ALL AUTH DATA =====
      tokenService.clearAll();
      setUser(null);
      setError(null);
      console.log('[AUTH-CONTEXT] User logged out and cookies cleared');
      router.push('/login');
    }
  };

  // Permission helpers
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
    if (!user) return [];
    
    const categoryPermissions = {
      'member': ['testimonies'],
      'volunteer': ['testimonies', 'events'],
      'usher': ['testimonies', 'events'],
      'worship_team': ['testimonies', 'events'],
      'pastor': ['testimonies', 'events', 'teaching', 'news'],
      'bishop': ['testimonies', 'events', 'teaching', 'news'],
      'admin': ['testimonies', 'events', 'teaching', 'news']
    };
    
    return categoryPermissions[user.role?.name] || [];
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