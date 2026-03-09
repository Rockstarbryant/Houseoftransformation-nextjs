'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Clock,
  AlertCircle,
  Info,
  AlertTriangle,
  Zap,
  Edit,
  Trash2,
  Eye, Mail, MessageSquare, RefreshCw, CheckCircle, XCircle, Users
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Announcement Detail Page
 * Shows full announcement content and metadata
 */
export default function AnnouncementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [notifStats, setNotifStats]     = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [resending, setResending]       = useState('');  // 'email' | 'sms' | 'both' | ''


  const canManageAnnouncements = hasPermission('manage:announcements');

  // Priority config
  const priorityConfig = {
    low: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Low Priority' },
    normal: { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Normal Priority' },
    high: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'High Priority' },
    urgent: { icon: Zap, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Urgent' }
  };

  // Fetch announcement
  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/announcements/${params.id}`);
      
      if (response.data.success) {
        setAnnouncement(response.data.announcement);
        
        // Mark as read if not already
        if (!response.data.announcement.isRead) {
          await api.post(`/announcements/${params.id}/read`);
        }
      }
    } catch (error) {
      console.error('[AnnouncementDetail] Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifStats = async () => {
  try {
    setLoadingStats(true);
    const res = await api.get(`/announcements/${params.id}/notification-stats`);
    if (res.data.success) setNotifStats(res.data.stats);
  } catch (e) {
    console.error('[NotifStats]', e);
  } finally {
    setLoadingStats(false);
  }
};

const handleResend = async (channel) => {
  if (!confirm(`Resend ${channel} notifications to all eligible opted-in users?`)) return;
  try {
    setResending(channel);
    const res = await api.post(`/announcements/${params.id}/resend`, { channel });
    if (res.data.success) {
      alert(`✅ ${res.data.message}. Delivery will complete in the background.`);
      setTimeout(fetchNotifStats, 4000); // refresh stats after worker runs
    }
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to queue resend');
  } finally {
    setResending('');
  }
};

// Add to useEffect — fetch stats when page loads (admin only):
useEffect(() => {
  if (params.id) {
    fetchAnnouncement();
    if (canManageAnnouncements) fetchNotifStats();
  }
}, [params.id]);

  // Delete announcement
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/announcements/${params.id}`);
      router.push('/portal/announcements');
    } catch (error) {
      console.error('[AnnouncementDetail] Error deleting:', error);
      alert('Failed to delete announcement');
    } finally {
      setDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

   useEffect(() => {
    if (params.id) {
      fetchAnnouncement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center">
        <AlertCircle size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Announcement not found
        </p>
        <button
          onClick={() => router.push('/portal/announcements')}
          className="mt-4 px-4 py-2 bg-[#8B1A1A] text-white rounded-lg font-semibold hover:bg-red-900 transition-colors"
        >
          Back to Announcements
        </button>
      </div>
    );
  }

  const PriorityIcon = priorityConfig[announcement.priority].icon;
  const priorityColor = priorityConfig[announcement.priority].color;
  const priorityBg = priorityConfig[announcement.priority].bg;
  const priorityBorder = priorityConfig[announcement.priority].border;
  const priorityLabel = priorityConfig[announcement.priority].label;

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

        {canManageAnnouncements && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/portal/announcements/${params.id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit size={18} />
              <span className="hidden md:inline">Edit</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 size={18} />
              <span className="hidden md:inline">{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Announcement Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Priority Banner */}
        <div className={`${priorityBg} dark:${priorityBg}/20 border-b ${priorityBorder} dark:${priorityBorder}/30 p-4`}>
          <div className="flex items-center gap-3">
            <PriorityIcon size={24} className={priorityColor} />
            <span className={`text-sm font-bold ${priorityColor} uppercase tracking-wide`}>
              {priorityLabel}
            </span>
            {announcement.isPinned && (
              <span className="ml-auto px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold">
                📌 PINNED
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
            {announcement.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <UserIcon size={18} />
              <span>{announcement.author?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{formatDate(announcement.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span>{announcement.statistics?.totalViews || 0} views</span>
            </div>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full capitalize font-semibold">
              {announcement.category}
            </span>
          </div>

          {/* Content */}
          <div className="prose dark:prose-invert max-w-none">
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {announcement.content}
            </div>
          </div>

          {/* Attachments (if any) */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                Attachments
              </h3>
              <div className="space-y-2">
                {announcement.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                        {attachment.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(attachment.fileSize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Expiration Info */}
          {announcement.expiresAt && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                <Clock size={18} />
                <span className="text-sm font-semibold">
                  Expires on {formatDate(announcement.expiresAt)}
                </span>
              </div>
            </div>
          )}

          {/* Target Audience */}
          {announcement.targetAudience !== 'all' && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-400">
                Target Audience: <span className="capitalize">{announcement.targetAudience}</span>
              </p>
              {announcement.targetRoles && announcement.targetRoles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {announcement.targetRoles.map((role) => (
                    <span
                      key={role._id}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold"
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 md:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <div>
              <span className="font-semibold">{announcement.statistics?.totalReads || 0}</span> people read this
            </div>
            <div className="text-xs">
              ID: {announcement._id}
            </div>
          </div>
        </div>

        {/* ── NOTIFICATION DELIVERY PANEL (admin only) ─────────────────────── */}
          {canManageAnnouncements && (
            <div className="border-t border-slate-200 dark:border-slate-700 px-6 md:px-8 py-6">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-[#8B1A1A]" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Notification Deliveries
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchNotifStats}
                    disabled={loadingStats}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    title="Refresh stats"
                  >
                    <RefreshCw size={16} className={loadingStats ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {loadingStats && !notifStats ? (
                <p className="text-sm text-slate-400 animate-pulse">Loading delivery data…</p>
              ) : notifStats ? (
                <div className="space-y-6">

                  {/* ── EMAIL ─────────────────────────────────────────────────── */}
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-blue-500" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          Email Notifications
                        </span>
                        {notifStats.email.enabled ? (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase">
                            Enabled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-500 text-[10px] font-bold rounded-full uppercase">
                            Disabled
                          </span>
                        )}
                      </div>
                      {/* Resend email button */}
                      <button
                        onClick={() => handleResend('email')}
                        disabled={!!resending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={resending === 'email' || resending === 'both' ? 'animate-spin' : ''} />
                        Resend Email
                      </button>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: 'Total Sent',  value: notifStats.email.total,      color: 'text-slate-700 dark:text-white' },
                        { label: 'Delivered',   value: notifStats.email.successful, color: 'text-emerald-600 dark:text-emerald-400' },
                        { label: 'Failed',      value: notifStats.email.failed,     color: 'text-red-600 dark:text-red-400' },
                      ].map(s => (
                        <div key={s.label} className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                          <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Recipient list */}
                    {notifStats.email.deliveries.length > 0 && (
                      <div className="max-h-48 overflow-y-auto space-y-1.5">
                        {notifStats.email.deliveries.map((d, i) => (
                          <div key={i} className="flex items-center justify-between text-xs bg-white dark:bg-slate-800 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-blue-600">
                                  {d.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 dark:text-white truncate">{d.name}</p>
                                <p className="text-slate-400 truncate">{d.email}</p>
                              </div>
                            </div>
                            {d.success
                              ? <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                              : <XCircle    size={14} className="text-red-500 shrink-0" />
                            }
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── SMS ───────────────────────────────────────────────────── */}
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-emerald-500" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          SMS Notifications
                        </span>
                        {notifStats.sms.enabled ? (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase">
                            Enabled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-500 text-[10px] font-bold rounded-full uppercase">
                            Disabled
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleResend('sms')}
                        disabled={!!resending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={resending === 'sms' || resending === 'both' ? 'animate-spin' : ''} />
                        Resend SMS
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: 'Total Sent',  value: notifStats.sms.total,      color: 'text-slate-700 dark:text-white' },
                        { label: 'Delivered',   value: notifStats.sms.successful, color: 'text-emerald-600 dark:text-emerald-400' },
                        { label: 'Failed',      value: notifStats.sms.failed,     color: 'text-red-600 dark:text-red-400' },
                      ].map(s => (
                        <div key={s.label} className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                          <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {notifStats.sms.deliveries.length > 0 && (
                      <div className="max-h-48 overflow-y-auto space-y-1.5">
                        {notifStats.sms.deliveries.map((d, i) => (
                          <div key={i} className="flex items-center justify-between text-xs bg-white dark:bg-slate-800 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-emerald-600">
                                  {d.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 dark:text-white truncate">{d.name}</p>
                                <p className="text-slate-400 truncate">{d.phone}</p>
                              </div>
                            </div>
                            {d.success
                              ? <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                              : <XCircle    size={14} className="text-red-500 shrink-0" />
                            }
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Resend both ───────────────────────────────────────────── */}
                  {(notifStats.email.enabled || notifStats.sms.enabled) && (
                    <button
                      onClick={() => handleResend('both')}
                      disabled={!!resending}
                      className="w-full py-2.5 bg-[#8B1A1A] text-white text-sm font-bold rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={16} className={resending === 'both' ? 'animate-spin' : ''} />
                      Resend All Notifications (Email + SMS)
                    </button>
                  )}

                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No notification data yet. Post an announcement with email or SMS enabled to see delivery stats.
                </p>
              )}
            </div>
          )}
          {/* ─────────────────────────────────────────────────────────────────── */}
      </div>
    </div>
  );
}