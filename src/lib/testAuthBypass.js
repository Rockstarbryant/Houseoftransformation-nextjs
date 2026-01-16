// src/lib/testAuthBypass.js
// Only for LOCAL TESTING - DELETE BEFORE PRODUCTION

/**
 * Mock user for testing portal without authentication
 * Only works on localhost
 */
const MOCK_ADMIN_USER = {
  id: '64690edf3045cf433b1586c9',
  supabase_uid: 'test-admin-123',
  name: 'Admin Test User',
  email: 'admin@test.local',
  avatar: null,
  role: {
    id: '69690ede3045cf433b1586c9',
    name: 'admin',
    description: 'Full system access - Can manage everything',
    permissions: [
      'manage:events',
      'manage:sermons',
      'manage:gallery',
      'manage:donations',
      'manage:users',
      'manage:roles',
      'manage:blog',
      'manage:livestream',
      'manage:feedback',
      'manage:volunteers',
      'view:analytics',
      'view:audit_logs',
      'manage:settings'
    ],
    isSystemRole: true
  }
};

const MOCK_PASTOR_USER = {
  id: '64690edf3045cf433b1586ca',
  supabase_uid: 'test-pastor-123',
  name: 'Pastor Test User',
  email: 'pastor@test.local',
  avatar: null,
  role: {
    id: '69690ee03045cf433b1586ce',
    name: 'pastor',
    description: 'Pastor - Can manage sermons and events',
    permissions: [
      'manage:sermons',
      'manage:events',
      'view:analytics'
    ],
    isSystemRole: false
  }
};

const MOCK_MEMBER_USER = {
  id: '64690edf3045cf433b1586cb',
  supabase_uid: 'test-member-123',
  name: 'Member Test User',
  email: 'member@test.local',
  avatar: null,
  role: {
    id: '69690edf3045cf433b1586cb',
    name: 'member',
    description: 'Default member role - No special permissions',
    permissions: [],
    isSystemRole: true
  }
};

export const testAuthBypass = {
  /**
   * Check if running on localhost
   */
  isLocalhost: () => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );
  },

  /**
   * Get mock user based on role
   * @param {string} role - 'admin', 'pastor', or 'member'
   */
  getMockUser: (role = 'admin') => {
    const users = {
      admin: MOCK_ADMIN_USER,
      pastor: MOCK_PASTOR_USER,
      member: MOCK_MEMBER_USER
    };
    return users[role] || MOCK_ADMIN_USER;
  },

  /**
   * Set mock user in localStorage
   */
  setMockAuth: (role = 'admin') => {
    if (!testAuthBypass.isLocalhost()) {
      console.warn('❌ Test auth bypass only works on localhost!');
      return false;
    }

    const mockUser = testAuthBypass.getMockUser(role);
    const mockToken = `test-token-${role}-${Date.now()}`;

    localStorage.setItem('supabase_access_token', mockToken);
    localStorage.setItem('__MOCK_USER__', JSON.stringify(mockUser));

    console.log(`✅ Mock ${role} auth set in localStorage`);
    return true;
  },

  /**
   * Clear mock auth
   */
  clearMockAuth: () => {
    localStorage.removeItem('supabase_access_token');
    localStorage.removeItem('__MOCK_USER__');
    console.log('✅ Mock auth cleared');
  },

  /**
   * Get mock user from localStorage
   */
  getMockUserFromStorage: () => {
    const stored = localStorage.getItem('__MOCK_USER__');
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * Check if using mock auth
   */
  isUsingMockAuth: () => {
    return localStorage.getItem('__MOCK_USER__') !== null;
  }
};

export default testAuthBypass;