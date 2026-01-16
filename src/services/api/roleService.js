// src/services/api/roleService.js
import api from '@/lib/api';

/**
 * Role Service
 * Handles all role-related API calls
 */

// ============================================
// ROLE CRUD
// ============================================

/**
 * Get all roles
 */
export const getAllRoles = async () => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    console.error('[RoleService] Get all roles error:', error);
    throw error;
  }
};

/**
 * Get single role by ID
 */
export const getRoleById = async (roleId) => {
  try {
    const response = await api.get(`/roles/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('[RoleService] Get role error:', error);
    throw error;
  }
};

/**
 * Create new role
 */
export const createRole = async (roleData) => {
  try {
    const response = await api.post('/roles', roleData);
    return response.data;
  } catch (error) {
    console.error('[RoleService] Create role error:', error);
    throw error;
  }
};

/**
 * Update role (permissions + description)
 */
export const updateRole = async (roleId, updates) => {
  try {
    const response = await api.patch(`/roles/${roleId}`, updates);
    return response.data;
  } catch (error) {
    console.error('[RoleService] Update role error:', error);
    throw error;
  }
};

/**
 * Delete role
 */
export const deleteRole = async (roleId) => {
  try {
    const response = await api.delete(`/roles/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('[RoleService] Delete role error:', error);
    throw error;
  }
};

// ============================================
// USER ASSIGNMENT
// ============================================

/**
 * Assign role to single user
 */
export const assignRoleToUser = async (userId, roleId) => {
  try {
    const response = await api.patch('/roles/assign-user', {
      userId,
      roleId
    });
    return response.data;
  } catch (error) {
    console.error('[RoleService] Assign role error:', error);
    throw error;
  }
};

/**
 * Bulk assign role to multiple users
 */
export const bulkAssignRole = async (userIds, roleId) => {
  try {
    const response = await api.post('/roles/bulk-assign', {
      userIds,
      roleId
    });
    return response.data;
  } catch (error) {
    console.error('[RoleService] Bulk assign error:', error);
    throw error;
  }
};

/**
 * Get users by role ID
 */
export const getUsersByRole = async (roleId, page = 1, limit = 50) => {
  try {
    const response = await api.get(`/roles/${roleId}/users`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('[RoleService] Get users by role error:', error);
    throw error;
  }
};

/**
 * Get user with role
 */
export const getUserWithRole = async (userId) => {
  try {
    const response = await api.get(`/roles/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('[RoleService] Get user with role error:', error);
    throw error;
  }
};

// ============================================
// PERMISSIONS
// ============================================

/**
 * Get all available permissions (for UI)
 */
export const getAvailablePermissions = async () => {
  try {
    const response = await api.get('/roles/permissions/list');
    return response.data;
  } catch (error) {
    console.error('[RoleService] Get permissions error:', error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if role is deletable
 */
export const canDeleteRole = (role) => {
  return role && !role.isSystemRole;
};

/**
 * Format role for display
 */
export const formatRoleDisplay = (role) => {
  if (!role) return null;
  
  return {
    id: role._id,
    name: role.name,
    displayName: role.name.charAt(0).toUpperCase() + role.name.slice(1),
    description: role.description || `${role.name} role`,
    permissions: role.permissions || [],
    permissionCount: role.permissions?.length || 0,
    isSystemRole: role.isSystemRole || false,
    isDeletable: !role.isSystemRole,
    createdAt: role.createdAt
  };
};

/**
 * Group permissions by category
 */
export const groupPermissionsByCategory = (permissions) => {
  const grouped = {};
  
  permissions.forEach(perm => {
    const category = perm.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(perm);
  });
  
  return grouped;
};