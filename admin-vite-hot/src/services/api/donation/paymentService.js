// src/services/donation/paymentService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_DONATION_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
});

export const paymentService = {
  // Initiate M-Pesa payment
  initiateMpesaPayment: async (paymentData) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/initiate-mpesa`,
        paymentData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error initiating M-Pesa payment:', error);
      throw error;
    }
  },

  // Get member's payment history
  getMyPaymentHistory: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/payments/member/history`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  // Get all payments (admin only)
  getAllPayments: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.campaignId) params.append('campaignId', filters.campaignId);

      const response = await axios.get(
        `${API_URL}/payments?${params}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all payments:', error);
      throw error;
    }
  },

  // Record manual payment (admin only)
  recordManualPayment: async (paymentData) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/manual-payment`,
        paymentData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error recording manual payment:', error);
      throw error;
    }
  },

  // Query M-Pesa payment status
  queryMpesaStatus: async (checkoutRequestId) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/query-mpesa`,
        { checkoutRequestId },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error querying M-Pesa status:', error);
      throw error;
    }
  }
};