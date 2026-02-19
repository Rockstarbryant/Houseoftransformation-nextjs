'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

export default function AnnouncementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    category: '',
    unreadOnly: false,
    startDate: '',
    endDate: ''
  });

  const canManageAnnouncements = hasPermission('manage:announcements');

  // ── Richer priority config with full colour sets ──────────────────────────
  const priorityConfig = {
    low: {
      icon: 'solar:info-circle-bold',
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-500/10',
      badge: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
      border: 'border-sky-300 dark:border-sky-500/40',
      label: 'Low'
    },
    normal: {
      icon: 'solar:bell-bing-bold',
      color: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-100 dark:bg-slate-700/40',
      badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-600',
      label: 'Normal'
    },
    high: {
      icon: 'solar:danger-bold',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-500/40',
      label: 'High'
    },
    urgent: {
      icon: 'solar:bolt-circle-bold',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-600/10',
      badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
      border: 'border-red-400 dark:border-red-500/50',
      label: 'Urgent'
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: '20', ...filters });
      const response = await api.get(`/announcements?${params}`);
      if (response.data.success) {
        setAnnouncements(response.data.announcements);
        setTotalPages(response.data.pages);
      }
    } catch (error) {
      console.error('[Announcements] Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/announcements/count/unread');
      if (response.data.success) setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('[Announcements] Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/announcements/${id}/read`);
      setAnnouncements(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
      fetchUnreadCount();
    } catch (error) {
      console.error('[Announcements] Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.post('/announcements/read/all');
      if (response.data.success) {
        setAnnouncements(prev => prev.map(a => ({ ...a, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('[Announcements] Error marking all as read:', error);
    }
  };

  const clearAll = async () => await markAllAsRead();

  const viewAnnouncement = (id) => router.push(`/portal/announcements/${id}`);

  const applyFilters = () => {
    setPage(1);
    fetchAnnouncements();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({ search: '', priority: '', category: '', unreadOnly: false, startDate: '', endDate: '' });
    setPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchUnreadCount();
  }, [page]);

  if (loading && announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#8B1A1A] rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8 pb-12 px-3 sm:px-4 lg:px-0">

      {/* ── HEADER & ACTIONS ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
        {/* Title block */}
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2 bg-[#8B1A1A]/10 rounded-lg text-[#8B1A1A]">
              <Icon icon="solar:megaphone-bold-duotone" width="28" className="sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Announcements
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
            Manage communication and system-wide notifications.
          </p>
        </div>

        {/* Action buttons – stack on mobile, row on larger screens */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-xl font-bold hover:bg-emerald-100 transition-all border border-emerald-200/50 text-sm"
            >
              <Icon icon="solar:check-read-linear" width="18" />
              <span className="hidden xs:inline">Mark All Read</span>
              <span className="xs:hidden">Mark Read</span>
            </button>
          )}
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
          >
            <Icon icon="solar:trash-bin-minimalistic-linear" width="18" />
            Clear
          </button>
          {canManageAnnouncements && (
            <button
              onClick={() => router.push('/portal/announcements/create')}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-[#8B1A1A] text-white rounded-xl font-bold hover:bg-red-800 shadow-lg shadow-red-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              <Icon icon="solar:add-circle-bold" width="18" />
              <span className="hidden sm:inline">New Announcement</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
        </div>
      </div>

      {/* ── STATS SUMMARY BAR ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Unread */}
        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 sm:gap-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 shrink-0">
            <Icon icon="solar:letter-unread-bold-duotone" width="20" className="sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Unread</p>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{unreadCount}</p>
          </div>
        </div>

        {/* Pinned */}
        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 sm:gap-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
            <Icon icon="solar:pin-list-bold-duotone" width="20" className="sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Pinned</p>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {announcements.filter(a => a.isPinned).length}
            </p>
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 sm:gap-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
            <Icon icon="solar:ranking-bold-duotone" width="20" className="sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Priority</p>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {announcements.filter(a => a.priority === 'urgent' || a.priority === 'high').length}
            </p>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTERS ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-linear" className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" />
            <input
              type="text"
              placeholder="Search by title or content..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold transition-all text-sm ${
              showFilters ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Icon icon="solar:filter-bold-duotone" width="18" />
            Filters
            <Icon icon="solar:alt-arrow-down-linear" width="14" className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full p-2 sm:p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                >
                  <option value="">All Levels</option>
                  {Object.keys(priorityConfig).map(k => <option key={k} value={k}>{priorityConfig[k].label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full p-2 sm:p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="event">Event</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Date From</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full p-2 sm:p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
              <div className="flex items-end gap-2 col-span-2 sm:col-span-1">
                <button onClick={applyFilters} className="flex-1 py-2 sm:py-2.5 bg-[#8B1A1A] text-white rounded-lg font-bold text-sm hover:bg-red-800 transition-colors">
                  Apply
                </button>
                <button onClick={resetFilters} className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-bold">
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ANNOUNCEMENTS LIST ───────────────────────────────────────────────── */}
      <div className="space-y-3 sm:space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-10 sm:p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Icon icon="solar:document-add-bold-duotone" width="40" className="sm:w-12 sm:h-12 text-slate-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
            <p className="text-sm sm:text-base text-slate-500 max-w-sm mx-auto">
              Try adjusting your filters or create a new announcement to get started.
            </p>
          </div>
        ) : (
          announcements.map((announcement) => {
            const config = priorityConfig[announcement.priority] || priorityConfig.normal;
            return (
              <div
                key={announcement._id}
                onClick={() => viewAnnouncement(announcement._id)}
                className={`
                  group relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl
                  border transition-all cursor-pointer
                  hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none
                  hover:border-[#8B1A1A]/30
                  ${!announcement.isRead
                    ? `border-l-4 ${config.border} border-t border-r border-b border-slate-200 dark:border-slate-700`
                    : 'border border-slate-200 dark:border-slate-700'}
                `}
              >
                {/* Subtle priority tint strip on unread – visible on the left */}
                <div className="flex items-start gap-3 sm:gap-5 p-4 sm:p-5">

                  {/* Priority icon badge */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${config.bg} flex items-center justify-center ${config.color} shrink-0`}>
                    <Icon icon={config.icon} width="22" className="sm:w-7 sm:h-7" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-[#8B1A1A] transition-colors line-clamp-1">
                          {announcement.title}
                        </h3>
                        {!announcement.isRead && (
                          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                        )}
                        {announcement.isPinned && (
                          <Icon icon="solar:pin-bold" className="text-amber-500 shrink-0" width="16" />
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md shrink-0 whitespace-nowrap">
                        {formatDate(announcement.createdAt)}
                      </span>
                    </div>

                    {/* Preview text */}
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm line-clamp-2 mb-3 leading-relaxed">
                      {announcement.content}
                    </p>

                    {/* Meta chips */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-4">
                      {/* Category */}
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg">
                        <Icon icon="solar:tag-bold-duotone" width="12" />
                        <span className="capitalize">{announcement.category}</span>
                      </div>

                      {/* Priority badge – colour-coded per level */}
                      <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-black px-2 py-1 ${config.badge} rounded-lg uppercase tracking-tight`}>
                        <Icon icon="solar:ranking-bold" width="12" />
                        {config.label}
                      </div>

                      {/* Author – hidden on very small screens */}
                      <div className="hidden xs:flex items-center gap-1 text-[10px] sm:text-xs font-medium text-slate-400">
                        <Icon icon="solar:user-circle-bold" width="14" />
                        <span>By <span className="text-slate-600 dark:text-slate-200">{announcement.author?.name || 'Admin'}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Right-side action buttons */}
                  <div className="flex flex-col gap-1.5 sm:gap-2 shrink-0">
                    {!announcement.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(announcement._id); }}
                        className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg sm:rounded-xl transition-all"
                        title="Mark as Read"
                      >
                        <Icon icon="solar:check-circle-bold" width="18" className="sm:w-[22px] sm:h-[22px]" />
                      </button>
                    )}
                    <button className="p-2 sm:p-2.5 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors">
                      <Icon icon="solar:alt-arrow-right-linear" width="20" className="sm:w-6 sm:h-6" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── PAGINATION ───────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 sm:gap-3 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Icon icon="solar:alt-arrow-left-linear" width="18" className="sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1">
            <span className="text-sm font-black text-slate-900 dark:text-white px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {page}
            </span>
            <span className="text-sm font-bold text-slate-400 px-2">of {totalPages}</span>
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Icon icon="solar:alt-arrow-right-linear" width="18" className="sm:w-5 sm:h-5" />
          </button>
        </div>
      )}
    </div>
  );
}