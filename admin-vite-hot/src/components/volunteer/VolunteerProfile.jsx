import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, Users, Heart } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { volunteerService } from '../../services/api/volunteerService';

const VolunteerProfile = ({ userId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [userId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await volunteerService.getMyApplications();
      
      if (response.success) {
        setApplications(response.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load application status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={24} />;
      case 'interviewing':
        return <Users className="text-blue-600" size={24} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={24} />;
      default:
        return <AlertCircle className="text-gray-600" size={24} />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 border-yellow-200',
      approved: 'bg-green-50 border-green-200',
      rejected: 'bg-red-50 border-red-200',
      interviewing: 'bg-blue-50 border-blue-200'
    };
    return colors[status] || 'bg-gray-50 border-gray-200';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      pending: 'text-yellow-800',
      approved: 'text-green-800',
      rejected: 'text-red-800',
      interviewing: 'text-blue-800'
    };
    return colors[status] || 'text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Under Review',
      approved: 'Approved',
      rejected: 'Not Selected',
      interviewing: 'Interview Scheduled'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString('en-US', options);
  };

  if (loading) {
    return (
      <div className="bg-blue-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">Volunteer Applications</h3>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-blue-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">Volunteer Applications</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p>{error}</p>
          <Button onClick={fetchApplications} variant="primary" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-blue-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">Volunteer Applications</h3>
        <div className="text-center py-12">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg mb-6">You haven't submitted any volunteer applications yet</p>
          <Button onClick={() => window.location.href = '/volunteer'} variant="primary">
            View Volunteer Opportunities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-xl p-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">Your Volunteer Applications</h3>
      <div className="space-y-6">
        {applications.map((app) => (
          <Card key={app._id} className={`border-l-4 border-blue-900 ${getStatusColor(app.status)}`}>
            <div className="flex items-start gap-6">
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {getStatusIcon(app.status)}
              </div>

              {/* Application Info */}
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{app.ministry}</h4>
                    <p className={`text-sm font-semibold ${getStatusTextColor(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-600">
                    Applied: {formatDate(app.appliedAt)}
                  </span>
                </div>

                {/* Application Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Availability</p>
                    <p className="font-semibold text-gray-900">{app.availability}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{app.phone}</p>
                  </div>
                </div>

                {/* Status-Specific Messages */}
                {app.status === 'approved' && (
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
                    <p className="text-green-900 font-semibold mb-2">✨ Congratulations! Your application has been approved!</p>
                    <p className="text-green-800 text-sm mb-3">
                      A member of our volunteer team will reach out to you to discuss next steps and orientation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-green-800 font-semibold">Contact via:</p>
                        <p className="text-green-900">info@houseoftransformation.or.ke</p>
                        <p className="text-green-900">+254 700 000 000</p>
                      </div>
                      <div>
                        <p className="text-green-800 font-semibold">Expected Contact:</p>
                        <p className="text-green-900">Within 3-5 business days</p>
                        <p className="text-green-900">Monday-Friday, 9:00 AM - 5:00 PM</p>
                      </div>
                    </div>
                  </div>
                )}

                {app.status === 'rejected' && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
                    <p className="text-red-900 font-semibold mb-2">Thank You for Your Interest</p>
                    <p className="text-red-800 text-sm">
                      Unfortunately, we are unable to move forward with your application at this time. 
                      We encourage you to apply again in the future. If you have questions, please contact us at 
                      <a href="mailto:info@houseoftransformation.or.ke" className="font-semibold hover:underline"> info@houseoftransformation.or.ke</a>.
                    </p>
                  </div>
                )}

                {app.status === 'interviewing' && (
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
                    <p className="text-blue-900 font-semibold mb-2">📞 Interview Scheduled</p>
                    <p className="text-blue-800 text-sm">
                      Your application is progressing! Our team is reviewing your submission and will contact you 
                      to schedule an interview. Please ensure we have the correct contact information.
                    </p>
                  </div>
                )}

                {app.status === 'pending' && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
                    <p className="text-yellow-900 font-semibold mb-2">⏳ Application Under Review</p>
                    <p className="text-yellow-800 text-sm">
                      Thank you for submitting your application! We are currently reviewing it and will be in touch 
                      within 1-2 weeks with an update. We appreciate your patience.
                    </p>
                  </div>
                )}

                {/* Edit Notice */}
                {app.isEditable && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
                    <p className="text-purple-900 font-semibold mb-1">✏️ Edit Available</p>
                    <p className="text-purple-800">
                      You can edit your application one more time within 3 hours of submission.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Multiple Applications Info */}
        {applications.length > 1 && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
            <p className="text-blue-900 text-sm">
              <strong>Note:</strong> You have applied for multiple ministry roles. You can only have one active application at a time.
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-8 text-center">
        <Button onClick={fetchApplications} variant="outline">
          Refresh Status
        </Button>
      </div>
    </div>
  );
};

export default VolunteerProfile;