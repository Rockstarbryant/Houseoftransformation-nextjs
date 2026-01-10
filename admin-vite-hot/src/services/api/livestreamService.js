import api from './authService';

export const livestreamService = {
  /**
   * Get currently active/live stream
   * NO AUTH REQUIRED - public endpoint
   */
  async getActiveStream() {
    try {
      console.log('Fetching active stream from: /livestreams/active'); // Debug
      const response = await api.get('/livestreams/active');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('No active stream found (404)');
        return { success: false, message: 'No active stream' };
      }
      console.error('Error fetching active stream:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get archived livestreams with filters
   * NO AUTH REQUIRED - public endpoint
   */
  async getArchives(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.preacher) params.append('preacher', filters.preacher);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      // For admin: include scheduled and live. For public: only archived
      if (filters.includeScheduled === true) {
        params.append('includeScheduled', 'true');
      }

      const url = `/livestreams/archives${params.toString() ? '?' + params.toString() : ''}`;
      console.log('Fetching archives from:', url); // Debug
      
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('Error fetching archives:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        data: [],
        pagination: {}
      };
    }
  },

  /**
   * Get single livestream by ID
   * NO AUTH REQUIRED - public endpoint
   */
  async getStreamById(id) {
    try {
      const response = await api.get(`/livestreams/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching livestream:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Create new livestream
   * ADMIN ONLY - requires auth + admin role
   */
  async createStream(streamData) {
    try {
      const response = await api.post('/livestreams', streamData);
      return {
        success: true,
        data: response.data.data,
        message: 'Stream created successfully'
      };
    } catch (error) {
      console.error('Error creating stream:', error);
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Unauthorized - admin access required'
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Update livestream
   * ADMIN ONLY
   */
  async updateStream(id, updateData) {
    try {
      const response = await api.put(`/livestreams/${id}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: 'Stream updated successfully'
      };
    } catch (error) {
      console.error('Error updating stream:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Archive livestream (mark as ended)
   * ADMIN ONLY
   */
  async archiveStream(id, archiveData) {
    try {
      const response = await api.put(
        `/livestreams/${id}/archive`,
        archiveData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error archiving stream:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Add AI summary to livestream
   * ADMIN ONLY
   */
  async addAISummary(id, summaryData) {
    try {
      const response = await api.put(
        `/livestreams/${id}/ai-summary`,
        summaryData
      );
      return {
        success: true,
        data: response.data.data,
        message: 'Summary added successfully'
      };
    } catch (error) {
      console.error('Error adding summary:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Delete livestream
   * ADMIN ONLY
   */
  async deleteStream(id) {
    try {
      const response = await api.delete(`/livestreams/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error deleting stream:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get analytics dashboard
   * ADMIN ONLY
   */
  async getAnalytics(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(
        `/livestreams/admin/analytics${params.toString() ? '?' + params.toString() : ''}`
      );
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        data: null
      };
    }
  }
};