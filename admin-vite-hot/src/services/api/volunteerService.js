import api from './authService';
import { API_ENDPOINTS } from '../../utils/constants';

export const volunteerService = {
  // Get all volunteer opportunities
  async getOpportunities() {
    try {
      const response = await api.get(API_ENDPOINTS.VOLUNTEERS.OPPORTUNITIES);
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  },

  // Check if user has existing application
  async checkExistingApplication() {
    try {
      const response = await api.get(API_ENDPOINTS.VOLUNTEERS.CHECK_APPLICATION);
      return response.data;
    } catch (error) {
      console.error('Error checking application:', error);
      throw error;
    }
  },

  // Submit volunteer application
  async apply(applicationData) {
    try {
      const response = await api.post(API_ENDPOINTS.VOLUNTEERS.APPLY, applicationData);
      return response.data;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  },

  // Edit existing application (one-time within 3 hours)
  async editApplication(applicationId, applicationData) {
    try {
      const response = await api.put(
        API_ENDPOINTS.VOLUNTEERS.EDIT_APPLICATION(applicationId),
        applicationData
      );
      return response.data;
    } catch (error) {
      console.error('Error editing application:', error);
      throw error;
    }
  },

  // Get current user's volunteer profile
  async getProfile() {
    try {
      const response = await api.get(API_ENDPOINTS.VOLUNTEERS.PROFILE);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Get current user's applications (PROTECTED - only their own)
  async getMyApplications() {
    try {
      const response = await api.get(API_ENDPOINTS.VOLUNTEERS.MY_APPLICATIONS);
      return response.data;
    } catch (error) {
      console.error('Error fetching my applications:', error);
      throw error;
    }
  },

  // Admin: Get all volunteer applications (with filters)
  async getAllApplications(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.ministry) params.append('ministry', filters.ministry);

      const response = await api.get(
        API_ENDPOINTS.VOLUNTEERS.ALL_APPLICATIONS,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all applications:', error);
      throw error;
    }
  },

  // Admin: Update application status
  async updateStatus(applicationId, statusData) {
    try {
      const response = await api.put(
        API_ENDPOINTS.VOLUNTEERS.UPDATE_STATUS(applicationId),
        statusData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  // Admin: Update volunteer hours
  async updateHours(applicationId, hours) {
    try {
      const response = await api.put(
        API_ENDPOINTS.VOLUNTEERS.UPDATE_HOURS(applicationId),
        { hours }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating hours:', error);
      throw error;
    }
  },

  // Admin: Delete application
  async deleteApplication(applicationId) {
    try {
      const response = await api.delete(
        API_ENDPOINTS.VOLUNTEERS.DELETE(applicationId)
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  },

  // Admin: Get volunteer statistics
  async getStats() {
    try {
      const response = await api.get(API_ENDPOINTS.VOLUNTEERS.STATS);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
};