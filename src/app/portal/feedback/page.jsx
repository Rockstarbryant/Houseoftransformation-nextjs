'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  ArrowLeft, MessageSquare, Filter, RefreshCw, Eye, CheckCircle, XCircle, Clock, AlertCircle, Send, Archive, Trash2, RotateCcw, BookOpen, Sparkles, Users, Lightbulb, Heart, MessageCircle, Lock, FileText } from 'lucide-react';
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user?.role?.permissions]); //

  useEffect(() => {
  applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [feedback, filters]); // Intentional: applyFilters uses these dependencies

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
    const iconMap = {
      sermon: BookOpen,
      service: Sparkles,
      testimony: Users,
      suggestion: Lightbulb,
      prayer: Heart,
      general: MessageCircle
    };
    return iconMap[category] || FileText;
  };

   // Helper function to get category color
  const getCategoryColor = (category) => {
    const colorMap = {
      sermon: 'text-blue-600 dark:text-blue-400',
      service: 'text-purple-600 dark:text-purple-400',
      testimony: 'text-amber-600 dark:text-amber-400',
      suggestion: 'text-emerald-600 dark:text-emerald-400',
      prayer: 'text-red-600 dark:text-red-400',
      general: 'text-slate-600 dark:text-slate-400'
    };
    return colorMap[category] || 'text-slate-600 dark:text-slate-400';
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
      <div className="space-y-6 p-4">
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
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
    </div>
  );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center p-4 gap-6 mb-2">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            Feedback Management
          </h1>
        </div>
        <p className="text-slate-600 p-4 dark:text-slate-400">
          Review, respond to, and manage community feedback
        </p>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-500 dark:bg-green-700 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-white dark:text-green-200 font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500 dark:bg-red-700 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-white dark:text-red-200 font-semibold">{error}</p>
        </div>
      )}

      {/* Stats */}
      {!isLoading && stats && canViewStats() && (
        <div className="grid grid-cols-2 md:grid-cols-4 p-0 gap-2">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
            <p className="text-sm text-slate-700 dark:text-slate-200 mb-2">Total Feedback</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-slate-700 dark:text-slate-200 mt-2">{stats.thisWeek} this week</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
            <p className="text-sm text-slate-700 dark:text-slate-200 mb-2">Pending</p>
            <p className="text-2xl font-black text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
            <p className="text-sm text-slate-700 dark:text-slate-200 mb-2">Urgent Prayers</p>
            <p className="text-2xl font-black text-red-600">{stats.urgentPrayers || 0}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
            <p className="text-sm text-slate-700 dark:text-slate-200 mb-2">Anonymous</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total > 0 ? Math.round((stats.anonymous / stats.total) * 100) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {/* Filters */}
      {!isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-slate-700 dark:text-slate-200" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-3 bg-red-900 dark:bg-red-900 border rounded-lg text-slate-100 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
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
            className="px-4 py-3 bg-red-900 dark:bg-red-900 border rounded-lg text-slate-100 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
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
            className="px-4 py-3 bg-red-900 dark:bg-red-900 border rounded-lg text-slate-100 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
          >
            <option value="all">All Types</option>
            <option value="false">With Contact</option>
            <option value="true">Anonymous</option>
          </select>

          <button
          onClick={fetchData}
          disabled={isLoading}
           className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
             >
           <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
           </button>
        </div>
      </div>
      )}


      {/* Feedback List */}
      {/* Feedback List */}
      {!isLoading && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
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
          <div className="space-y-6">
            {filteredFeedback.map((item) => (
              <div
                key={item._id}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-0 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col py-2 md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {/* ✅ ICON INSTEAD OF EMOJI */}
                      <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-900 ${getCategoryColor(item.category)}`}>
                        {(() => {
                          const IconComponent = getCategoryIcon(item.category);
                          return <IconComponent size={24} />;
                        })()}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)} Feedback
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          {/* ✅ ICON FOR ANONYMOUS */}
                          {item.isAnonymous ? (
                            <span className="inline-flex items-center gap-1">
                              <Lock size={14} /> Anonymous
                            </span>
                          ) : item.name} 
                          <span>•</span> 
                          {formatDate(item.submittedAt)}
                        </p>
                      </div>
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
      )}

      {/* RECYCLE BIN TAB */}
      {!isLoading && (
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
                {/* ✅ ICON INSTEAD OF EMOJI */}
                <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-900 opacity-50 ${getCategoryColor(item.category)}`}>
                  {(() => {
                    const IconComponent = getCategoryIcon(item.category);
                    return <IconComponent size={24} />;
                  })()}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white line-through">
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)} Feedback
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    {/* ✅ ICON FOR ANONYMOUS */}
                    {item.isAnonymous ? (
                      <span className="inline-flex items-center gap-1">
                        <Lock size={14} /> Anonymous
                      </span>
                    ) : item.name} 
                    <span>•</span> 
                    Deleted {formatDate(item.deletedAt)}
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
    )}

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
                  {/* ✅ NEW: PHONE NUMBER FIELD */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Phone</label>
                    <p className="text-slate-900 dark:text-white">{selectedFeedback.phone || 'Not provided'}</p>
                  </div>
                </div>
              )}


              {/* Content */}
              <div className="space-y-4">
                {/* ============================================ */}
                {/* SERMON FEEDBACK - Already complete ✅ */}
                {/* ============================================ */}
                {selectedFeedback.category === 'sermon' && (
                  <>
                    {selectedFeedback.feedbackData.sermonTitle && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Sermon Title
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                          {selectedFeedback.feedbackData.sermonTitle}
                        </p>
                      </div>
                    )}
                    {selectedFeedback.feedbackData.sermonDate && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Sermon Date
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                          {new Date(selectedFeedback.feedbackData.sermonDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedFeedback.feedbackData.rating && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Rating
                        </label>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                          <span className="text-2xl font-bold text-yellow-500">
                            {'⭐'.repeat(selectedFeedback.feedbackData.rating)}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            ({selectedFeedback.feedbackData.rating}/5)
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedFeedback.feedbackData.resonatedMost && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          What Resonated Most
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedFeedback.feedbackData.resonatedMost}
                        </p>
                      </div>
                    )}
                    {selectedFeedback.feedbackData.application && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Application Steps
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedFeedback.feedbackData.application}
                        </p>
                      </div>
                    )}
                    {selectedFeedback.feedbackData.questions && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Questions
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedFeedback.feedbackData.questions}
                        </p>
                      </div>
                    )}
                    {selectedFeedback.feedbackData.wouldRecommend !== undefined && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Would Recommend
                        </label>
                        <p className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                          selectedFeedback.feedbackData.wouldRecommend 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {selectedFeedback.feedbackData.wouldRecommend ? '✅ Yes' : '❌ No'}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* ============================================ */}
                {/* SERVICE FEEDBACK - NEW FIELDS ADDED ✅ */}
                {/* ============================================ */}
                {selectedFeedback.category === 'service' && (
                  <>
                    {/* ✅ NEW: First Time Visitor Badge */}
                    {selectedFeedback.isFirstTimeVisitor && (
                      <div className="bg-slate-300 dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-blue-200">First Time Visitor</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">This person is new to our church!</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ✅ NEW: Ratings Display */}
                    {selectedFeedback.feedbackData.ratings && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-3">
                          Service Ratings
                        </label>
                        <div className="grid grid-cols-2 gap-1 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                          {Object.entries(selectedFeedback.feedbackData.ratings).map(([category, rating]) => (
                            rating > 0 && (
                              <div 
                                key={category} 
                                className="bg-white dark:bg-slate-800 px-2.5 py-2.5 rounded-lg flex flex-col min-w-0"
                              >
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wide">
                                  {category.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <div className="flex items-center shrink-0 gap-1 flex-wrap text-base">
                                  <span className="text-emerald-500 text-base leading-none">
                                    {'⭐'.repeat(rating)}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {rating}/5
                                  </span>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ✅ NEW: What Went Well */}
                    {selectedFeedback.feedbackData.whatWentWell && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          What Went Well
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedFeedback.feedbackData.whatWentWell}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Improvements */}
                    {selectedFeedback.feedbackData.improvements && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Suggestions for Improvement
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedFeedback.feedbackData.improvements}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Would Return */}
                    {selectedFeedback.feedbackData.wouldReturn && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Would Return / Recommend
                        </label>
                        <p className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                          selectedFeedback.feedbackData.wouldReturn === 'Yes' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : selectedFeedback.feedbackData.wouldReturn === 'Maybe'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {selectedFeedback.feedbackData.wouldReturn === 'Yes' && 'Yes'}
                          {selectedFeedback.feedbackData.wouldReturn === 'Maybe' && 'Maybe'}
                          {selectedFeedback.feedbackData.wouldReturn === 'No' && 'No'}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* ============================================ */}
                {/* TESTIMONY FEEDBACK - NEW FIELDS ADDED ✅ */}
                {/* ============================================ */}
                {selectedFeedback.category === 'testimony' && (
                  <>
                    {/* ✅ NEW: Testimony Type */}
                    {selectedFeedback.feedbackData.testimonyType && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Testimony Type
                        </label>
                        <p className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-bold">
                          {selectedFeedback.feedbackData.testimonyType}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Testimony Title */}
                    {selectedFeedback.feedbackData.title && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Title
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg font-bold text-lg">
                          {selectedFeedback.feedbackData.title}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Testimony Date */}
                    {selectedFeedback.feedbackData.testimonyDate && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Date of Occurrence
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                          {new Date(selectedFeedback.feedbackData.testimonyDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Story */}
                    {selectedFeedback.feedbackData.story && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Testimony Story
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedFeedback.feedbackData.story}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Share in Service */}
                    {selectedFeedback.feedbackData.shareInService && (
                      <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎤</span>
                          <div>
                            <p className="text-sm font-bold text-green-900 dark:text-green-200">Willing to Share in Service</p>
                            <p className="text-xs text-green-700 dark:text-green-300">This person is open to sharing publicly</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ✅ NEW: Allow Contact */}
                    {selectedFeedback.allowFollowUp && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📞</span>
                          <div>
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Open to Contact</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">Permission granted for follow-up</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ============================================ */}
                {/* SUGGESTION FEEDBACK - NEW FIELDS ADDED ✅ */}
                {/* ============================================ */}
                {selectedFeedback.category === 'suggestion' && (
                  <>
                    {/* ✅ NEW: Suggestion Type */}
                    {selectedFeedback.feedbackData.suggestionType && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Suggestion Category
                        </label>
                        <p className="inline-block px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-bold">
                          {selectedFeedback.feedbackData.suggestionType}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Suggestion Title */}
                    {selectedFeedback.feedbackData.suggestionTitle && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Title
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg font-bold text-lg">
                          {selectedFeedback.feedbackData.suggestionTitle}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Priority Level */}
                    {selectedFeedback.feedbackData.priority && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Priority Level
                        </label>
                        <p className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                          selectedFeedback.feedbackData.priority === 'High' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                            : selectedFeedback.feedbackData.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {selectedFeedback.feedbackData.priority === 'High' && 'High Priority'}
                          {selectedFeedback.feedbackData.priority === 'Medium' && 'Medium Priority'}
                          {selectedFeedback.feedbackData.priority === 'Low' && 'Low Priority'}
                        </p>
                      </div>
                    )}

                    {/* Description */}
                    {selectedFeedback.feedbackData.description && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Detailed Description
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedFeedback.feedbackData.description}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Importance */}
                    {selectedFeedback.feedbackData.importance && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Why It's Important
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedFeedback.feedbackData.importance}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Expected Benefit */}
                    {selectedFeedback.feedbackData.benefit && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Expected Impact / Benefit
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedFeedback.feedbackData.benefit}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Willing to Help */}
                    {selectedFeedback.feedbackData.willingToHelp && (
                      <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          
                          <div>
                            <p className="text-sm font-bold text-green-900 dark:text-green-200">Willing to Help Implement</p>
                            <p className="text-xs text-green-700 dark:text-green-300">This person volunteered to assist</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ============================================ */}
                {/* PRAYER REQUEST - NEW FIELDS ADDED ✅ */}
                {/* ============================================ */}
                {selectedFeedback.category === 'prayer' && (
                  <>
                    {/* ✅ NEW: Urgency Badge */}
                    {selectedFeedback.feedbackData.urgency && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Urgency Level
                        </label>
                        <p className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                          selectedFeedback.feedbackData.urgency === 'Urgent' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {selectedFeedback.feedbackData.urgency === 'Urgent' ? 'URGENT PRAYER' : 'Regular Prayer'}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Prayer Category */}
                    {selectedFeedback.feedbackData.prayerCategory && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Prayer Category
                        </label>
                        <p className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-bold">
                          {selectedFeedback.feedbackData.prayerCategory}
                        </p>
                      </div>
                    )}

                    {/* Prayer Request */}
                    {selectedFeedback.feedbackData.request && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Prayer Request
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedFeedback.feedbackData.request}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Share on Prayer List */}
                    {selectedFeedback.shareOnPrayerList && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Share on Church Prayer List</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">Permission to share with congregation</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ✅ NEW: Personal Prayer Follow-up */}
                    {selectedFeedback.feedbackData.prayerNeeded && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Requesting Personal Prayer</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300">Wants someone to pray with them</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ✅ NEW: Contact Preferences */}
                    {(selectedFeedback.feedbackData.preferredContact || selectedFeedback.feedbackData.bestTimeToContact) && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block">
                          Contact Preferences
                        </label>
                        {selectedFeedback.feedbackData.preferredContact && (
                          <p className="text-slate-900 dark:text-white">
                            <span className="font-bold">Method:</span> {selectedFeedback.feedbackData.preferredContact}
                          </p>
                        )}
                        {selectedFeedback.feedbackData.bestTimeToContact && (
                          <p className="text-slate-900 dark:text-white">
                            <span className="font-bold">Best Time:</span> {selectedFeedback.feedbackData.bestTimeToContact}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ============================================ */}
                {/* GENERAL FEEDBACK - NEW FIELDS ADDED ✅ */}
                {/* ============================================ */}
                {selectedFeedback.category === 'general' && (
                  <>
                    {/* ✅ NEW: Feedback Type */}
                    {selectedFeedback.feedbackData.feedbackType && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Feedback Type
                        </label>
                        <p className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full text-sm font-bold">
                          {selectedFeedback.feedbackData.feedbackType}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Subject */}
                    {selectedFeedback.feedbackData.subject && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Subject
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg font-bold">
                          {selectedFeedback.feedbackData.subject}
                        </p>
                      </div>
                    )}

                    {/* Message */}
                    {selectedFeedback.feedbackData.message && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-2">
                          Message
                        </label>
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedFeedback.feedbackData.message}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* ============================================ */}
                {/* FALLBACK: Show any remaining fields not handled above */}
                {/* ============================================ */}
                {Object.entries(selectedFeedback.feedbackData || {})
                  .filter(([key]) => {
                    // Skip fields we've already displayed
                    const displayedFields = [
                      // Sermon
                      'sermonTitle', 'sermonDate', 'rating', 'resonatedMost', 'application', 'questions', 'wouldRecommend',
                      // Service
                      'ratings', 'whatWentWell', 'improvements', 'wouldReturn',
                      // Testimony
                      'testimonyType', 'title', 'story', 'testimonyDate', 'shareInService',
                      // Suggestion
                      'suggestionType', 'suggestionTitle', 'description', 'importance', 'benefit', 'priority', 'willingToHelp',
                      // Prayer
                      'prayerCategory', 'request', 'urgency', 'prayerNeeded', 'preferredContact', 'bestTimeToContact',
                      // General
                      'feedbackType', 'subject', 'message'
                    ];
                    return !displayedFields.includes(key);
                  })
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