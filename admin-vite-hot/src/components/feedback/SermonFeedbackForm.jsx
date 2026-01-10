import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Star } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import StarRating from './StarRating';
import { feedbackService } from '../../services/api/feedbackService';

const SermonFeedbackForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    // Personal info
    name: '',
    email: '',
    phone: '',
    
    // Sermon details
    sermonTitle: '',
    sermonDate: '',
    
    // Feedback
    rating: 0,
    resonatedMost: '',
    application: '',
    questions: '',
    wouldRecommend: null,
    
    // Preferences
    allowFollowUp: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill user data if not anonymous
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate contact info if follow-up requested and not anonymous
    if (!isAnonymous && formData.allowFollowUp) {
      if (!formData.email) {
        newErrors.email = 'Email is required for follow-up';
      }
    }

    // Sermon details
    if (!formData.sermonTitle.trim()) {
      newErrors.sermonTitle = 'Please specify which sermon';
    }

    if (!formData.sermonDate) {
      newErrors.sermonDate = 'Please select the date you attended';
    }

    // Rating required
    if (formData.rating === 0) {
      newErrors.rating = 'Please provide a rating';
    }

    // Feedback required
    if (!formData.resonatedMost.trim()) {
      newErrors.resonatedMost = 'Please share what resonated with you';
    } else if (formData.resonatedMost.trim().length < 20) {
      newErrors.resonatedMost = 'Please provide at least 20 characters';
    }

    // Would recommend required
    if (formData.wouldRecommend === null) {
      newErrors.wouldRecommend = 'Please answer this question';
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
        category: 'sermon',
        isAnonymous,
        allowFollowUp: formData.allowFollowUp && !isAnonymous,
        feedbackData: {
          sermonTitle: formData.sermonTitle,
          sermonDate: formData.sermonDate,
          rating: formData.rating,
          resonatedMost: formData.resonatedMost,
          application: formData.application,
          questions: formData.questions,
          wouldRecommend: formData.wouldRecommend
        }
      };

      // Add contact info if not anonymous
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
        <h2 className="text-3xl font-bold text-blue-900">Sermon Feedback</h2>
        <p className="text-gray-600 mt-2">Help us understand how God's Word is impacting your life</p>
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

        {/* Sermon Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Sermon Details</h3>
          
          <div>
            <Input
              name="sermonTitle"
              label="Which sermon are you providing feedback on?"
              value={formData.sermonTitle}
              onChange={handleChange}
              placeholder="e.g., Walking in Faith, The Power of Prayer"
              required
              error={errors.sermonTitle}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date Attended <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="sermonDate"
              value={formData.sermonDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
            {errors.sermonDate && (
              <p className="text-red-600 text-sm mt-1">{errors.sermonDate}</p>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Feedback</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Overall Rating <span className="text-red-600">*</span>
            </label>
            <StarRating
              rating={formData.rating}
              onRatingChange={handleRatingChange}
              size={40}
            />
            {errors.rating && (
              <p className="text-red-600 text-sm mt-2">{errors.rating}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What part of the sermon resonated most with you? <span className="text-red-600">*</span>
            </label>
            <textarea
              name="resonatedMost"
              value={formData.resonatedMost}
              onChange={handleChange}
              rows="4"
              required
              disabled={isSubmitting}
              placeholder="Share what spoke to your heart..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.resonatedMost.length} characters (minimum 20)
            </p>
            {errors.resonatedMost && (
              <p className="text-red-600 text-sm mt-1">{errors.resonatedMost}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              How will you apply this message to your life?
            </label>
            <textarea
              name="application"
              value={formData.application}
              onChange={handleChange}
              rows="3"
              disabled={isSubmitting}
              placeholder="What steps will you take? (optional)"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Do you have any questions about the message?
            </label>
            <textarea
              name="questions"
              value={formData.questions}
              onChange={handleChange}
              rows="3"
              disabled={isSubmitting}
              placeholder="Any areas you'd like clarification on? (optional)"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Would you recommend this sermon to others? <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, wouldRecommend: true }));
                  if (errors.wouldRecommend) setErrors(prev => ({ ...prev, wouldRecommend: '' }));
                }}
                disabled={isSubmitting}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                  formData.wouldRecommend === true
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                Yes, Definitely!
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, wouldRecommend: false }));
                  if (errors.wouldRecommend) setErrors(prev => ({ ...prev, wouldRecommend: '' }));
                }}
                disabled={isSubmitting}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                  formData.wouldRecommend === false
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                Not Really
              </button>
            </div>
            {errors.wouldRecommend && (
              <p className="text-red-600 text-sm mt-2">{errors.wouldRecommend}</p>
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
                I would like the pastor to follow up with me about this feedback
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

export default SermonFeedbackForm;