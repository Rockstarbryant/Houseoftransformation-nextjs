// lib/events.js
// Server-side data fetching functions for events
// Used in Server Components (app router)

/**
 * Fetch all events from the API (Server-side)
 * @param {object} options - { limit, status, search, startDate, endDate, cache }
 * @returns {Promise<Array>} events array
 */
export async function getEvents(options = {}) {
  const { 
    limit, 
    status, 
    search, 
    startDate, 
    endDate,
    //cache = 'no-store' // or 'force-cache', 'no-store'
  } = options;

  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/events${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      cache, // 'no-store' for dynamic, 'force-cache' for static
      next: { 
        revalidate: cache === 'no-store' ? 0 : 3600 // Revalidate every hour for cached requests
      },
    });

    if (!response.ok) {
      console.error(`[lib/events] Failed to fetch events: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // Handle both response formats
    const eventsList = data.events || data.data || data;
    return Array.isArray(eventsList) ? eventsList : [];

  } catch (error) {
    console.error('[lib/events] Error fetching events:', error);
    return [];
  }
}

/**
 * Fetch single event by ID (Server-side)
 * @param {string} id - Event ID
 * @param {string} cache - Cache strategy ('no-store', 'force-cache')
 * @returns {Promise<Object|null>} event object or null
 */
export async function getEvent(id, cache = 'no-store') {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/events/${id}`;

    const response = await fetch(url, {
      cache,
      next: { 
        revalidate: cache === 'no-store' ? 0 : 3600
      },
    });

    if (!response.ok) {
      console.error(`[lib/events] Failed to fetch event ${id}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Handle both response formats
    return data.event || data.data || data;

  } catch (error) {
    console.error(`[lib/events] Error fetching event ${id}:`, error);
    return null;
  }
}

/**
 * Fetch upcoming events (Server-side)
 * @param {number} limit - Maximum number of events to return
 * @param {string} cache - Cache strategy
 * @returns {Promise<Array>} upcoming events array
 */
export async function getUpcomingEvents(limit = 10, cache = 'no-store') {
  try {
    const events = await getEvents({ 
      limit, 
      status: 'upcoming',
      cache 
    });

    // Additional filtering to ensure only future events
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    });

  } catch (error) {
    console.error('[lib/events] Error fetching upcoming events:', error);
    return [];
  }
}

/**
 * Fetch past events (Server-side)
 * @param {number} limit - Maximum number of events to return
 * @param {string} cache - Cache strategy
 * @returns {Promise<Array>} past events array
 */
export async function getPastEvents(limit = 10, cache = 'no-store') {
  try {
    const events = await getEvents({ 
      limit, 
      status: 'past',
      cache 
    });

    // Additional filtering to ensure only past events
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < now;
    });

  } catch (error) {
    console.error('[lib/events] Error fetching past events:', error);
    return [];
  }
}

/**
 * Fetch events by date range (Server-side)
 * @param {string} startDate - Start date (ISO format)
 * @param {string} endDate - End date (ISO format)
 * @param {string} cache - Cache strategy
 * @returns {Promise<Array>} events array
 */
export async function getEventsByDateRange(startDate, endDate, cache = 'no-store') {
  try {
    return await getEvents({ 
      startDate, 
      endDate,
      cache 
    });
  } catch (error) {
    console.error('[lib/events] Error fetching events by date range:', error);
    return [];
  }
}

/**
 * Search events (Server-side)
 * @param {string} query - Search query
 * @param {string} cache - Cache strategy
 * @returns {Promise<Array>} events array
 */
export async function searchEvents(query, cache = 'no-store') {
  try {
    if (!query || query.trim().length === 0) {
      return await getEvents({ cache });
    }

    return await getEvents({ 
      search: query,
      cache 
    });
  } catch (error) {
    console.error('[lib/events] Error searching events:', error);
    return [];
  }
}

/**
 * Get event registrations (Server-side)
 * @param {string} id - Event ID
 * @param {string} token - Auth token
 * @returns {Promise<Array>} registrations array
 */
export async function getEventRegistrations(id, token) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/events/${id}/registrations`;

    const response = await fetch(url, {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {},
      cache: 'no-store', // Always fetch fresh registration data
    });

    if (!response.ok) {
      console.error(`[lib/events] Failed to fetch registrations for event ${id}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // Handle both response formats
    const registrations = data.registrations || data.data || data;
    return Array.isArray(registrations) ? registrations : [];

  } catch (error) {
    console.error(`[lib/events] Error fetching registrations for event ${id}:`, error);
    return [];
  }
}

// ============================================
// UTILITY FUNCTIONS (Server-side safe)
// ============================================

/**
 * Format date for display
 * @param {string} dateStr - Date string
 * @returns {object} Formatted date object
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
    year: date.getFullYear(),
    full: date.toLocaleDateString('default', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  };
}

/**
 * Get event status
 * @param {object} event - Event object
 * @returns {string} Status ('past', 'today', 'upcoming')
 */
export function getEventStatus(event) {
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
}

/**
 * Sort events by date
 * @param {Array} events - Events array
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted events
 */
export function sortEventsByDate(events, order = 'asc') {
  if (!events || !Array.isArray(events)) return [];
  
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Filter events by category
 * @param {Array} events - Events array
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered events
 */
export function filterEventsByCategory(events, category) {
  if (!events || !Array.isArray(events)) return [];
  if (!category) return events;
  
  return events.filter(event => 
    event.category?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get unique categories from events
 * @param {Array} events - Events array
 * @returns {Array} Array of unique categories
 */
export function getUniqueCategories(events) {
  if (!events || !Array.isArray(events)) return [];
  
  const categories = events
    .map(event => event.category)
    .filter(Boolean);
  
  return [...new Set(categories)];
}

/**
 * Calculate days until event
 * @param {string} dateStr - Date string
 * @returns {number} Days until event
 */
export function getDaysUntilEvent(dateStr) {
  if (!dateStr) return null;
  
  const eventDate = new Date(dateStr);
  const now = new Date();
  const diffTime = eventDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if event is happening soon (within 7 days)
 * @param {string} dateStr - Date string
 * @returns {boolean}
 */
export function isEventSoon(dateStr) {
  const days = getDaysUntilEvent(dateStr);
  return days !== null && days >= 0 && days <= 7;
}

/**
 * Group events by month
 * @param {Array} events - Events array
 * @returns {Object} Events grouped by month
 */
export function groupEventsByMonth(events) {
  if (!events || !Array.isArray(events)) return {};
  
  return events.reduce((acc, event) => {
    const date = new Date(event.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('default', { year: 'numeric', month: 'long' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        name: monthName,
        events: []
      };
    }
    
    acc[monthKey].events.push(event);
    return acc;
  }, {});
}