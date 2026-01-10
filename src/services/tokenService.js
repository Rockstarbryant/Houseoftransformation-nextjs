'use client';

import Cookies from 'js-cookie';

export const tokenService = {
  getToken() {
    if (typeof window === 'undefined') return null;
    return Cookies.get('authToken') || sessionStorage.getItem('authToken');
  },
  
  setToken(token) {
    if (typeof window === 'undefined') return false;
    if (!token) return false;
    try {
      Cookies.set('authToken', token, { expires: 7 });
      sessionStorage.setItem('authToken', token);
      return true;
    } catch (error) {
      console.error('Error storing token:', error);
      return false;
    }
  },
  
  removeToken() {
    if (typeof window === 'undefined') return false;
    try {
      Cookies.remove('authToken');
      sessionStorage.removeItem('authToken');
      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  },

  hasToken() {
    return !!this.getToken();
  },

  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const decoded = JSON.parse(atob(parts[1]));
      const expiryTime = decoded.exp * 1000;
      return expiryTime < Date.now();
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  },

  clearAuth() {
    this.removeToken();
  }
};

export default tokenService;