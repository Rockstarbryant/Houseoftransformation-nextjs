'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import EventCard from './EventCard';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { getEvents } from '@/services/api/eventService';

const EventList = ({ limit, showViewAll = false }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [limit]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents({ limit });
      // Handle both response formats
      const eventsList = data.events || data.data || data;
      setEvents(Array.isArray(eventsList) ? eventsList : []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents([]);
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
      {/* Container for the cards */}
      <div className="space-y-8 max-w-4xl mx-auto">
        {events.length > 0 ? (
          events.map(event => (
            <EventCard key={event._id || event.id} event={event} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 font-semibold">
              No events available at the moment
            </p>
          </div>
        )}
      </div>

      {/* View All Action */}
      {showViewAll && events.length > 0 && (
        <div className="flex justify-center mt-20 relative">
          {/* Decorative line behind the button */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 dark:bg-slate-800 -z-10" />
          
          <Link href="/events">
            <div className="bg-[#F8FAFC] dark:bg-slate-900 px-8">
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