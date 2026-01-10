/**
 * Secure token service using sessionStorage
 * Tokens are NOT persisted across browser restarts (security best practice)
 */

export const tokenService = {
  /**
   * Store raw token string in sessionStorage (memory-based, cleared on browser close)
   */
  setToken(token) {
    if (!token) return false;
    try {
      // Store as raw string (not JSON)
      sessionStorage.setItem('authToken', token);
      return true;
    } catch (error) {
      console.error('Error storing token:', error);
      return false;
    }
  },

  /**
   * Get raw token string from sessionStorage
   */
  getToken() {
    try {
      const token = sessionStorage.getItem('authToken');
      return token; // Return raw string, not parsed
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  /**
   * Remove token from sessionStorage
   */
  removeToken() {
    try {
      sessionStorage.removeItem('authToken');
      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  },

  /**
   * Check if token exists
   */
  hasToken() {
    return !!this.getToken();
  },

  /**
   * Check if token is expired (basic JWT expiry check)
   */
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const decoded = JSON.parse(atob(parts[1]));
      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      return expiryTime < Date.now();
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  },

  /**
   * Clear all auth data
   */
  clearAuth() {
    this.removeToken();
  }
};

export default tokenService;