/**
 * Token Service - Manages JWT storage and retrieval
 * Works in browser only (client-side)
 * Uses localStorage for storage + cookies for middleware
 */

const TOKEN_KEY = 'supabase_access_token';
const REFRESH_TOKEN_KEY = 'supabase_refresh_token';
const TOKEN_EXPIRY_KEY = 'supabase_token_expiry';
const ROLE_KEY = 'user_role';
const COOKIE_AUTH_TOKEN = 'auth_token';

// ===== COOKIE HELPERS =====
const setCookie = (name, value, days = 7) => {
  if (typeof window === 'undefined') return;
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
    console.log(`[TOKEN-SERVICE] Cookie set: ${name}`);
  } catch (error) {
    console.error(`[TOKEN-SERVICE] Error setting cookie ${name}:`, error);
  }
};

const getCookie = (name) => {
  if (typeof window === 'undefined') return null;
  try {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  } catch (error) {
    console.error(`[TOKEN-SERVICE] Error getting cookie ${name}:`, error);
    return null;
  }
};

const deleteCookie = (name) => {
  if (typeof window === 'undefined') return;
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    console.log(`[TOKEN-SERVICE] Cookie deleted: ${name}`);
  } catch (error) {
    console.error(`[TOKEN-SERVICE] Error deleting cookie ${name}:`, error);
  }
};

// ===== MAIN TOKEN SERVICE =====
export const tokenService = {
  /**
   * Store access token in BOTH localStorage + cookies
   */
  setToken: (token) => {
    if (typeof window === 'undefined') return;
    if (!token) return;

    localStorage.setItem(TOKEN_KEY, token);
    setCookie(COOKIE_AUTH_TOKEN, token, 7);

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, (payload.exp * 1000).toString());
      }
    } catch (e) {
      console.warn('[TOKEN-SERVICE] Could not decode token expiry');
    }

    console.log('[TOKEN-SERVICE] Access token stored');
  },

  /**
   * Get access token from localStorage
   */
  getToken: () => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (expiry && Date.now() > parseInt(expiry)) {
        console.log('[TOKEN-SERVICE] Token expired, removing');
        tokenService.removeToken();
        return null;
      }
    }

    return token;
  },

  /**
   * Store refresh token
   */
  setRefreshToken: (refreshToken) => {
    if (typeof window === 'undefined') return;
    if (!refreshToken) return;

    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    console.log('[TOKEN-SERVICE] Refresh token stored');
  },

  /**
   * Get refresh token
   */
  getRefreshToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Set user role in BOTH cookie + localStorage
   */
  setRole: (role) => {
    if (typeof window === 'undefined') return;
    
    const roleName = role?.name || role || 'user';
    
    localStorage.setItem(ROLE_KEY, roleName);
    setCookie(ROLE_KEY, roleName, 7);
    
    console.log('[TOKEN-SERVICE] User role set:', roleName);
  },

  /**
   * Get user role - check both sources
   */
  getRole: () => {
    if (typeof window === 'undefined') return null;
    
    const cookieRole = getCookie(ROLE_KEY);
    if (cookieRole) return cookieRole;
    
    const storageRole = localStorage.getItem(ROLE_KEY);
    if (storageRole) return storageRole;
    
    return null;
  },

  /**
   * Remove role from both sources
   */
  removeRole: () => {
    if (typeof window === 'undefined') return;
    deleteCookie(ROLE_KEY);
    localStorage.removeItem(ROLE_KEY);
    console.log('[TOKEN-SERVICE] Role removed');
  },

  /**
   * Remove tokens from both sources
   */
  removeToken: () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    deleteCookie(COOKIE_AUTH_TOKEN);
    
    console.log('[TOKEN-SERVICE] Tokens removed');
  },

  /**
   * Remove refresh token specifically
   */
  removeRefreshToken: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    console.log('[TOKEN-SERVICE] Refresh token removed');
  },

  /**
   * Clear all auth data
   */
  clearAll: () => {
    tokenService.removeToken();
    tokenService.removeRefreshToken();
    tokenService.removeRole();
    console.log('[TOKEN-SERVICE] All auth data cleared');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!tokenService.getToken();
  },

  /**
   * Get token expiry time remaining (in seconds)
   */
  getTokenExpiryIn: () => {
    if (typeof window === 'undefined') return null;

    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return null;

    const remaining = parseInt(expiry) - Date.now();
    return remaining > 0 ? Math.floor(remaining / 1000) : null;
  },

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  isTokenExpiringSoon: () => {
    const expiryIn = tokenService.getTokenExpiryIn();
    return expiryIn !== null && expiryIn < 300; // 5 minutes
  },

  /**
   * Debug: Get all cookies
   */
  getAllCookies: () => {
    if (typeof window === 'undefined') return {};
    const cookies = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name) cookies[name] = decodeURIComponent(value || '');
    });
    return cookies;
  }
};