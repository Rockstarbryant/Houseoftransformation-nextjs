'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import EventCard from './EventCard';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { eventService } from '@/services/api/eventService';

const EventList = ({ limit, showViewAll = false }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [limit]);

  const fetchEvents = async () => {
    try {
      const data = await eventService.getEvents({ limit });
      setEvents(data.events || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20">
        <Loader />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
          Synchronizing Schedule
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Container for the cards - strictly following your mapping logic */}
      <div className="space-y-8 max-w-4xl mx-auto">
        {events.map(event => (
          <EventCard key={event._id || event.id} event={event} />
        ))}
      </div>

      {/* View All Action - Preserved logic with updated styling */}
      {showViewAll && (
        <div className="flex justify-center mt-20 relative">
          {/* Decorative line behind the button */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 -z-10" />
          
          <Link href="/events">
            <div className="bg-[#F8FAFC] dark:bg-slate-800 px-8">
              <Button variant="primary">
                <span className="flex items-center gap-2">
                  View All Events
                </span>
              </Button>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default EventList;