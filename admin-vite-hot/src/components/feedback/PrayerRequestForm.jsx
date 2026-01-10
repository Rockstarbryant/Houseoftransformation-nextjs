// ============================================
// PrayerRequestForm.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { feedbackService } from '../../services/api/feedbackService';

export const PrayerRequestForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    prayerCategory: '',
    request: '',
    urgency: 'Regular',
    shareOnPrayerList: false,
    prayerNeeded: false,
    preferredContact: '',
    bestTimeToContact: ''
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
        shareOnPrayerList: false,
        prayerNeeded: false
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

    if (!isAnonymous && formData.prayerNeeded && !formData.email && !formData.phone) {
      newErrors.contact = 'Please provide email or phone if you want someone to pray with you';
    }

    if (!formData.prayerCategory) {
      newErrors.prayerCategory = 'Please select a category';
    }

    if (!formData.request.trim()) {
      newErrors.request = 'Please share your prayer request';
    } else if (formData.request.trim().length < 20) {
      newErrors.request = 'Please provide at least 20 characters';
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
        category: 'prayer',
        isAnonymous,
        shareOnPrayerList: formData.shareOnPrayerList && !isAnonymous,
        feedbackData: {
          prayerCategory: formData.prayerCategory,
          request: formData.request,
          urgency: formData.urgency,
          prayerNeeded: formData.prayerNeeded && !isAnonymous,
          preferredContact: formData.preferredContact,
          bestTimeToContact: formData.bestTimeToContact
        }
      };

      if (!isAnonymous) {
        submissionData.name = formData.name;
        submissionData.email = formData.email;
        submissionData.phone = formData.phone;
        submissionData.allowFollowUp = formData.prayerNeeded;
      }

      const response = await feedbackService.submitFeedback(submissionData);

      if (response.success) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to submit prayer request' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const prayerCategories = [
    'Personal Health',
    'Family',
    'Financial',
    'Career/Work',
    'Relationships',
    'Spiritual Growth',
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
        <h2 className="text-3xl font-bold text-blue-900">Prayer Request</h2>
        <p className="text-gray-600 mt-2">Submit your prayer needs - we're here to pray with you</p>
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
              label="Phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254 700 000 000"
              disabled={isSubmitting}
            />

            {errors.contact && (
              <p className="text-red-600 text-sm">{errors.contact}</p>
            )}
          </div>
        )}

        {/* Prayer Request Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Prayer Request</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Request Category <span className="text-red-600">*</span>
            </label>
            <select
              name="prayerCategory"
              value={formData.prayerCategory}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            >
              <option value="">Select category</option>
              {prayerCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.prayerCategory && (
              <p className="text-red-600 text-sm mt-1">{errors.prayerCategory}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Prayer Request <span className="text-red-600">*</span>
            </label>
            <textarea
              name="request"
              value={formData.request}
              onChange={handleChange}
              rows="6"
              required
              disabled={isSubmitting}
              placeholder="Share your prayer need with us. We will lift you up in prayer..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.request.length} characters (minimum 20)
            </p>
            {errors.request && (
              <p className="text-red-600 text-sm mt-1">{errors.request}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Urgency <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, urgency: 'Urgent' }))}
                disabled={isSubmitting}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                  formData.urgency === 'Urgent'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                🚨 Urgent
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, urgency: 'Regular' }))}
                disabled={isSubmitting}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                  formData.urgency === 'Regular'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                🙏 Regular
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {formData.urgency === 'Urgent' 
                ? 'Urgent requests will be sent to our prayer team immediately'
                : 'Regular requests will be included in our weekly prayer meetings'}
            </p>
          </div>
        </div>

        {/* Privacy & Follow-up Options */}
        {!isAnonymous && (
          <div className="space-y-3 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Prayer Support Options</h3>
            
            <label className="flex items-start gap-3 cursor-pointer p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                name="shareOnPrayerList"
                checked={formData.shareOnPrayerList}
                onChange={handleChange}
                disabled={isSubmitting}
                className="mt-1 w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
              />
              <div>
                <span className="font-semibold text-gray-900">Add to church prayer list</span>
                <p className="text-sm text-gray-600 mt-1">
                  Your request will be shared with the prayer team and congregation
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition">
              <input
                type="checkbox"
                name="prayerNeeded"
                checked={formData.prayerNeeded}
                onChange={handleChange}
                disabled={isSubmitting}
                className="mt-1 w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
              />
              <div>
                <span className="font-semibold text-gray-900">I would like someone to pray with me</span>
                <p className="text-sm text-gray-600 mt-1">
                  Someone from our prayer team will reach out to you
                </p>
              </div>
            </label>

            {formData.prayerNeeded && (
              <div className="ml-8 space-y-3 pt-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="">Select method</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="In-person">In-person</option>
                  </select>
                </div>

                <Input
                  name="bestTimeToContact"
                  label="Best Time to Contact"
                  value={formData.bestTimeToContact}
                  onChange={handleChange}
                  placeholder="e.g., Weekday evenings, Weekend mornings"
                  disabled={isSubmitting}
                />
              </div>
            )}
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
              'Submit Prayer Request'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PrayerRequestForm;