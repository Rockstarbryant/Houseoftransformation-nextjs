/**
 * Token Service - Manages JWT storage and retrieval
 * Works in browser only (client-side)
 */

const TOKEN_KEY = 'supabase_access_token';
const REFRESH_TOKEN_KEY = 'supabase_refresh_token';
const TOKEN_EXPIRY_KEY = 'supabase_token_expiry';

export const tokenService = {
  /**
   * Store access token
   */
  setToken: (token) => {
    if (typeof window === 'undefined') return; // SSR guard
    if (!token) return;

    localStorage.setItem(TOKEN_KEY, token);

    // Decode token to get expiry (optional)
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
   * Get access token
   */
  getToken: () => {
    if (typeof window === 'undefined') return null; // SSR guard

    const token = localStorage.getItem(TOKEN_KEY);

    // Check if token is expired
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
    if (typeof window === 'undefined') return; // SSR guard
    if (!refreshToken) return;

    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    console.log('[TOKEN-SERVICE] Refresh token stored');
  },

  /**
   * Get refresh token
   */
  getRefreshToken: () => {
    if (typeof window === 'undefined') return null; // SSR guard
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Remove tokens (logout)
   */
  removeToken: () => {
    if (typeof window === 'undefined') return; // SSR guard

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    console.log('[TOKEN-SERVICE] Tokens removed');
  },

  /**
   * Remove refresh token specifically
   */
  removeRefreshToken: () => {
    if (typeof window === 'undefined') return; // SSR guard

    localStorage.removeItem(REFRESH_TOKEN_KEY);
    console.log('[TOKEN-SERVICE] Refresh token removed');
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
    if (typeof window === 'undefined') return null; // SSR guard

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
  }
};