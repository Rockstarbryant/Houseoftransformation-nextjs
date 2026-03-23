// lib/events.js
// Server-side data fetching for events — used in Next.js Server Components

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ============================================
// PUBLIC FETCHERS (no auth — no PII returned)
// ============================================

/**
 * Fetch upcoming events — PUBLIC endpoint
 * Returns events WITHOUT the registrations array (just registrationCount)
 */
export async function getEvents(options = {}) {
  const { limit, status, search, startDate, endDate } = options;

  try {
    const params = new URLSearchParams();
    if (limit)     params.append('limit', limit);
    if (status)    params.append('status', status);
    if (search)    params.append('search', search);
    if (startDate) params.append('startDate', startDate);
    if (endDate)   params.append('endDate', endDate);

    const qs  = params.toString();
    const url = `${API_BASE}/events${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`[lib/events] getEvents failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const list = data.events || data.data || data;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.error('[lib/events] getEvents error:', error);
    return [];
  }
}

/**
 * Fetch single event by ID — PUBLIC endpoint (no registrations)
 */
export async function getEvent(id, cache = 'no-store') {
  try {
    const response = await fetch(`${API_BASE}/events/${id}`, {
      cache,
      next: { revalidate: cache === 'no-store' ? 0 : 3600 },
    });

    if (!response.ok) {
      console.error(`[lib/events] getEvent(${id}) failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.event || data.data || data;
  } catch (error) {
    console.error(`[lib/events] getEvent(${id}) error:`, error);
    return null;
  }
}

/**
 * Upcoming events helper
 */
export async function getUpcomingEvents(limit = 10) {
  const events = await getEvents({ limit });
  const now = new Date();
  return events.filter((e) => new Date(e.date) >= now);
}

/**
 * Past events helper
 */
export async function getPastEvents(limit = 10) {
  const events = await getEvents({ limit });
  const now = new Date();
  return events.filter((e) => new Date(e.date) < now);
}

/**
 * Events by date range
 */
export async function getEventsByDateRange(startDate, endDate) {
  return getEvents({ startDate, endDate });
}

/**
 * Server-side event search
 */
export async function searchEvents(query) {
  if (!query?.trim()) return getEvents({});
  return getEvents({ search: query });
}

// ============================================
// ADMIN FETCHERS (require auth token — return PII)
// ============================================

/**
 * Fetch ALL events for admin portal (past + upcoming)
 * Calls GET /api/events/admin/all — requires manage:events permission
 * Returns events with registrationCount (not full registrations array)
 *
 * @param {string} token  — Supabase / auth bearer token
 * @param {object} options — { limit }
 */
export async function getEventsAdmin(token, options = {}) {
  const { limit = 100 } = options;

  try {
    const params = new URLSearchParams();
    params.append('limit', limit);

    const url = `${API_BASE}/events/admin/all?${params.toString()}`;

    const response = await fetch(url, {
      cache: 'no-store', // always fresh for admin views
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      console.error(`[lib/events] getEventsAdmin failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const list = data.events || data.data || data;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.error('[lib/events] getEventsAdmin error:', error);
    return [];
  }
}

/**
 * Fetch registrations for a specific event — ADMIN ONLY
 * Returns full PII: names, emails, phones
 *
 * @param {string} id     — Event ID
 * @param {string} token  — Auth bearer token
 */
export async function getEventRegistrations(id, token) {
  try {
    const response = await fetch(`${API_BASE}/events/${id}/registrations`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      console.error(`[lib/events] getEventRegistrations(${id}) failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const list = data.registrations || data.data || data;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.error(`[lib/events] getEventRegistrations(${id}) error:`, error);
    return [];
  }
}

// ============================================
// SHARED UTILITIES (server-safe, no browser APIs)
// ============================================

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
    year: date.getFullYear(),
    full: date.toLocaleDateString('default', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }),
  };
}

export function getEventStatus(event) {
  if (!event?.date) return 'unknown';
  const eventDate = new Date(event.date);
  const now = new Date();
  const oneDayMs = 86_400_000;
  if (eventDate < now - oneDayMs) return 'past';
  if (eventDate > now + oneDayMs) return 'upcoming';
  return 'today';
}

export function sortEventsByDate(events, order = 'asc') {
  if (!Array.isArray(events)) return [];
  return [...events].sort((a, b) => {
    const diff = new Date(a.date) - new Date(b.date);
    return order === 'asc' ? diff : -diff;
  });
}

export function filterEventsByCategory(events, category) {
  if (!Array.isArray(events) || !category) return events ?? [];
  return events.filter((e) => e.category?.toLowerCase() === category.toLowerCase());
}

export function getUniqueCategories(events) {
  if (!Array.isArray(events)) return [];
  return [...new Set(events.map((e) => e.category).filter(Boolean))];
}

export function getDaysUntilEvent(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86_400_000);
}

export function isEventSoon(dateStr) {
  const days = getDaysUntilEvent(dateStr);
  return days !== null && days >= 0 && days <= 7;
}

export function groupEventsByMonth(events) {
  if (!Array.isArray(events)) return {};
  return events.reduce((acc, event) => {
    const date = new Date(event.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const name = date.toLocaleDateString('default', { year: 'numeric', month: 'long' });
    if (!acc[key]) acc[key] = { name, events: [] };
    acc[key].events.push(event);
    return acc;
  }, {});
}