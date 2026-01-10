import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api/authService';
import { tokenService } from '../services/tokenService';

// Create the context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = tokenService.getToken();
      if (token) {
        // Verify token is still valid
        const response = await authService.verifyToken(token);
        if (response.user) {
          setUser(response.user);
        } else {
          tokenService.removeToken();
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      // Token might be expired - try to refresh it
      try {
        const refreshResponse = await authService.refreshToken();
        if (refreshResponse.user) {
          setUser(refreshResponse.user);
        } else {
          tokenService.removeToken();
        }
      } catch (refreshErr) {
        console.error('Token refresh failed:', refreshErr);
        tokenService.removeToken();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authService.login(email, password);
      
      if (response.token) {
        tokenService.setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      
      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.response?.status === 429) {
        const errorMsg = 'Too many login attempts. Please try again in 15 minutes.';
        setError(errorMsg);
        return { success: false, error: errorMsg, rateLimited: true };
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
      
      const errorMsg = error.response?.data?.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const signup = async (userData) => {
    setError(null);
    try {
      const response = await authService.signup(userData);
      
      if (response.token) {
        tokenService.setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      
      return { success: false, error: response.message || 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle different error types
      if (error.response?.status === 429) {
        const errorMsg = 'Too many signup attempts. Please try again later.';
        setError(errorMsg);
        return { success: false, error: errorMsg, rateLimited: true };
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
        return { success: false, error: data.message || 'Signup failed' };
      }
      
      const errorMsg = error.response?.data?.message || 'Signup failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local state, even if backend fails
      tokenService.removeToken();
      setUser(null);
      setError(null);
    }
  };

  // Permission helper methods
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

// Hook to use auth context (MUST be defined AFTER AuthProvider)
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