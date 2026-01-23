// src/services/api/roleService.js
import api from '@/lib/api';

/**
 * Role Service
 * Handles all role-related API calls
 */

// ============================================
// ROLE CRUD
// ============================================

export const getAllRoles = async () => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    console.error('[RoleService] Get all roles error:', error);
    throw error;
  }
};

export const getRoleById = async (roleId) => {
  try {
    const response = await api.get(`/roles/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('[RoleService] Get role error:', error);
    throw error;
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await api.post('/roles', roleData);
    return response.data;
  } catch (error) {
    console.error('[RoleService] Create role error:', error);
    throw error;
  }
};

export const updateRole = async (roleId, updates) => {
  try {
    const response = await api.patch(`/roles/${roleId}`, updates);
    return response.data;
  } catch (error) {
    console.error('[RoleService] Update role error:', error);
    throw error;
  }
};

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
// PERMISSIONS - FIXED
// ============================================

export const getAvailablePermissions = async () => {
  try {
    const response = await api.get('/roles/permissions/list');
    
    if (response.data.success && response.data.permissions) {
      // Backend returns: { all: [...], grouped: {...} }
      // Convert to array format expected by frontend
      const permissionsArray = response.data.permissions.all.map(perm => ({
        key: perm,
        label: formatPermissionLabel(perm),
        category: categorizePermission(perm)
      }));
      
      return {
        success: true,
        permissions: permissionsArray
      };
    }
    
    return { success: false, permissions: [] };
  } catch (error) {
    console.error('[RoleService] Get permissions error:', error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatPermissionLabel = (perm) => {
  return perm
    .split(':')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' > ');
};

const categorizePermission = (perm) => {
  if (perm.startsWith('manage:')) return 'Broad Permissions';
  if (perm.includes('campaign')) return 'Campaigns';
  if (perm.includes('pledge')) return 'Pledges';
  if (perm.includes('payment')) return 'Payments';
  if (perm.includes('donation')) return 'Donations';
  if (perm.includes('feedback')) return 'Feedback';
  if (perm.includes('event')) return 'Events';
  if (perm.includes('sermon')) return 'Sermons';
  if (perm.includes('gallery')) return 'Gallery';
  if (perm.includes('user')) return 'Users';
  if (perm.includes('role')) return 'Roles';
  if (perm.includes('blog')) return 'Blog';
  if (perm.includes('livestream')) return 'Livestream';
  if (perm.includes('volunteer')) return 'Volunteers';
  if (perm.includes('analytics') || perm.includes('audit')) return 'Analytics';
  return 'Other';
};

export const canDeleteRole = (role) => {
  return role && !role.isSystemRole;
};

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