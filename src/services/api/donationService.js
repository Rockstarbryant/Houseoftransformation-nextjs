// ============================================
// FILE 27: services/donationService.js
// ============================================
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_DONATION_API_URL || 'http://localhost:5001/api';

const getHeaders = () => ({
  Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`
});

export const donationService = {
  // Campaigns
  getCampaigns: (status) => {
    const url = status ? `${API_URL}/campaigns?status=${status}` : `${API_URL}/campaigns`;
    return axios.get(url);
  },
  getCampaign: (id) => axios.get(`${API_URL}/campaigns/${id}`),
  createCampaign: (data) => axios.post(`${API_URL}/campaigns`, data, { headers: getHeaders() }),
  updateCampaign: (id, data) => axios.put(`${API_URL}/campaigns/${id}`, data, { headers: getHeaders() }),
  archiveCampaign: (id) => axios.patch(`${API_URL}/campaigns/${id}/archive`, {}, { headers: getHeaders() }),
  deleteCampaign: (id) => axios.delete(`${API_URL}/campaigns/${id}`, { headers: getHeaders() }),

  // Pledges
  createPledge: (data) => axios.post(`${API_URL}/pledges`, data, { headers: getHeaders() }),
  getPledges: () => axios.get(`${API_URL}/pledges/member/my-pledges`, { headers: getHeaders() }),
  getPledge: (id) => axios.get(`${API_URL}/pledges/${id}`, { headers: getHeaders() }),
  getAllPledges: (query) => {
    const params = new URLSearchParams(query).toString();
    return axios.get(`${API_URL}/pledges?${params}`, { headers: getHeaders() });
  },

  // Payments
  initiatePayment: (data) => axios.post(`${API_URL}/payments/initiate-mpesa`, data, { headers: getHeaders() }),
  recordManualPayment: (data) => axios.post(`${API_URL}/payments/manual-payment`, data, { headers: getHeaders() }),
  getPaymentHistory: () => axios.get(`${API_URL}/payments/member/history`, { headers: getHeaders() }),
  getAllPayments: (query) => {
    const params = new URLSearchParams(query).toString();
    return axios.get(`${API_URL}/payments?${params}`, { headers: getHeaders() });
  },

  // Dashboard
  getMemberDashboard: () => axios.get(`${API_URL}/dashboard/member`, { headers: getHeaders() }),
  getAdminDashboard: () => axios.get(`${API_URL}/dashboard/admin`, { headers: getHeaders() }),
  getCampaignAnalytics: (id) => axios.get(`${API_URL}/dashboard/campaign/${id}`, { headers: getHeaders() }),

  // Notifications
  sendCampaignEndNotification: (campaignId) => 
    axios.post(`${API_URL}/notifications/campaign-end/${campaignId}`, {}, { headers: getHeaders() }),
  sendReminder: (campaignId) => 
    axios.post(`${API_URL}/notifications/send-reminder/${campaignId}`, {}, { headers: getHeaders() }),
  getNotifications: () => axios.get(`${API_URL}/notifications`, { headers: getHeaders() })
};