'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import OpportunityCard from '@/components/volunteer/OpportunityCard';
import { useAuthContext } from '@/context/AuthContext';
import { volunteerService } from '@/services/api/volunteerService';
import { volunteerData } from '@/data/volunteers';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const VolunteerPage = () => {
  const { user } = useAuthContext();
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkApplicationStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkApplicationStatus = async () => {
    try {
      setLoading(true);
      const response = await volunteerService.checkExistingApplication();
      
      if (response.hasApplication) {
        setExistingApplication(response.application);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApplicationBannerContent = (app) => {
    const statusConfig = {
      pending: {
        icon: <Clock className="text-yellow-600" size={24} />,
        title: '⏳ Application Under Review',
        color: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-900',
        description: `Your application for ${app.ministry} is under review. We will contact you within 1-2 weeks.`
      },
      interviewing: {
        icon: <AlertCircle className="text-blue-600" size={24} />,
        title: '📞 Interview Scheduled',
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-900',
        description: `Great progress! Your application for ${app.ministry} is advancing. Watch for contact from our team.`
      },
      approved: {
        icon: <CheckCircle className="text-green-600" size={24} />,
        title: '✨ Approved!',
        color: 'bg-green-50 border-green-200',
        textColor: 'text-green-900',
        description: `Congratulations! Your application for ${app.ministry} has been approved. Our team will reach out shortly.`
      },
      rejected: {
        icon: <AlertCircle className="text-red-600" size={24} />,
        title: '📋 Application Status',
        color: 'bg-red-50 border-red-200',
        textColor: 'text-red-900',
        description: `Thank you for your interest. Unfortunately, we cannot move forward with your application at this time.`
      }
    };

    return statusConfig[app.status] || statusConfig.pending;
  };

  return (
    <div className="pt-20 pb-20 bg-gray-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 mb-4 flex items-center justify-center gap-3">
            <UserPlus size={48} /> Volunteer Portal
          </h1>
          <p className="text-xl text-gray-600">Use your gifts to serve and make a difference</p>
        </div>

        {/* Application Status Banner */}
        {user && existingApplication && !loading && (
          <Card className={`mb-12 border-l-4 border-blue-900 ${getApplicationBannerContent(existingApplication.status).color}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getApplicationBannerContent(existingApplication.status).icon}
              </div>
              <div className="flex-grow">
                <h3 className={`text-xl font-bold ${getApplicationBannerContent(existingApplication.status).textColor} mb-2`}>
                  {getApplicationBannerContent(existingApplication.status).title}
                </h3>
                <p className={`text-sm ${getApplicationBannerContent(existingApplication.status).textColor} mb-4`}>
                  {getApplicationBannerContent(existingApplication.status).description}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button 
                    onClick={() => window.location.href = '/profile/' + user._id}
                    variant="primary"
                    className="text-sm"
                  >
                    Check Application Progress
                  </Button>
                  {existingApplication.isEditable && (
                    <Button 
                      onClick={() => window.location.href = '/volunteer'}
                      variant="outline"
                      className="text-sm"
                    >
                      Edit Application
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Not Logged In Message */}
        {!user && !loading && (
          <Card className="mb-12 bg-blue-50 border-l-4 border-blue-900">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">Sign In to Track Your Application</h3>
                <p className="text-blue-800 mb-4">
                  Create an account or sign in to see your volunteer application status and progress.
                </p>
                <Button onClick={() => window.location.href = '/login'} variant="primary">
                  Sign In
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Inspirational Banner */}
        <div className="bg-purple-900 text-white rounded-2xl p-8 mb-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Why Volunteer?</h3>
          <p className="text-lg mb-6">Use your God-given talents to transform lives and grow in faith</p>
        </div>

        {/* Opportunities Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-blue-900 mb-8">Available Opportunities</h2>
          <div className="space-y-6">
            {volunteerData.map(opp => (
              <OpportunityCard 
                key={opp.id} 
                opportunity={opp}
                onApplicationSuccess={checkApplicationStatus}
              />
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-blue-900 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-3">1</div>
              <h4 className="font-bold text-gray-900 mb-2">Apply</h4>
              <p className="text-sm text-gray-600">Submit your application for the ministry you're interested in</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-3">2</div>
              <h4 className="font-bold text-gray-900 mb-2">Review</h4>
              <p className="text-sm text-gray-600">Our team reviews your application and qualifications</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-3">3</div>
              <h4 className="font-bold text-gray-900 mb-2">Interview</h4>
              <p className="text-sm text-gray-600">If selected, we'll schedule an interview to discuss the role</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-3">4</div>
              <h4 className="font-bold text-gray-900 mb-2">Serve</h4>
              <p className="text-sm text-gray-600">Upon approval, join our ministry team and make an impact</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VolunteerPage;