// src/services/donation/donationService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_DONATION_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
});

export const donationService = {
  // Campaign endpoints
  getCampaigns: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      
      const response = await axios.get(`${API_URL}/campaigns?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  getCampaignById: async (campaignId) => {
    try {
      const response = await axios.get(`${API_URL}/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  },

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
  }
};