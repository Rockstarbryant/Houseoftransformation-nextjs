// src/services/api/auditService.js
import api from './authService';

export const auditService = {
  /**
   * Get filtered audit logs
   * @param {Object} filters - Filter options
   * @param {Object} options - Pagination and sorting options
   */
  async getLogs(filters = {}, options = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.success !== undefined) params.append('success', filters.success);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.ipAddress) params.append('ipAddress', filters.ipAddress);
      if (filters.search) params.append('search', filters.search);
      
      // Add pagination options
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);

      const response = await api.get(`/audit/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  /**
   * Get audit statistics
   * @param {Object} filters - Date range and user filters
   */
  async getStats(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.userId) params.append('userId', filters.userId);

      const response = await api.get(`/audit/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      throw error;
    }
  },

  /**
   * Get user activity
   * @param {string} userId - User ID
   * @param {number} limit - Number of records to fetch
   */
  async getUserActivity(userId, limit = 50) {
    try {
      const response = await api.get(`/audit/user/${userId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  },

  /**
   * Get recent activity (last 100 actions)
   * @param {number} limit - Number of records
   */
  async getRecentActivity(limit = 100) {
    try {
      const response = await api.get(`/audit/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },

  /**
   * Get security alerts
   * @param {number} hours - Look back period in hours
   */
  async getSecurityAlerts(hours = 24) {
    try {
      const response = await api.get(`/audit/security-alerts?hours=${hours}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      throw error;
    }
  },

  /**
   * Get resource timeline (action history for a specific resource)
   * @param {string} resourceType - Type of resource (sermon, blog, etc.)
   * @param {string} resourceId - Resource ID
   */
  async getResourceTimeline(resourceType, resourceId) {
    try {
      const response = await api.get(`/audit/timeline/${resourceType}/${resourceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resource timeline:', error);
      throw error;
    }
  },

  /**
   * Export audit logs to CSV
   * @param {Object} filters - Filter options
   */
  async exportLogs(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.success !== undefined) params.append('success', filters.success);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.ipAddress) params.append('ipAddress', filters.ipAddress);

      const response = await api.get(`/audit/export?${params.toString()}`, {
        responseType: 'blob' // Important for file download
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Export completed' };
    } catch (error) {
      console.error('Error exporting logs:', error);
      throw error;
    }
  },

  /**
   * Get single audit log by ID
   * @param {string} logId - Audit log ID
   */
  async getLogById(logId) {
    try {
      const response = await api.get(`/audit/${logId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit log:', error);
      throw error;
    }
  },

  /**
   * Clean old audit logs (admin only)
   * @param {number} days - Delete logs older than this many days
   */
  async cleanOldLogs(days = 90) {
    try {
      const response = await api.delete(`/audit/clean?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error cleaning logs:', error);
      throw error;
    }
  }
};

export default auditService;