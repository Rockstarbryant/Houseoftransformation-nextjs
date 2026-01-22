// src/services/api/donationService.js
//import { api } from '@/lib/api';
import api from '@/lib/api';

// ============================================
// CAMPAIGN SERVICE
// ============================================

export const campaignService = {
  // Get all campaigns (public/filtered)
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.isFeatured) params.append('isFeatured', filters.isFeatured);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/campaigns?${params.toString()}`);
      return response?.data || { campaigns: [], success: false };
    } catch (error) {
      console.error('Campaign service error:', error);
      throw error;
    }
  },

  // Get featured campaigns
  getFeatured: async () => {
    try {
      const response = await api.get('/campaigns/featured');
      return response?.data || { campaigns: [], success: false };
    } catch (error) {
      console.error('Featured campaigns error:', error);
      throw error;
    }
  },

  // Get single campaign
  getById: async (campaignId) => {
    try {
      const response = await api.get(`/campaigns/${campaignId}`);
      return response?.data || { campaign: null, success: false };
    } catch (error) {
      console.error('Get campaign error:', error);
      throw error;
    }
  },

  // Create campaign (admin only)
  create: async (campaignData) => {
    try {
      const response = await api.post('/campaigns', campaignData);
      return response?.data || { success: false };
    } catch (error) {
      console.error('Create campaign error:', error);
      throw error;
    }
  },

  // Update campaign (admin only)
  update: async (campaignId, updates) => {
    try {
      const response = await api.put(`/campaigns/${campaignId}`, updates);
      return response?.data || { success: false };
    } catch (error) {
      console.error('Update campaign error:', error);
      throw error;
    }
  },

  // Activate campaign
  activate: async (campaignId) => {
    try {
      const response = await api.patch(`/campaigns/${campaignId}/activate`, {});
      return response?.data || { success: false };
    } catch (error) {
      console.error('Activate campaign error:', error);
      throw error;
    }
  },

  // Complete campaign
  complete: async (campaignId) => {
    try {
      const response = await api.patch(`/campaigns/${campaignId}/complete`, {});
      return response?.data || { success: false };
    } catch (error) {
      console.error('Complete campaign error:', error);
      throw error;
    }
  },

  // Archive campaign
  archive: async (campaignId) => {
    try {
      const response = await api.patch(`/campaigns/${campaignId}/archive`, {});
      return response?.data || { success: false };
    } catch (error) {
      console.error('Archive campaign error:', error);
      throw error;
    }
  },

  // Delete campaign
  delete: async (campaignId) => {
    try {
      const response = await api.delete(`/campaigns/${campaignId}`);
      return response?.data || { success: false };
    } catch (error) {
      console.error('Delete campaign error:', error);
      throw error;
    }
  }
};

// ============================================
// PLEDGE SERVICE
// ============================================

export const pledgeService = {
  // Create pledge
  create: async (pledgeData) => {
    try {
      const response = await api.post('/pledges', pledgeData);
      return response?.data || { success: false };
    } catch (error) {
      console.error('Create pledge error:', error);
      throw error;
    }
  },

  // Get user's pledges
  getMyPledges: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/pledges/my-pledges?page=${page}&limit=${limit}`);
      return response?.data || { pledges: [], success: false };
    } catch (error) {
      console.error('Get my pledges error:', error);
      throw error;
    }
  },

  // Get single pledge
  getById: async (pledgeId) => {
    try {
      const response = await api.get(`/pledges/${pledgeId}`);
      return response?.data || { pledge: null, success: false };
    } catch (error) {
      console.error('Get pledge error:', error);
      throw error;
    }
  },

  // Get campaign pledges (admin only)
  getCampaignPledges: async (campaignId, status = null, page = 1, limit = 20) => {
    try {
      let url = `/pledges/campaign/${campaignId}?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      
      const response = await api.get(url);
      return response?.data || { pledges: [], success: false };
    } catch (error) {
      console.error('Get campaign pledges error:', error);
      throw error;
    }
  },

  // Update pledge (admin only)
  update: async (pledgeId, updates) => {
    try {
      const response = await api.put(`/pledges/${pledgeId}`, updates);
      return response?.data || { success: false };
    } catch (error) {
      console.error('Update pledge error:', error);
      throw error;
    }
  },

  // Cancel pledge
  cancel: async (pledgeId) => {
    try {
      const response = await api.patch(`/pledges/${pledgeId}/cancel`, {});
      return response?.data || { success: false };
    } catch (error) {
      console.error('Cancel pledge error:', error);
      throw error;
    }
  }
};

// ============================================
// PAYMENT SERVICE
// ============================================

export const paymentService = {
  // Initiate M-Pesa payment
  initiateMpesa: async (pledgeId, amount, phoneNumber) => {
    try {
      const response = await api.post('/payments/mpesa/initiate', {
        pledgeId,
        amount,
        phoneNumber
      });
      return response?.data || { success: false };
    } catch (error) {
      console.error('Initiate M-Pesa error:', error);
      throw error;
    }
  },

  // Get user's payment history
  getHistory: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/payments/history?page=${page}&limit=${limit}`);
      return response?.data || { payments: [], success: false };
    } catch (error) {
      console.error('Get payment history error:', error);
      throw error;
    }
  },

  // Record manual payment (admin only)
  recordManual: async (pledgeId, amount, paymentMethod, mpesaRef = null) => {
    try {
      const response = await api.post('/payments/manual', {
        pledgeId,
        amount,
        paymentMethod,
        mpesaRef
      });
      return response?.data || { success: false };
    } catch (error) {
      console.error('Record manual payment error:', error);
      throw error;
    }
  },

  // Get all payments (admin only)
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.campaignId) params.append('campaignId', filters.campaignId);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/payments?${params.toString()}`);
      return response?.data || { payments: [], success: false };
    } catch (error) {
      console.error('Get all payments error:', error);
      throw error;
    }
  }
};

// ============================================
// SETTINGS SERVICE (M-Pesa & Donations)
// ============================================

export const donationSettingsService = {
  // Get public donation settings (no auth needed)
  getPublicSettings: async () => {
    try {
      const response = await api.get('/settings/donations/public');
      return response?.data || { donations: {}, success: false };
    } catch (error) {
      console.error('Get public settings error:', error);
      return { donations: {}, success: false };
    }
  },

  // Get M-Pesa settings (admin only)
  getMpesaSettings: async () => {
    try {
      const response = await api.get('/settings/mpesa');
      return response?.data || { mpesa: {}, success: false };
    } catch (error) {
      console.error('Get M-Pesa settings error:', error);
      throw error;
    }
  },

  // Update M-Pesa settings (admin only)
  updateMpesaSettings: async (mpesaData) => {
    try {
      const response = await api.patch('/settings/mpesa', mpesaData);
      return response?.data || { success: false };
    } catch (error) {
      console.error('Update M-Pesa settings error:', error);
      throw error;
    }
  },

  // Test M-Pesa connection (admin only)
  testMpesaConnection: async () => {
    try {
      const response = await api.post('/settings/mpesa/test', {});
      return response?.data || { success: false };
    } catch (error) {
      console.error('Test M-Pesa connection error:', error);
      throw error;
    }
  },

  // Get donation settings (admin only)
  getDonationSettings: async () => {
    try {
      const response = await api.get('/settings/donations');
      return response?.data || { donations: {}, success: false };
    } catch (error) {
      console.error('Get donation settings error:', error);
      throw error;
    }
  },

  // Update donation settings (admin only)
  updateDonationSettings: async (settings) => {
    try {
      const response = await api.patch('/settings/donations', settings);
      return response?.data || { success: false };
    } catch (error) {
      console.error('Update donation settings error:', error);
      throw error;
    }
  },

  // Update payment gateway (admin only)
  updatePaymentGateway: async (gateway, minimumDonation, currency) => {
    try {
      const response = await api.patch('/settings/payment-gateway', {
        gateway,
        minimumDonation,
        currency
      });
      return response?.data || { success: false };
    } catch (error) {
      console.error('Update payment gateway error:', error);
      throw error;
    }
  }
};

// ============================================
// EXPORT ALL SERVICES
// ============================================

export const donationApi = {
  campaigns: campaignService,
  pledges: pledgeService,
  payments: paymentService,
  settings: donationSettingsService
};