'use client';

import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { feedbackService } from '@/services/api/feedbackService';
import { ArrowLeft } from 'lucide-react';
import { Loader } from 'lucide-react';

export const SuggestionForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    suggestionType: '',
    suggestionTitle: '',
    description: '',
    importance: '',
    benefit: '',
    priority: 'Medium',
    willingToHelp: false,
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
        allowFollowUp: false,
        willingToHelp: false
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

    if (!isAnonymous && (formData.allowFollowUp || formData.willingToHelp) && !formData.email) {
      newErrors.email = 'Email is required for follow-up or volunteering';
    }

    if (!formData.suggestionType) {
      newErrors.suggestionType = 'Please select suggestion type';
    }

    if (!formData.suggestionTitle.trim()) {
      newErrors.suggestionTitle = 'Please provide a title';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please describe your suggestion';
    } else if (formData.description.trim().length < 30) {
      newErrors.description = 'Please provide at least 30 characters';
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
        category: 'suggestion',
        isAnonymous,
        allowFollowUp: formData.allowFollowUp && !isAnonymous,
        feedbackData: {
          suggestionType: formData.suggestionType,
          suggestionTitle: formData.suggestionTitle,
          description: formData.description,
          importance: formData.importance,
          benefit: formData.benefit,
          priority: formData.priority,
          willingToHelp: formData.willingToHelp && !isAnonymous
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
      setErrors({ submit: error.response?.data?.message || 'Failed to submit suggestion' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestionTypes = [
    'Ministry/Program Idea',
    'Event Suggestion',
    'Facility Improvement',
    'Community Outreach',
    'Technology/Website',
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
        <h2 className="text-3xl font-bold text-blue-900">Suggestions & Ideas</h2>
        <p className="text-gray-600 mt-2">Help us improve and grow with your creative ideas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
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

        {/* Suggestion Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Suggestion</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Suggestion Category <span className="text-red-600">*</span>
            </label>
            <select
              name="suggestionType"
              value={formData.suggestionType}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            >
              <option value="">Select category</option>
              {suggestionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.suggestionType && (
              <p className="text-red-600 text-sm mt-1">{errors.suggestionType}</p>
            )}
          </div>

          <div>
            <Input
              name="suggestionTitle"
              label="Brief Title"
              value={formData.suggestionTitle}
              onChange={handleChange}
              placeholder="e.g., Youth Mentorship Program"
              required
              error={errors.suggestionTitle}
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Detailed Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              required
              disabled={isSubmitting}
              placeholder="Describe your suggestion in detail. What would it look like? How would it work?"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length} characters (minimum 30)
            </p>
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Why is this important?
            </label>
            <textarea
              name="importance"
              value={formData.importance}
              onChange={handleChange}
              rows="3"
              disabled={isSubmitting}
              placeholder="Why should we consider this? (optional)"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              How would this benefit the church?
            </label>
            <textarea
              name="benefit"
              value={formData.benefit}
              onChange={handleChange}
              rows="3"
              disabled={isSubmitting}
              placeholder="What positive impact would this have? (optional)"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Low', 'Medium', 'High'].map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority }))}
                  disabled={isSubmitting}
                  className={`py-3 px-4 rounded-lg font-semibold transition ${
                    formData.priority === priority
                      ? priority === 'High' ? 'bg-red-600 text-white' :
                        priority === 'Medium' ? 'bg-yellow-600 text-white' :
                        'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Volunteer to Help */}
        {!isAnonymous && (
          <div className="space-y-3 pt-6 border-t">
            <label className="flex items-start gap-3 cursor-pointer p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                name="willingToHelp"
                checked={formData.willingToHelp}
                onChange={handleChange}
                disabled={isSubmitting}
                className="mt-1 w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
              />
              <div>
                <span className="font-semibold text-gray-900">I'm willing to help implement this</span>
                <p className="text-sm text-gray-600 mt-1">
                  We may reach out to discuss how you can be involved
                </p>
              </div>
            </label>

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
                I would like feedback on this suggestion
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
              'Submit Suggestion'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SuggestionForm;