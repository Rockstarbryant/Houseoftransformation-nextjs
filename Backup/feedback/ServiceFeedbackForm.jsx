'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import StarRating from './StarRating';
import { feedbackService } from '@/services/api/feedbackService';

const ServiceFeedbackForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    // Personal info
    name: '',
    email: '',
    phone: '',
    
    // Visitor status
    isFirstTimeVisitor: false,
    
    // Ratings
    ratings: {
      overall: 0,
      worship: 0,
      hospitality: 0,
      facility: 0,
      parking: 0,
      childrensMinistry: 0,
      soundQuality: 0
    },
    
    // Comments
    whatWentWell: '',
    improvements: '',
    additionalComments: '',
    wouldReturn: '',
    
    // Preferences
    allowFollowUp: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAnonymous && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    } else if (isAnonymous) {
      setFormData(prev => ({
        ...prev,
        name: '',
        email: '',
        phone: '',
        allowFollowUp: false
      }));
    }
  }, [isAnonymous, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: rating
      }
    }));
    
    if (errors[`rating_${category}`]) {
      setErrors(prev => ({ ...prev, [`rating_${category}`]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isAnonymous && formData.allowFollowUp && !formData.email) {
      newErrors.email = 'Email is required for follow-up';
    }

    if (formData.ratings.overall === 0) {
      newErrors.rating_overall = 'Please provide an overall rating';
    }

    if (!formData.wouldReturn) {
      newErrors.wouldReturn = 'Please answer this question';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        category: 'service',
        isAnonymous,
        isFirstTimeVisitor: formData.isFirstTimeVisitor,
        allowFollowUp: formData.allowFollowUp && !isAnonymous,
        feedbackData: {
          ratings: formData.ratings,
          whatWentWell: formData.whatWentWell,
          improvements: formData.improvements,
          wouldReturn: formData.wouldReturn
        }
      };

      if (!isAnonymous) {
        submissionData.name = formData.name;
        submissionData.email = formData.email;
        submissionData.phone = formData.phone;
      }

      const response = await feedbackService.submitFeedback(submissionData);

      if (response.success) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to submit feedback' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingCategories = [
    { key: 'overall', label: 'Overall Service Experience', required: true },
    { key: 'worship', label: 'Worship Music Quality' },
    { key: 'hospitality', label: 'Welcoming & Hospitality' },
    { key: 'facility', label: 'Facility Cleanliness' },
    { key: 'parking', label: 'Parking Convenience' },
    { key: 'childrensMinistry', label: 'Children\'s Ministry (if applicable)' },
    { key: 'soundQuality', label: 'Sound/AV Quality' }
  ];

  return (
    <Card>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold mb-4 transition"
        >
          <ArrowLeft size={20} />
          Back to Categories
        </button>
        <h2 className="text-3xl font-bold text-blue-900">Service Experience Feedback</h2>
        <p className="text-gray-600 mt-2">Help us improve your worship experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information (if not anonymous) */}
        {!isAnonymous && (
          <div className="space-y-4 pb-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Your Information</h3>
            
            <Input
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name (optional)"
              disabled={isSubmitting}
            />

            <Input
              name="email"
              type="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              error={errors.email}
              disabled={isSubmitting}
            />

            <Input
              name="phone"
              label="Phone (Optional)"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254 700 000 000"
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Visitor Status */}
        <div className="pt-4">
          <label className="flex items-start gap-3 cursor-pointer bg-blue-50 p-4 rounded-lg">
            <input
              type="checkbox"
              name="isFirstTimeVisitor"
              checked={formData.isFirstTimeVisitor}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1 w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
            />
            <div>
              <span className="font-semibold text-gray-900">I'm a first-time visitor</span>
              <p className="text-sm text-gray-600 mt-1">
                Your feedback as a new visitor is especially valuable to us!
              </p>
            </div>
          </label>
        </div>

        {/* Ratings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Rate Your Experience</h3>
          
          {ratingCategories.map((category) => (
            <div key={category.key} className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {category.label}
                {category.required && <span className="text-red-600"> *</span>}
              </label>
              <StarRating
                rating={formData.ratings[category.key]}
                onRatingChange={(rating) => handleRatingChange(category.key, rating)}
                size={32}
              />
              {errors[`rating_${category.key}`] && (
                <p className="text-red-600 text-sm mt-2">{errors[`rating_${category.key}`]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Comments */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Feedback</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What did we do well?
            </label>
            <textarea
              name="whatWentWell"
              value={formData.whatWentWell}
              onChange={handleChange}
              rows="3"
              disabled={isSubmitting}
              placeholder="Share what you appreciated about the service..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              How can we improve?
            </label>
            <textarea
              name="improvements"
              value={formData.improvements}
              onChange={handleChange}
              rows="3"
              disabled={isSubmitting}
              placeholder="Constructive feedback helps us serve you better..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Would you return/recommend our church? <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, wouldReturn: 'Yes' }));
                  if (errors.wouldReturn) setErrors(prev => ({ ...prev, wouldReturn: '' }));
                }}
                disabled={isSubmitting}
                className={`py-3 px-4 rounded-lg font-semibold transition ${
                  formData.wouldReturn === 'Yes'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, wouldReturn: 'Maybe' }));
                  if (errors.wouldReturn) setErrors(prev => ({ ...prev, wouldReturn: '' }));
                }}
                disabled={isSubmitting}
                className={`py-3 px-4 rounded-lg font-semibold transition ${
                  formData.wouldReturn === 'Maybe'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                Maybe
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, wouldReturn: 'No' }));
                  if (errors.wouldReturn) setErrors(prev => ({ ...prev, wouldReturn: '' }));
                }}
                disabled={isSubmitting}
                className={`py-3 px-4 rounded-lg font-semibold transition ${
                  formData.wouldReturn === 'No'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                No
              </button>
            </div>
            {errors.wouldReturn && (
              <p className="text-red-600 text-sm mt-2">{errors.wouldReturn}</p>
            )}
          </div>
        </div>

        {/* Follow-up Option (if not anonymous) */}
        {!isAnonymous && (
          <div className="pt-4 border-t">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="allowFollowUp"
                checked={formData.allowFollowUp}
                onChange={handleChange}
                disabled={isSubmitting}
                className="mt-1 w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
              />
              <span className="text-sm text-gray-700">
                I would like someone from the team to follow up with me
              </span>
            </label>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={20} />
                Submitting...
              </span>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ServiceFeedbackForm;