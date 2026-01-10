import { useState, useEffect, useCallback } from 'react';
import { livestreamService } from '../services/api/livestreamService';

/**
 * Hook for public livestream operations (no auth required)
 * Follows same pattern as eventService, feedbackService, etc
 */
export const useLivestream = () => {
  const [activeStream, setActiveStream] = useState(null);
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, skip: 0, limit: 20 });

  // Fetch active stream
  const fetchActiveStream = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await livestreamService.getActiveStream();
      
      if (result.success) {
        setActiveStream(result.data);
      } else {
        setActiveStream(null);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching active stream:', err);
      setActiveStream(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch archives with filters
  const fetchArchives = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await livestreamService.getArchives(filters);
      
      if (result.success) {
        setArchives(result.data || []);
        setPagination(result.pagination || {});
      } else {
        setError(result.message);
        setArchives([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching archives:', err);
      setArchives([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single stream
  const fetchStream = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await livestreamService.getStreamById(id);
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stream:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch active stream on mount & setup refresh interval
  useEffect(() => {
    fetchActiveStream();
    // Only refresh every 2 minutes to check if stream status changed
    // Don't refresh too frequently to avoid blinking
    const interval = setInterval(fetchActiveStream, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [fetchActiveStream]);

  return {
    activeStream,
    archives,
    loading,
    error,
    pagination,
    fetchActiveStream,
    fetchArchives,
    fetchStream
  };
};

/**
 * Hook for admin livestream operations (requires auth)
 * Follows same pattern as event/feedback admin operations
 */
export const useLivestreamAdmin = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Create new stream
  const createStream = useCallback(async (streamData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await livestreamService.createStream(streamData);
      
      if (result.success) {
        setSuccess(result.message);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creating stream:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update stream
  const updateStream = useCallback(async (id, updateData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await livestreamService.updateStream(id, updateData);
      
      if (result.success) {
        setSuccess(result.message);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating stream:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Archive/End stream
  const archiveStream = useCallback(async (id, archiveData = {}) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await livestreamService.archiveStream(id, archiveData);
      
      if (result.success) {
        setSuccess(result.message);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error archiving stream:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Add AI summary
  const addSummary = useCallback(async (id, summaryData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await livestreamService.addAISummary(id, summaryData);
      
      if (result.success) {
        setSuccess(result.message);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error adding summary:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete stream
  const deleteStream = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await livestreamService.deleteStream(id);
      
      if (result.success) {
        setSuccess(result.message);
        setStreams(streams.filter(s => s._id !== id));
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting stream:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [streams]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await livestreamService.getAnalytics(filters);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return {
    streams,
    loading,
    error,
    success,
    createStream,
    updateStream,
    archiveStream,
    addSummary,
    deleteStream,
    fetchAnalytics,
    clearMessages: () => { setSuccess(null); setError(null); }
  };
};