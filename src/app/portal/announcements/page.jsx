'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Filter,
  Search,
  CheckCheck,
  Trash2,
  Calendar,
  AlertCircle,
  Info,
  AlertTriangle,
  Zap,
  ChevronDown,
  X
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Announcements List Page
 * Shows all announcements with filtering, search, and mark as read
 */
export default function AnnouncementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Filters
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

  // Priority icons and colors
  const priorityConfig = {
    low: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Low' },
    normal: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Normal' },
    high: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', label: 'High' },
    urgent: { icon: Zap, color: 'text-red-600', bg: 'bg-red-50', label: 'Urgent' }
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filters
      });

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

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/announcements/count/unread');
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('[Announcements] Error fetching unread count:', error);
    }
  };

  // Mark single announcement as read
  const markAsRead = async (id) => {
    try {
      await api.post(`/announcements/${id}/read`);
      
      // Update local state
      setAnnouncements(prev =>
        prev.map(a => a._id === id ? { ...a, isRead: true } : a)
      );
      
      fetchUnreadCount();
    } catch (error) {
      console.error('[Announcements] Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await api.post('/announcements/read/all');
      
      if (response.data.success) {
        // Update all announcements to read
        setAnnouncements(prev =>
          prev.map(a => ({ ...a, isRead: true }))
        );
        
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('[Announcements] Error marking all as read:', error);
    }
  };

  // Clear all notifications (mark all as read)
  const clearAll = async () => {
    await markAllAsRead();
  };

  // View announcement details
  const viewAnnouncement = (id) => {
    router.push(`/portal/announcements/${id}`);
  };

  // Apply filters
  const applyFilters = () => {
    setPage(1);
    fetchAnnouncements();
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      priority: '',
      category: '',
      unreadOnly: false,
      startDate: '',
      endDate: ''
    });
    setPage(1);
  };

  // Format date
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Announcements
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Create Button (if has permission) */}
            {canManageAnnouncements && (
              <button
                onClick={() => router.push('/portal/announcements/create')}
                className="px-4 py-2 bg-[#8B1A1A] text-white rounded-lg font-semibold hover:bg-red-900 transition-colors"
              >
                Create Announcement
              </button>
            )}

            {/* Mark All as Read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCheck size={18} />
                <span className="hidden md:inline">Mark All Read</span>
              </button>
            )}

            {/* Clear All */}
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              <span className="hidden md:inline">Clear All</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search announcements..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Filter size={18} />
            <span>Filters</span>
            <ChevronDown size={18} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-4 border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="general">General</option>
                    <option value="event">Event</option>
                    <option value="service">Service</option>
                    <option value="urgent">Urgent</option>
                    <option value="ministry">Ministry</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>

                {/* Unread Only */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.unreadOnly}
                      onChange={(e) => setFilters({ ...filters, unreadOnly: e.target.checked })}
                      className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                    />
                    <span className="text-sm text-slate-900 dark:text-white">Unread only</span>
                  </label>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-[#8B1A1A] text-white rounded-lg font-semibold hover:bg-red-900 transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center">
            <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-semibold">
              No announcements found
            </p>
          </div>
        ) : (
          announcements.map((announcement) => {
            const PriorityIcon = priorityConfig[announcement.priority].icon;
            const priorityColor = priorityConfig[announcement.priority].color;
            const priorityBg = priorityConfig[announcement.priority].bg;

            return (
              <div
                key={announcement._id}
                onClick={() => viewAnnouncement(announcement._id)}
                className={`
                  bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-sm cursor-pointer
                  hover:shadow-md transition-all border-l-4
                  ${!announcement.isRead ? 'border-l-[#8B1A1A] bg-red-50/30 dark:bg-red-950/10' : 'border-l-transparent'}
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Priority Icon */}
                  <div className={`p-3 ${priorityBg} dark:${priorityBg}/20 rounded-lg flex-shrink-0`}>
                    <PriorityIcon size={24} className={priorityColor} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {announcement.title}
                        {!announcement.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(announcement.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {announcement.content}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded capitalize">
                        {announcement.category}
                      </span>
                      <span className={`px-2 py-1 ${priorityBg} dark:${priorityBg}/20 ${priorityColor} rounded capitalize font-semibold`}>
                        {priorityConfig[announcement.priority].label}
                      </span>
                      {announcement.isPinned && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded font-semibold">
                          📌 Pinned
                        </span>
                      )}
                      <span>by {announcement.author?.name || 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Mark as Read Button */}
                  {!announcement.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(announcement._id);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                      title="Mark as read"
                    >
                      <CheckCheck size={20} className="text-green-600" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}