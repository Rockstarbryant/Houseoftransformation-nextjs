import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Shield, Trash2, Mail, Phone, MapPin, AlertCircle, CheckCircle, Download, Archive, Send, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { userService } from '../../services/api/userService';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const ITEMS_PER_PAGE = 50;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [bulkRoleChange, setBulkRoleChange] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [notificationData, setNotificationData] = useState({ role: 'all', message: '' });
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([
  { value: 'all', label: 'All Roles' }
  ]);

    // Fetch available roles from backend
    useEffect(() => {
    const fetchRoles = async () => {
      try {
      const response = await api.get('/roles');
      if (response.data.success && response.data.roles) {
        const roleOptions = response.data.roles.map(role => ({
          value: role.name,
          label: role.name.replace(/_/g, ' ').toUpperCase()
        }));
        setAvailableRoles([
          { value: 'all', label: 'All Roles' },
          ...roleOptions
        ]);
        }
        } catch (err) {
        console.error('Failed to fetch roles:', err);
        // Fallback to hardcoded roles
        setAvailableRoles([
        { value: 'all', label: 'All Roles' },
        { value: 'admin', label: 'Admin' },
        { value: 'pastor', label: 'Pastor' },
        { value: 'bishop', label: 'Bishop' },
        { value: 'usher', label: 'Usher' },
        { value: 'worship_team', label: 'Worship Team' },
        { value: 'volunteer', label: 'Volunteer' },
        { value: 'member', label: 'Member' }
        ]);
        }
          };
  
          fetchRoles();
          }, []);

        // Use availableRoles instead of hardcoded roles
      const roles = availableRoles;

    const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAllUsers(page, ITEMS_PER_PAGE, {
        role: roleFilter,
        status: statusFilter,
        search: search.trim()
      });

      if (response.success) {
        setUsers(response.users || []);
        setCurrentPage(response.currentPage || page);
        setTotalPages(response.pages || 1);
        setTotalUsers(response.total || 0);
      } else {
        setError(response.message || 'Failed to load users');
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Connection error. Check your internet.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, search]);

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers(1);
  }, [roleFilter, statusFilter, search, fetchUsers]);

  const updateRole = async (userId, newRole) => {
    try {
      const response = await userService.updateUserRole(userId, newRole);
      if (response.success) {
        setUsers(users.map(u => u._id === userId ? response.user : u));
        showSuccess(`Role updated to ${newRole}`);
      } else {
        alert(response.message || 'Error updating role');
      }
    } catch (err) {
      alert('Error updating role');
    }
  };

  const bulkUpdateRoles = async () => {
    if (!bulkRoleChange || selectedUsers.size === 0) {
      alert('Select users and a role first');
      return;
    }

    try {
      setLoading(true);
      const userIds = Array.from(selectedUsers);
      const response = await userService.bulkUpdateRoles(userIds, bulkRoleChange);

      if (response.success) {
        await fetchUsers(currentPage);
        setSelectedUsers(new Set());
        setBulkRoleChange('');
        setShowBulkActions(false);
        showSuccess(`Updated ${selectedUsers.size} users`);
      } else {
        alert(response.message);
      }
    } catch (err) {
      alert('Error updating users');
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (userId) => {
    try {
      const response = await userService.updateUserStatus(userId, false);
      if (response.success) {
        setUsers(users.map(u => u._id === userId ? response.user : u));
        showSuccess('User deactivated');
      }
    } catch (err) {
      alert('Error deactivating user');
    }
  };

  const reactivateUser = async (userId) => {
    try {
      const response = await userService.updateUserStatus(userId, true);
      if (response.success) {
        setUsers(users.map(u => u._id === userId ? response.user : u));
        showSuccess('User reactivated');
      }
    } catch (err) {
      alert('Error reactivating user');
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        setUsers(users.filter(u => u._id !== userId));
        setShowDeleteConfirm(null);
        showSuccess('User deleted');
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const startEditing = (user) => {
    setEditingUser(user._id);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || ''
    });
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      const response = await userService.updateUser(editingUser, editFormData);
      if (response.success) {
        setUsers(users.map(u => u._id === editingUser ? response.user : u));
        setEditingUser(null);
        showSuccess('User updated');
      }
    } catch (err) {
      alert('Error updating user');
    }
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    newSelected.has(userId) ? newSelected.delete(userId) : newSelected.add(userId);
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u._id)));
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Role', 'Status', 'Joined'];
    const rows = users.map(u => [
      u.name, u.email, u.phone || '', u.location || '', u.role,
      u.isActive ? 'Active' : 'Inactive', new Date(u.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members-page-${currentPage}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccess('CSV downloaded');
  };

  const sendBulkNotification = async () => {
    if (!notificationData.message.trim()) {
      alert('Enter a message');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.sendBulkNotification(notificationData.role, notificationData.message);
      if (response.success) {
        setNotificationData({ role: 'all', message: '' });
        setShowNotificationModal(false);
        showSuccess(`Notification sent to ${response.sentCount} users`);
      } else {
        alert(response.message);
      }
    } catch (err) {
      alert('Error sending notification');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getRoleDisplayName = (roleObj) => {
  if (!roleObj) return 'Member';
  
  const roleName = typeof roleObj === 'string' ? roleObj : roleObj?.name;
  if (!roleName) return 'Member';
  
  return roleName.replace(/_/g, ' ').toUpperCase();
};

const getRoleColor = (roleObj) => {
  if (!roleObj) return 'bg-gray-100 text-gray-800';
  
  const roleName = typeof roleObj === 'string' ? roleObj : roleObj?.name;
  if (!roleName) return 'bg-gray-100 text-gray-800';
  
  return {
    'admin': 'bg-purple-100 text-purple-800',
    'pastor': 'bg-red-100 text-red-800',
    'bishop': 'bg-blue-100 text-blue-800',
    'usher': 'bg-green-100 text-green-800',
    'worship_team': 'bg-yellow-100 text-yellow-800',
    'volunteer': 'bg-indigo-100 text-indigo-800',
    'member': 'bg-gray-100 text-gray-800'
  }[roleName] || 'bg-gray-100 text-gray-800';
};

const getRoleIcon = (roleObj) => {
  if (!roleObj) return '👤';
  
  const role = typeof roleObj === 'string' ? roleObj : roleObj?.name;
  if (!role) return '👤';
  
  return {
    'admin': '👑',
    'pastor': '👨‍⛪',
    'bishop': '👨‍⛪',
    'worship_team': '🎵',
    'usher': '🤝',
    'volunteer': '❤️',
    'member': '👤'
  }[role] || '👤';
};

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">Manage Users</h1>
        <p className="text-gray-600">Total Members: <strong>{totalUsers}</strong></p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 flex items-center justify-between rounded">
          <div className="flex items-center gap-3"><AlertCircle size={20} />{error}</div>
          <button onClick={() => fetchUsers(currentPage)} className="font-semibold hover:underline text-red-700">Retry</button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 flex items-center gap-3 rounded">
          <CheckCircle size={20} />{successMessage}
        </div>
      )}

      <Card className="mb-8 p-6">
        <div className="grid md:grid-cols-5 gap-4 mb-4">
          <Input placeholder="Name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-900 font-medium">
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-900 font-medium">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('cards')} className={`flex-1 px-3 py-2 rounded-lg font-semibold transition ${viewMode === 'cards' ? 'bg-blue-900 text-white' : 'bg-gray-100'}`}>Cards</button>
            <button onClick={() => setViewMode('table')} className={`flex-1 px-3 py-2 rounded-lg font-semibold transition ${viewMode === 'table' ? 'bg-blue-900 text-white' : 'bg-gray-100'}`}>Table</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2"><Download size={18} /> Export CSV</Button>
          <Button onClick={() => setShowNotificationModal(true)} className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"><Send size={18} /> Send Notification</Button>
          {selectedUsers.size > 0 && (
            <Button onClick={() => setShowBulkActions(!showBulkActions)} className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"><Shield size={18} /> Bulk ({selectedUsers.size})</Button>
          )}
        </div>

        {showBulkActions && selectedUsers.size > 0 && (
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="font-semibold text-blue-900 mb-3">Update role for {selectedUsers.size} users:</p>
            <div className="flex gap-3">
              <select value={bulkRoleChange} onChange={(e) => setBulkRoleChange(e.target.value)} className="flex-1 px-4 py-2 rounded-lg border-2 border-blue-300 font-semibold">
                <option value="">Select role...</option>
                {roles.slice(1).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <Button onClick={bulkUpdateRoles} className="bg-green-600 text-white hover:bg-green-700">Apply</Button>
            </div>
          </div>
        )}
      </Card>

      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Send Notification</h2>
            <div className="space-y-4">
              <select value={notificationData.role} onChange={(e) => setNotificationData({ ...notificationData, role: e.target.value })} className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-900">
                <option value="all">All Members</option>
                <option value="admin">Admins</option>
                <option value="pastor">Pastors</option>
                <option value="volunteer">Volunteers</option>
              </select>
              <textarea value={notificationData.message} onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })} placeholder="Type message..." className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-900" rows="4" />
              <div className="flex gap-3">
                <Button onClick={sendBulkNotification} variant="primary" className="flex-1">Send</Button>
                <Button onClick={() => setShowNotificationModal(false)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {loading && <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>}

      {!loading && users.length === 0 && (
        <Card className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">No members found</p>
        </Card>
      )}

      {!loading && users.length > 0 && viewMode === 'cards' && (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user._id} className="hover:shadow-lg transition-shadow">
              {editingUser === user._id ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {['name', 'email', 'phone', 'location'].map(field => (
                      <div key={field}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">{field}</label>
                        <input type={field === 'email' ? 'email' : 'text'} value={editFormData[field]} onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                    <textarea value={editFormData.bio} onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none" rows="3" />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={saveEdit} variant="primary" className="flex-1">Save</Button>
                    <Button onClick={() => setEditingUser(null)} variant="outline" className="flex-1">Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-4 mb-4">
                    <input type="checkbox" checked={selectedUsers.has(user._id)} onChange={() => handleSelectUser(user._id)} className="w-5 h-5 rounded mt-1" />
                    <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">{getRoleIcon(user.role)} {user.name.charAt(0)}</div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-blue-900">{user.name}</h3>
                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">@{user.username || user.email.split('@')[0]}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-700"><Mail size={16} className="text-blue-900" /><span className="truncate">{user.email}</span></div>
                        {user.phone && <div className="flex items-center gap-2 text-gray-700"><Phone size={16} className="text-blue-900" />{user.phone}</div>}
                        {user.location && <div className="flex items-center gap-2 text-gray-700"><MapPin size={16} className="text-blue-900" />{user.location}</div>}
                        <div className="text-gray-600">Joined {formatDate(user.createdAt)}</div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 w-48">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Change Role</label>
                      <select value={typeof user.role === 'string' ? user.role : user.role?.name || ''} onChange={(e) => updateRole(user._id, e.target.value)} className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-900 text-sm font-semibold">
                        {roles.slice(1).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {user.bio && <div className="py-3 px-4 bg-gray-50 rounded-lg mb-4"><p className="text-sm text-gray-700">{user.bio}</p></div>}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600"><span className="font-bold text-blue-900">{user.blogsCreated || 0}</span> posts</span>
                      <span className="text-gray-600"><span className="font-bold text-blue-900">{user.testimonyCount || 0}</span> testimonies</span>
                      <span className="text-gray-600"><span className="font-bold text-blue-900">{user.ministries?.length || 0}</span> ministries</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditing(user)} className="p-2 text-blue-900 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit size={20} /></button>
                      {user.isActive ? <button onClick={() => deactivateUser(user._id)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Deactivate"><Archive size={20} /></button> : <button onClick={() => reactivateUser(user._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Reactivate"><Eye size={20} /></button>}
                      <button onClick={() => setShowDeleteConfirm(showDeleteConfirm === user._id ? null : user._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={20} /></button>
                    </div>
                  </div>
                  {showDeleteConfirm === user._id && (
                    <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                      <p className="text-red-800 font-semibold mb-3">Permanently delete? Cannot undo.</p>
                      <div className="flex gap-2">
                        <Button onClick={() => deleteUser(user._id)} className="bg-red-600 text-white hover:bg-red-700 flex-1">Delete</Button>
                        <Button onClick={() => setShowDeleteConfirm(null)} variant="outline" className="flex-1">Cancel</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {!loading && users.length > 0 && viewMode === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="p-4 text-left"><input type="checkbox" checked={selectedUsers.size === users.length && users.length > 0} onChange={selectAll} className="w-4 h-4 rounded" /></th>
                  <th className="p-4 text-left text-sm font-bold text-blue-900">Name</th>
                  <th className="p-4 text-left text-sm font-bold text-blue-900">Email</th>
                  <th className="p-4 text-left text-sm font-bold text-blue-900">Role</th>
                  <th className="p-4 text-left text-sm font-bold text-blue-900">Phone</th>
                  <th className="p-4 text-left text-sm font-bold text-blue-900">Status</th>
                  <th className="p-4 text-left text-sm font-bold text-blue-900">Joined</th>
                  <th className="p-4 text-left text-sm font-bold text-blue-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-200 hover:bg-blue-50 transition">
                    <td className="p-4"><input type="checkbox" checked={selectedUsers.has(user._id)} onChange={() => handleSelectUser(user._id)} className="w-4 h-4 rounded" /></td>
                    <td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white text-sm font-bold">{user.name.charAt(0)}</div><div><p className="font-semibold text-blue-900">{user.name}</p><p className="text-xs text-gray-500">@{user.username || user.email.split('@')[0]}</p></div></div></td>
                    <td className="p-4 text-sm text-gray-700">{user.email}</td>
                    <td className="p-4"><select value={typeof user.role === 'string' ? user.role : user.role?.name || ''} onChange={(e) => updateRole(user._id, e.target.value)} className="px-3 py-1 rounded-lg border-2 border-gray-300 focus:border-blue-900 text-sm font-semibold">{roles.slice(1).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></td>
                    <td className="p-4 text-sm text-gray-700">{user.phone || '-'}</td>
                    <td className="p-4"><span className={`text-xs font-bold px-3 py-1 rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="p-4 text-sm text-gray-700">{formatDate(user.createdAt)}</td>
                    <td className="p-4"><div className="flex gap-2"><button onClick={() => startEditing(user)} className="p-2 text-blue-900 hover:bg-blue-100 rounded-lg transition" title="Edit"><Edit size={18} /></button>{user.isActive ? <button onClick={() => deactivateUser(user._id)} className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition" title="Deactivate"><Archive size={18} /></button> : <button onClick={() => reactivateUser(user._id)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition" title="Reactivate"><Eye size={18} /></button>}<button onClick={() => setShowDeleteConfirm(showDeleteConfirm === user._id ? null : user._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>{showDeleteConfirm === user._id && <div className="absolute top-full right-0 bg-red-50 border-l-4 border-red-500 p-3 rounded-lg shadow-lg z-10 text-sm"><p className="text-red-800 font-semibold mb-2">Delete permanently?</p><div className="flex gap-2"><Button onClick={() => deleteUser(user._id)} className="bg-red-600 text-white hover:bg-red-700 text-xs px-2 py-1">Delete</Button><Button onClick={() => setShowDeleteConfirm(null)} variant="outline" className="text-xs px-2 py-1">Cancel</Button></div></div>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-700 font-medium">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> | Total: <strong>{totalUsers}</strong> members</p>
          <div className="flex gap-2">
            <Button onClick={() => fetchUsers(currentPage - 1)} disabled={currentPage === 1} variant="outline" className="flex items-center gap-2"><ChevronLeft size={18} /> Previous</Button>
            <Button onClick={() => fetchUsers(currentPage + 1)} disabled={currentPage === totalPages} variant="outline" className="flex items-center gap-2">Next <ChevronRight size={18} /></Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;