'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Upload, Trash2, Camera, Shield
} from 'lucide-react';
import { getMyProfile, updateUser, deleteSelfAccount } from '@/services/api/userService';
import { uploadToCloudinary, getOptimizedImageUrl } from '@/lib/cloudinaryUpload';
import Loader from '@/components/common/Loader';

/**
 * User Profile Page
 * Allows users to view and edit their own profile
 * Features: Avatar upload, profile editing, account deletion
 */
export default function ProfilePage() {
  const { user: authUser, logout, checkAuth } = useAuth();
  
  // ============================================
  // STATE
  // ============================================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    gender: ''
  });
  
  const fileInputRef = useRef(null);

  // ============================================
  // FETCH PROFILE
  // ============================================
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getMyProfile();
      
      if (response.success && response.user) {
        setUser(response.user);
        setFormData({
          name: response.user.name || '',
          phone: response.user.phone || '',
          location: response.user.location || '',
          bio: response.user.bio || '',
          gender: response.user.gender || ''
        });
      }
    } catch (err) {
      console.error('[Profile] Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // AVATAR UPLOAD
  // ============================================
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const result = await uploadToCloudinary(file);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update user avatar
      const response = await updateUser(user._id, { avatar: result.url });

      if (response.success) {
        setUser(prev => ({ ...prev, avatar: result.url }));
        setSuccess('Profile picture updated!');
        setTimeout(() => setSuccess(null), 3000);
        
        // Refresh auth context
        await checkAuth();
      }
    } catch (err) {
      console.error('[Profile] Avatar upload error:', err);
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await updateUser(user._id, { avatar: null });

      if (response.success) {
        setUser(prev => ({ ...prev, avatar: null }));
        setSuccess('Profile picture removed!');
        setTimeout(() => setSuccess(null), 3000);
        
        // Refresh auth context
        await checkAuth();
      }
    } catch (err) {
      console.error('[Profile] Remove avatar error:', err);
      setError(err.response?.data?.message || 'Failed to remove avatar');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // PROFILE UPDATE
  // ============================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      const response = await updateUser(user._id, formData);

      if (response.success) {
        setUser(response.user);
        setSuccess('Profile updated successfully!');
        setEditing(false);
        setTimeout(() => setSuccess(null), 3000);
        
        // Refresh auth context
        await checkAuth();
      }
    } catch (err) {
      console.error('[Profile] Update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      gender: user.gender || ''
    });
    setEditing(false);
    setError(null);
  };

  // ============================================
  // DELETE ACCOUNT
  // ============================================
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (!deletePassword) {
      setError('Password is required to delete account');
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const response = await deleteSelfAccount(deletePassword);

      if (response.success) {
        alert('Your account has been permanently deleted. You will now be logged out.');
        await logout();
      }
    } catch (err) {
      console.error('[Profile] Delete account error:', err);
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Profile not found</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your personal information
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
        {/* Cover / Header */}
        <div className="h-32 bg-gradient-to-r from-red-900 to-red-700"></div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Avatar Section */}
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="relative">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-2xl bg-white dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                {uploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader size="sm" />
                  </div>
                ) : user.avatar ? (
                  <img
                    src={getOptimizedImageUrl(user.avatar, { width: 200, height: 200 })}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-600">
                    <span className="text-4xl font-bold text-slate-400 dark:text-slate-300">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Avatar Actions */}
              <div className="absolute bottom-0 right-0 flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-2 bg-[#8B1A1A] text-white rounded-lg hover:bg-red-800 transition-colors shadow-lg disabled:opacity-50"
                  title="Upload photo"
                >
                  <Camera size={16} />
                </button>
                {user.avatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={saving}
                    className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg disabled:opacity-50"
                    title="Remove photo"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Edit Toggle Button */}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-[#8B1A1A] text-white rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {user.name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Shield size={16} className="text-[#8B1A1A]" />
              <span className="font-medium capitalize">
                {user.role?.name || 'Member'}
              </span>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSave}>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white transition-colors"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Contact admin to change email
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white transition-colors"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white transition-colors"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white transition-colors"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Member Since
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!editing}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white transition-colors resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-[#8B1A1A] text-white rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader size="sm" color="white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Danger Zone */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Delete Account
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This action cannot be undone. Your account and all associated data will be permanently deleted.
            </p>
            <form onSubmit={handleDeleteAccount}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  placeholder="Your password"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setError(null);
                  }}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}