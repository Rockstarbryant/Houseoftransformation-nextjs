'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Pin,
  Clock,
  Calendar,
  Mail,
  MessageSquare,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AnnouncementFormPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const isEditMode = Boolean(params?.id);

  const [loading, setLoading] = useState(false);
  const [roles,   setRoles]   = useState([]);
  const [formData, setFormData] = useState({
    title:          '',
    content:        '',
    priority:       'normal',
    category:       'general',
    targetAudience: 'all',
    targetRoles:    [],
    expiresAt:      '',
    isPinned:       false,
    scheduledFor:   '',
    // ── Notification channels ──────────────────────────────────────────
    notifyEmail:    false,
    notifySMS:      false,
  });

  const update = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      if (res.data.success) setRoles(res.data.roles);
    } catch (e) {
      console.error('[AnnouncementForm] Error fetching roles:', e);
    }
  };

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/announcements/${params.id}`);
      if (res.data.success) {
        const a = res.data.announcement;
        setFormData({
          title:          a.title,
          content:        a.content,
          priority:       a.priority,
          category:       a.category,
          targetAudience: a.targetAudience,
          targetRoles:    a.targetRoles?.map((r) => r._id) || [],
          expiresAt:      a.expiresAt ? new Date(a.expiresAt).toISOString().slice(0, 16) : '',
          isPinned:       a.isPinned,
          scheduledFor:   a.scheduledFor ? new Date(a.scheduledFor).toISOString().slice(0, 16) : '',
          notifyEmail:    a.notifyEmail ?? false,
          notifySMS:      a.notifySMS   ?? false,
        });
      }
    } catch (e) {
      console.error('[AnnouncementForm] Error fetching announcement:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        expiresAt:    formData.expiresAt    || null,
        scheduledFor: formData.scheduledFor || null,
        targetRoles:
          formData.targetAudience === 'specific_roles' ? formData.targetRoles : [],
      };

      const res = isEditMode
        ? await api.patch(`/announcements/${params.id}`, payload)
        : await api.post('/announcements', payload);

      if (res.data.success) {
        router.push('/portal/announcements');
      }
    } catch (e) {
      console.error('[AnnouncementForm] Error saving:', e);
      alert(e.response?.data?.message || 'Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (roleId) =>
    setFormData((prev) => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(roleId)
        ? prev.targetRoles.filter((id) => id !== roleId)
        : [...prev.targetRoles, roleId],
    }));

  useEffect(() => {
    fetchRoles();
    if (isEditMode && params.id) fetchAnnouncement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, isEditMode]);

  // ── Reusable toggle component ────────────────────────────────────────────
  const ToggleOption = ({ checked, onChange, icon: Icon, iconColor, title, description }) => (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-10 h-6 rounded-full transition-colors duration-200 ${
            checked ? 'bg-[#8B1A1A]' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-transform duration-200 ${
              checked ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <Icon size={16} className={iconColor} />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
          {checked && (
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase">
              On
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/portal/announcements')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Announcements</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Announcement' : 'Create New Announcement'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isEditMode
              ? 'Update announcement details'
              : 'Compose and publish a new announcement to your congregation.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Enter announcement title"
              maxLength={200}
              required
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder="Enter announcement content"
              rows={8}
              required
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent resize-none"
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => update('priority', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
              >
                <option value="low">Low — Informational</option>
                <option value="normal">Normal — General</option>
                <option value="high">High — Important</option>
                <option value="urgent">Urgent — Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="event">Event</option>
                <option value="service">Service</option>
                <option value="urgent">Urgent</option>
                <option value="ministry">Ministry</option>
                <option value="technical">Technical</option>
              </select>
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Target Audience
            </label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData((prev) => ({ ...prev, targetAudience: e.target.value, targetRoles: [] }))}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="members">Members Only</option>
              <option value="volunteers">Volunteers Only</option>
              <option value="staff">Staff Only</option>
              <option value="specific_roles">Specific Roles</option>
            </select>

            {formData.targetAudience === 'specific_roles' && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Select Target Roles
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {roles.map((role) => (
                    <label
                      key={role._id}
                      className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.targetRoles.includes(role._id)}
                        onChange={() => toggleRole(role._id)}
                        className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                      />
                      <span className="text-sm text-slate-900 dark:text-white capitalize">
                        {role.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-5 p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Additional Options
            </h3>

            {/* Pin */}
            <ToggleOption
              checked={formData.isPinned}
              onChange={(v) => update('isPinned', v)}
              icon={Pin}
              iconColor="text-amber-500"
              title="Pin this announcement"
              description="Pinned announcements appear at the top of the list for all users."
            />

            {/* ── NOTIFICATION CHANNELS ──────────────────────────────────────── */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                Notification Channels
              </p>

              <div className="space-y-4">
                <ToggleOption
                  checked={formData.notifyEmail}
                  onChange={(v) => update('notifyEmail', v)}
                  icon={Mail}
                  iconColor="text-blue-500"
                  title="Send Email Notifications"
                  description="Sends an email to all members who have opted in to email notifications. Delivered asynchronously in the background."
                />

                <ToggleOption
                  checked={formData.notifySMS}
                  onChange={(v) => update('notifySMS', v)}
                  icon={MessageSquare}
                  iconColor="text-emerald-500"
                  title="Send SMS Notifications"
                  description="Sends an SMS to members who provided a phone number and opted in to SMS alerts. Standard message rates may apply."
                />
              </div>

              {(formData.notifyEmail || formData.notifySMS) && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs text-amber-800 dark:text-amber-400 font-semibold">
                    ⚡ Notifications are queued and sent asynchronously. They will be delivered within minutes of posting. Only users who have opted in will receive them.
                  </p>
                </div>
              )}
            </div>
            {/* ─────────────────────────────────────────────────────────────── */}

            {/* Expiration */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Clock size={16} />
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => update('expiresAt', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Announcement will be hidden after this date.
              </p>
            </div>

            {/* Scheduled For */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Calendar size={16} />
                Schedule For (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => update('scheduledFor', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Announcement will be published at this date/time.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-initial px-6 py-3 bg-[#8B1A1A] text-white rounded-lg font-bold hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Saving…' : isEditMode ? 'Update Announcement' : 'Publish Announcement'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/portal/announcements')}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}