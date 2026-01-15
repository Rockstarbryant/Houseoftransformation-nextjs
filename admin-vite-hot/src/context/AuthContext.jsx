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
            setUser(response.data.user);
          } else {
            console.log('[AUTH-CONTEXT] Token verification failed');
            tokenService.removeToken();
            setUser(null);
          }
        } catch (err) {
          console.error('[AUTH-CONTEXT] Verification error:', err);
          // Token might be expired - try to refresh it
          try {
            const refreshToken = tokenService.getRefreshToken();
            if (refreshToken) {
              console.log('[AUTH-CONTEXT] Attempting token refresh...');
              const refreshResponse = await api.post('/auth/refresh', { 
                refreshToken 
              });
              
              if (refreshResponse.data.token) {
                tokenService.setToken(refreshResponse.data.token);
                if (refreshResponse.data.refreshToken) {
                  tokenService.setRefreshToken(refreshResponse.data.refreshToken);
                }
                
                // Retry verification
                const retryResponse = await api.get('/auth/verify');
                if (retryResponse.data.user) {
                  setUser(retryResponse.data.user);
                  console.log('[AUTH-CONTEXT] Token refreshed and user verified');
                }
              } else {
                tokenService.removeToken();
                setUser(null);
              }
            } else {
              tokenService.removeToken();
              setUser(null);
            }
          } catch (refreshErr) {
            console.error('[AUTH-CONTEXT] Token refresh failed:', refreshErr);
            tokenService.removeToken();
            setUser(null);
          }
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

      // Call backend login endpoint (which uses Supabase)
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success && response.data.token) {
        console.log('[AUTH-CONTEXT] Login successful');
        
        // Store tokens
        tokenService.setToken(response.data.token);
        if (response.data.refreshToken) {
          tokenService.setRefreshToken(response.data.refreshToken);
        }
        
        // Set user
        setUser(response.data.user);
        
        return { success: true, user: response.data.user };
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

      // Call backend signup endpoint (which creates in Supabase + MongoDB)
      const response = await api.post('/auth/signup', {
        name,
        email,
        password
      });

      if (response.data.success && response.data.user) {
        console.log('[AUTH-CONTEXT] Signup successful, user created');
        
        // Auto-login after signup (optional)
        // You can uncomment this if you want to auto-login users after signup
        // const loginResult = await login(email, password);
        // return loginResult;

        // Or just return success and let them login manually
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
        
        // Check for email already exists
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
      
      // Call backend logout endpoint
      try {
        await api.post('/auth/logout');
      } catch (err) {
        console.warn('[AUTH-CONTEXT] Backend logout failed, clearing local state anyway');
      }
    } catch (err) {
      console.error('[AUTH-CONTEXT] Logout error:', err);
    } finally {
      // Always clear local state
      tokenService.removeToken();
      tokenService.removeRefreshToken();
      setUser(null);
      setError(null);
      console.log('[AUTH-CONTEXT] User logged out');
    }
  };

  // Permission helper methods (unchanged)
  const canPostBlog = () => {
    return user && [
      'member', 
      'volunteer', 
      'usher', 
      'worship_team', 
      'pastor', 
      'bishop', 
      'admin'
    ].includes(user.role);
  };

  const canPostBlogCategory = (category) => {
    if (!user) return false;
    
    const permissions = {
      member: ['testimonies'],
      volunteer: ['testimonies', 'events'],
      usher: ['testimonies', 'events'],
      worship_team: ['testimonies', 'events'],
      pastor: ['testimonies', 'events', 'teaching', 'news'],
      bishop: ['testimonies', 'events', 'teaching', 'news'],
      admin: ['testimonies', 'events', 'teaching', 'news']
    };
    
    return (permissions[user.role] || []).includes(category);
  };

  const getAllowedBlogCategories = () => {
    if (!user) return [];
    
    const permissions = {
      member: ['testimonies'],
      volunteer: ['testimonies', 'events'],
      usher: ['testimonies', 'events'],
      worship_team: ['testimonies', 'events'],
      pastor: ['testimonies', 'events', 'teaching', 'news'],
      bishop: ['testimonies', 'events', 'teaching', 'news'],
      admin: ['testimonies', 'events', 'teaching', 'news']
    };
    
    return permissions[user.role] || [];
  };

  const canPostSermon = () => {
    return user && ['pastor', 'bishop', 'admin'].includes(user.role);
  };

  const canUploadPhoto = () => {
    return user && ['pastor', 'bishop', 'admin'].includes(user.role);
  };

  const canEditBlog = (authorId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.id === authorId || user._id === authorId;
  };

  const canDeleteBlog = (authorId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.id === authorId || user._id === authorId;
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
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
    canPostBlog,
    canPostBlogCategory,
    getAllowedBlogCategories,
    canPostSermon,
    canUploadPhoto,
    canEditBlog,
    canDeleteBlog,
    isAdmin
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