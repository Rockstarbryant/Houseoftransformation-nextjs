// components/modals/DeleteEventModal.jsx
'use client';

import { X, AlertTriangle, Loader } from 'lucide-react';

/**
 * Delete Event Modal
 * Confirm event deletion
 */
export default function DeleteEventModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  event
}) {
  if (!isOpen || !event) return null;

  const hasRegistrations = event.registrations && event.registrations.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-black text-red-900 dark:text-red-100">
              Delete Event
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-700 dark:text-slate-300">
            Are you sure you want to delete this event?
          </p>

          {/* Event Preview */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              {event.title}
            </h3>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <p>
                <span className="font-semibold">Date:</span>{' '}
                {new Date(event.date).toLocaleDateString()}
              </p>
              {event.location && (
                <p>
                  <span className="font-semibold">Location:</span>{' '}
                  {event.location}
                </p>
              )}
              <p>
                <span className="font-semibold">Registrations:</span>{' '}
                {event.registrations?.length || 0}
              </p>
            </div>
          </div>

          {/* Warning for registrations */}
          {hasRegistrations && (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-100 text-sm">
                  Warning: This event has {event.registrations.length} registered attendee(s)
                </p>
                <p className="text-yellow-800 dark:text-yellow-200 text-sm mt-1">
                  Deleting this event will remove all registration records.
                </p>
              </div>
            </div>
          )}

          {/* Confirmation Warning */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-900 dark:text-red-100 font-semibold text-sm">
              ⚠️ This action cannot be undone
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Deleting...
                </>
              ) : (
                'Delete Event'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}