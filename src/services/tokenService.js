/**
 * Token Service - Manages JWT storage and retrieval
 * SSR-safe implementation
 */

const TOKEN_KEY = 'supabase_access_token';
const REFRESH_TOKEN_KEY = 'supabase_refresh_token';
const TOKEN_EXPIRY_KEY = 'supabase_token_expiry';
const ROLE_KEY = 'user_role';
const COOKIE_AUTH_TOKEN = 'auth_token';

// ===== SSR-SAFE CHECK =====
const isBrowser = () => typeof window !== 'undefined';

// ===== JWT VALIDATION HELPER =====
const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload to verify it's valid JSON
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has expiry
    if (!payload.exp) return false;
    
    // Check if token is expired
    const expiryTime = payload.exp * 1000;
    if (Date.now() >= expiryTime) {
      console.log('[TOKEN-SERVICE] ⚠️ Token expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[TOKEN-SERVICE] ❌ Invalid JWT format:', error);
    return false;
  }
};

// ===== COOKIE HELPER FUNCTIONS =====
const setCookie = (name, value, days = 7) => {
  if (!isBrowser()) return;
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    
    const cookieString = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
    document.cookie = cookieString;
    
    console.log(`[TOKEN-SERVICE] ✅ Cookie SET: ${name}`);
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
        const value = decodeURIComponent(cookie.substring(nameEQ.length));
        return value;
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
    const cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    document.cookie = cookieString;
    console.log(`[TOKEN-SERVICE] ✅ Cookie DELETED: ${name}`);
  } catch (error) {
    console.error(`[TOKEN-SERVICE] ❌ Error deleting cookie ${name}:`, error);
  }
};

// ===== MAIN TOKEN SERVICE =====
export const tokenService = {
  setToken: (token) => {
    if (!isBrowser() || !token) return;

    try {
      // ✅ Validate token before storing
      if (!isValidJWT(token)) {
        console.error('[TOKEN-SERVICE] ❌ Attempted to store invalid token');
        return;
      }

      localStorage.setItem(TOKEN_KEY, token);
      setCookie(COOKIE_AUTH_TOKEN, token, 7);

      // Decode and store expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        const expiryTime = payload.exp * 1000;
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
    } catch (e) {
      console.warn('[TOKEN-SERVICE] ⚠️ Error storing token:', e);
    }
  },

  getToken: () => {
    if (!isBrowser()) return null;

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;

      // ✅ Validate JWT structure and expiry
      if (!isValidJWT(token)) {
        console.log('[TOKEN-SERVICE] ⚠️ Token invalid or expired, removing...');
        tokenService.removeToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('[TOKEN-SERVICE] Error getting token:', error);
      tokenService.removeToken();
      return null;
    }
  },

  setRefreshToken: (refreshToken) => {
    if (!isBrowser() || !refreshToken) return;
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('[TOKEN-SERVICE] Error setting refresh token:', error);
    }
  },

  getRefreshToken: () => {
    if (!isBrowser()) return null;
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  },

  setRole: (role) => {
    if (!isBrowser()) return;
    
    try {
      const roleName = role?.name || role || 'user';
      localStorage.setItem(ROLE_KEY, roleName);
      setCookie(ROLE_KEY, roleName, 7);
    } catch (error) {
      console.error('[TOKEN-SERVICE] Error setting role:', error);
    }
  },

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

  removeRole: () => {
    if (!isBrowser()) return;
    try {
      deleteCookie(ROLE_KEY);
      localStorage.removeItem(ROLE_KEY);
    } catch (error) {
      console.error('[TOKEN-SERVICE] Error removing role:', error);
    }
  },

  removeToken: () => {
    if (!isBrowser()) return;

    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      deleteCookie(COOKIE_AUTH_TOKEN);
    } catch (error) {
      console.error('[TOKEN-SERVICE] Error removing token:', error);
    }
  },

  removeRefreshToken: () => {
    if (!isBrowser()) return;
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('[TOKEN-SERVICE] Error removing refresh token:', error);
    }
  },

  clearAll: () => {
    if (!isBrowser()) return;
    tokenService.removeToken();
    tokenService.removeRefreshToken();
    tokenService.removeRole();
  },

  isAuthenticated: () => {
    return !!tokenService.getToken();
  },

  // ✅ Enhanced expiry check
  getTokenExpiryIn: () => {
    if (!isBrowser()) return null;

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;

      // Decode token to get expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return null;

      const remaining = (payload.exp * 1000) - Date.now();
      return remaining > 0 ? Math.floor(remaining / 1000) : null;
    } catch (error) {
      return null;
    }
  },

  isTokenExpiringSoon: () => {
    const expiryIn = tokenService.getTokenExpiryIn();
    return expiryIn !== null && expiryIn < 300; // 5 minutes
  },

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