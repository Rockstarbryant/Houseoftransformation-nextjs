import api from './authService';
import { API_ENDPOINTS } from '@/utils/constants';

export const feedbackService = {
  /**
   * Submit feedback (NO AUTH REQUIRED - works for anonymous and authenticated users)
   */
  async submitFeedback(feedbackData) {
    try {
      const response = await api.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      console.error('Submit feedback error:', error);
      throw error;
    }
  },

  /**
   * Get public testimonies (NO AUTH REQUIRED)
   */
  async getPublicTestimonies() {
    try {
      const response = await api.get('/feedback/testimonies/public');
      return response.data;
    } catch (error) {
      console.error('Get testimonies error:', error);
      throw error;
    }
  },

  /**
   * Admin: Get all feedback with filters
   */
  async getAllFeedback(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.anonymous) params.append('anonymous', filters.anonymous);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(
        `/feedback${params.toString() ? '?' + params.toString() : ''}`
      );
      return response.data;
    } catch (error) {
      console.error('Get all feedback error:', error);
      throw error;
    }
  },

  /**
   * Admin: Get single feedback by ID
   */
  async getFeedbackById(id) {
    try {
      const response = await api.get(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get feedback error:', error);
      throw error;
    }
  },

  /**
   * Admin: Update feedback status
   */
  async updateStatus(id, statusData) {
    try {
      const response = await api.put(`/feedback/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  },

  /**
   * Admin: Respond to feedback
   */
  async respondToFeedback(id, responseText) {
    try {
      const response = await api.post(`/feedback/${id}/respond`, { 
        response: responseText 
      });
      return response.data;
    } catch (error) {
      console.error('Respond error:', error);
      throw error;
    }
  },

  /**
   * Admin: Publish testimony
   */
  async publishTestimony(id) {
    try {
      const response = await api.put(`/feedback/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error('Publish testimony error:', error);
      throw error;
    }
  },

  /**
   * Admin: Archive feedback
   */
  async archiveFeedback(id) {
    try {
      const response = await api.put(`/feedback/${id}/archive`);
      return response.data;
    } catch (error) {
      console.error('Archive feedback error:', error);
      throw error;
    }
  },

  /**
   * Admin: Unarchive feedback
   */
  async unarchiveFeedback(id) {
    try {
      const response = await api.put(`/feedback/${id}/unarchive`);
      return response.data;
    } catch (error) {
      console.error('Unarchive feedback error:', error);
      throw error;
    }
  },

  /**
   * Admin: Soft delete feedback
   */
  async softDeleteFeedback(id) {
    try {
      const response = await api.put(`/feedback/${id}/soft-delete`);
      return response.data;
    } catch (error) {
      console.error('Soft delete feedback error:', error);
      throw error;
    }
  },

  /**
   * Admin: Permanently delete feedback
   */
  async deleteFeedback(id) {
    try {
      const response = await api.delete(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete feedback error:', error);
      throw error;
    }
  },

  /**
   * Admin: Get recycled feedback
   */
  async getRecycledFeedback() {
    try {
      const response = await api.get('/feedback/recycled/list');
      return response.data;
    } catch (error) {
      console.error('Get recycled feedback error:', error);
      throw error;
    }
  },

  /**
   * Admin: Restore from recycle
   */
  async restoreFromRecycle(id) {
    try {
      const response = await api.put(`/feedback/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error('Restore feedback error:', error);
      throw error;
    }
  },

  /**
   * Admin: Get feedback statistics
   */
  async getStats() {
    try {
      const response = await api.get('/feedback/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Get feedback stats error:', error);
      throw error;
    }
  }
};