'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Bell,
  AlertCircle,
  Calendar,
  Users,
  Pin,
  Clock
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

/**
 * Create/Edit Announcement Page
 * Form for creating and editing announcements
 */
export default function AnnouncementFormPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const isEditMode = Boolean(params?.id);
  
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    category: 'general',
    targetAudience: 'all',
    targetRoles: [],
    expiresAt: '',
    isPinned: false,
    scheduledFor: ''
  });

  // Fetch roles for targeting
  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      if (response.data.success) {
        setRoles(response.data.roles);
      }
    } catch (error) {
      console.error('[AnnouncementForm] Error fetching roles:', error);
    }
  };

  // Fetch announcement (if editing)
  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/announcements/${params.id}`);
      
      if (response.data.success) {
        const announcement = response.data.announcement;
        setFormData({
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          category: announcement.category,
          targetAudience: announcement.targetAudience,
          targetRoles: announcement.targetRoles?.map(r => r._id) || [],
          expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : '',
          isPinned: announcement.isPinned,
          scheduledFor: announcement.scheduledFor ? new Date(announcement.scheduledFor).toISOString().slice(0, 16) : ''
        });
      }
    } catch (error) {
      console.error('[AnnouncementForm] Error fetching announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
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
        expiresAt: formData.expiresAt || null,
        scheduledFor: formData.scheduledFor || null,
        targetRoles: formData.targetAudience === 'specific_roles' ? formData.targetRoles : []
      };

      let response;
      if (isEditMode) {
        response = await api.patch(`/announcements/${params.id}`, payload);
      } else {
        response = await api.post('/announcements', payload);
      }

      if (response.data.success) {
        router.push('/portal/announcements');
      }
    } catch (error) {
      console.error('[AnnouncementForm] Error saving:', error);
      alert(error.response?.data?.message || 'Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  // Handle role selection
  const toggleRole = (roleId) => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(roleId)
        ? prev.targetRoles.filter(id => id !== roleId)
        : [...prev.targetRoles, roleId]
    }));
  };

   useEffect(() => {
    fetchRoles();
    if (isEditMode && params.id) {
      fetchAnnouncement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, isEditMode]);

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

      {/* Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Announcement' : 'Create New Announcement'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isEditMode ? 'Update announcement details' : 'Create a new announcement to notify users'}
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter announcement content"
              rows={8}
              required
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent resize-none"
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
              >
                <option value="low">Low - Informational</option>
                <option value="normal">Normal - General</option>
                <option value="high">High - Important</option>
                <option value="urgent">Urgent - Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value, targetRoles: [] })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="members">Members Only</option>
              <option value="volunteers">Volunteers Only</option>
              <option value="staff">Staff Only</option>
              <option value="specific_roles">Specific Roles</option>
            </select>

            {/* Role Selection */}
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
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Additional Options
            </h3>

            {/* Pin Announcement */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Pin size={16} className="text-yellow-600" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Pin this announcement
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Pinned announcements appear at the top of the list
                </p>
              </div>
            </label>

            {/* Expiration Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Clock size={16} />
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Announcement will be hidden after this date
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
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Announcement will be published at this date/time
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-initial px-6 py-3 bg-[#8B1A1A] text-white rounded-lg font-bold hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Saving...' : (isEditMode ? 'Update Announcement' : 'Create Announcement')}
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