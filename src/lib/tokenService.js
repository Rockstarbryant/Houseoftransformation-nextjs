/**
 * Token Service - Manages JWT storage and retrieval
 * Works in browser only (client-side)
 */

const TOKEN_KEY = 'supabase_access_token';
const REFRESH_TOKEN_KEY = 'supabase_refresh_token';
const TOKEN_EXPIRY_KEY = 'supabase_token_expiry';
const ROLE_KEY = 'user_role';
const COOKIE_AUTH_TOKEN = 'auth_token';

// ===== SSR-SAFE CHECK =====
const isBrowser = () => typeof window !== 'undefined';

// ===== COOKIE HELPER FUNCTIONS =====
const setCookie = (name, value, days = 7) => {
  if (!isBrowser()) return;
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const cookieString = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
    document.cookie = cookieString;
  } catch (error) {
    console.error(`[TOKEN-SERVICE] ❌ Error setting cookie ${name}:`, error);
  }
};

const getCookie = (name) => {
  if (!isBrowser()) return null;
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
    console.error(`[TOKEN-SERVICE] ❌ Error getting cookie ${name}:`, error);
    return null;
  }
};

const deleteCookie = (name) => {
  if (!isBrowser()) return;
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  } catch (error) {
    console.error(`[TOKEN-SERVICE] ❌ Error deleting cookie ${name}:`, error);
  }
};

// ===== MAIN TOKEN SERVICE =====
const tokenService = {
  /**
   * Store access token
   */
  setToken: (token) => {
    if (!isBrowser() || !token) return;

    try {
      localStorage.setItem(TOKEN_KEY, token);
      setCookie(COOKIE_AUTH_TOKEN, token, 7);

      // Decode token to get expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, (payload.exp * 1000).toString());
      }

      // console.log('[TOKEN-SERVICE] ✅ Access token stored');
    } catch (e) {
      console.warn('[TOKEN-SERVICE] ⚠️ Could not decode token expiry:', e);
    }
  },

  /**
   * Get access token
   */
  getToken: () => {
    if (!isBrowser()) return null;

    const token = localStorage.getItem(TOKEN_KEY);

    // Check if token is expired
    if (token) {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (expiry && Date.now() > parseInt(expiry)) {
        // console.log('[TOKEN-SERVICE] ⚠️ Token expired, removing');
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
    if (!isBrowser() || !refreshToken) return;

    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      // console.log('[TOKEN-SERVICE] ✅ Refresh token stored');
    } catch (error) {
      console.error('[TOKEN-SERVICE] ❌ Error storing refresh token:', error);
    }
  },

  /**
   * Get refresh token
   */
  getRefreshToken: () => {
    if (!isBrowser()) return null;
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  },

  /**
   * Store user role
   */
  setRole: (role) => {
    if (!isBrowser()) return;
    
    try {
      const roleName = role?.name || role || 'user';
      localStorage.setItem(ROLE_KEY, roleName);
      setCookie(ROLE_KEY, roleName, 7);
      // console.log('[TOKEN-SERVICE] ✅ Role stored:', roleName);
    } catch (error) {
      console.error('[TOKEN-SERVICE] ❌ Error setting role:', error);
    }
  },

  /**
   * Get user role
   */
  getRole: () => {
    if (!isBrowser()) return null;
    
    try {
      const cookieRole = getCookie(ROLE_KEY);
      if (cookieRole) return cookieRole;
      
      return localStorage.getItem(ROLE_KEY);
    } catch (error) {
      return null;
    }
  },

  /**
   * Remove user role
   */
  removeRole: () => {
    if (!isBrowser()) return;
    
    try {
      deleteCookie(ROLE_KEY);
      localStorage.removeItem(ROLE_KEY);
      // console.log('[TOKEN-SERVICE] ✅ Role removed');
    } catch (error) {
      console.error('[TOKEN-SERVICE] ❌ Error removing role:', error);
    }
  },

  /**
   * Remove tokens (logout)
   */
  removeToken: () => {
    if (!isBrowser()) return;

    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      deleteCookie(COOKIE_AUTH_TOKEN);
      // console.log('[TOKEN-SERVICE] ✅ Tokens removed');
    } catch (error) {
      console.error('[TOKEN-SERVICE] ❌ Error removing tokens:', error);
    }
  },

  /**
   * Remove refresh token specifically
   */
  removeRefreshToken: () => {
    if (!isBrowser()) return;

    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      // console.log('[TOKEN-SERVICE] ✅ Refresh token removed');
    } catch (error) {
      console.error('[TOKEN-SERVICE] ❌ Error removing refresh token:', error);
    }
  },

  /**
   * Clear all authentication data
   */
  clearAll: () => {
    if (!isBrowser()) return;
    
    // console.log('[TOKEN-SERVICE] 🧹 Clearing all tokens and data...');
    
    try {
      tokenService.removeToken();
      tokenService.removeRefreshToken();
      tokenService.removeRole();
      
      // console.log('[TOKEN-SERVICE] ✅ All tokens cleared');
    } catch (error) {
      console.error('[TOKEN-SERVICE] ❌ Error clearing all:', error);
    }
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
    if (!isBrowser()) return null;

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
   * Get all cookies (for debugging)
   */
  getAllCookies: () => {
    if (!isBrowser()) return {};
    try {
      const cookies = {};
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name) cookies[name] = decodeURIComponent(value || '');
      });
      return cookies;
    } catch (error) {
      return {};
    }
  },

  /**
   * Verify cookies exist (for debugging)
   */
  verifyCookies: () => {
    if (!isBrowser()) return { authToken: false, userRole: false, bothSet: false };
    
    const authTokenExists = !!getCookie(COOKIE_AUTH_TOKEN);
    const userRoleExists = !!getCookie(ROLE_KEY);
    
    return {
      authToken: authTokenExists,
      userRole: userRoleExists,
      bothSet: authTokenExists && userRoleExists
    };
  }
};

// ✅ Named export (for destructuring)
export { tokenService };

// ✅ Default export (for default import)
export default tokenService;
