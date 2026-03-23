// src/services/api/eventService.js
import api from '@/lib/api';

// ============================================
// EVENT CRUD — PUBLIC
// ============================================

/**
 * Get upcoming events (PUBLIC — no PII, no registrations array)
 * Used by public-facing EventCarousel / EventList
 */
export const getEvents = async (params = {}) => {
  try {
    const response = await api.get('/events', { params });
    return response.data;
  } catch (error) {
    console.error('[EventService] Get events error:', error);
    throw error;
  }
};

/**
 * Get single event (PUBLIC — no registrations)
 */
export const getEvent = async (id) => {
  try {
    const response = await api.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    console.error('[EventService] Get event error:', error);
    throw error;
  }
};

// ============================================
// EVENT CRUD — ADMIN (protected)
// ============================================

/**
 * Get ALL events for admin portal (includes past events + registrationCount)
 * Calls GET /api/events/admin/all — requires manage:events permission
 */
export const getEventsAdmin = async (params = {}) => {
  try {
    const response = await api.get('/events/admin/all', { params });
    return response.data;
  } catch (error) {
    console.error('[EventService] Get admin events error:', error);
    throw error;
  }
};

/**
 * Get registrations for a specific event (ADMIN ONLY — PII returned)
 * Calls GET /api/events/:id/registrations
 */
export const getEventRegistrations = async (id) => {
  try {
    const response = await api.get(`/events/${id}/registrations`);
    return response.data;
  } catch (error) {
    console.error('[EventService] Get registrations error:', error);
    throw error;
  }
};

/**
 * Create new event
 */
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    console.error('[EventService] Create event error:', error);
    throw error;
  }
};

/**
 * Update event
 */
export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error('[EventService] Update event error:', error);
    throw error;
  }
};

/**
 * Delete event
 */
export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    console.error('[EventService] Delete event error:', error);
    throw error;
  }
};

// ============================================
// EVENT REGISTRATION
// ============================================

/**
 * Register authenticated user for event
 */
export const registerForEvent = async (id) => {
  try {
    const response = await api.post(`/events/${id}/register`);
    return response.data;
  } catch (error) {
    console.error('[EventService] Register error:', error);
    throw error;
  }
};

/**
 * Unregister from event
 */
export const unregisterFromEvent = async (id) => {
  try {
    const response = await api.delete(`/events/${id}/register`);
    return response.data;
  } catch (error) {
    console.error('[EventService] Unregister error:', error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getEventStatus = (event) => {
  if (!event || !event.date) return 'unknown';
  const eventDate = new Date(event.date);
  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (eventDate < now - oneDayMs) return 'past';
  if (eventDate > now + oneDayMs) return 'upcoming';
  return 'today';
};

export const getStatusColor = (status) => {
  const colors = {
    past: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    upcoming: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    today: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  };
  return colors[status] || colors.upcoming;
};

export const formatEventDate = (date) => {
  if (!date) return 'No date';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
};

export const formatEventTime = (time) => time || 'Time TBA';

export const getDaysUntilEvent = (date) => {
  if (!date) return null;
  const diffTime = new Date(date) - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const filterEventsByStatus = (events, status) => {
  if (!events) return [];
  return events.filter((event) => {
    const s = getEventStatus(event);
    if (status === 'all') return true;
    if (status === 'upcoming') return s === 'upcoming' || s === 'today';
    return s === status;
  });
};

export const sortEventsByDate = (events, order = 'asc') => {
  if (!events) return [];
  return [...events].sort((a, b) => {
    const diff = new Date(a.date) - new Date(b.date);
    return order === 'asc' ? diff : -diff;
  });
};

export const searchEvents = (events, query) => {
  if (!events || !query) return events;
  const q = query.toLowerCase();
  return events.filter(
    (e) =>
      e.title?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q)
  );
};

/**
 * Format registration count.
 * Backend now returns `registrationCount` (number) instead of the full
 * `registrations` array on public and admin-list endpoints.
 * `registrations` array is only present on GET /:id/registrations.
 */
export const formatRegistrationCount = (event) => {
  // Admin-list response: registrationCount is a plain number
  const count =
    event.registrationCount ??
    event.registrations?.length ??
    0;

  return event.capacity ? `${count}/${event.capacity}` : String(count);
};

export const isEventFull = (event) => {
  if (!event.capacity) return false;
  const count = event.registrationCount ?? event.registrations?.length ?? 0;
  return count >= event.capacity;
};

/**
 * Export to CSV — uses registrationCount (no PII)
 */
export const exportEventsToCSV = (events) => {
  if (!events || events.length === 0) return null;

  const headers = ['Title', 'Date', 'Time', 'Location', 'Registrations', 'Capacity', 'Status'];
  const rows = events.map((event) => [
    event.title || '',
    formatEventDate(event.date),
    formatEventTime(event.time),
    event.location || '',
    event.registrationCount ?? event.registrations?.length ?? 0,
    event.capacity || 'Unlimited',
    getEventStatus(event),
  ]);

  return [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');
};

export const downloadCSV = (csvContent, filename = 'events-export.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const validateEventData = (data) => {
  const errors = {};

  if (!data.title || data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }
  if (!data.date) {
    errors.date = 'Date is required';
  } else if (new Date(data.date) < new Date()) {
    errors.date = 'Event date cannot be in the past';
  }
  if (!data.location || data.location.trim().length < 3) {
    errors.location = 'Location is required';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};