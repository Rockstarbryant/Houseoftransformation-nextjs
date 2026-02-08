// src/services/api/userService.js - UPDATED with new endpoints
import api from '@/lib/api';

/**
 * User Service
 * Handles all user-related API calls
 * Updated with ban, delete, manual registration, and self-deletion
 */

// ============================================
// USER CRUD
// ============================================

/**
 * Get all users with pagination and filters
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 50)
 * @param {object} filters - { role, status, search }
 */
export const getAllUsers = async (page = 1, limit = 50, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    // Add filters if provided
    if (filters.role && filters.role !== 'all') {
      params.append('role', filters.role);
    }
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.search && filters.search.trim()) {
      params.append('search', filters.search.trim());
    }

    const response = await api.get(`/users?${params.toString()}`);
    
    return {
      success: true,
      users: response.data.users || [],
      total: response.data.total || 0,
      pages: response.data.pages || 1,
      currentPage: response.data.currentPage || 1,
      limit: response.data.limit || 50
    };
  } catch (error) {
    console.error('[UserService] Get all users error:', error);
    throw error;
  }
};

/**
 * Get single user by ID
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('[UserService] Get user error:', error);
    throw error;
  }
};

/**
 * Get current user's profile
 */
export const getMyProfile = async () => {
  try {
    const response = await api.get('/users/me/profile');
    return response.data;
  } catch (error) {
    console.error('[UserService] Get my profile error:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} data - { name, email, phone, bio, location, avatar, gender }
 */
export const updateUser = async (userId, data) => {
  try {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error('[UserService] Update user error:', error);
    throw error;
  }
};

/**
 * Update user role (Admin only)
 * @param {string} userId - User ID
 * @param {string} roleId - Role ObjectId (NOT role name)
 */
export const updateUserRole = async (userId, roleId) => {
  try {
    const response = await api.put(`/users/${userId}/role`, { 
      roleId
    });
    return response.data;
  } catch (error) {
    console.error('[UserService] Update user role error:', error);
    throw error;
  }
};

/**
 * Delete user (Admin only) - Hard delete from both MongoDB and Supabase
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('[UserService] Delete user error:', error);
    throw error;
  }
};

/**
 * Ban user permanently (Admin only)
 * @param {string} userId - User ID
 * @param {string} reason - Ban reason
 */
export const banUser = async (userId, reason) => {
  try {
    const response = await api.post(`/users/${userId}/ban`, { reason });
    return response.data;
  } catch (error) {
    console.error('[UserService] Ban user error:', error);
    throw error;
  }
};

/**
 * Manual user registration by admin
 * @param {object} userData - { name, email, phone, location, gender, roleId }
 */
export const manualRegisterUser = async (userData) => {
  try {
    const response = await api.post('/users/manual-register', userData);
    return response.data;
  } catch (error) {
    console.error('[UserService] Manual register error:', error);
    throw error;
  }
};

/**
 * User self-deletion (delete own account)
 * @param {string} password - User's password for verification (optional for OAuth users)
 */
export const deleteSelfAccount = async (password) => {
  try {
    // Build request body - only include password if provided
    const requestData = password ? { password } : {};
    
    const response = await api.delete('/users/me/delete-account', {
      data: requestData
    });
    
    return response.data;
  } catch (error) {
    console.error('[UserService] Self delete error:', error);
    throw error;
  }
};

/**
 * Check if email or IP is banned
 * @param {string} email - Email to check
 */
export const checkBanStatus = async (email) => {
  try {
    const response = await api.post('/users/check-ban', { email });
    return response.data;
  } catch (error) {
    console.error('[UserService] Check ban error:', error);
    throw error;
  }
};

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Bulk update roles for multiple users
 * @param {array} userIds - Array of user IDs
 * @param {string} roleId - Role ObjectId (NOT role name)
 */
export const bulkUpdateRoles = async (userIds, roleId) => {
  try {
    const response = await api.post('/users/bulk/role-update', {
      userIds,
      role: roleId
    });
    return response.data;
  } catch (error) {
    console.error('[UserService] Bulk update roles error:', error);
    throw error;
  }
};

/**
 * Send bulk notification to users
 * @param {string} roleFilter - 'all' or role name filter
 * @param {string} message - Notification message
 */
export const sendBulkNotification = async (roleFilter, message) => {
  try {
    const response = await api.post('/users/notifications/send', {
      role: roleFilter,
      message
    });
    return response.data;
  } catch (error) {
    console.error('[UserService] Send notification error:', error);
    throw error;
  }
};

// ============================================
// SEARCH & FILTER
// ============================================

/**
 * Search users by name or email
 * @param {string} query - Search query
 */
export const searchUsers = async (query) => {
  try {
    if (!query || query.length < 2) {
      return { success: true, users: [] };
    }

    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('[UserService] Search users error:', error);
    throw error;
  }
};

/**
 * Get users by role
 * @param {string} roleName - Role name (string)
 */
export const getUsersByRole = async (roleName) => {
  try {
    const response = await api.get(`/users/role/${roleName}`);
    return response.data;
  } catch (error) {
    console.error('[UserService] Get users by role error:', error);
    throw error;
  }
};

// ============================================
// STATISTICS
// ============================================

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  try {
    const response = await api.get('/users/stats');
    return response.data;
  } catch (error) {
    console.error('[UserService] Get stats error:', error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format user for display
 */
export const formatUserDisplay = (user) => {
  if (!user) return null;

  return {
    id: user._id,
    name: user.name || 'Unknown User',
    email: user.email || 'No email',
    phone: user.phone || 'No phone',
    avatar: user.avatar || null,
    gender: user.gender || null,
    initials: user.name ? user.name.charAt(0).toUpperCase() : 'U',
    role: user.role ? {
      id: user.role._id || user.role,
      name: user.role.name || 'member',
      displayName: user.role.name 
        ? user.role.name.charAt(0).toUpperCase() + user.role.name.slice(1)
        : 'Member'
    } : null,
    isActive: user.isActive !== false,
    isBanned: user.isBanned || false,
    joinedDate: user.createdAt 
      ? new Date(user.createdAt).toLocaleDateString()
      : 'Unknown',
    location: user.location || null,
    bio: user.bio || null
  };
};

/**
 * Validate user data before update
 */
export const validateUserData = (data) => {
  const errors = {};

  if (data.email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.name && data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (data.phone && data.phone.trim() && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
    errors.phone = 'Invalid phone format';
  }

  if (data.gender && !['male', 'female'].includes(data.gender)) {
    errors.gender = 'Gender must be either male or female';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Export users to CSV
 */
export const exportUsersToCSV = (users) => {
  if (!users || users.length === 0) {
    return null;
  }

  const headers = ['Name', 'Email', 'Role', 'Gender', 'Phone', 'Status', 'Joined Date'];
  const rows = users.map(user => {
    const formatted = formatUserDisplay(user);
    return [
      formatted.name,
      formatted.email,
      formatted.role?.displayName || 'Member',
      formatted.gender || 'N/A',
      formatted.phone || 'N/A',
      formatted.isActive ? 'Active' : 'Inactive',
      formatted.joinedDate
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent, filename = 'users-export.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};