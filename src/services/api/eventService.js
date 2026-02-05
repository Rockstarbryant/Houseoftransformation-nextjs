// src/services/api/eventService.js - Enhanced
import api from '@/lib/api';

/**
 * Event Service
 * Handles all event-related API calls
 */

// ============================================
// EVENT CRUD
// ============================================

/**
 * Get all events with filters
 * @param {object} params - { limit, status, search, startDate, endDate }
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
 * Get single event by ID
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

/**
 * Create new event
 * @param {object} eventData - { title, description, date, time, location, image }
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
 * Register for event
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

/**
 * Get event registrations
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

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get event status
 */
export const getEventStatus = (event) => {
  if (!event || !event.date) return 'unknown';
  
  const eventDate = new Date(event.date);
  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  if (eventDate < now - oneDayMs) {
    return 'past';
  } else if (eventDate > now + oneDayMs) {
    return 'upcoming';
  } else {
    return 'today';
  }
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const colors = {
    past: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    upcoming: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    today: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
  };
  return colors[status] || colors.upcoming;
};

/**
 * Format event date
 */
export const formatEventDate = (date) => {
  if (!date) return 'No date';
  
  const eventDate = new Date(date);
  return eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format event time
 */
export const formatEventTime = (time) => {
  if (!time) return 'Time TBA';
  return time;
};

/**
 * Check if event is full (if capacity exists)
 */
export const isEventFull = (event) => {
  if (!event.capacity) return false;
  return event.registrations?.length >= event.capacity;
};

/**
 * Calculate days until event
 */
export const getDaysUntilEvent = (date) => {
  if (!date) return null;
  
  const eventDate = new Date(date);
  const now = new Date();
  const diffTime = eventDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Filter events by status
 */
export const filterEventsByStatus = (events, status) => {
  if (!events) return [];
  
  return events.filter(event => {
    const eventStatus = getEventStatus(event);
    
    if (status === 'all') return true;
    if (status === 'past') return eventStatus === 'past';
    if (status === 'upcoming') return eventStatus === 'upcoming' || eventStatus === 'today';
    if (status === 'today') return eventStatus === 'today';
    
    return true;
  });
};

/**
 * Sort events by date
 */
export const sortEventsByDate = (events, order = 'asc') => {
  if (!events) return [];
  
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Search events
 */
export const searchEvents = (events, query) => {
  if (!events || !query) return events;
  
  const lowerQuery = query.toLowerCase();
  
  return events.filter(event => 
    event.title?.toLowerCase().includes(lowerQuery) ||
    event.description?.toLowerCase().includes(lowerQuery) ||
    event.location?.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Export events to CSV
 */
export const exportEventsToCSV = (events) => {
  if (!events || events.length === 0) return null;

  const headers = ['Title', 'Date', 'Time', 'Location', 'Registrations', 'Status'];
  const rows = events.map(event => [
    event.title || '',
    formatEventDate(event.date),
    formatEventTime(event.time),
    event.location || '',
    event.registrations?.length || 0,
    getEventStatus(event)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent, filename = 'events-export.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Validate event data
 */
export const validateEventData = (data) => {
  const errors = {};

  if (!data.title || data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (!data.date) {
    errors.date = 'Date is required';
  } else {
    const eventDate = new Date(data.date);
    if (eventDate < new Date()) {
      errors.date = 'Event date cannot be in the past';
    }
  }

  if (!data.location || data.location.trim().length < 3) {
    errors.location = 'Location is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format registration count
 */
export const formatRegistrationCount = (event) => {
  const count = event.registrations?.length || 0;
  
  if (event.capacity) {
    return `${count}/${event.capacity}`;
  }
  
  return count.toString();
};

