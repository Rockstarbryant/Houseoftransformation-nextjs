import { useState, useEffect, useCallback } from 'react';
import  authService  from '../services/api/authService';
import { setWithExpiry, getWithExpiry } from '../utils/helpers';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = getWithExpiry('authToken');
      if (token) {
        const userData = await authService.verifyToken(token);
        setUser(userData.user);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      const { user, token } = response;
      
      setWithExpiry('authToken', token, 7 * 24 * 60 * 60 * 1000);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.signup(userData);
      const { user, token } = response;
      
      setWithExpiry('authToken', token, 7 * 24 * 60 * 60 * 1000);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';
  const isVolunteer = user?.role === 'volunteer';

  return {
    user,
    isAuthenticated,
    isAdmin,
    isMember,
    isVolunteer,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    checkAuth
  };
};