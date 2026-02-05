'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Clock, Eye, Filter, Calendar, RefreshCw, AlertCircle, Info, Trash2
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Loader from '@/components/common/Loader';
import { volunteerService } from '@/services/api/volunteerService';

// ─── Toast Notification System ──────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />
  };

  const styles = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
  };

  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400'
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slideIn ${styles[type]}`}>
      <span className={iconColors[type]}>{icons[type]}</span>
      <p className="flex-1 font-medium">{message}</p>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        <XCircle size={18} />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 w-96 max-w-[calc(100vw-2rem)]">
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const VolunteerApplicationsAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    ministry: 'all'
  });
  const [stats, setStats] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Add this line

  // Toast utilities
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await volunteerService.getAllApplications();
      if (response.success) {
        setApplications(response.applications);
      } else {
        showToast('Failed to load applications', 'error');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showToast('Error loading applications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await volunteerService.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    if (filters.ministry !== 'all') {
      filtered = filtered.filter(app => app.ministry === filters.ministry);
    }

    setFilteredApplications(filtered);
  };

  const handleViewDetails = (application) => {
    setSelectedApp(application);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedApp) return;

    setIsSubmitting(true);
    try {
      const response = await volunteerService.updateStatus(selectedApp._id, {
        status,
        startDate: status === 'approved' ? new Date() : undefined
      });

      if (response.success) {
        await fetchApplications();
        await fetchStats();
        setIsModalOpen(false);
        setSelectedApp(null);
        showToast(`Application ${status} successfully!`, 'success');
      } else {
        showToast('Failed to update application status', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update application status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
  setIsSubmitting(true);
  try {
    const response = await volunteerService.deleteApplication(applicationId);

    if (response.success) {
      await fetchApplications();
      await fetchStats();
      setDeleteConfirm(null);
      setIsModalOpen(false);
      setSelectedApp(null);
      showToast('Application deleted successfully!', 'success');
    } else {
      showToast('Failed to delete application', 'error');
    }
  } catch (error) {
    console.error('Error deleting application:', error);
    showToast('Failed to delete application', 'error');
  } finally {
    setIsSubmitting(false);
  }
};

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      interviewing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
    };

    const icons = {
      pending: <Clock size={14} />,
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />,
      interviewing: <Users size={14} />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const ministries = ['Worship Team', 'Children\'s Ministry', 'Ushering Team', 'Technical Team', 'Community Outreach'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-400">{stats.totalApplications}</p>
              </div>
              <Users className="text-blue-900 dark:text-blue-400" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingApplications}</p>
              </div>
              <Clock className="text-yellow-600 dark:text-yellow-400" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.approvedVolunteers}</p>
              </div>
              <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalHours}</p>
              </div>
              <Calendar className="text-purple-600 dark:text-purple-400" size={40} />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Filter Applications</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="interviewing">Interviewing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.ministry}
              onChange={(e) => setFilters({ ...filters, ministry: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-500"
            >
              <option value="all">All Ministries</option>
              {ministries.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <Button variant="secondary" onClick={fetchApplications}>
              <RefreshCw size={16} /> Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Applications List */}
      <Card>
        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-6">
          Volunteer Applications ({filteredApplications.length})
        </h3>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app._id}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-800"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {app.fullName}
                      </h4>
                      {getStatusBadge(app.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Ministry:</strong> {app.ministry}</p>
                      <p><strong>Email:</strong> {app.email}</p>
                      <p><strong>Phone:</strong> {app.phone}</p>
                      <p><strong>Applied:</strong> {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                  <Button variant="primary" onClick={() => handleViewDetails(app)}>
                    <Eye size={16} /> View Details
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => setDeleteConfirm(app._id)}
                    className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
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
        title="Application Details"
        size="lg"
      >
        {selectedApp && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between pb-4 border-b dark:border-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedApp.fullName}</h3>
              {getStatusBadge(selectedApp.status)}
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email</label>
                <p className="text-gray-900 dark:text-white">{selectedApp.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Phone</label>
                <p className="text-gray-900 dark:text-white">{selectedApp.phone}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Ministry</label>
                <p className="text-gray-900 dark:text-white">{selectedApp.ministry}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Applied Date</label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedApp.appliedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                Availability
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                {selectedApp.availability}
              </p>
            </div>

            {/* Motivation */}
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                Motivation
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                {selectedApp.motivation}
              </p>
            </div>

            {/* Optional Fields */}
            {selectedApp.previousExperience && (
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                  Previous Experience
                </label>
                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                  {selectedApp.previousExperience}
                </p>
              </div>
            )}

            {selectedApp.skills && (
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                  Skills
                </label>
                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                  {selectedApp.skills}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {selectedApp.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t dark:border-slate-700">
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <CheckCircle size={16} />
                  {isSubmitting ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleUpdateStatus('interviewing')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <Users size={16} />
                  Move to Interview
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                >
                  <XCircle size={16} />
                  Reject
                </Button>
              </div>
            )}

            {selectedApp.status === 'interviewing' && (
              <div className="flex gap-3 pt-4 border-t dark:border-slate-700">
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <CheckCircle size={16} />
                  {isSubmitting ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                >
                  <XCircle size={16} />
                  Reject
                </Button>
              </div>
            )}
            {/* Delete Button - Available for all statuses */}
            <div className="pt-4 border-t dark:border-slate-700">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirm(selectedApp._id)}
                disabled={isSubmitting}
                className="w-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                <Trash2 size={16} />
                Delete Application
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => !isSubmitting && setDeleteConfirm(null)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
            <p className="text-red-800 dark:text-red-200 font-medium">
              Are you sure you want to delete this application? This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDeleteApplication(deleteConfirm)}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 size={16} />
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VolunteerApplicationsAdmin;