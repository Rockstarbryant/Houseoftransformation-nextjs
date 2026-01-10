'use client';

import React, { useState } from 'react';
import { Clock, MapPin, X, Calendar, User } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const EventCard = ({ event }) => {
  const [showModal, setShowModal] = useState(false);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      year: date.getFullYear(),
      full: date.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  const dateInfo = formatDate(event.date);

  return (
    <>
      <Card 
        hover 
        padding="lg" 
        shadow="md"
        border
        className="border-slate-200"
      >
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          {/* Date Badge */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 text-center min-w-[120px] flex flex-col justify-center h-32">
            <p className="text-4xl font-bold leading-none">{dateInfo.day}</p>
            <p className="text-sm font-bold mt-2 uppercase tracking-widest">{dateInfo.month}</p>
            <p className="text-xs opacity-90 mt-1">{dateInfo.year}</p>
          </div>

          {/* Event Details */}
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 hover:text-blue-600 transition-colors">
              {event.title}
            </h3>
            
            <div className="space-y-2 mb-6">
              {event.time && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Clock size={20} className="text-blue-600 flex-shrink-0" />
                  <span className="font-semibold">{event.time}</span>
                </div>
              )}
              
              {event.location && (
                <div className="flex items-center gap-3 text-slate-700">
                  <MapPin size={20} className="text-blue-600 flex-shrink-0" />
                  <span className="font-semibold">{event.location}</span>
                </div>
              )}

              {event.category && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar size={20} className="text-blue-600 flex-shrink-0" />
                  <span className="font-semibold uppercase text-sm tracking-wide">{event.category}</span>
                </div>
              )}
            </div>

            {/* Description Preview */}
            {event.description && (
              <p className="text-slate-600 line-clamp-2 mb-6">
                {event.description}
              </p>
            )}
          </div>

          {/* CTA Button */}
          <div className="w-full md:w-auto">
            <Button 
              variant="secondary"
              size="lg"
              onClick={() => setShowModal(true)}
              fullWidth
            >
              Learn More
            </Button>
          </div>
        </div>
      </Card>

      {/* Event Details Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 md:px-8 py-4 flex justify-between items-center rounded-t-3xl">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Event Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={28} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8">
              {/* Date Badge */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-6xl font-bold leading-none">{dateInfo.day}</div>
                    <div className="text-xl font-bold uppercase tracking-wider mt-2">{dateInfo.month}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{dateInfo.year}</div>
                    <div className="text-sm opacity-90 mt-1">{dateInfo.full.split(',')[0]}</div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                {event.title}
              </h1>

              {/* Time */}
              {event.time && (
                <div className="flex items-center gap-4 text-slate-700 mb-4 text-lg">
                  <Clock size={28} className="text-blue-600" />
                  <span className="font-semibold">{event.time}</span>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-4 text-slate-700 mb-6 text-lg">
                  <MapPin size={28} className="text-blue-600" />
                  <span className="font-semibold">{event.location}</span>
                </div>
              )}

              {/* Category Badge */}
              {event.category && (
                <div className="mb-8">
                  <span className="inline-block bg-blue-100 text-blue-900 px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-widest">
                    {event.category}
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-200 my-8" />

              {/* Description */}
              {event.description && (
                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">About This Event</h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-lg">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Need Help?
                </h4>
                <p className="text-slate-700">
                  If you have any questions about this event, please contact us at 
                  <span className="font-semibold"> contact@church.com</span> or call us directly.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors transform hover:scale-105">
                  Register Now
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-4 px-6 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCard;