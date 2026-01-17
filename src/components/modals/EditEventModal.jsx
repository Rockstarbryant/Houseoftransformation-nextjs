// components/modals/EditEventModal.jsx
'use client';

import { X, Calendar, MapPin, Clock, ImageIcon, Loader } from 'lucide-react';

/**
 * Edit Event Modal
 * Form to edit existing events
 */
export default function EditEventModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  formErrors,
  onSubmit,
  loading,
  event
}) {
  if (!isOpen || !event) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Edit Event
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Update event details
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Sunday Service, Bible Study..."
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${
                formErrors.title 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-slate-200 dark:border-slate-700 focus:ring-[#8B1A1A]'
              } rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:border-transparent outline-none`}
              disabled={loading}
            />
            {formErrors.title && (
              <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the event..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none resize-none"
              disabled={loading}
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                <Calendar size={16} className="inline mr-2" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${
                  formErrors.date 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-slate-200 dark:border-slate-700 focus:ring-[#8B1A1A]'
                } rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:border-transparent outline-none`}
                disabled={loading}
              />
              {formErrors.date && (
                <p className="text-red-600 text-sm mt-1">{formErrors.date}</p>
              )}
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                <Clock size={16} className="inline mr-2" />
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
              <MapPin size={16} className="inline mr-2" />
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Main Sanctuary, Fellowship Hall..."
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${
                formErrors.location 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-slate-200 dark:border-slate-700 focus:ring-[#8B1A1A]'
              } rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:border-transparent outline-none`}
              disabled={loading}
            />
            {formErrors.location && (
              <p className="text-red-600 text-sm mt-1">{formErrors.location}</p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
              <ImageIcon size={16} className="inline mr-2" />
              Image URL
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
              disabled={loading}
            />
            {formData.image && (
              <div className="mt-3">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Event Info */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Created:</span>{' '}
              {new Date(event.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              <span className="font-semibold">Registrations:</span>{' '}
              {event.registrations?.length || 0}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Updating...
                </>
              ) : (
                'Update Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}