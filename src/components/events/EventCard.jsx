'use client';

import React, { useState } from 'react';
import { Clock, MapPin, X, Calendar, User, ArrowUpRight } from 'lucide-react';
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
        padding="none" 
        shadow="none"
        className="group border-2 border-slate-100 hover:border-slate-900 rounded-[32px] overflow-hidden transition-all duration-300 bg-white"
      >
        <div className="flex flex-col md:flex-row items-stretch">
          {/* Date Block: HQ Style */}
          <div className="bg-slate-900 text-white p-8 text-center md:min-w-[140px] flex flex-col justify-center border-b-4 border-red-600 md:border-b-0 md:border-r-4">
            <p className="text-5xl font-black leading-none tracking-tighter">{dateInfo.day}</p>
            <p className="text-xs font-black mt-2 uppercase tracking-[0.3em] text-red-500">{dateInfo.month}</p>
            <p className="text-[10px] font-bold opacity-40 mt-1 uppercase tracking-widest">{dateInfo.year}</p>
          </div>

          {/* Event Details */}
          <div className="flex-1 p-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none group-hover:text-red-600 transition-colors">
                {event.title}
              </h3>
              <ArrowUpRight className="text-slate-200 group-hover:text-slate-900 transition-colors shrink-0" size={24} />
            </div>
            
            <div className="flex flex-wrap gap-6 mb-6">
              {event.time && (
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={14} className="text-red-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{event.time}</span>
                </div>
              )}
              
              {event.location && (
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin size={14} className="text-red-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{event.location}</span>
                </div>
              )}

              {event.category && (
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar size={14} className="text-red-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{event.category}</span>
                </div>
              )}
            </div>

            {event.description && (
              <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* CTA Section */}
          <div className="p-8 md:border-l border-slate-50 flex items-center">
            <Button 
              variant="secondary"
              onClick={() => setShowModal(true)}
              className="md:w-auto w-full font-black uppercase tracking-widest text-[10px] py-4 px-8 border-2"
            >
              Access Intelligence
            </Button>
          </div>
        </div>
      </Card>

      {/* Event Details Modal: Refactored for HQ Aesthetic */}
      {showModal && (
        <div
          className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-[40px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-6 flex justify-between items-center z-20">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Operation Briefing</span>
              <button
                onClick={() => setShowModal(false)}
                className="bg-slate-900 text-white p-2 rounded-xl hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-10 pb-12">
              <div className="mb-10">
                <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">
                  {event.title}
                </h1>
                <div className="h-2 w-20 bg-red-600" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Schedule</p>
                  <p className="font-black text-slate-900 uppercase tracking-tight">{event.time}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">{dateInfo.full}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</p>
                  <p className="font-black text-slate-900 uppercase tracking-tight">{event.location}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">HQ Main Node</p>
                </div>
              </div>

              {event.description && (
                <div className="mb-10">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Briefing Details</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {event.description}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button className="flex-1 bg-slate-900 hover:bg-red-600 text-white font-black py-5 px-6 rounded-2xl uppercase tracking-[0.2em] text-[11px] transition-all transform active:scale-95 shadow-xl">
                  Register for Gathering
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-2xl uppercase tracking-widest text-[11px] transition-colors"
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