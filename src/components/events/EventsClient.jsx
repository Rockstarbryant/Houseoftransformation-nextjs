'use client';

import React from 'react';
import EventCard from './EventCard';

const EventsClient = ({ events }) => {
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
    </div>
  );
};

export default EventsClient;