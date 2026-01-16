import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Filter,
  Calendar,
  RefreshCw
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import { volunteerService } from '../../services/api/volunteerService';

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
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
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
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update application status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      interviewing: 'bg-blue-100 text-blue-800'
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
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalApplications}</p>
              </div>
              <Users className="text-blue-900" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</p>
              </div>
              <Clock className="text-yellow-600" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approvedVolunteers}</p>
              </div>
              <CheckCircle className="text-green-600" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalHours}</p>
              </div>
              <Calendar className="text-purple-600" size={40} />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filter Applications</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
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
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
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
        <h3 className="text-xl font-bold text-blue-900 mb-6">
          Volunteer Applications ({filteredApplications.length})
        </h3>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {app.fullName}
                      </h4>
                      {getStatusBadge(app.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p><strong>Ministry:</strong> {app.ministry}</p>
                      <p><strong>Email:</strong> {app.email}</p>
                      <p><strong>Phone:</strong> {app.phone}</p>
                      <p><strong>Applied:</strong> {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <Button variant="primary" onClick={() => handleViewDetails(app)}>
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
        title="Application Details"
        size="lg"
      >
        {selectedApp && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">{selectedApp.fullName}</h3>
              {getStatusBadge(selectedApp.status)}
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-900">{selectedApp.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Phone</label>
                <p className="text-gray-900">{selectedApp.phone}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Ministry</label>
                <p className="text-gray-900">{selectedApp.ministry}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Applied Date</label>
                <p className="text-gray-900">
                  {new Date(selectedApp.appliedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-2">
                Availability
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {selectedApp.availability}
              </p>
            </div>

            {/* Motivation */}
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-2">
                Motivation
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {selectedApp.motivation}
              </p>
            </div>

            {/* Optional Fields */}
            {selectedApp.previousExperience && (
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">
                  Previous Experience
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedApp.previousExperience}
                </p>
              </div>
            )}

            {selectedApp.skills && (
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">
                  Skills
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedApp.skills}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {selectedApp.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
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
                  className="flex-1 bg-red-100 text-red-700 hover:bg-red-200"
                >
                  <XCircle size={16} />
                  Reject
                </Button>
              </div>
            )}

            {selectedApp.status === 'interviewing' && (
              <div className="flex gap-3 pt-4 border-t">
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
                  className="flex-1 bg-red-100 text-red-700 hover:bg-red-200"
                >
                  <XCircle size={16} />
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VolunteerApplicationsAdmin;