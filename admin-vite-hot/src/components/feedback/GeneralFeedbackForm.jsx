
// ============================================
// GeneralFeedbackForm.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { feedbackService } from '../../services/api/feedbackService';
import { ArrowLeft } from 'lucide-react';
import { Loader } from 'lucide-react';

export const GeneralFeedbackForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    feedbackType: '',
    subject: '',
    message: '',
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

  const validateForm = () => {
    const newErrors = {};

    if (!isAnonymous && formData.allowFollowUp && !formData.email) {
      newErrors.email = 'Email is required for response';
    }

    if (!formData.feedbackType) {
      newErrors.feedbackType = 'Please select feedback type';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please provide a subject';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please write your message';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Please provide at least 20 characters';
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
        category: 'general',
        isAnonymous,
        allowFollowUp: formData.allowFollowUp && !isAnonymous,
        feedbackData: {
          feedbackType: formData.feedbackType,
          subject: formData.subject,
          message: formData.message
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

  const feedbackTypes = [
    'Compliment',
    'Question',
    'Concern',
    'General Comment'
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
        <h2 className="text-3xl font-bold text-blue-900">General Feedback</h2>
        <p className="text-gray-600 mt-2">Share your questions, comments, or concerns</p>
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

        {/* Feedback Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Feedback</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Feedback Type <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, feedbackType: type }));
                    if (errors.feedbackType) setErrors(prev => ({ ...prev, feedbackType: '' }));
                  }}
                  disabled={isSubmitting}
                  className={`py-3 px-4 rounded-lg font-semibold transition ${
                    formData.feedbackType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.feedbackType && (
              <p className="text-red-600 text-sm mt-2">{errors.feedbackType}</p>
            )}
          </div>

          <div>
            <Input
              name="subject"
              label="Subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief summary of your feedback"
              required
              error={errors.subject}
              disabled={isSubmitting}
              maxLength={150}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message <span className="text-red-600">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="6"
              required
              disabled={isSubmitting}
              placeholder="Share your thoughts, questions, or concerns with us..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.message.length} characters (minimum 20)
            </p>
            {errors.message && (
              <p className="text-red-600 text-sm mt-1">{errors.message}</p>
            )}
          </div>
        </div>

        {/* Follow-up Option */}
        {!isAnonymous && (
          <div className="pt-6 border-t">
            <label className="flex items-start gap-3 cursor-pointer p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                name="allowFollowUp"
                checked={formData.allowFollowUp}
                onChange={handleChange}
                disabled={isSubmitting}
                className="mt-1 w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
              />
              <div>
                <span className="font-semibold text-gray-900">I would like a response</span>
                <p className="text-sm text-gray-600 mt-1">
                  Someone from our team will get back to you via email
                </p>
              </div>
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

export default GeneralFeedbackForm;