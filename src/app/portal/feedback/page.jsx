'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Archive,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { feedbackService } from '@/services/api/feedbackService';
import Loader from '@/components/common/Loader';

export default function FeedbackPage() {
  const router = useRouter();
  const { user } = useAuth();

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [success, setSuccess] = useState(null);
  const [recycledFeedback, setRecycledFeedback] = useState([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [loadingRecycle, setLoadingRecycle] = useState(false);

  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    anonymous: 'all'
  });

  // ============================================
  // PERMISSION CHECKS
  // ============================================

  const canReadCategory = (category) => {
    if (!user?.role?.permissions) return false;
    const perms = user.role.permissions;
    return perms.includes('manage:feedback') || perms.includes(`read:feedback:${category}`);
  };

  const canRespondCategory = (category) => {
    if (!user?.role?.permissions) return false;
    const perms = user.role.permissions;
    return perms.includes('manage:feedback') || perms.includes(`respond:feedback:${category}`);
  };

  const canPublishTestimony = () => {
    if (!user?.role?.permissions) return false;
    const perms = user.role.permissions;
    return perms.includes('manage:feedback') || perms.includes('publish:feedback:testimony');
  };

  const canArchiveCategory = (category) => {
    if (!user?.role?.permissions) return false;
    const perms = user.role.permissions;
    return perms.includes('manage:feedback') || perms.includes(`archive:feedback:${category}`);
  };

  const canViewStats = () => {
    if (!user?.role?.permissions) return false;
    const perms = user.role.permissions;
    return perms.includes('manage:feedback') || perms.includes('view:feedback:stats');
  };

  const canAccessAnyFeedback = () => {
    if (!user?.role?.permissions) return false;
    return user.role.permissions.some(p => p.includes('feedback'));
  };

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
  if (canAccessAnyFeedback()) {
    fetchData();
  } else {
    setError('You do not have permission to access feedback');
    setIsLoading(false);
  }
  }, [user?.role?.permissions]); // Only refetch when permissions change

  useEffect(() => {
  applyFilters();
  }, [feedback, filters]);

  // ============================================
// FETCH RECYCLED FEEDBACK
// ============================================

const fetchRecycledFeedback = async () => {
  setLoadingRecycle(true);
  try {
    const data = await feedbackService.getRecycledFeedback();
    setRecycledFeedback(data.recycled || []);
  } catch (err) {
    console.error('Error fetching recycled feedback:', err);
    setError('Failed to load recycled feedback');
  } finally {
    setLoadingRecycle(false);
  }
};

// ============================================
// FETCH ALL DATA (Updated to include recycled)
// ============================================

const fetchData = async () => {
  try {
    setIsLoading(true);
    console.log('Fetching feedback data...');
    
    const [feedbackRes, statsRes] = await Promise.all([
      feedbackService.getAllFeedback(),
      feedbackService.getStats()
    ]);

    console.log('Feedback response:', feedbackRes);
    console.log('Stats response:', statsRes);

    if (feedbackRes.success) {
      setFeedback(feedbackRes.feedback || []);
    } else {
      setError('Failed to load feedback');
    }

    if (statsRes.success) {
      setStats(statsRes.stats);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    setError(error.response?.data?.message || 'Failed to load feedback data. Please check your connection.');
    setFeedback([]);
    setStats({
      total: 0,
      pending: 0,
      urgentPrayers: 0,
      anonymous: 0,
      thisWeek: 0
    });
  } finally {
    setIsLoading(false);
  }
};


  const applyFilters = () => {
    let filtered = [...feedback];

    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.anonymous === 'true') {
      filtered = filtered.filter(item => item.isAnonymous === true);
    } else if (filters.anonymous === 'false') {
      filtered = filtered.filter(item => item.isAnonymous === false);
    }

    setFilteredFeedback(filtered);
  };

  // ============================================
  // ACTION HANDLERS
  // ============================================

  const handleViewDetails = (item) => {
    if (!canReadCategory(item.category)) {
      setError(`You don't have permission to view ${item.category} feedback`);
      return;
    }
    setSelectedFeedback(item);
    setResponseText('');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedFeedback) return;

    setIsSubmitting(true);
    try {
      const response = await feedbackService.updateStatus(selectedFeedback._id, { 
        status,
        adminNotes: ''
      });

      if (response.success) {
        setSuccess(`Feedback marked as ${status}`);
        await fetchData();
        setIsModalOpen(false);
        setSelectedFeedback(null);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishTestimony = async () => {
    if (!selectedFeedback || selectedFeedback.category !== 'testimony') return;
    if (!canPublishTestimony()) {
      setError('You do not have permission to publish testimonies');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await feedbackService.publishTestimony(selectedFeedback._id);

      if (response.success) {
        setSuccess('Testimony published successfully!');
        await fetchData();
        setIsModalOpen(false);
        setSelectedFeedback(null);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish testimony');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveFeedback = async () => {
    if (!selectedFeedback) return;
    if (!canArchiveCategory(selectedFeedback.category)) {
      setError(`You don't have permission to archive ${selectedFeedback.category} feedback`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await feedbackService.archiveFeedback?.(selectedFeedback._id);

      if (response?.success) {
        setSuccess('Feedback archived successfully');
        await fetchData();
        setIsModalOpen(false);
        setSelectedFeedback(null);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResponse = async () => {
  if (!selectedFeedback || !responseText.trim()) return;
  if (!canRespondCategory(selectedFeedback.category)) {
    setError(`You don't have permission to respond to ${selectedFeedback.category} feedback`);
    return;
  }

  setIsSubmitting(true);
  try {
    const response = await feedbackService.respondToFeedback(
      selectedFeedback._id,
      responseText
    );

    if (response.success) {
      // Check if email was sent successfully
      if (response.emailSent) {
        setSuccess('✅ Response sent and email delivered successfully!');
      } else if (response.emailError) {
        setSuccess(`⚠️ Response saved but email failed: ${response.emailError || 'Unknown error'}. Please contact user directly.`);
      } else {
        setSuccess('✅ Response saved successfully');
      }
      
      setResponseText('');
      await fetchData();
      setTimeout(() => setSuccess(null), 5000);
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to send response');
  } finally {
    setIsSubmitting(false);
  }
  };

  const handleDeleteFeedback = async () => {
  if (!selectedFeedback) return;
  
  // Confirm before delete
  if (!window.confirm('Are you sure you want to permanently delete this feedback? This cannot be undone.')) {
    return;
  }

  setIsSubmitting(true);
  try {
    const response = await feedbackService.deleteFeedback(selectedFeedback._id);

    if (response.success) {
      setSuccess('Feedback permanently deleted');
      await fetchData();
      setIsModalOpen(false);
      setSelectedFeedback(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to delete feedback');
  } finally {
    setIsSubmitting(false);
  }
};

  // ============================================
  // UI HELPERS
  // ============================================

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      reviewed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Eye },
      published: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      responded: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Send },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Archive }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      sermon: '📖',
      service: '⛪',
      testimony: '🙏',
      suggestion: '💡',
      prayer: '🙌',
      general: '💬'
    };
    return icons[category] || '📋';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================================
  // PERMISSION CHECK
  // ============================================

  if (!canAccessAnyFeedback() && !isLoading) {
    return (
      <div className="space-y-6">
        <Link href="/portal" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">
            Access Denied
          </h2>
          <p className="text-red-700 dark:text-red-300">
            You do not have permission to access the feedback management page
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader fullScreen text="Loading feedback..." />
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/portal" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-4">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={40} className="text-[#8B1A1A]" />
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            Feedback Management
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Review, respond to, and manage community feedback
        </p>
      </div>

      {/* Messages */}
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

      {/* Stats */}
      {stats && canViewStats() && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Total Feedback</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{stats.thisWeek} this week</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Pending</p>
            <p className="text-3xl font-black text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Urgent Prayers</p>
            <p className="text-3xl font-black text-red-600">{stats.urgentPrayers || 0}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Anonymous</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.total > 0 ? Math.round((stats.anonymous / stats.total) * 100) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-slate-600 dark:text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
          >
            <option value="all">All Categories</option>
            <option value="sermon">Sermon Feedback</option>
            <option value="service">Service Experience</option>
            <option value="testimony">Testimonies</option>
            <option value="suggestion">Suggestions</option>
            <option value="prayer">Prayer Requests</option>
            <option value="general">General Feedback</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="published">Published</option>
            <option value="responded">Responded</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filters.anonymous}
            onChange={(e) => setFilters({ ...filters, anonymous: e.target.value })}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
          >
            <option value="all">All Types</option>
            <option value="false">With Contact</option>
            <option value="true">Anonymous</option>
          </select>

          <button
            onClick={fetchData}
            className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Feedback ({filteredFeedback.length})
        </h3>

        {filteredFeedback.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No feedback found</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {feedback.length === 0 
                ? 'No feedback has been submitted yet'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <div
                key={item._id}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)} Feedback
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {item.isAnonymous ? '🔒 Anonymous' : item.name} • {formatDate(item.submittedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {getStatusBadge(item.status)}
                      {item.isAnonymous && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          🔒 Anonymous
                        </span>
                      )}
                    </div>
                  </div>

                  {canReadCategory(item.category) && (
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="px-4 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECYCLE BIN TAB */}
<div className="mt-8">
  <button
    onClick={() => {
      setShowRecycleBin(!showRecycleBin);
      if (!showRecycleBin) {
        fetchRecycledFeedback();
      }
    }}
    className="mb-6 px-6 py-3 bg-slate-600 dark:bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
  >
    <Trash2 size={20} />
    {showRecycleBin ? 'Hide' : 'Show'} Recycle Bin ({recycledFeedback.length})
  </button>

  {showRecycleBin && (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        Recycle Bin
      </h3>

      {recycledFeedback.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Recycle bin is empty
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Deleted feedback will appear here for 30 days before permanent deletion
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recycledFeedback.map((item) => (
            <div
              key={item._id}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)} Feedback
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.isAnonymous ? '🔒 Anonymous' : item.name} • {formatDate(item.deletedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-200">
                      🗑️ Deleted
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        setIsSubmitting(true);
                        const response = await feedbackService.restoreFromRecycle(item._id);
                        if (response.success) {
                          setSuccess('Feedback restored from recycle bin');
                          await fetchData();
                          await fetchRecycledFeedback();
                          setTimeout(() => setSuccess(null), 3000);
                        }
                      } catch (err) {
                        setError(err.response?.data?.message || 'Failed to restore feedback');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Restore
                  </button>

                  <button
                    onClick={async () => {
                      if (!window.confirm('Permanently delete this feedback? This cannot be undone.')) return;
                      try {
                        setIsSubmitting(true);
                        const response = await feedbackService.deleteFeedback(item._id);
                        if (response.success) {
                          setSuccess('Feedback permanently deleted');
                          await fetchRecycledFeedback();
                          setTimeout(() => setSuccess(null), 3000);
                        }
                      } catch (err) {
                        setError(err.response?.data?.message || 'Failed to delete feedback');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>

      {/* Modal */}
      {isModalOpen && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                  {selectedFeedback.category} Feedback
                </h2>
                <button
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status Info */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Submitted: {formatDate(selectedFeedback.submittedAt)}
                  </p>
                  {selectedFeedback.reviewedAt && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Reviewed by: {selectedFeedback.reviewedBy?.name} on {formatDate(selectedFeedback.reviewedAt)}
                    </p>
                  )}
                </div>
                {getStatusBadge(selectedFeedback.status)}
              </div>

              {/* Contact Info */}
              {!selectedFeedback.isAnonymous && (
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Name</label>
                    <p className="text-slate-900 dark:text-white">{selectedFeedback.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Email</label>
                    <p className="text-slate-900 dark:text-white">{selectedFeedback.email || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="space-y-4">
                {Object.entries(selectedFeedback.feedbackData || {})
                  .filter(([, value]) => value && typeof value !== 'object')
                  .map(([key, value]) => (
                    <div key={key}>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                        {String(value)}
                      </p>
                    </div>
                  ))}
              </div>

              {/* Response Section */}
              {!selectedFeedback.isAnonymous && selectedFeedback.allowFollowUp && selectedFeedback.status !== 'responded' && canRespondCategory(selectedFeedback.category) && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Send Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows="4"
                    disabled={isSubmitting}
                    placeholder="Type your response here..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendResponse}
                    disabled={isSubmitting || !responseText.trim()}
                    className="mt-3 px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Sending...' : 'Send Response'}
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                {selectedFeedback.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus('reviewed')}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    {isSubmitting ? 'Processing...' : 'Mark Reviewed'}
                  </button>
                )}

                {selectedFeedback.category === 'testimony' && canPublishTestimony() && ['pending', 'reviewed'].includes(selectedFeedback.status) && (
                  <button
                    onClick={handlePublishTestimony}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    {isSubmitting ? 'Publishing...' : 'Publish Testimony'}
                  </button>
                )}

                {canArchiveCategory(selectedFeedback.category) && selectedFeedback.status !== 'archived' && (
                  <button
                    onClick={handleArchiveFeedback}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                     >
                    <Archive size={16} />
                     Archive
                    </button>
                    )}

                    {/* DELETE BUTTON - Only show for soft-deleted items (in recycle bin) */}
                  {selectedFeedback.isDeleted && (
                 <button
                onClick={handleDeleteFeedback}
              disabled={isSubmitting}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
              <Trash2 size={16} />
              {isSubmitting ? 'Deleting...' : 'Permanently Delete'}
              </button>
                )}

               {/* SOFT DELETE BUTTON - Move to recycle bin */}
{!selectedFeedback.isDeleted && canArchiveCategory(selectedFeedback.category) && (
  <button
    onClick={async () => {
      if (!window.confirm('Move this feedback to recycle bin?')) return;
      setIsSubmitting(true);
      try {
        const response = await feedbackService.softDeleteFeedback(selectedFeedback._id);
        if (response.success) {
          setSuccess('Feedback moved to recycle bin');
          await fetchData();
          setIsModalOpen(false);
          setSelectedFeedback(null);
          setTimeout(() => setSuccess(null), 3000);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete feedback');
      } finally {
        setIsSubmitting(false);
      }
    }}
    disabled={isSubmitting}
    className="px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
  >
    <Trash2 size={16} />
    Soft Delete
  </button>
)}

{/* PERMANENT DELETE BUTTON - Only for recycled items */}
{selectedFeedback.isDeleted && (
  <button
    onClick={handleDeleteFeedback}
    disabled={isSubmitting}
    className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
  >
    <Trash2 size={16} />
    {isSubmitting ? 'Deleting...' : 'Permanently Delete'}
  </button>
)}
                <button
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 ml-auto"
                    >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}