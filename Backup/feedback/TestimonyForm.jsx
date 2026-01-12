'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { feedbackService } from '@/services/api/feedbackService';

export const TestimonyForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    testimonyType: '',
    title: '',
    story: '',
    testimonyDate: '',
    sharingPreference: 'private',
    shareInService: false,
    allowContact: false
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
        sharingPreference: 'private',
        allowContact: false
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.testimonyType) {
      newErrors.testimonyType = 'Please select testimony type';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Please provide a title';
    }

    if (!formData.story.trim()) {
      newErrors.story = 'Please share your testimony';
    } else if (formData.story.trim().length < 50) {
      newErrors.story = 'Please provide at least 50 characters';
    }

    if (!formData.testimonyDate) {
      newErrors.testimonyDate = 'Please select when this happened';
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
        category: 'testimony',
        isAnonymous,
        isPublic: formData.sharingPreference === 'public' || formData.sharingPreference === 'public_anonymous',
        feedbackData: {
          testimonyType: formData.testimonyType,
          title: formData.title,
          story: formData.story,
          testimonyDate: formData.testimonyDate,
          shareInService: formData.shareInService
        }
      };

      if (!isAnonymous && formData.sharingPreference === 'public') {
        submissionData.name = formData.name;
        submissionData.email = formData.email;
        submissionData.phone = formData.phone;
        submissionData.allowFollowUp = formData.allowContact;
      }

      const response = await feedbackService.submitFeedback(submissionData);

      if (response.success) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to submit testimony' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const testimonyTypes = [
    'Prayer Answered',
    'Healing/Miracle',
    'Life Transformation',
    'Salvation Story',
    'Financial Breakthrough',
    'Relationship Restoration',
    'Other'
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
        <h2 className="text-3xl font-bold text-blue-900">Share Your Testimony</h2>
        <p className="text-gray-600 mt-2">Tell us how God has moved in your life</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information (if not anonymous and wants public sharing) */}
        {!isAnonymous && formData.sharingPreference === 'public' && (
          <div className="space-y-4 pb-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Your Information</h3>
            
            <Input
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              disabled={isSubmitting}
            />

            <Input
              name="email"
              type="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
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

        {/* Testimony Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Testimony</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Testimony Type <span className="text-red-600">*</span>
            </label>
            <select
              name="testimonyType"
              value={formData.testimonyType}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            >
              <option value="">Select type</option>
              {testimonyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.testimonyType && (
              <p className="text-red-600 text-sm mt-1">{errors.testimonyType}</p>
            )}
          </div>

          <div>
            <Input
              name="title"
              label="Title of Your Testimony"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., How God Healed My Marriage"
              required
              error={errors.title}
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Story <span className="text-red-600">*</span>
            </label>
            <textarea
              name="story"
              value={formData.story}
              onChange={handleChange}
              rows="8"
              required
              disabled={isSubmitting}
              placeholder="Share your testimony in detail. How did God work in your life? What changed? How has it impacted you?"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.story.length} characters (minimum 50)
            </p>
            {errors.story && (
              <p className="text-red-600 text-sm mt-1">{errors.story}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              When did this happen? <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="testimonyDate"
              value={formData.testimonyDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
            {errors.testimonyDate && (
              <p className="text-red-600 text-sm mt-1">{errors.testimonyDate}</p>
            )}
          </div>
        </div>

        {/* Sharing Preferences */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-800">Sharing Preferences</h3>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer p-4 border-2 rounded-lg transition hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                name="sharingPreference"
                value="public"
                checked={formData.sharingPreference === 'public'}
                onChange={handleChange}
                disabled={isSubmitting || isAnonymous}
                className="mt-1 w-5 h-5 text-blue-900"
              />
              <div>
                <span className="font-semibold text-gray-900">Share publicly with my name</span>
                <p className="text-sm text-gray-600">Your testimony will be visible to others with your name</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-4 border-2 rounded-lg transition hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                name="sharingPreference"
                value="public_anonymous"
                checked={formData.sharingPreference === 'public_anonymous'}
                onChange={handleChange}
                disabled={isSubmitting}
                className="mt-1 w-5 h-5 text-blue-900"
              />
              <div>
                <span className="font-semibold text-gray-900">Share publicly anonymously</span>
                <p className="text-sm text-gray-600">Your testimony will be visible but without your name</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-4 border-2 rounded-lg transition hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                name="sharingPreference"
                value="private"
                checked={formData.sharingPreference === 'private'}
                onChange={handleChange}
                disabled={isSubmitting}
                className="mt-1 w-5 h-5 text-blue-900"
              />
              <div>
                <span className="font-semibold text-gray-900">Keep private (leadership only)</span>
                <p className="text-sm text-gray-600">Only pastoral team will see your testimony</p>
              </div>
            </label>
          </div>

          <div className="pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="shareInService"
                checked={formData.shareInService}
                onChange={handleChange}
                disabled={isSubmitting}
                className="mt-1 w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
              />
              <span className="text-sm text-gray-700">
                I would like to share this testimony during a service
              </span>
            </label>
          </div>

          {!isAnonymous && formData.sharingPreference !== 'private' && (
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="allowContact"
                  checked={formData.allowContact}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="mt-1 w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
                />
                <span className="text-sm text-gray-700">
                  Leadership can contact me for more details
                </span>
              </label>
            </div>
          )}
        </div>

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
              'Share Testimony'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TestimonyForm;