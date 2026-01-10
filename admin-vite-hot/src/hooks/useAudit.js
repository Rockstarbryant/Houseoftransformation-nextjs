// src/hooks/useAudit.js
import { useState, useCallback } from 'react';
import { auditService } from '../services/api/auditService';

/**
 * React hook for audit log operations
 * Use this in admin components
 */
export const useAudit = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  /**
   * Fetch audit logs with filters
   */
  const fetchLogs = useCallback(async (filters = {}, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await auditService.getLogs(filters, {
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        sortBy: options.sortBy || 'timestamp',
        sortOrder: options.sortOrder || 'desc'
      });

      setLogs(response.logs || []);
      setPagination(response.pagination);
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching audit logs:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  /**
   * Fetch audit statistics
   */
  const fetchStats = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await auditService.getStats(filters);
      setStats(response.stats);
      return response.stats;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching audit stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch user activity
   */
  const fetchUserActivity = useCallback(async (userId, limit = 50) => {
    try {
      setLoading(true);
      setError(null);

      const response = await auditService.getUserActivity(userId, limit);
      return response.activity;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user activity:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch recent activity
   */
  const fetchRecentActivity = useCallback(async (limit = 100) => {
    try {
      setLoading(true);
      setError(null);

      const response = await auditService.getRecentActivity(limit);
      return response.logs;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching recent activity:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch security alerts
   */
  const fetchSecurityAlerts = useCallback(async (hours = 24) => {
    try {
      setLoading(true);
      setError(null);

      const response = await auditService.getSecurityAlerts(hours);
      return response.alerts;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching security alerts:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch resource timeline
   */
  const fetchResourceTimeline = useCallback(async (resourceType, resourceId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await auditService.getResourceTimeline(resourceType, resourceId);
      return response.timeline;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching resource timeline:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export logs to CSV
   */
  const exportLogs = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      await auditService.exportLogs(filters);
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error exporting logs:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Change page
   */
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    logs,
    stats,
    loading,
    error,
    pagination,
    fetchLogs,
    fetchStats,
    fetchUserActivity,
    fetchRecentActivity,
    fetchSecurityAlerts,
    fetchResourceTimeline,
    exportLogs,
    changePage,
    clearError
  };
};

export default useAudit;