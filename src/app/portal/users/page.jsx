// app/portal/users/page.jsx - Complete Admin Users Management
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Users, UserPlus, Edit, Trash2, Shield, Search, Download, Mail, Phone, MapPin, Calendar,
  CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Ban, User, Loader as LoaderIcon, Copy, Eye, EyeOff, X
} from 'lucide-react';
import {
  getAllUsers, updateUser, updateUserRole, deleteUser, banUser, manualRegisterUser,
  getUserStats, exportUsersToCSV, downloadCSV
} from '@/services/api/userService';
import { getAllRoles } from '@/services/api/roleService';
import Loader from '@/components/common/Loader';

export default function UsersPage() {
  const { user: currentUser, checkAuth } = useAuth();
  const { canManageUsers } = usePermissions();

  // STATE
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, banned: 0, byRole: {} });
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage] = useState(50);
  const [filters, setFilters] = useState({ search: '', role: 'all', status: 'all' });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // MODALS
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showManualRegisterModal, setShowManualRegisterModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // FORM DATA
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '', bio: '', gender: '' });
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [banReason, setBanReason] = useState('');
  const [manualRegData, setManualRegData] = useState({ name: '', email: '', phone: '', location: '', gender: '', roleId: '' });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // PERMISSION CHECK
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

  // DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // FETCH DATA
  useEffect(() => { fetchUsers(); }, [currentPage, itemsPerPage, debouncedSearch, filters.role, filters.status]);
  useEffect(() => { fetchRoles(); fetchStats(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers(currentPage, itemsPerPage, { search: debouncedSearch, role: filters.role, status: filters.status });
      if (response.success) {
        setUsers(response.users || []);
        setTotalPages(response.pages || 1);
        setTotalUsers(response.total || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getAllRoles();
      if (response.success) setRoles(response.roles || []);
    } catch (err) {
      console.error('Fetch roles error:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getUserStats();
      if (response.success) setStats(response.stats || { total: 0, active: 0, inactive: 0, banned: 0, byRole: {} });
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  // HANDLERS
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      setError(null);
      const response = await updateUser(selectedUser._id, formData);
      if (response.success) {
        setSuccess('User updated successfully!');
        setShowEditModal(false);
        setSelectedUser(null);
        await fetchUsers();
        await checkAuth();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
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
      const response = await updateUserRole(selectedUser._id, selectedRoleId);
      if (response.success) {
        setSuccess('Role updated!');
        setShowRoleModal(false);
        await fetchUsers();
        await fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const response = await deleteUser(selectedUser._id);
      if (response.success) {
        setSuccess('User deleted!');
        setShowDeleteModal(false);
        await fetchUsers();
        await fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanUser = async (e) => {
    e.preventDefault();
    if (!selectedUser || !banReason.trim()) return;
    //if (!confirm(`Ban ${selectedUser.name}? This prevents re-registration.`)) return;
    try {
      setActionLoading(true);
      const response = await banUser(selectedUser._id, banReason);
      if (response.success) {
        setSuccess(`${selectedUser.name} banned!`);
        setShowBanModal(false);
        setBanReason('');
        await fetchUsers();
        await fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to ban');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualRegister = async (e) => {
    e.preventDefault();
    if (!manualRegData.name.trim() || !manualRegData.email.trim()) {
      setError('Name and email required');
      return;
    }
    try {
      setActionLoading(true);
      const response = await manualRegisterUser(manualRegData);
      if (response.success) {
        setGeneratedPassword(response.temporaryPassword);
        setSuccess(`${manualRegData.name} registered!`);
        await fetchUsers();
        await fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setActionLoading(false);
    }
  };

  // LOADING
  if (loading && users.length === 0) {
    return <div className="flex items-center justify-center min-h-screen"><Loader fullScreen text="Loading users..." /></div>;
  }

  // RENDER
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage all system users and their roles</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchUsers()} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition font-bold">
            Refresh
          </button>
          <button onClick={() => setShowManualRegisterModal(true)} className="px-4 py-2 bg-[#8B1A1A] text-white rounded-lg hover:bg-red-900 transition font-bold flex items-center gap-2">
            <UserPlus size={18} /> Add User
          </button>
          <button onClick={() => { const csv = exportUsersToCSV(users); if (csv) downloadCSV(csv); }} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-bold flex items-center gap-2">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* ALERTS */}
      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-red-700 dark:text-red-300">{error}</p><button onClick={() => setError(null)} className="ml-auto"><X size={18} /></button></div>}
      {success && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-green-700 dark:text-green-300">{success}</p></div>}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2"><Users size={24} className="text-blue-600" /><span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Users</span></div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2"><CheckCircle size={24} className="text-green-600" /><span className="text-xs font-bold text-green-600 uppercase tracking-wider">Active</span></div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.active}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2"><XCircle size={24} className="text-orange-600" /><span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Inactive</span></div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.inactive}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2"><Ban size={24} className="text-red-600" /><span className="text-xs font-bold text-red-600 uppercase tracking-wider">Banned</span></div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.banned || 0}</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Search by name, email..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none transition" /></div></div>
          <select value={filters.role} onChange={(e) => setFilters({...filters, role: e.target.value})} className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none">
            <option value="all">All Roles</option>
            {roles.map(role => <option key={role._id} value={role._id}>{role.name}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#8B1A1A] rounded-full flex items-center justify-center text-white font-bold">{user.name?.charAt(0)}</div>
                      <div><p className="font-bold text-slate-900 dark:text-white">{user.name}</p><p className="text-sm text-slate-500">{user.email}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.phone && <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><Phone size={14} />{user.phone}</div>}
                    {user.location && <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1"><MapPin size={14} />{user.location}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold uppercase">{user.role?.name || 'Member'}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.isActive ? <span className="flex items-center gap-2 text-green-600"><CheckCircle size={16} />Active</span> : <span className="flex items-center gap-2 text-red-600"><XCircle size={16} />Inactive</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setSelectedUser(user); setFormData({name: user.name, email: user.email, phone: user.phone || '', location: user.location || '', bio: user.bio || '', gender: user.gender || ''}); setShowEditModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition" title="Edit"><Edit size={16} /></button>
                      <button onClick={() => { setSelectedUser(user); setSelectedRoleId(user.role?._id || ''); setShowRoleModal(true); }} className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition" title="Change Role"><Shield size={16} /></button>
                      <button onClick={() => { setSelectedUser(user); setShowBanModal(true); }} className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition" title="Ban User"><Ban size={16} /></button>
                      <button 
                        onClick={() => { 
                          setSelectedUser(user); 
                          setShowDeleteModal(true); 
                        }} 
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">Showing {users.length} of {totalUsers} users</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsLeft size={18} /></button>
              <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={18} /></button>
              <span className="px-4 py-2 text-sm font-bold">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none dark:bg-slate-700 dark:text-white" /></div>
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label><input type="email" value={formData.email} disabled className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-600 cursor-not-allowed" /><p className="text-xs text-slate-500 mt-1">Email cannot be changed</p></div>
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none dark:bg-slate-700 dark:text-white" /></div>
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Location</label><input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none dark:bg-slate-700 dark:text-white" /></div>
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gender</label><select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none dark:bg-slate-700 dark:text-white"><option value="">Prefer not to say</option><option value="male">Male</option><option value="female">Female</option></select></div>
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bio</label><textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={3} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none dark:bg-slate-700 dark:text-white resize-none" /></div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={actionLoading} className="flex-1 px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition disabled:opacity-50">{actionLoading ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedUser(null); }} className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE MODAL */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Change Role</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Change role for <strong>{selectedUser.name}</strong></p>
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} required className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none dark:bg-slate-700 dark:text-white">
                <option value="">Select Role</option>
                {roles.map(role => <option key={role._id} value={role._id}>{role.name}</option>)}
              </select>
              <div className="flex gap-3">
                <button type="submit" disabled={actionLoading} className="flex-1 px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition disabled:opacity-50">{actionLoading ? 'Updating...' : 'Update Role'}</button>
                <button type="button" onClick={() => { setShowRoleModal(false); setSelectedUser(null); }} className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BAN MODAL */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-red-600 mb-4">Ban User</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Permanently ban <strong>{selectedUser.name}</strong>? They won't be able to re-register with the same email or IP.</p>
            <form onSubmit={handleBanUser} className="space-y-4">
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ban Reason *</label><textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} required minLength={5} rows={3} placeholder="Minimum 5 characters..." className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none dark:bg-slate-700 dark:text-white resize-none" /></div>
              <div className="flex gap-3">
                <button type="submit" disabled={actionLoading} className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50">{actionLoading ? 'Banning...' : 'Ban User'}</button>
                <button type="button" onClick={() => { setShowBanModal(false); setSelectedUser(null); setBanReason(''); }} className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-red-600 mb-4">Delete User</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Delete <strong>{selectedUser.name}</strong> from both MongoDB and Supabase? This can be reversed if needed.</p>
            <div className="flex gap-3">
              <button onClick={handleDeleteUser} disabled={actionLoading} className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50">{actionLoading ? 'Deleting...' : 'Delete User'}</button>
              <button onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }} className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL REGISTER MODAL */}
      {showManualRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Manual User Registration</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Register a user manually (for elderly or children who cannot register themselves)</p>
            {generatedPassword ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"><p className="text-sm text-green-700 dark:text-green-300 mb-2">User registered successfully!</p><div className="bg-white dark:bg-slate-700 p-3 rounded-lg"><p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Temporary Password:</p><div className="flex items-center gap-2"><input type={showPassword ? 'text' : 'password'} value={generatedPassword} readOnly className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-600 rounded border-0 font-mono text-sm" /><button onClick={() => setShowPassword(!showPassword)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button><button onClick={() => {navigator.clipboard.writeText(generatedPassword); setSuccess('Password copied!'); setTimeout(() => setSuccess(null), 2000);}} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"><Copy size={18} /></button></div></div><p className="text-xs text-slate-600 dark:text-slate-400 mt-2">⚠️ Save this password! It won't be shown again.</p></div>
                <button onClick={() => { setShowManualRegisterModal(false); setManualRegData({ name: '', email: '', phone: '', location: '', gender: '', roleId: '' }); setGeneratedPassword(''); setShowPassword(false); }} className="w-full px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition">Close</button>
              </div>
            ) : (
              <form onSubmit={handleManualRegister} className="space-y-4">
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Name *</label><input type="text" value={manualRegData.name} onChange={(e) => setManualRegData({...manualRegData, name: e.target.value})} required className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none dark:bg-slate-700 dark:text-white" /></div>
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email *</label><input type="email" value={manualRegData.email} onChange={(e) => setManualRegData({...manualRegData, email: e.target.value})} required className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none dark:bg-slate-700 dark:text-white" /></div>
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone</label><input type="tel" value={manualRegData.phone} onChange={(e) => setManualRegData({...manualRegData, phone: e.target.value})} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none dark:bg-slate-700 dark:text-white" /></div>
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Location</label><input type="text" value={manualRegData.location} onChange={(e) => setManualRegData({...manualRegData, location: e.target.value})} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none dark:bg-slate-700 dark:text-white" /></div>
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gender</label><select value={manualRegData.gender} onChange={(e) => setManualRegData({...manualRegData, gender: e.target.value})} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none dark:bg-slate-700 dark:text-white"><option value="">Prefer not to say</option><option value="male">Male</option><option value="female">Female</option></select></div>
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Role</label><select value={manualRegData.roleId} onChange={(e) => setManualRegData({...manualRegData, roleId: e.target.value})} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none dark:bg-slate-700 dark:text-white"><option value="">Default (Member)</option>{roles.map(role => <option key={role._id} value={role._id}>{role.name}</option>)}</select></div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={actionLoading} className="flex-1 px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition disabled:opacity-50">{actionLoading ? 'Registering...' : 'Register User'}</button>
                  <button type="button" onClick={() => { setShowManualRegisterModal(false); setManualRegData({ name: '', email: '', phone: '', location: '', gender: '', roleId: '' }); setError(null); }} className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}