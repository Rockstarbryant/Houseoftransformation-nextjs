import api from './authService';

const API_BASE = import.meta.env.VITE_API_URL || 'https://house-of-transformation.onrender.com/api';

export const userService = {
  /**
   * Get all users with pagination
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Items per page (default: 50)
   * @param {object} filters - { role, status, search }
   */
  getAllUsers: async (page = 1, limit = 50, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(filters.role && filters.role !== 'all' && { role: filters.role }),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status })
      });

      const response = await api.get(`/users?${params.toString()}`);
      return {
        success: true,
        users: response.data.users || [],
        total: response.data.total || 0,
        pages: response.data.pages || 1,
        currentPage: response.data.currentPage || 1
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        users: [],
        total: 0
      };
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Update user profile
   */
  updateUser: async (userId, data) => {
    try {
      const response = await api.put(`/users/${userId}`, data);
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Update single user role
   */
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/users/${userId}/role`, { role });
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error updating role:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Bulk update roles for multiple users
   */
  bulkUpdateRoles: async (userIds, role) => {
    try {
      const response = await api.post(`/users/bulk/role-update`, {
        userIds,
        role
      });
      return {
        success: true,
        message: response.data.message,
        updatedCount: response.data.updatedCount
      };
    } catch (error) {
      console.error('Error bulk updating roles:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Update user active status
   */
  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await api.put(`/users/${userId}`, { isActive });
      return {
        success: true,
        user: response.data.user,
        message: isActive ? 'User reactivated' : 'User deactivated'
      };
    } catch (error) {
      console.error('Error updating status:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Search users
   */
  searchUsers: async (query, limit = 10) => {
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      return {
        success: true,
        users: response.data.users || []
      };
    } catch (error) {
      console.error('Error searching users:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        users: []
      };
    }
  },

  /**
   * Get users by role
   */
  getUsersByRole: async (role) => {
    try {
      const response = await api.get(`/users/role/${role}`);
      return {
        success: true,
        users: response.data.users || []
      };
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        users: []
      };
    }
  },

  /**
   * Send bulk notification to users by role
   */
  sendBulkNotification: async (role, message) => {
    try {
      const response = await api.post(`/users/notifications/send`, {
        role,
        message
      });
      return {
        success: true,
        message: response.data.message,
        sentCount: response.data.sentCount
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get user statistics
   */
  getStats: async () => {
    try {
      const response = await api.get(`/users/stats`);
      return {
        success: true,
        stats: response.data.stats
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        success: false,
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          byRole: {}
        }
      };
    }
  }
};

export default userService;