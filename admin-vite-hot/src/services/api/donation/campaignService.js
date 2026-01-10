// src/services/donation/campaignService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_DONATION_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
});

export const campaignService = {
  // Get all campaigns with filters
  getCampaigns: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`${API_URL}/campaigns?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  // Get active campaigns only
  getActiveCampaigns: async () => {
    try {
      const response = await axios.get(`${API_URL}/campaigns?status=active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      throw error;
    }
  },

  // Get single campaign by ID
  getCampaignById: async (campaignId) => {
    try {
      const response = await axios.get(`${API_URL}/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  },

  // Create new campaign (admin only)
  createCampaign: async (campaignData) => {
    try {
      const response = await axios.post(
        `${API_URL}/campaigns`,
        campaignData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  // Update campaign (admin only)
  updateCampaign: async (campaignId, campaignData) => {
    try {
      const response = await axios.put(
        `${API_URL}/campaigns/${campaignId}`,
        campaignData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  // Archive campaign (admin only)
  archiveCampaign: async (campaignId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/campaigns/${campaignId}/archive`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error archiving campaign:', error);
      throw error;
    }
  },

  // Delete campaign (admin only)
  deleteCampaign: async (campaignId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/campaigns/${campaignId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  },

  // Get campaign statistics
  getCampaignStats: async (campaignId) => {
    try {
      const response = await axios.get(
        `${API_URL}/dashboard/campaign/${campaignId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      throw error;
    }
  },

  // Search campaigns
  searchCampaigns: async (searchTerm) => {
    try {
      const response = await axios.get(
        `${API_URL}/campaigns?search=${encodeURIComponent(searchTerm)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching campaigns:', error);
      throw error;
    }
  }
};