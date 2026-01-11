'use client';

import React, { useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import AnonymousToggle from '@/components/feedback/AnonymousToggle';
import SermonFeedbackForm from '@/components/feedback/SermonFeedbackForm';
import ServiceFeedbackForm from '@/components/feedback/ServiceFeedbackForm';
import TestimonyForm from '@/components/feedback/TestimonyForm';
import SuggestionForm from '@/components/feedback/SuggestionForm';
import PrayerRequestForm from '@/components/feedback/PrayerRequestForm';
import GeneralFeedbackForm from '@/components/feedback/GeneralFeedbackForm';
import TestimoniesWall from '@/components/feedback/TestimoniesWall';
import { useAuthContext } from '@/context/AuthContext';

const FeedbackPage = () => {
  const { user, isLoading, error: authError } = useAuthContext();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successData, setSuccessData] = useState(null); // no generics needed in JS

  const categories = [
    {
      id: 'sermon',
      title: 'Sermon Feedback',
      description: 'Share your thoughts on recent sermons',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      id: 'service',
      title: 'Service Experience',
      description: 'Rate your worship experience',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      id: 'testimony',
      title: 'Share Testimony',
      description: 'Tell us how God has moved in your life',
      color: 'red',
      gradient: 'from-red-500 to-pink-600',
    },
    {
      id: 'suggestion',
      title: 'Suggestions & Ideas',
      description: 'Help us improve and grow',
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-600',
    },
    {
      id: 'prayer',
      title: 'Prayer Request',
      description: 'Submit your prayer needs',
      color: 'green',
      gradient: 'from-green-500 to-teal-600',
    },
    {
      id: 'general',
      title: 'General Feedback',
      description: 'Questions, comments, or concerns',
      color: 'gray',
      gradient: 'from-gray-500 to-gray-600',
    },
  ];

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowSuccessMessage(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitSuccess = (data) => {
    setSuccessData(data);
    setShowSuccessMessage(true);
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => setShowSuccessMessage(false), 10000);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setShowSuccessMessage(false);
  };

  const renderForm = () => {
    const formProps = {
      isAnonymous,
      user,
      onSuccess: handleSubmitSuccess,
      onBack: handleBack,
    };

    switch (selectedCategory) {
      case 'sermon':
        return <SermonFeedbackForm {...formProps} />;
      case 'service':
        return <ServiceFeedbackForm {...formProps} />;
      case 'testimony':
        return <TestimonyForm {...formProps} />;
      case 'suggestion':
        return <SuggestionForm {...formProps} />;
      case 'prayer':
        return <PrayerRequestForm {...formProps} />;
      case 'general':
        return <GeneralFeedbackForm {...formProps} />;
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Auth error state
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-6">{authError}</p>
          <p className="text-sm text-gray-500">
            Please try refreshing the page or contact support.
          </p>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare size={48} className="text-blue-900" />
            <h1 className="text-4xl sm:text-5xl font-bold text-blue-900">
              We Value Your Voice
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-3">
            Your feedback helps us serve you better
          </p>
          <p className="text-lg text-green-600 font-semibold">
            ✓ No login required • Submit anonymously if you prefer
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-10 bg-green-50 border-l-4 border-green-500 rounded-lg p-6 animate-fade-in shadow-sm">
            <div className="flex items-start gap-4">
              <svg
                className="w-8 h-8 text-green-500 flex-shrink-0 mt-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>

              <div className="flex-grow">
                <h3 className="text-lg font-bold text-green-900 mb-2">
                  {isAnonymous ? 'Thank You for Your Anonymous Feedback!' : 'Thank You for Your Feedback!'}
                </h3>
                <p className="text-green-800 mb-3">
                  {isAnonymous
                    ? "Your voice matters to us. While we can't follow up personally, your feedback will help us serve better."
                    : "We've received your submission and will review it shortly."}
                </p>
                {successData?.referenceId && (
                  <p className="text-sm text-green-700 font-mono bg-green-100 inline-block px-3 py-1 rounded">
                    Reference ID: {successData.referenceId}
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-700 hover:text-green-900 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Anonymous Toggle */}
        {selectedCategory && (
          <div className="mb-8 max-w-3xl mx-auto">
            <AnonymousToggle isAnonymous={isAnonymous} onToggle={setIsAnonymous} />
          </div>
        )}

        {/* Content */}
        {!selectedCategory ? (
          <>
            {/* Categories */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
                Choose Feedback Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-200 text-left"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}
                    />
                    <div className="relative">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-6">{category.description}</p>
                      <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        <span>Get Started</span>
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white rounded-2xl p-8 mb-12 text-center shadow-lg">
              <h3 className="text-3xl font-bold mb-4">Join Our Community Voice</h3>
              <p className="text-lg mb-6 opacity-90">
                Help us grow and serve better through your valuable feedback
              </p>
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div>
                  <p className="text-4xl font-bold mb-1">500+</p>
                  <p className="text-sm opacity-80">Feedback Received</p>
                </div>
                <div>
                  <p className="text-4xl font-bold mb-1">95%</p>
                  <p className="text-sm opacity-80">Satisfaction Rate</p>
                </div>
                <div>
                  <p className="text-4xl font-bold mb-1">100+</p>
                  <p className="text-sm opacity-80">Testimonies Shared</p>
                </div>
              </div>
            </div>

            <TestimoniesWall />
          </>
        ) : (
          <div className="max-w-3xl mx-auto">{renderForm()}</div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;