// src/services/donation/pledgeService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_DONATION_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
});

export const pledgeService = {
  /**
   * Create a new pledge
   * @param {Object} pledgeData - Pledge information
   * @returns {Promise} Response with created pledge
   */
  createPledge: async (pledgeData) => {
    try {
      const response = await axios.post(
        `${API_URL}/pledges`,
        pledgeData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating pledge:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get member's pledges
   * @returns {Promise} Array of member's pledges
   */
  getMyPledges: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/pledges/member/my-pledges`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching my pledges:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all pledges (admin only)
   * @param {Object} filters - Filter options (campaignId, status)
   * @returns {Promise} Array of all pledges
   */
  getAllPledges: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.campaignId) params.append('campaignId', filters.campaignId);
      if (filters.status) params.append('status', filters.status);
      if (filters.memberId) params.append('memberId', filters.memberId);

      const response = await axios.get(
        `${API_URL}/pledges?${params}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all pledges:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get single pledge by ID
   * @param {String} pledgeId - Pledge ID
   * @returns {Promise} Single pledge details
   */
  getPledgeById: async (pledgeId) => {
    try {
      const response = await axios.get(
        `${API_URL}/pledges/${pledgeId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching pledge:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update pledge (admin only)
   * @param {String} pledgeId - Pledge ID
   * @param {Object} pledgeData - Updated pledge data
   * @returns {Promise} Updated pledge
   */
  updatePledge: async (pledgeId, pledgeData) => {
    try {
      const response = await axios.put(
        `${API_URL}/pledges/${pledgeId}`,
        pledgeData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating pledge:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Cancel pledge (member only)
   * @param {String} pledgeId - Pledge ID
   * @returns {Promise} Cancelled pledge response
   */
  cancelPledge: async (pledgeId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/pledges/${pledgeId}/cancel`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling pledge:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get pledges by campaign
   * @param {String} campaignId - Campaign ID
   * @returns {Promise} Array of pledges for campaign
   */
  getPledgesByCampaign: async (campaignId) => {
    try {
      const response = await axios.get(
        `${API_URL}/pledges?campaignId=${campaignId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign pledges:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get pledges by status
   * @param {String} status - Pledge status (pending, partial, completed)
   * @returns {Promise} Array of pledges with status
   */
  getPledgesByStatus: async (status) => {
    try {
      const response = await axios.get(
        `${API_URL}/pledges?status=${status}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching pledges by status:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get pledge statistics
   * @returns {Promise} Pledge statistics
   */
  getPledgeStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/pledges/stats`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching pledge stats:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Mark pledge as completed
   * @param {String} pledgeId - Pledge ID
   * @returns {Promise} Updated pledge
   */
  completePledge: async (pledgeId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/pledges/${pledgeId}/complete`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error completing pledge:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Search pledges
   * @param {String} searchTerm - Search term
   * @returns {Promise} Array of matching pledges
   */
  searchPledges: async (searchTerm) => {
    try {
      const response = await axios.get(
        `${API_URL}/pledges?search=${encodeURIComponent(searchTerm)}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error searching pledges:', error);
      throw error.response?.data || error;
    }
  }
};