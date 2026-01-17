// app/portal/events/page.jsx - COMPLETE WITH MODALS
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Calendar, Plus, Edit, Trash2, Users, MapPin, Clock, Search,
  Download, RefreshCw, Grid, List, CheckCircle, XCircle, Eye
} from 'lucide-react';
import {
  getEvents, createEvent, updateEvent, deleteEvent, getEventStatus,
  getStatusColor, formatEventDate, formatEventTime, getDaysUntilEvent,
  filterEventsByStatus, sortEventsByDate, searchEvents, exportEventsToCSV,
  downloadCSV, validateEventData, formatRegistrationCount
} from '@/services/api/eventService';
import Loader from '@/components/common/Loader';
import CreateEventModal from '@/components/modals/CreateEventModal';
import EditEventModal from '@/components/modals/EditEventModal';
import ViewEventModal from '@/components/modals/ViewEventModal';
import DeleteEventModal from '@/components/modals/DeleteEventModal';

/**
 * Events Management Portal
 * Manage church events and registrations
 */
export default function EventsPage() {
  const { user } = useAuth();
  const { canManageEvents } = usePermissions();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Data state
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // ============================================
  // PERMISSION CHECK
  // ============================================
  
  if (!canManageEvents()) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have permission to manage events
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchQuery, statusFilter, sortOrder]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getEvents({ limit: 100 });
      
      if (response.success) {
        setEvents(response.events || []);
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      console.error('[Events] Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];
    filtered = filterEventsByStatus(filtered, statusFilter);
    filtered = searchEvents(filtered, searchQuery);
    filtered = sortEventsByDate(filtered, sortOrder);
    setFilteredEvents(filtered);
  };

  // ============================================
  // CRUD HANDLERS
  // ============================================

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    const validation = validateEventData(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setFormErrors({});

      const response = await createEvent(formData);

      if (response.success) {
        setSuccess('Event created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchEvents();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Events] Create error:', err);
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const validation = validateEventData(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setFormErrors({});

      const response = await updateEvent(selectedEvent._id, formData);

      if (response.success) {
        setSuccess('Event updated successfully!');
        setShowEditModal(false);
        setSelectedEvent(null);
        resetForm();
        fetchEvents();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Events] Update error:', err);
      setError(err.response?.data?.message || 'Failed to update event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await deleteEvent(selectedEvent._id);

      if (response.success) {
        setSuccess('Event deleted successfully!');
        setShowDeleteModal(false);
        setSelectedEvent(null);
        fetchEvents();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Events] Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // UI HELPERS
  // ============================================

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      image: ''
    });
    setFormErrors({});
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event.time || '',
      location: event.location || '',
      image: event.image || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const openViewModal = (event) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const handleExport = () => {
    try {
      const csv = exportEventsToCSV(filteredEvents);
      if (csv) {
        const timestamp = new Date().toISOString().split('T')[0];
        downloadCSV(csv, `events-export-${timestamp}.csv`);
        setSuccess('Events exported successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('No events to export');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('[Events] Export error:', err);
      setError('Failed to export events');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Calculate stats
  const stats = {
    total: events.length,
    upcoming: filterEventsByStatus(events, 'upcoming').length,
    past: filterEventsByStatus(events, 'past').length,
    today: filterEventsByStatus(events, 'today').length
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return <Loader fullScreen text="Loading events..." />;
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Events Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Create and manage church events
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Export
          </button>

          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <RefreshCw size={20} />
            Refresh
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors"
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-800 dark:text-green-200 font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <XCircle className="text-red-600" size={20} />
          <p className="text-red-800 dark:text-red-200 font-semibold">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
              Total Events
            </h3>
            <Calendar className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-black text-blue-900 dark:text-blue-100">
            {stats.total}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-green-900 dark:text-green-200 uppercase tracking-wider">
              Upcoming
            </h3>
            <Calendar className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-black text-green-900 dark:text-green-100">
            {stats.upcoming}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-orange-900 dark:text-orange-200 uppercase tracking-wider">
              Today
            </h3>
            <Calendar className="text-orange-600" size={24} />
          </div>
          <p className="text-3xl font-black text-orange-900 dark:text-orange-100">
            {stats.today}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              Past Events
            </h3>
            <Calendar className="text-slate-600" size={24} />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100">
            {stats.past}
          </p>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="today">Today</option>
            <option value="past">Past</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
          >
            <option value="asc">Date: Earliest First</option>
            <option value="desc">Date: Latest First</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredEvents.length}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-white">{events.length}</span> events
          </p>
        </div>
      </div>

      {/* Events Display */}
      {filteredEvents.length === 0 ? (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-semibold">
            No events found
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            Try adjusting your filters or create a new event
          </p>
        </div>
      ) : (
        <>
          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const status = getEventStatus(event);
                const daysUntil = getDaysUntilEvent(event.date);

                return (
                  <div
                    key={event._id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {event.image ? (
                      <div className="h-48 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-[#8B1A1A] to-red-900 flex items-center justify-center">
                        <Calendar className="text-white/30" size={64} />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        {daysUntil !== null && daysUntil >= 0 && (
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar size={16} />
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Clock size={16} />
                            <span>{formatEventTime(event.time)}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <MapPin size={16} />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Users size={16} />
                          <span>{formatRegistrationCount(event)} registered</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => openViewModal(event)}
                          className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(event)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Registrations
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredEvents.map((event) => {
                      const status = getEventStatus(event);

                      return (
                        <tr key={event._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-[#8B1A1A] rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="text-white" size={20} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">
                                  {event.title}
                                </p>
                                {event.description && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {new Date(event.date).toLocaleDateString()}
                              </p>
                              {event.time && (
                                <p className="text-slate-500 dark:text-slate-400">
                                  {event.time}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <MapPin size={14} />
                              <span className="truncate max-w-[200px]">{event.location || 'TBA'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Users size={14} />
                              <span>{formatRegistrationCount(event)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openViewModal(event)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => openEditModal(event)}
                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 rounded-lg transition-colors"
                                title="Edit Event"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(event)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 rounded-lg transition-colors"
                                title="Delete Event"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        onSubmit={handleCreateEvent}
        loading={actionLoading}
      />

      <EditEventModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEvent(null);
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        onSubmit={handleUpdateEvent}
        loading={actionLoading}
        event={selectedEvent}
      />

      <ViewEventModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />

      <DeleteEventModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedEvent(null);
        }}
        onConfirm={handleDeleteEvent}
        loading={actionLoading}
        event={selectedEvent}
      />
    </div>
  );
}