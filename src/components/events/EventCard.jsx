'use client';

import React, { useState } from 'react';
import { Clock, MapPin, Calendar, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Card from '../common/Card';

const EventCard = ({ event }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [visitorDetails, setVisitorDetails] = useState({
    name: '',
    email: '',
    phone: '',
    attendanceTime: event.time || ''
  });

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

  // Determine if description needs truncation
  const needsTruncation = event.description && event.description.length > 100;
  const displayDescription = isDescriptionExpanded || !needsTruncation 
    ? event.description 
    : event.description?.substring(0, 100) + '...';

  // Registration handler for authenticated users
  const handleRegister = async () => {
    try {
      setRegistering(true);
      setError(null);

      const token = localStorage.getItem('token');
      
      if (!token) {
        setShowRegistrationForm(true);
        setRegistering(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${event._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setRegistered(true);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  // Registration handler for visitors
  const handleVisitorRegistration = async (e) => {
    e.preventDefault();
    
    try {
      setRegistering(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${event._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorDetails: {
            name: visitorDetails.name,
            email: visitorDetails.email,
            phone: visitorDetails.phone,
            attendanceTime: visitorDetails.attendanceTime,
            isVisitor: true
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setRegistered(true);
        setShowRegistrationForm(false);
        setTimeout(() => {
          setRegistered(false);
          setVisitorDetails({ name: '', email: '', phone: '', attendanceTime: event.time || '' });
        }, 3000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Visitor registration error:', err);
      setError('Failed to register. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Card 
      padding="none" 
      shadow="none"
      className="group border-2 border-slate-100 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-600 rounded-3xl overflow-hidden transition-all duration-300 bg-white dark:bg-slate-900 h-full flex flex-col"
    >
      {/* Date Badge - Floating on top left */}
      

      {/* Main Content */}
      <div className="p-6 pt-20 flex-1 flex flex-col">
        {/* Title - Compact */}
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-4">
          {event.title}
        </h3>
        
        {/* Quick Info Grid - Compact 2-column layout */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Time */}
          {event.time && (
            <div className="flex items-start gap-2">
              <Clock size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Time</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{event.time}</p>
              </div>
            </div>
          )}
          
          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Location</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{event.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Full Date */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Calendar size={12} className="text-slate-400" />
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {dateInfo.full}
          </p>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-4 flex-1">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {displayDescription}
            </p>
            
            {needsTruncation && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-bold text-[10px] uppercase tracking-wider transition-colors"
              >
                {isDescriptionExpanded ? (
                  <>
                    Less <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    More <ChevronDown size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Registration Section */}
        <div className="mt-auto">
          {!showRegistrationForm ? (
            <>
              {registered ? (
                <div className="bg-green-600 text-white font-bold py-3 px-4 rounded-xl uppercase tracking-wider text-[10px] flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  Registered!
                </div>
              ) : (
                <button 
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full bg-slate-900 dark:bg-slate-100 hover:bg-red-600 dark:hover:bg-red-600 text-white dark:text-slate-900 dark:hover:text-white font-bold py-3 px-4 rounded-xl uppercase tracking-wider text-[10px] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {registering ? (
                    <>
                      <Loader className="animate-spin" size={14} />
                      Processing...
                    </>
                  ) : (
                    'Confirm Attendance'
                  )}
                </button>
              )}
            </>
          ) : null}

          {/* Error Message */}
          {error && (
            <div className="mt-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0" size={14} />
              <p className="text-red-800 dark:text-red-200 text-[10px] font-semibold">{error}</p>
            </div>
          )}

          {/* Visitor Registration Form */}
          {showRegistrationForm && (
            <div className="mt-4 space-y-3">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Visitor Registration
              </h4>
              <form onSubmit={handleVisitorRegistration} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={visitorDetails.name}
                    onChange={(e) => setVisitorDetails({...visitorDetails, name: e.target.value})}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-600 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={visitorDetails.email}
                    onChange={(e) => setVisitorDetails({...visitorDetails, email: e.target.value})}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-600 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={visitorDetails.phone}
                    onChange={(e) => setVisitorDetails({...visitorDetails, phone: e.target.value})}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-600 outline-none transition-all"
                    placeholder="+254 700 000 000"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Attendance Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={visitorDetails.attendanceTime}
                    onChange={(e) => setVisitorDetails({...visitorDetails, attendanceTime: e.target.value})}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-red-600 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={registering}
                    className="flex-1 bg-slate-900 dark:bg-slate-100 hover:bg-red-600 dark:hover:bg-red-600 text-white dark:text-slate-900 dark:hover:text-white font-bold py-2.5 px-4 rounded-xl uppercase tracking-wider text-[10px] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {registering ? (
                      <>
                        <Loader className="animate-spin" size={12} />
                        Registering...
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegistrationForm(false);
                      setError(null);
                    }}
                    className="px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EventCard;