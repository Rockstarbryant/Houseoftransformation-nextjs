'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Upload, Trash2, Camera, Shield, Bell, MessageSquare,
  UserCheck, CheckCircle2, Clock, XCircle, ChevronRight
} from 'lucide-react';
import { getMyProfile, updateUser, deleteSelfAccount, updateNotificationPreferences } from '@/services/api/userService';
import { getMyMembership } from '@/services/api/membershipService';
import { uploadToCloudinary, getOptimizedImageUrl } from '@/lib/cloudinaryUpload';
import Loader from '@/components/common/Loader';
import MembershipFormModal from '@/components/membership/MembershipFormModal';

// ── Membership status display config ─────────────────────────────────────────
const MEMBERSHIP_STATUS = {
  pending: {
    icon:  Clock,
    label: 'Application Under Review',
    desc:  'Your membership application has been submitted and is being reviewed by our team.',
    bg:    'bg-amber-50 dark:bg-amber-900/20',
    border:'border-amber-200 dark:border-amber-700',
    text:  'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  approved: {
    icon:  CheckCircle2,
    label: 'Registered Church Member',
    desc:  'Your membership has been approved. Welcome to the family of H.O.T. Church!',
    bg:    'bg-green-50 dark:bg-green-900/20',
    border:'border-green-200 dark:border-green-700',
    text:  'text-green-700 dark:text-green-400',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  rejected: {
    icon:  XCircle,
    label: 'Application Not Approved',
    desc:  'Your application was not approved at this time. Please contact the church office for more information.',
    bg:    'bg-red-50 dark:bg-red-900/20',
    border:'border-red-200 dark:border-red-700',
    text:  'text-red-700 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
};

/**
 * User Profile Page - Fully Mobile Responsive
 * Now uses full width on mobile, maintains original desktop design
 */
export default function ProfilePage() {
  const { user: authUser, logout, checkAuth } = useAuth();
  
  // ── Existing state (unchanged) ────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ email: false, sms: false });
  const [savingNotif, setSavingNotif] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', location: '', bio: '', gender: ''
  });
  const fileInputRef = useRef(null);

  // ── NEW: Membership state ─────────────────────────────────────────────────
  const [membership, setMembership]           = useState(null);   // null = not fetched yet
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  // ── Fetch profile (unchanged) ─────────────────────────────────────────────
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
          name:     response.user.name     || '',
          phone:    response.user.phone    || '',
          location: response.user.location || '',
          bio:      response.user.bio      || '',
          gender:   response.user.gender   || ''
        });
        setNotifPrefs({
          email: response.user.notifications?.email ?? false,
          sms:   response.user.notifications?.sms   ?? false,
        });
      }
    } catch (err) {
      console.error('[Profile] Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // ── NEW: Fetch membership status once user is loaded ──────────────────────
  useEffect(() => {
    if (!user) return;
    const fetchMembership = async () => {
      try {
        setMembershipLoading(true);
        const res = await getMyMembership();
        setMembership(res.exists ? res.data : null);
      } catch {
        setMembership(null);
      } finally {
        setMembershipLoading(false);
      }
    };
    fetchMembership();
  }, [user]);

  // ── All existing handlers (completely unchanged) ──────────────────────────

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      const result = await uploadToCloudinary(file);
      if (!result.success) throw new Error(result.error);
      const response = await updateUser(user._id, { avatar: result.url });
      if (response.success) {
        setUser(prev => ({ ...prev, avatar: result.url }));
        setSuccess('Profile picture updated!');
        setTimeout(() => setSuccess(null), 3000);
        await checkAuth();
      }
    } catch (err) {
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
        await checkAuth();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove avatar');
    } finally {
      setSaving(false);
    }
  };

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
        await checkAuth();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '', phone: user.phone || '',
      location: user.location || '', bio: user.bio || '', gender: user.gender || ''
    });
    setEditing(false);
    setError(null);
  };

  const handleNotifSave = async () => {
    try {
      setSavingNotif(true);
      setError(null);
      const response = await updateNotificationPreferences(user._id, notifPrefs);
      if (response.success) {
        setUser(response.user);
        setSuccess('Notification preferences saved!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save notification preferences');
    } finally {
      setSavingNotif(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const isOAuthUser = user?.authProvider && user.authProvider !== 'email';
    if (!isOAuthUser && !deletePassword) {
      setError('Password is required to delete account');
      return;
    }
    try {
      setDeleting(true);
      setError(null);
      const response = await deleteSelfAccount(isOAuthUser ? undefined : deletePassword);
      if (response.success) {
        alert('Your account has been permanently deleted. You will now be logged out.');
        await logout();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  // ── NEW: After membership form is submitted, refresh membership state ─────
  const handleMembershipComplete = async () => {
    setShowMembershipModal(false);
    try {
      const res = await getMyMembership();
      setMembership(res.exists ? res.data : null);
    } catch {
      // silent
    }
  };

  // ── Loading / error states (unchanged) ────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Profile not found</p>
        </div>
      </div>
    );
  }

  // ── Membership section helper ─────────────────────────────────────────────
  const renderMembershipSection = () => {
    const cfg = membership ? MEMBERSHIP_STATUS[membership.status] : null;
    const StatusIcon = cfg?.icon;

    return (
      <div className="mt-8 pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-700">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-1">
          <UserCheck size={20} className="text-[#8B1A1A]" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Church Membership
          </h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Official membership connects you deeper to the H.O.T. Church family.
        </p>

        {/* Loading skeleton */}
        {membershipLoading && (
          <div className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        )}

        {/* No application yet → CTA card */}
        {!membershipLoading && !membership && (
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[#8B1A1A]/30 bg-[#8B1A1A]/3 dark:bg-[#8B1A1A]/5 p-5">
            {/* Decorative cross watermark */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none">
              <svg width="64" height="64" viewBox="0 0 38 38" fill="none">
                <rect x="15" y="2"  width="8" height="34" rx="3" fill="#8B1A1A" />
                <rect x="2"  y="13" width="34" height="8" rx="3" fill="#8B1A1A" />
              </svg>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Not yet a registered member
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm">
                  Fill in the church membership form to officially join the House of Transformation family.
                </p>
                <ul className="mt-2 space-y-1">
                  {[
                    'Official member of the Body of Christ at H.O.T.',
                    'Receive targeted member communications',
                    'Serve in your chosen ministry department',
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <CheckCircle2 size={11} className="text-[#d4a017] shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setShowMembershipModal(true)}
                className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold transition-all active:scale-[0.97] shadow-md hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #8B1A1A, #a52020)' }}
              >
                Become a Member
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Has an application → status card */}
        {!membershipLoading && membership && cfg && (
          <div className={`rounded-2xl border ${cfg.bg} ${cfg.border} p-5`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.badge}`}>
                  <StatusIcon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-bold text-sm ${cfg.text}`}>{cfg.label}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${cfg.badge}`}>
                      {membership.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
                    {cfg.desc}
                  </p>
                </div>
              </div>

              {/* Submitted date */}
              <div className="shrink-0 text-right">
                <p className="text-xs text-slate-400 dark:text-slate-500">Submitted</p>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                  {membership.submittedAt
                    ? new Date(membership.submittedAt).toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })
                    : '—'}
                </p>
              </div>
            </div>

            {/* Department interest snippet (if filled) */}
            {membership.departmentInterest && (
              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">Preferred department:</span>{' '}
                  {membership.departmentInterest}
                </p>
              </div>
            )}

            {/* Review notes (if rejected) */}
            {membership.status === 'rejected' && membership.reviewNotes && (
              <div className="mt-3 pt-3 border-t border-red-200/60 dark:border-red-700/40">
                <p className="text-xs text-red-600 dark:text-red-400">
                  <span className="font-semibold">Note from team:</span>{' '}
                  {membership.reviewNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — original structure preserved 100%, membership section inserted
  //          before the Notification Preferences section.
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen -mx-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Manage your personal information
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 sm:mb-6 px-4 py-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 sm:mb-6 px-4 py-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Cover */}
          <div className="h-24 sm:h-32 bg-[#b30000]"></div>

          <div className="px-4 sm:px-6 pb-6 pt-16 sm:pt-0">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16 mb-6 gap-4">
              <div className="relative mx-auto sm:mx-0">
                <div className="w-64 h-48 sm:w-64 sm:h-48 rounded-2xl bg-white dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
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
                      <span className="text-4xl sm:text-5xl font-bold text-slate-400 dark:text-slate-300">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 right-0 flex gap-2 translate-y-1/2 sm:translate-y-0">
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
                    className="p-2.5 bg-[#8B1A1A] mt-8 text-white rounded-lg hover:bg-red-800 transition-colors shadow-lg disabled:opacity-50"
                    title="Upload photo"
                  >
                    <Camera size={16} />
                  </button>
                  {user.avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      disabled={saving}
                      className="p-2.5 bg-slate-600 mt-8 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg disabled:opacity-50"
                      title="Remove photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {!editing && (
                <div className="mt-8 flex justify-center sm:justify-end">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-3 bg-[#8B1A1A] text-white rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2 text-sm sm:text-base"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {user.name}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Shield size={16} className="text-[#8B1A1A]" />
                <span className="font-medium capitalize">
                  {user.role?.name || 'Member'}
                </span>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
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

                {/* Email */}
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
                  <p className="mt-1 text-xs text-slate-500">Email cannot be changed.</p>
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
                        year: 'numeric', month: 'long', day: 'numeric' 
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

              {/* Save / Cancel buttons */}
              {editing && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:flex-1 px-6 py-3 bg-[#8B1A1A] text-white rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <><Loader size="sm" color="white" /> Saving...</> : <><Save size={18} /> Save Changes</>}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="w-full sm:flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <X size={18} /> Cancel
                  </button>
                </div>
              )}
            </form>

            {/* ── ✨ NEW: Church Membership Section ──────────────────────────── */}
            {renderMembershipSection()}

            {/* ── Notification Preferences (unchanged) ─────────────────────── */}
            <div className="mt-8 pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-1">
                <Bell size={20} className="text-[#8B1A1A]" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Notification Preferences
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Choose how you want to receive church announcements.
              </p>

              <div className="space-y-4 mb-6">
                {/* Email toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                      <Mail size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Email Notifications</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Receive announcements to {user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifPrefs(p => ({ ...p, email: !p.email }))}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:ring-offset-2 ${notifPrefs.email ? 'bg-[#8B1A1A]' : 'bg-slate-300 dark:bg-slate-600'}`}
                    aria-label="Toggle email notifications"
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${notifPrefs.email ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* SMS toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                      <MessageSquare size={18} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">SMS Notifications</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user.phone ? `Receive alerts to ${user.phone}` : 'Add a phone number above to enable SMS'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!user.phone}
                    onClick={() => setNotifPrefs(p => ({ ...p, sms: !p.sms }))}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed ${notifPrefs.sms && user.phone ? 'bg-[#8B1A1A]' : 'bg-slate-300 dark:bg-slate-600'}`}
                    aria-label="Toggle SMS notifications"
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${notifPrefs.sms && user.phone ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNotifSave}
                disabled={savingNotif}
                className="px-6 py-2.5 bg-[#8B1A1A] text-white rounded-lg hover:bg-red-800 transition-colors font-medium text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {savingNotif
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  : <><Save size={16} /> Save Preferences</>
                }
              </button>
            </div>

            {/* ── Danger Zone (unchanged) ──────────────────────────────────── */}
            <div className="mt-8 pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Warning</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                You can delete your account at any time.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>

        {/* ── Delete Account Modal (unchanged) ─────────────────────────────── */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-red-600 mb-4">Delete Account</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                This action cannot be undone. Your account and all associated data will be permanently deleted.
              </p>
              <form onSubmit={handleDeleteAccount}>
                {user?.authProvider && user.authProvider !== 'email' ? (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-300">
                      You signed in with <strong className="capitalize">{user.authProvider}</strong>.
                      Click "Yes, Delete My Account" to confirm deletion.
                    </p>
                  </div>
                ) : (
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
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={deleting}
                    className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setError(null); }}
                    disabled={deleting}
                    className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ── ✨ NEW: Membership form modal ─────────────────────────────────── */}
      <MembershipFormModal
        isOpen={showMembershipModal}
        userEmail={user.email}
        userName={user.name}
        userPhone={user.phone    || ''}
        userGender={user.gender  || ''}
        userLocation={user.location || ''}
        onComplete={handleMembershipComplete}
      />
    </div>
  );
}