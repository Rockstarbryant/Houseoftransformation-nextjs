import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Send
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import { feedbackService } from '../../services/api/feedbackService';

const ManageFeedback = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseText, setResponseText] = useState('');

  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    anonymous: 'all'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedback, filters]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching feedback data...');
      
      // Fetch both feedback and stats
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
      
      // Set empty data to prevent crashes
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

  const handleViewDetails = (item) => {
    setSelectedFeedback(item);
    setResponseText('');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedFeedback) return;

    setIsSubmitting(true);
    try {
      const response = await feedbackService.updateStatus(selectedFeedback._id, { status });

      if (response.success) {
        await fetchData();
        setIsModalOpen(false);
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to update status: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishTestimony = async () => {
    if (!selectedFeedback || selectedFeedback.category !== 'testimony') return;

    setIsSubmitting(true);
    try {
      const response = await feedbackService.publishTestimony(selectedFeedback._id);

      if (response.success) {
        await fetchData();
        setIsModalOpen(false);
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish testimony: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await feedbackService.respondToFeedback(
        selectedFeedback._id,
        responseText
      );

      if (response.success) {
        await fetchData();
        setResponseText('');
        alert('Response sent successfully!');
      }
    } catch (error) {
      console.error('Send response error:', error);
      alert(error.response?.data?.message || 'Failed to send response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      reviewed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Eye },
      published: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      responded: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Send },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle }
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
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader />
          <p className="mt-4 text-gray-600">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && feedback.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold mb-4 transition"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Feedback</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Possible issues:</p>
            <ul className="text-sm text-gray-600 text-left max-w-md mx-auto space-y-2">
              <li>• Backend server is not running (check if server is on port 5000)</li>
              <li>• Feedback routes not registered in server.js</li>
              <li>• Database connection issues</li>
              <li>• Authentication token expired</li>
            </ul>
          </div>
          <div className="mt-6 space-x-3">
            <Button variant="primary" onClick={fetchData}>
              <RefreshCw size={16} /> Try Again
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin')}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold mb-4 transition"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={40} className="text-blue-900" />
          <h1 className="text-4xl font-bold text-blue-900">Feedback Management</h1>
        </div>
        <p className="text-gray-600">Review and respond to community feedback</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Feedback</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.thisWeek} this week
                </p>
              </div>
              <MessageSquare className="text-blue-900" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-600" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Urgent Prayers</p>
                <p className="text-3xl font-bold text-red-600">{stats.urgentPrayers || 0}</p>
              </div>
              <AlertCircle className="text-red-600" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Anonymous</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.total > 0 ? Math.round((stats.anonymous / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="text-4xl">🔒</div>
            </div>
          </Card>
        </div>
      )}

      {/* Urgent Prayers Alert */}
      {stats && stats.urgentPrayers > 0 && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0" size={32} />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-1">
                {stats.urgentPrayers} Urgent Prayer Request{stats.urgentPrayers !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700">
                These requests need immediate attention from the prayer team
              </p>
            </div>
            <button
              onClick={() => setFilters({ category: 'prayer', status: 'all', anonymous: 'all' })}
              className="ml-auto bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition flex-shrink-0"
            >
              Review Now
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filter Feedback</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
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
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
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
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="all">All Types</option>
              <option value="false">With Contact</option>
              <option value="true">Anonymous</option>
            </select>

            <Button variant="secondary" onClick={fetchData}>
              <RefreshCw size={16} /> Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Feedback List */}
      <Card>
        <h3 className="text-xl font-bold text-blue-900 mb-6">
          Feedback ({filteredFeedback.length})
        </h3>

        {filteredFeedback.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">No feedback found</p>
            <p className="text-sm">
              {feedback.length === 0 
                ? 'No feedback has been submitted yet. Check back later!'
                : 'Try adjusting your filters to see more results.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <div
                key={item._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)} Feedback
                        </h4>
                        <p className="text-sm text-gray-600">
                          From: {item.isAnonymous ? '🔒 Anonymous' : (item.name || 'Unknown')} • {formatDate(item.submittedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {getStatusBadge(item.status)}
                      {item.isAnonymous && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                          🔒 Anonymous
                        </span>
                      )}
                      {item.category === 'prayer' && item.feedbackData?.urgency === 'Urgent' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          🚨 Urgent
                        </span>
                      )}
                    </div>
                  </div>

                  <Button variant="primary" onClick={() => handleViewDetails(item)}>
                    <Eye size={16} /> View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={selectedFeedback ? `${selectedFeedback.category.charAt(0).toUpperCase() + selectedFeedback.category.slice(1)} Feedback` : 'Feedback Details'}
        size="lg"
      >
        {selectedFeedback && (
          <div className="space-y-6">
            {/* Status & Info */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <p className="text-sm text-gray-600">Submitted {formatDate(selectedFeedback.submittedAt)}</p>
                <p className="text-sm text-gray-600">
                  {selectedFeedback.isAnonymous ? '🔒 Anonymous Submission' : `By: ${selectedFeedback.name || 'Unknown'}`}
                </p>
              </div>
              {getStatusBadge(selectedFeedback.status)}
            </div>

            {/* Contact Info (if not anonymous) */}
            {!selectedFeedback.isAnonymous && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Name</label>
                  <p className="text-gray-900">{selectedFeedback.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedFeedback.email || 'N/A'}</p>
                </div>
                {selectedFeedback.phone && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedFeedback.phone}</p>
                  </div>
                )}
              </div>
            )}

            {/* Feedback Content */}
            <div className="space-y-4">
              {Object.entries(selectedFeedback.feedbackData || {}).map(([key, value]) => {
                if (!value || typeof value === 'object') return null;

                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                return (
                  <div key={key}>
                    <label className="text-sm font-semibold text-gray-600 block mb-2">
                      {label}
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {String(value)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Response Section (if not anonymous and allows follow-up) */}
            {!selectedFeedback.isAnonymous && selectedFeedback.allowFollowUp && selectedFeedback.status !== 'responded' && (
              <div className="pt-4 border-t">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Send Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows="4"
                  disabled={isSubmitting}
                  placeholder="Type your response here..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
                />
                <Button
                  variant="primary"
                  onClick={handleSendResponse}
                  disabled={isSubmitting || !responseText.trim()}
                  className="mt-3"
                >
                  <Send size={16} />
                  {isSubmitting ? 'Sending...' : 'Send Response'}
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {selectedFeedback.status === 'pending' && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => handleUpdateStatus('reviewed')}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <CheckCircle size={16} />
                    {isSubmitting ? 'Processing...' : 'Mark Reviewed'}
                  </Button>
                  {selectedFeedback.category === 'testimony' && (
                    <Button
                      variant="primary"
                      onClick={handlePublishTestimony}
                      disabled={isSubmitting}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle size={16} />
                      Publish Testimony
                    </Button>
                  )}
                </>
              )}

              {selectedFeedback.status === 'reviewed' && selectedFeedback.category === 'testimony' && (
                <Button
                  variant="primary"
                  onClick={handlePublishTestimony}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle size={16} />
                  {isSubmitting ? 'Publishing...' : 'Publish Testimony'}
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={() => handleUpdateStatus('archived')}
                disabled={isSubmitting}
                className="flex-1"
              >
                Archive
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageFeedback;