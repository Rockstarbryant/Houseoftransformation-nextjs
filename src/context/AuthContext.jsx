'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import api from '@/lib/api';
import { tokenService } from '@/lib/tokenService';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ Prevent multiple simultaneous auth checks
  const isCheckingAuth = useRef(false);
  const hasInitialized = useRef(false); // ✅ NEW: Prevent double initialization

  // ✅ Helper: Decode JWT and check expiry locally (no network call)
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const now = Date.now();
      
      // ✅ FIXED: Only refresh if token expires in less than 1 minute (not 5)
      const timeUntilExpiry = expiryTime - now;
      
      if (timeUntilExpiry < 60 * 1000) { // 1 minute instead of 5
        console.log('[AUTH-CONTEXT] ⚠️ Token expires in', Math.floor(timeUntilExpiry / 1000), 'seconds');
        return false;
      }
      
      return expiryTime > now;
    } catch (error) {
      console.error('[AUTH-CONTEXT] ❌ Token decode error:', error);
      return false;
    }
  };

  // ===== HANDLE OAUTH SESSION =====
  const handleOAuthSession = async (session) => {
    try {
      console.log('[AUTH-CONTEXT] Processing OAuth session');

      tokenService.setToken(session.access_token);
      tokenService.setRefreshToken(session.refresh_token);

      const response = await api.post('/auth/oauth-sync', {
        supabase_uid: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        provider: session.user.app_metadata?.provider
      });

      if (response.data.success) {
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
        console.log('[AUTH-CONTEXT] ✅ OAuth user synced:', userData.email);
      }
    } catch (error) {
      console.error('[AUTH-CONTEXT] OAuth sync error:', error);
      tokenService.clearAll();
      setUser(null);
    }
  };

  // ===== AUTO-CHECK AUTH ON APP LOAD (RUNS ONCE) =====
  useEffect(() => {
    // ✅ CRITICAL: Prevent double initialization in React StrictMode
    if (hasInitialized.current) {
      console.log('[AUTH-CONTEXT] ⏭️ Already initialized, skipping...');
      return;
    }

    hasInitialized.current = true;

    const initializeAuth = async () => {
      // ✅ Prevent multiple simultaneous checks
      if (isCheckingAuth.current) {
        console.log('[AUTH-CONTEXT] ⏳ Auth check already in progress, skipping...');
        return;
      }

      try {
        isCheckingAuth.current = true;
        console.log('[AUTH-CONTEXT] 🔍 Initializing authentication...');
        
        // ✅ FIXED: Check token locally FIRST before any API calls
        const token = tokenService.getToken();
        
        if (!token) {
          console.log('[AUTH-CONTEXT] ❌ No token found - user not authenticated');
          setUser(null);
          setIsLoading(false);
          return;
        }

        // ✅ Validate token structure and expiry
        if (!isTokenValid(token)) {
          console.log('[AUTH-CONTEXT] ⚠️ Token invalid or expired');
          
          // ✅ Try to refresh ONCE
          const refreshToken = tokenService.getRefreshToken();
          
          if (refreshToken) {
            console.log('[AUTH-CONTEXT] 🔄 Attempting token refresh...');
            
            try {
              const refreshResponse = await api.post('/auth/refresh', { refreshToken });
              
              if (refreshResponse.data.token) {
                console.log('[AUTH-CONTEXT] ✅ Token refreshed successfully');
                tokenService.setToken(refreshResponse.data.token);
                
                if (refreshResponse.data.refreshToken) {
                  tokenService.setRefreshToken(refreshResponse.data.refreshToken);
                }
                
                // ✅ Now fetch user data with new token
                await fetchUserData();
              } else {
                throw new Error('No token in refresh response');
              }
            } catch (refreshError) {
              console.error('[AUTH-CONTEXT] ❌ Token refresh failed:', refreshError.message);
              tokenService.clearAll();
              setUser(null);
              setIsLoading(false);
              return;
            }
          } else {
            console.log('[AUTH-CONTEXT] ❌ No refresh token available');
            tokenService.clearAll();
            setUser(null);
            setIsLoading(false);
            return;
          }
        } else {
          // ✅ Token is valid, fetch user data
          console.log('[AUTH-CONTEXT] ✅ Token valid, fetching user data...');
          await fetchUserData();
        }
        
      } catch (error) {
        console.error('[AUTH-CONTEXT] ❌ Initialization error:', error);
        tokenService.clearAll();
        setUser(null);
      } finally {
        setIsLoading(false);
        isCheckingAuth.current = false;
      }
    };

    initializeAuth();

    // ===== LISTEN FOR OAUTH AUTH STATE CHANGES =====
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH-CONTEXT] 🔔 Auth state changed:', event);

        if (event === 'SIGNED_IN' && session) {
          await handleOAuthSession(session);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          tokenService.clearAll();
          setIsLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []); // ✅ Empty dependency array - runs ONCE

  // ✅ NEW: Separate function to fetch user data
  const fetchUserData = async () => {
    try {
      console.log('[AUTH-CONTEXT] 📡 Fetching user data from /auth/me...');
      
      const response = await api.get('/auth/me');
      
      if (response.data.success && response.data.user) {
        console.log('[AUTH-CONTEXT] ✅ User data received:', response.data.user.email);
        
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
        return true;
      } else {
        console.log('[AUTH-CONTEXT] ❌ Invalid user data response');
        tokenService.clearAll();
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('[AUTH-CONTEXT] ❌ Failed to fetch user data:', error.message);
      
      // ✅ CRITICAL: Don't retry on 401 - token is definitely invalid
      if (error.response?.status === 401) {
        console.log('[AUTH-CONTEXT] 🚫 401 Unauthorized - clearing tokens');
        tokenService.clearAll();
        setUser(null);
      }
      
      return false;
    }
  };

  // ===== CHECK AUTHENTICATION (for manual refresh) =====
  const checkAuth = async () => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      console.log('[AUTH-CONTEXT] 🔄 Manual auth check requested...');
      
      const token = tokenService.getToken();

      if (!token) {
        console.log('[AUTH-CONTEXT] ❌ No token found');
        setUser(null);
        return false;
      }

      // Check token validity
      if (!isTokenValid(token)) {
        console.log('[AUTH-CONTEXT] ⚠️ Token invalid, attempting refresh...');
        
        const refreshToken = tokenService.getRefreshToken();
        
        if (!refreshToken) {
          console.log('[AUTH-CONTEXT] ❌ No refresh token');
          tokenService.clearAll();
          setUser(null);
          return false;
        }

        try {
          const refreshResponse = await api.post('/auth/refresh', { refreshToken });

          if (refreshResponse.data.token) {
            tokenService.setToken(refreshResponse.data.token);
            
            if (refreshResponse.data.refreshToken) {
              tokenService.setRefreshToken(refreshResponse.data.refreshToken);
            }
            
            return await fetchUserData();
          }
        } catch (refreshError) {
          console.error('[AUTH-CONTEXT] ❌ Refresh failed:', refreshError.message);
          tokenService.clearAll();
          setUser(null);
          return false;
        }
      }

      // Fetch user data
      return await fetchUserData();

    } catch (err) {
      console.error('[AUTH-CONTEXT] ❌ Check auth error:', err);
      tokenService.clearAll();
      setUser(null);
      return false;
    }
  };

  // ===== LOGIN =====
  const login = async (email, password) => {
    setError(null);
    setIsLoading(true);
    
    try {
      console.log('[AUTH-CONTEXT] 🔐 Login attempt for:', email);

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
    } finally {
      setIsLoading(false);
    }
  };

  // ===== SIGNUP =====
  const signup = async (userData) => {
    setError(null);
    try {
      const { name, email, password } = userData;

      console.log('[AUTH-CONTEXT] 📝 Signup attempt for:', email);

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

  // ===== SIGN IN WITH GOOGLE =====
  const signInWithGoogle = async () => {
    try {
      console.log('[AUTH-CONTEXT] 🔵 Google sign-in initiated');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('[AUTH-CONTEXT] ❌ Google sign-in error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('[AUTH-CONTEXT] ❌ Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  };

  // ===== LOGOUT =====
  const logout = async () => {
    try {
      console.log('[AUTH-CONTEXT] 🚪 Logout initiated');

      try {
        await api.post('/auth/logout');
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[AUTH-CONTEXT] ⚠️ Backend logout failed, clearing local state anyway');
      }
    } catch (err) {
      console.error('[AUTH-CONTEXT] ❌ Logout error:', err);
    } finally {
      tokenService.clearAll();
      setUser(null);
      setError(null);
      console.log('[AUTH-CONTEXT] ✅ User logged out');
      router.push('/login');
    }
  };

  // ===== PERMISSION HELPERS =====
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

  const canManageAnnouncements = () => hasPermission('manage:announcements');
  const canCreateAnnouncement = () => hasPermission('manage:announcements');
  const canEditAnnouncement = () => hasPermission('manage:announcements');
  const canDeleteAnnouncement = () => hasPermission('manage:announcements');

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
    if (!user || !user.role) return [];
    
    const hasManageBlog = Array.isArray(user.role.permissions) && 
      user.role.permissions.includes('manage:blog');
    
    if (!hasManageBlog) return [];
    
    return ['testimonies', 'events', 'teaching', 'news'];
  };

  const canPostBlogCategory = (category) => {
    if (!user || !user.role) return false;
    
    const hasManageBlog = Array.isArray(user.role.permissions) && 
      user.role.permissions.includes('manage:blog');
    
    if (!hasManageBlog) return false;
    
    const allowedCategories = ['testimonies', 'events', 'teaching', 'news'];
    return allowedCategories.includes(category);
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    signup,
    signInWithGoogle,
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
    canArchiveAnyFeedback: () => hasAnyPermission(['archive:feedback:sermon', 'archive:feedback:service', 'archive:feedback:testimony', 'archive:feedback:suggestion', 'archive:feedback:prayer', 'archive:feedback:general', 'manage:feedback']),
    canManageAnnouncements,
    canCreateAnnouncement,
    canEditAnnouncement,
    canDeleteAnnouncement
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
