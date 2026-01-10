import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { eventService } from '../../services/api/eventService';

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

  if (loading) return <Loader />;

  return (
    <div>
      <div className="space-y-6 max-w-4xl mx-auto">
        {events.map(event => (
          <EventCard key={event._id || event.id} event={event} />
        ))}
      </div>
      {showViewAll && (
        <div className="text-center mt-12">
          <Link to="/events">
            <Button variant="primary">View All Events</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default EventList;