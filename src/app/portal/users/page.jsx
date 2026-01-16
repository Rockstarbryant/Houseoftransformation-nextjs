// app/portal/users/page.jsx - PART 1: Imports, State & Permission Check
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Users, UserPlus, Edit, Trash2, Shield, Search, Filter, Download, Mail, Phone, MapPin, Calendar,
  CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  MoreVertical, Eye, UserCog, RefreshCw, List, Grid, Check, X
} from 'lucide-react';
import {
  getAllUsers, getUserById, updateUser, updateUserRole, deleteUser,
  bulkUpdateRoles, getUserStats, exportUsersToCSV, downloadCSV, formatUserDisplay
} from '@/services/api/userService';
import { getAllRoles } from '@/services/api/roleService';
import Loader from '@/components/common/Loader';

/**
 * Users Management Portal
 * Admin page for managing all system users
 * Features: View, Edit, Delete, Role Assignment, Bulk Operations, Export
 */
export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { canManageUsers, isAdmin } = usePermissions();

  // ============================================
  // DATA STATE
  // ============================================
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, byRole: {} });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  // ============================================
  // UI STATE
  // ============================================
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // ============================================
  // PAGINATION STATE
  // ============================================
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // ============================================
  // FILTER STATE
  // ============================================
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all'
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ============================================
  // MODAL STATE
  // ============================================
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);

  // ============================================
  // FORM STATE
  // ============================================
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', location: '', bio: '', avatar: ''
  });
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // ============================================
  // PERMISSION CHECK
  // ============================================
  if (!canManageUsers()) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">You don't have permission to manage users</p>
        </div>
      </div>
    );
  }

  // ============================================
  // DEBOUNCE SEARCH
  // ============================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // ============================================
  // DATA FETCHING
  // ============================================
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, debouncedSearch, filters.role, filters.status]);

  useEffect(() => {
    fetchRoles();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllUsers(currentPage, itemsPerPage, {
        search: debouncedSearch,
        role: filters.role,
        status: filters.status
      });

      if (response.success) {
        setUsers(response.users || []);
        setTotalPages(response.pages || 1);
        setTotalUsers(response.total || 0);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      console.error('[Users] Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getAllRoles();
      if (response.success) {
        setRoles(response.roles || []);
      }
    } catch (err) {
      console.error('[Users] Fetch roles error:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getUserStats();
      if (response.success) {
        setStats(response.stats || { total: 0, active: 0, inactive: 0, byRole: {} });
      }
    } catch (err) {
      console.error('[Users] Fetch stats error:', err);
    }
  };

  

  // ============================================
  // CRUD HANDLERS
  // ============================================

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await updateUser(selectedUser._id, {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio
      });

      if (response.success) {
        setSuccess('User updated successfully!');
        setShowEditModal(false);
        setSelectedUser(null);
        resetForm();
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Users] Update error:', err);
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedRoleId) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await updateUserRole(selectedUser._id, selectedRoleId);

      if (response.success) {
        setSuccess(`Role updated successfully!`);
        setShowRoleModal(false);
        setSelectedUser(null);
        setSelectedRoleId('');
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Users] Update role error:', err);
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkUpdateRoles = async (e) => {
    e.preventDefault();
    if (selectedUsers.size === 0 || !selectedRoleId) return;

    try {
      setActionLoading(true);
      setError(null);

      const userIds = Array.from(selectedUsers);
      const response = await bulkUpdateRoles(userIds, selectedRoleId);

      if (response.success) {
        setSuccess(`${response.updatedCount} user(s) updated successfully!`);
        setShowBulkRoleModal(false);
        setSelectedUsers(new Set());
        setSelectedRoleId('');
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Users] Bulk update error:', err);
      setError(err.response?.data?.message || 'Failed to update users');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await deleteUser(selectedUser._id);

      if (response.success) {
        setSuccess('User deleted successfully!');
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Users] Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // SELECTION HANDLERS
  // ============================================

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u._id)));
    }
  };

  const isAllSelected = users.length > 0 && selectedUsers.size === users.length;
  const isSomeSelected = selectedUsers.size > 0 && selectedUsers.size < users.length;

  // ============================================
  // MODAL HANDLERS
  // ============================================

  const openViewModal = async (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      avatar: user.avatar || ''
    });
    setShowEditModal(true);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRoleId(user.role?._id || user.role || '');
    setShowRoleModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openBulkRoleModal = () => {
    if (selectedUsers.size === 0) {
      setError('Please select at least one user');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setSelectedRoleId('');
    setShowBulkRoleModal(true);
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', location: '', bio: '', avatar: '' });
  };

  const handleExport = () => {
    try {
      const csv = exportUsersToCSV(users);
      if (csv) {
        const timestamp = new Date().toISOString().split('T')[0];
        downloadCSV(csv, `users-export-${timestamp}.csv`);
        setSuccess('Users exported successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('No users to export');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('[Users] Export error:', err);
      setError('Failed to export users');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setSelectedUsers(new Set());
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    setSelectedUsers(new Set());
  };

  const clearFilters = () => {
    setFilters({ search: '', role: 'all', status: 'all' });
    setCurrentPage(1);
    setSelectedUsers(new Set());
  };

  const getRoleName = (role) => {
    if (!role) return 'Member';
    if (typeof role === 'string') return role.charAt(0).toUpperCase() + role.slice(1);
    return role.name ? role.name.charAt(0).toUpperCase() + role.name.slice(1) : 'Member';
  };

  const getRoleColor = (roleName) => {
    const colors = {
      admin: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      bishop: 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      pastor: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      volunteer: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      member: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    };
    return colors[roleName?.toLowerCase()] || colors.member;
  };

  // ============================================
  // PAGINATION COMPONENT
  // ============================================

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
          <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalUsers)}</span> of{' '}
          <span className="font-semibold">{totalUsers}</span> users
        </p>
        
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#8B1A1A]"
        >
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsLeft size={20} />
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, idx) => {
            const page = idx + 1;
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === page
                      ? 'bg-[#8B1A1A] text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="px-2">...</span>;
            }
            return null;
          })}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsRight size={20} />
        </button>
      </div>
    </div>
  );

  

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && users.length === 0) {
    return <Loader fullScreen text="Loading users..." />;
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage all system users and their roles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Export CSV
          </button>

          {selectedUsers.size > 0 && (
            <button
              onClick={openBulkRoleModal}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserCog size={20} />
              Bulk Update ({selectedUsers.size})
            </button>
          )}
        </div>
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

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">Total Users</h3>
            <Users className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{stats.total}</p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">All registered users</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-green-900 dark:text-green-200 uppercase tracking-wider">Active</h3>
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-black text-green-900 dark:text-green-100">{stats.active}</p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-orange-900 dark:text-orange-200 uppercase tracking-wider">Inactive</h3>
            <XCircle className="text-orange-600" size={24} />
          </div>
          <p className="text-3xl font-black text-orange-900 dark:text-orange-100">{stats.inactive}</p>
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
            {stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% of total
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider">Admins</h3>
            <Shield className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-black text-purple-900 dark:text-purple-100">{stats.byRole?.admin || 0}</p>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">System administrators</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h2>
          {(filters.search || filters.role !== 'all' || filters.status !== 'all') && (
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-[#8B1A1A] hover:text-red-700 flex items-center gap-2"
            >
              <X size={16} />
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>{role.name.charAt(0).toUpperCase() + role.name.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Mode Toggle & Selection Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedUsers.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <CheckCircle className="text-blue-600" size={20} />
              <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedUsers(new Set())}
                className="text-blue-600 hover:text-blue-700"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-400">
            {totalUsers} total user{totalUsers !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Grid size={20} />
          </button>
        </div>
      </div>

      {/* Loading State for Filters */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-[#8B1A1A] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
          </div>
        </div>
      )}

      

      {/* Users Display */}
      {!loading && users.length === 0 ? (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-12 text-center">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-semibold">No users found</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <>
          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isSomeSelected;
                          }}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {users.map((user) => {
                      const isSelected = selectedUsers.has(user._id);
                      const roleName = getRoleName(user.role);

                      return (
                        <tr
                          key={user._id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectUser(user._id)}
                              className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#8B1A1A] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">
                                  {user.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">
                                  {user.name}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm space-y-1">
                              {user.phone && (
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                  <Phone size={14} />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                              {user.location && (
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                  <MapPin size={14} />
                                  <span>{user.location}</span>
                                </div>
                              )}
                              {!user.phone && !user.location && (
                                <span className="text-slate-400">No contact info</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getRoleColor(roleName)}`}>
                              <Shield size={12} />
                              {roleName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {user.isActive !== false ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                                <CheckCircle size={12} />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold">
                                <XCircle size={12} />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Calendar size={14} />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openViewModal(user)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => openRoleModal(user)}
                                className="p-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 rounded-lg transition-colors"
                                title="Change Role"
                              >
                                <Shield size={18} />
                              </button>
                              {user._id !== currentUser?._id && (
                                <button
                                  onClick={() => openDeleteModal(user)}
                                  className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <PaginationControls />
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map((user) => {
                  const isSelected = selectedUsers.has(user._id);
                  const roleName = getRoleName(user.role);

                  return (
                    <div
                      key={user._id}
                      className={`bg-white dark:bg-slate-800 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-[#8B1A1A] shadow-lg'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectUser(user._id)}
                            className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                          />
                          <div className="relative group">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                              <MoreVertical size={20} />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button
                                onClick={() => openViewModal(user)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 rounded-t-lg"
                              >
                                <Eye size={16} />
                                View Details
                              </button>
                              <button
                                onClick={() => openEditModal(user)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                              >
                                <Edit size={16} />
                                Edit User
                              </button>
                              <button
                                onClick={() => openRoleModal(user)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                              >
                                <Shield size={16} />
                                Change Role
                              </button>
                              {user._id !== currentUser?._id && (
                                <button
                                  onClick={() => openDeleteModal(user)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 flex items-center gap-2 rounded-b-lg"
                                >
                                  <Trash2 size={16} />
                                  Delete User
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="w-20 h-20 bg-[#8B1A1A] rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-white font-bold text-2xl">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                            {user.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Role</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleColor(roleName)}`}>
                            {roleName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</span>
                          {user.isActive !== false ? (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold">
                              Inactive
                            </span>
                          )}
                        </div>

                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Phone size={14} />
                            <span className="truncate">{user.phone}</span>
                          </div>
                        )}

                        {user.location && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <MapPin size={14} />
                            <span className="truncate">{user.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <Calendar size={12} />
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <PaginationControls />
              </div>
            </>
          )}
        </>
      )}

     

      {/* VIEW USER MODAL */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#8B1A1A] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedUser.name}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      User Profile Details
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-center gap-4">
                {selectedUser.isActive !== false ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded-lg font-bold">
                    <CheckCircle size={20} />
                    Active User
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-bold">
                    <XCircle size={20} />
                    Inactive User
                  </span>
                )}
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold border ${getRoleColor(getRoleName(selectedUser.role))}`}>
                  <Shield size={20} />
                  {getRoleName(selectedUser.role)}
                </span>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail size={16} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white break-all">
                    {selectedUser.email}
                  </p>
                </div>

                {/* Phone */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone size={16} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Phone</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedUser.phone || 'Not provided'}
                  </p>
                </div>

                {/* Location */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Location</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedUser.location || 'Not provided'}
                  </p>
                </div>

                {/* Joined Date */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Joined</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Bio</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedUser.bio}
                  </p>
                </div>
              )}

              {/* Role Permissions */}
              {selectedUser.role?.permissions && selectedUser.role.permissions.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-3">
                    Permissions ({selectedUser.role.permissions.length})
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedUser.role.permissions.map((perm) => (
                      <div
                        key={perm}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <CheckCircle className="text-green-500" size={14} />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {perm}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedUser);
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={20} />
                  Edit User
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openRoleModal(selectedUser);
                  }}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Shield size={20} />
                  Change Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && selectedUser && (
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Edit User
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Update user information
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
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
            <form onSubmit={handleUpdateUser} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                  disabled={actionLoading}
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                  disabled={actionLoading}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                  disabled={actionLoading}
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about this user..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none resize-none"
                  disabled={actionLoading}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading || !formData.name.trim()}
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
                      Update User
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
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

      

      {/* CHANGE ROLE MODAL */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Change User Role
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedUser.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateRole} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Current Role
                </label>
                <div className={`px-4 py-3 rounded-lg border flex items-center gap-2 ${getRoleColor(getRoleName(selectedUser.role))}`}>
                  <Shield size={16} />
                  <span className="font-semibold">{getRoleName(selectedUser.role)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  New Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                  disabled={actionLoading}
                >
                  <option value="">Select a role...</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)} - {role.permissions.length} permissions
                    </option>
                  ))}
                </select>
              </div>

              {/* Show permissions preview if role selected */}
              {selectedRoleId && roles.find(r => r._id === selectedRoleId) && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">
                    Permissions Preview
                  </h4>
                  <div className="space-y-1">
                    {roles.find(r => r._id === selectedRoleId).permissions.slice(0, 5).map(perm => (
                      <div key={perm} className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                        <CheckCircle size={12} />
                        {perm}
                      </div>
                    ))}
                    {roles.find(r => r._id === selectedRoleId).permissions.length > 5 && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        +{roles.find(r => r._id === selectedRoleId).permissions.length - 5} more...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={actionLoading || !selectedRoleId}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Shield size={20} />
                      Update Role
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                    setSelectedRoleId('');
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

      {/* BULK ROLE UPDATE MODAL */}
      {showBulkRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <UserCog className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Bulk Update Roles
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Update {selectedUsers.size} selected user{selectedUsers.size !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleBulkUpdateRoles} className="p-6 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
                  Selected Users ({selectedUsers.size})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {users.filter(u => selectedUsers.has(u._id)).map(user => (
                    <div key={user._id} className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                      <CheckCircle size={14} />
                      <span className="truncate">{user.name} - {user.email}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Assign Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                  disabled={actionLoading}
                >
                  <option value="">Select a role...</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)} ({role.permissions.length} permissions)
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                      Warning
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                      This will update the role for all {selectedUsers.size} selected users. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={actionLoading || !selectedRoleId}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <UserCog size={20} />
                      Update {selectedUsers.size} Users
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkRoleModal(false);
                    setSelectedRoleId('');
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

      {/* DELETE USER MODAL */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-lg flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Delete User
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-slate-700 dark:text-slate-300">
                Are you sure you want to delete{' '}
                <span className="font-bold">{selectedUser.name}</span>
                {' '}({selectedUser.email})?
              </p>

              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-200">
                      Warning
                    </p>
                    <ul className="text-sm text-red-800 dark:text-red-300 mt-1 space-y-1">
                      <li>• All user data will be permanently deleted</li>
                      <li>• User will be logged out immediately</li>
                      <li>• This action cannot be undone</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={handleDeleteUser}
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
                    Delete User
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
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
    </div>
  );
}