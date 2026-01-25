// app/portal/roles/page.jsx - PART 1: Imports, State, and Core Logic
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAvailablePermissions,
  assignRoleToUser,
  getUsersByRole,
  formatRoleDisplay
} from '@/services/api/roleService';
import Loader from '@/components/common/Loader';

/**
 * Roles Management Portal
 * Admin-only page for managing roles and permissions
 */
export default function RolesPage() {
  const { user } = useAuth();
  const { canManageRoles, isAdmin } = usePermissions();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Data state
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleUsers, setRoleUsers] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, system, custom
  const [expandedRoles, setExpandedRoles] = useState(new Set());

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRoles();
      
      if (response.success) {
        setRoles(response.roles || []);
      } else {
        setError('Failed to fetch roles');
      }
    } catch (err) {
      console.error('[Roles] Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await getAvailablePermissions();
      
      if (response.success) {
        setPermissions(response.permissions || []);
      }
    } catch (err) {
      console.error('[Roles] Fetch permissions error:', err);
    }
  };

  const fetchRoleUsers = async (roleId) => {
    try {
      setActionLoading(true);
      const response = await getUsersByRole(roleId);
      
      if (response.success) {
        setRoleUsers(response.users || []);
      }
    } catch (err) {
      console.error('[Roles] Fetch role users error:', err);
      setError('Failed to load users for this role');
    } finally {
      setActionLoading(false);
    }
  };

   // ============================================
  // PERMISSION CHECK
  // ============================================
  
  if (!canManageRoles()) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            You need permission to manage roles
          </p>
        </div>
      </div>
    );
  }


  // ============================================
  // CRUD HANDLERS
  // ============================================

  const handleCreateRole = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      
      const response = await createRole({
        name: formData.name.toLowerCase().trim(),
        description: formData.description.trim(),
        permissions: formData.permissions
      });

      if (response.success) {
        setSuccess('Role created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchRoles();
        
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Roles] Create error:', err);
      setError(err.response?.data?.message || 'Failed to create role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) return;

    try {
      setActionLoading(true);
      setError(null);
      
      const response = await updateRole(selectedRole._id, {
        description: formData.description,
        permissions: formData.permissions
      });

      if (response.success) {
        setSuccess('Role updated successfully!');
        setShowEditModal(false);
        setSelectedRole(null);
        resetForm();
        fetchRoles();
        
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Roles] Update error:', err);
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      setActionLoading(true);
      setError(null);
      
      const response = await deleteRole(selectedRole._id);

      if (response.success) {
        setSuccess('Role deleted successfully!');
        setShowDeleteModal(false);
        setSelectedRole(null);
        fetchRoles();
        
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Roles] Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete role');
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // UI HELPERS
  // ============================================

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const openUsersModal = async (role) => {
    setSelectedRole(role);
    setShowUsersModal(true);
    await fetchRoleUsers(role._id);
  };

  const togglePermission = (permKey) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permKey)
        ? prev.permissions.filter(p => p !== permKey)
        : [...prev.permissions, permKey]
    }));
  };

  const toggleRoleExpanded = (roleId) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };


  // ============================================
  // FILTERING & SEARCH
  // ============================================

  const filteredRoles = roles.filter(role => {
    // Search filter
    const matchesSearch = 
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    let matchesType = true;
    if (filterType === 'system') {
      matchesType = role.isSystemRole === true;
    } else if (filterType === 'custom') {
      matchesType = role.isSystemRole === false;
    }

    return matchesSearch && matchesType;
  });

  // Group permissions by category for UI
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    const category = perm.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(perm);
    return acc;
  }, {});

  // ============================================
  // LOADING STATE
  // ============================================
/*
  if (loading) {
    return <Loader fullScreen text="Loading roles..." />;
  }
*/
  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Roles & Permissions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage user roles and their permissions
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors"
        >
          <Plus size={20} />
          Create Role
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-800 dark:text-green-200 font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-800 dark:text-red-200 font-semibold">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
            />
          </div>

          {/* Filter by Type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="system">System Roles</option>
              <option value="custom">Custom Roles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
              Total Roles
            </h3>
            <Shield className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-black text-blue-900 dark:text-blue-100">
            {roles.length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-green-900 dark:text-green-200 uppercase tracking-wider">
              System Roles
            </h3>
            <Lock className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-black text-green-900 dark:text-green-100">
            {roles.filter(r => r.isSystemRole).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
              Custom Roles
            </h3>
            <Unlock className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-black text-purple-900 dark:text-purple-100">
            {roles.filter(r => !r.isSystemRole).length}
          </p>
        </div>
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Roles ({filteredRoles.length})
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-12 text-center">
            <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-semibold">
              No roles found
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRoles.map((role) => {
              const isExpanded = expandedRoles.has(role._id);
              const isDeletable = !role.isSystemRole;

              return (
                <div
                  key={role._id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {/* Role Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                            {role.name}
                          </h3>
                          
                          {role.isSystemRole && (
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full flex items-center gap-1">
                              <Lock size={12} />
                              System
                            </span>
                          )}
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                          {role.description || 'No description'}
                        </p>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Shield size={16} className="text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">
                              {role.permissions?.length || 0} permissions
                            </span>
                          </div>

                          <button
                            onClick={() => openUsersModal(role)}
                            className="flex items-center gap-2 text-[#8B1A1A] hover:text-red-700 font-semibold"
                          >
                            <Users size={16} />
                            View Users
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRoleExpanded(role._id)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        <button
                          onClick={() => openEditModal(role)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 rounded-lg transition-colors"
                          title="Edit Role"
                        >
                          <Edit size={20} />
                        </button>

                        {isDeletable && (
                          <button
                            onClick={() => openDeleteModal(role)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 rounded-lg transition-colors"
                            title="Delete Role"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Permissions */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                        Permissions ({role.permissions?.length || 0})
                      </h4>
                      
                      {role.permissions && role.permissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {role.permissions.map((perm) => (
                            <div
                              key={perm}
                              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                              <CheckCircle className="text-green-500" size={16} />
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {perm}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No permissions assigned
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Continued in Part 3 for Modals... */}
     


      {/* CREATE ROLE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#8B1A1A] rounded-lg flex items-center justify-center">
                    <Plus className="text-white" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Create New Role
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                    setError(null);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  disabled={actionLoading}
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateRole} className="p-6 space-y-6">
              {/* Role Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., content_manager"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                  disabled={actionLoading}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Use lowercase with underscores (e.g., content_manager)
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this role..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none resize-none"
                  disabled={actionLoading}
                />
              </div>

              {/* Permissions Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Permissions ({formData.permissions.length} selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, permissions: permissions.map(p => p.key) })}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      disabled={actionLoading}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, permissions: [] })}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                      disabled={actionLoading}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Group by Category */}
                <div className="space-y-4 max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category}>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Shield size={16} className="text-[#8B1A1A]" />
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 gap-2 ml-6">
                        {perms.map((perm) => (
                          <label
                            key={perm.key}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(perm.key)}
                              onChange={() => togglePermission(perm.key)}
                              className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                              disabled={actionLoading}
                            />
                            <div className="flex-1">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {perm.label}
                              </span>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {perm.key}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading || !formData.name.trim()}
                  className="flex-1 px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Create Role
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                    setError(null);
                  }}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Edit className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                      Edit {selectedRole.name}
                    </h2>
                    {selectedRole.isSystemRole && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        System role - only permissions can be modified
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRole(null);
                    resetForm();
                    setError(null);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  disabled={actionLoading}
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateRole} className="p-6 space-y-6">
              {/* Role Name (Read-only) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Role name cannot be changed
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this role..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none resize-none"
                  disabled={actionLoading || (selectedRole.isSystemRole && selectedRole.description)}
                />
              </div>

              {/* Permissions Selection (Same as Create) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Permissions ({formData.permissions.length} selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, permissions: permissions.map(p => p.key) })}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      disabled={actionLoading}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, permissions: [] })}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                      disabled={actionLoading}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category}>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Shield size={16} className="text-[#8B1A1A]" />
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 gap-2 ml-6">
                        {perms.map((perm) => (
                          <label
                            key={perm.key}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(perm.key)}
                              onChange={() => togglePermission(perm.key)}
                              className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                              disabled={actionLoading}
                            />
                            <div className="flex-1">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {perm.label}
                              </span>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {perm.key}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Update Role
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRole(null);
                    resetForm();
                    setError(null);
                  }}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Continued in Part 4 for Delete & Users Modals... */}
    

      {/* DELETE ROLE MODAL */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-lg flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Delete Role
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {selectedRole.isSystemRole ? (
                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-yellow-600" size={20} />
                    <div>
                      <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                        Cannot Delete System Role
                      </p>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                        System roles are protected and cannot be deleted.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-slate-700 dark:text-slate-300">
                    Are you sure you want to delete the role{' '}
                    <span className="font-bold capitalize">&quot;{selectedRole.name}&quot;</span>?
                  </p>

                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <strong>Warning:</strong> This role cannot be deleted if any users are currently assigned to it.
                      Make sure to reassign those users first.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              {!selectedRole.isSystemRole && (
                <button
                  onClick={handleDeleteRole}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={20} />
                      Delete Role
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRole(null);
                  setError(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USERS MODAL */}
      {showUsersModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Users className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                      Users with {selectedRole.name} Role
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {roleUsers.length} user{roleUsers.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUsersModal(false);
                    setSelectedRole(null);
                    setRoleUsers([]);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {actionLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-[#8B1A1A] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
                  </div>
                </div>
              ) : roleUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-semibold">
                    No users with this role
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roleUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-[#8B1A1A] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setShowUsersModal(false);
                  setSelectedRole(null);
                  setRoleUsers([]);
                }}
                className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}