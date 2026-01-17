// components/modals/ViewEventModal.jsx
'use client';

import { X, Calendar, MapPin, Clock, Users, ImageIcon } from 'lucide-react';
import { getEventStatus, getStatusColor, formatEventDate, formatEventTime, getDaysUntilEvent } from '@/services/api/eventService';

/**
 * View Event Modal
 * Display event details and registrations
 */
export default function ViewEventModal({
  isOpen,
  onClose,
  event
}) {
  if (!isOpen || !event) return null;

  const status = getEventStatus(event);
  const daysUntil = getDaysUntilEvent(event.date);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Event Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Event Image */}
          {event.image ? (
            <div className="rounded-xl overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 object-cover"
              />
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-br from-[#8B1A1A] to-red-900 rounded-xl flex items-center justify-center">
              <Calendar className="text-white/30" size={96} />
            </div>
          )}

          {/* Status Badge & Days Until */}
          <div className="flex items-center justify-between">
            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {daysUntil !== null && daysUntil >= 0 && (
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {daysUntil === 0 ? '🎉 Today!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
              </span>
            )}
          </div>

          {/* Event Title */}
          <div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {event.title}
            </h3>
          </div>

          {/* Event Description */}
          {event.description && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider mb-1">
                    Date
                  </p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {formatEventDate(event.date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <Clock className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider mb-1">
                    Time
                  </p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {formatEventTime(event.time)}
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <MapPin className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-900 dark:text-green-200 uppercase tracking-wider mb-1">
                    Location
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {event.location || 'TBA'}
                  </p>
                </div>
              </div>
            </div>

            {/* Registrations */}
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <Users className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-900 dark:text-orange-200 uppercase tracking-wider mb-1">
                    Registrations
                  </p>
                  <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                    {event.registrations?.length || 0} people
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Registrations List */}
          {event.registrations && event.registrations.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                Registered Attendees ({event.registrations.length})
              </h4>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Registered At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
  {event.registrations.map((reg, index) => (
    <tr key={index} className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        {index + 1}
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {reg.isVisitor 
              ? reg.visitorName 
              : (reg.user?.name || reg.user?.email || 'Unknown User')
            }
          </p>
          {reg.isVisitor && (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400">{reg.visitorEmail}</p>
              {reg.visitorPhone && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{reg.visitorPhone}</p>
              )}
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        {reg.isVisitor ? (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded">
            Visitor
          </span>
        ) : (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-xs font-bold rounded">
            Member
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        {reg.registeredAt 
          ? new Date(reg.registeredAt).toLocaleString()
          : 'N/A'
        }
      </td>
      {reg.attendanceTime && (
        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
          {reg.attendanceTime}
            </td>
                )}
                </tr>
                ))}
                </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Event Metadata */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <p>
              <span className="font-semibold">Created:</span>{' '}
              {new Date(event.createdAt).toLocaleString()}
            </p>
            {event.updatedAt && event.updatedAt !== event.createdAt && (
              <p>
                <span className="font-semibold">Last Updated:</span>{' '}
                {new Date(event.updatedAt).toLocaleString()}
              </p>
            )}
            <p>
              <span className="font-semibold">Event ID:</span> {event._id}
            </p>
          </div>

          {/* Close Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}