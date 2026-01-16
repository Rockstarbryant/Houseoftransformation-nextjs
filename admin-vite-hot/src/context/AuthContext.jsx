import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { tokenService } from '../services/tokenService';
import api from '../services/api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication on mount and when token changes
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[AUTH-CONTEXT] Checking authentication...');
      
      // Check if we have a token stored
      const token = tokenService.getToken();
      
      if (token) {
        console.log('[AUTH-CONTEXT] Token found, verifying...');
        
        // Verify token with backend
        try {
          const response = await api.get('/auth/verify');
          if (response.data.success && response.data.user) {
            console.log('[AUTH-CONTEXT] User verified:', response.data.user.email);
            
            // ===== UPDATED: Handle new role object structure =====
            const userData = {
              ...response.data.user,
              role: response.data.user.role ? {
                id: response.data.user.role._id || response.data.user.role.id,
                name: response.data.user.role.name,
                permissions: Array.isArray(response.data.user.role?.permissions) 
                  ? response.data.user.role.permissions 
                  : []
              } : null
            };
            
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

      // Call backend login endpoint
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success && response.data.token) {
        console.log('[AUTH-CONTEXT] Login successful');
        
        // Store tokens
        tokenService.setToken(response.data.token);
        
        // ===== UPDATED: Handle new role object structure =====
        const userData = {
          ...response.data.user,
          role: response.data.user.role ? {
            id: response.data.user.role._id || response.data.user.role.id,
            name: response.data.user.role.name,
            permissions: Array.isArray(response.data.user.role?.permissions) 
              ? response.data.user.role.permissions 
              : []
          } : null
        };
        
        setUser(userData);
        
        return { success: true, user: userData };
      }
      
      return { success: false, error: response.data.message || 'Login failed' };
    } catch (error) {
      console.error('[AUTH-CONTEXT] Login error:', error);
      
      // Handle different error types
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

      // Call backend signup endpoint
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
      
      // Handle different error types
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
      tokenService.removeToken();
      setUser(null);
      setError(null);
      console.log('[AUTH-CONTEXT] User logged out');
    }
  };

  // ===== PERMISSION HELPERS - NEW SYSTEM =====

  /**
   * Check if user has a specific permission
   * @param {string} permission - e.g., 'manage:events', 'view:analytics'
   */
  const hasPermission = (permission) => {
    if (!user || !user.role || !Array.isArray(user.role.permissions)) {
      return false;
    }
    return user.role.permissions.includes(permission);
  };

  /**
   * Check if user has ANY of the provided permissions
   */
  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.some(p => hasPermission(p));
  };

  /**
   * Check if user has ALL of the provided permissions
   */
  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.every(p => hasPermission(p));
  };

  /**
   * Get all user permissions
   */
  const getPermissions = () => {
    return Array.isArray(user?.role?.permissions) ? user.role.permissions : [];
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return user?.role?.name === 'admin';
  };

  /**
   * Check if user can manage a specific feature
   * @param {string} feature - e.g., 'events', 'sermons', 'users'
   */
  const canManage = (feature) => {
    return hasPermission(`manage:${feature}`);
  };

  // ===== LEGACY BLOG PERMISSION HELPERS (for backward compatibility) =====
  // These are used by ManageBlog and other blog-related components

  /**
   * Check if user can post in a specific blog category
   */
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

    const roleName = user.role?.name || user.role;
    const allowedCategories = permissions[roleName] || [];
    return allowedCategories.includes(category);
  };

  /**
   * Get all allowed blog categories for user
   */
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

    const roleName = user.role?.name || user.role;
    return permissions[roleName] || [];
  };

  /**
   * Check if user can create any blog post
   */
  const canPostBlog = () => {
    const allowedRoles = ['member', 'volunteer', 'usher', 'worship_team', 'pastor', 'bishop', 'admin'];
    return allowedRoles.includes(user?.role?.name);
  };


  /**
   * Check if user can post sermons (pastor/bishop/admin)
   */
  const canPostSermon = () => {
    return user && user.role && ['pastor', 'bishop', 'admin'].includes(user.role.name);
  };

  /**
   * Check if user can upload photos (pastor/bishop/admin)
   */
  const canUploadPhoto = () => {
    return user && user.role && ['pastor', 'bishop', 'admin'].includes(user.role.name);
  };

  /**
   * Check if user can edit a blog (author or admin)
   */
  const canEditBlog = (authorId) => {
    if (!user) return false;
    if (user.role?.name === 'admin') return true;
    return user.id === authorId || user._id === authorId;
  };

  /**
   * Check if user can delete a blog (author or admin)
   */
  const canDeleteBlog = (authorId) => {
    if (!user) return false;
    if (user.role?.name === 'admin') return true;
    return user.id === authorId || user._id === authorId;
  };

  // Context value
  const value = {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    
    // Permission helpers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
    isAdmin,
    canManage,
    
    // Legacy blog helpers (backward compatibility)
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
    throw new Error(
      'useAuthContext must be used within an AuthProvider. ' +
      'Make sure your component is wrapped with <AuthProvider> in App.jsx'
    );
  }
  
  return context;
};

export default AuthContext;