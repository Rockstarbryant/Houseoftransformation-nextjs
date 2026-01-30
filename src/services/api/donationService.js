// src/services/api/donationService.js
// ✅ PRODUCTION-READY VERSION WITH SECURITY FIXES
import api from '@/lib/api';

// ============================================
// HELPER: Generate UUID for Idempotency
// ============================================
function generateIdempotencyKey() {
  // Modern browsers support crypto.randomUUID()
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================
// CAMPAIGN SERVICE
// ============================================

export const campaignService = {
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
      console.error('[CAMPAIGN-SERVICE] Get all error:', error);
      throw error;
    }
  },

  getFeatured: async () => {
    try {
      const response = await api.get('/campaigns/featured');
      return response?.data || { campaigns: [], success: false };
    } catch (error) {
      console.error('[CAMPAIGN-SERVICE] Get featured error:', error);
      throw error;
    }
  },

  getById: async (campaignId) => {
    try {
      const response = await api.get(`/campaigns/${campaignId}`);
      return response?.data || { campaign: null, success: false };
    } catch (error) {
      console.error('[CAMPAIGN-SERVICE] Get by ID error:', error);
      throw error;
    }
  },

  create: async (campaignData) => {
    try {
      const response = await api.post('/campaigns', campaignData);
      return response?.data || { success: false };
    } catch (error) {
      console.error('[CAMPAIGN-SERVICE] Create error:', error);
      throw error;
    }
  },

  update: async (campaignId, updates) => {
    try {
      const response = await api.put(`/campaigns/${campaignId}`, updates);
      return response?.data || { success: false };
    } catch (error) {
      console.error('[CAMPAIGN-SERVICE] Update error:', error);
      throw error;
    }
  },

  activate: async (campaignId) => {
    try {
      const response = await api.patch(`/campaigns/${campaignId}/activate`, {});
      return response?.data || { success: false };
    } catch (error) {
      console.error('[CAMPAIGN-SERVICE] Activate error:', error);
      throw error;
    }
  },

  getAnalytics: async (campaignId) => {
    try {
      const response = await api.get(`/campaigns/${campaignId}/analytics`);
      return response?.data || { analytics: {}, success: false };
    } catch (error) {
      console.error('[CAMPAIGN-SERVICE] Get analytics error:', error);
      throw error;
    }
  },

  complete: async (campaignId) => {
    try {
      const response = await api.patch(`/campaigns/${campaignId}/complete`, {});
      return response?.data || { success: false };
    } catch (error) {
      console.error('[CAMPAIGN-SERVICE] Complete error:', error);
      throw error;
    }
  },

  archive: async (campaignId) => {
    try {
      const response = await api.patch(`/campaigns/${campaignId}/archive`, {});
      return response?.data || { success: false };
    } catch (error) {
      console.error('[CAMPAIGN-SERVICE] Archive error:', error);
      throw error;
    }
  },

  delete: async (campaignId) => {
    try {
      const response = await api.delete(`/campaigns/${campaignId}`);
      return response?.data || { success: false };
    } catch (error) {
      console.error('[CAMPAIGN-SERVICE] Delete error:', error);
      throw error;
    }
  }
};

// ============================================
// CONTRIBUTION SERVICE
// ============================================

export const contributionService = {
  create: async (contributionData) => {
    try {
      const response = await api.post('/contributions', contributionData);
      return response?.data || { success: false };
    } catch (error) {
      console.error('[CONTRIBUTION-SERVICE] Create error:', error);
      throw error;
    }
  },

  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.campaignId) params.append('campaignId', filters.campaignId);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/contributions?${params.toString()}`);
      return response?.data || { contributions: [], success: false };
    } catch (error) {
      console.error('[CONTRIBUTION-SERVICE] Get all error:', error);
      throw error;
    }
  },

  verify: async (contributionId) => {
    try {
      const response = await api.patch(`/contributions/${contributionId}/verify`, {});
      return response?.data || { success: false };
    } catch (error) {
      console.error('[CONTRIBUTION-SERVICE] Verify error:', error);
      throw error;
    }
  },

  // ✅ FIXED: Initiate M-Pesa for contribution (with idempotency)
  initiateMpesa: async (campaignId, amount, phoneNumber) => {
    try {
      const idempotencyKey = generateIdempotencyKey();
      
      console.log('[CONTRIBUTION-SERVICE] Initiating M-Pesa contribution:', {
        campaignId,
        amount,
        phoneNumber,
        idempotencyKey
      });

      const response = await api.post('/contributions/mpesa/initiate', {
        campaignId,
        amount,
        phoneNumber
      }, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });

      return response?.data || { success: false };
    } catch (error) {
      console.error('[CONTRIBUTION-SERVICE] Initiate M-Pesa error:', error);
      throw error;
    }
  }
};

// ============================================
// PLEDGE SERVICE
// ============================================

export const pledgeService = {
  create: async (pledgeData) => {
    try {
      const response = await api.post('/pledges', pledgeData);
      return response?.data || { success: false };
    } catch (error) {
      console.error('[PLEDGE-SERVICE] Create error:', error);
      throw error;
    }
  },

  getMyPledges: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/pledges/my-pledges?page=${page}&limit=${limit}`);
      return response?.data || { pledges: [], success: false };
    } catch (error) {
      console.error('[PLEDGE-SERVICE] Get my pledges error:', error);
      throw error;
    }
  },

  getAllPledges: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/pledges/all?page=${page}&limit=${limit}`);
      return response?.data || { pledges: [], success: false };
    } catch (error) {
      console.error('[PLEDGE-SERVICE] Get all pledges error:', error);
      throw error;
    }
  },

  getById: async (pledgeId) => {
    try {
      const response = await api.get(`/pledges/${pledgeId}`);
      return response?.data || { pledge: null, success: false };
    } catch (error) {
      console.error('[PLEDGE-SERVICE] Get by ID error:', error);
      throw error;
    }
  },

  getCampaignPledges: async (campaignId, status = null, page = 1, limit = 20) => {
    try {
      let url = `/pledges/campaign/${campaignId}?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      
      const response = await api.get(url);
      return response?.data || { pledges: [], success: false };
    } catch (error) {
      console.error('[PLEDGE-SERVICE] Get campaign pledges error:', error);
      throw error;
    }
  },

  update: async (pledgeId, updates) => {
    try {
      const response = await api.put(`/pledges/${pledgeId}`, updates);
      return response?.data || { success: false };
    } catch (error) {
      console.error('[PLEDGE-SERVICE] Update error:', error);
      throw error;
    }
  },

  cancel: async (pledgeId) => {
    try {
      const response = await api.patch(`/pledges/${pledgeId}/cancel`, {});
      return response?.data || { success: false };
    } catch (error) {
      console.error('[PLEDGE-SERVICE] Cancel error:', error);
      throw error;
    }
  }
};

// ============================================
// PAYMENT SERVICE
// ============================================

export const paymentService = {
  // ✅ CRITICAL FIX: Idempotency key now properly generated and sent
  initiateMpesa: async (pledgeId, amount, phoneNumber) => {
    try {
      // Generate UUID for idempotency
      const idempotencyKey = generateIdempotencyKey();
      
      console.log('[PAYMENT-SERVICE] Initiating M-Pesa payment:', {
        pledgeId,
        amount,
        phoneNumber,
        idempotencyKey
      });

      const response = await api.post('/payments/mpesa/initiate', {
        pledgeId,
        amount,
        phoneNumber
      }, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });

      return response?.data || { success: false };
    } catch (error) {
      console.error('[PAYMENT-SERVICE] Initiate M-Pesa error:', error);
      throw error;
    }
  },

  getHistory: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/payments/history?page=${page}&limit=${limit}`);
      return response?.data || { payments: [], success: false };
    } catch (error) {
      console.error('[PAYMENT-SERVICE] Get history error:', error);
      throw error;
    }
  },

  // ✅ Manual payment recording (admin only)
  recordManual: async (pledgeId, amount, paymentMethod, mpesaRef = null, notes = null) => {
    try {
      const response = await api.post('/payments/manual', {
        pledgeId,
        amount,
        paymentMethod,
        mpesaRef,
        notes
      });
      return response?.data || { success: false };
    } catch (error) {
      console.error('[PAYMENT-SERVICE] Record manual error:', error);
      throw error;
    }
  },

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
      console.error('[PAYMENT-SERVICE] Get all error:', error);
      throw error;
    }
  }
};

// ============================================
// ANALYTICS SERVICE
// ============================================

export const analyticsService = {
  getDashboard: async () => {
    try {
      const response = await api.get('/donations/analytics/dashboard');
      return response?.data || { success: false, data: {} };
    } catch (error) {
      console.error('[ANALYTICS-SERVICE] Get dashboard error:', error);
      throw error;
    }
  },

  getCampaignAnalytics: async (campaignId) => {
    try {
      const response = await api.get(`/donations/analytics/campaign/${campaignId}`);
      return response?.data || { success: false, analytics: {} };
    } catch (error) {
      console.error('[ANALYTICS-SERVICE] Get campaign analytics error:', error);
      throw error;
    }
  }
};

export const auditService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/audit?${params.toString()}`);
    return response?.data || { logs: [], success: false };
  },

  exportCSV: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/audit/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response;
  },

  getStats: async () => {
    const response = await api.get('/audit/stats');
    return response?.data || { stats: {}, success: false };
  }
};

// ============================================
// SETTINGS SERVICE
// ============================================

export const donationSettingsService = {
  getPublicSettings: async () => {
    try {
      const response = await api.get('/settings/donations/public');
      return response?.data || { donations: {}, success: false };
    } catch (error) {
      console.error('[SETTINGS-SERVICE] Get public settings error:', error);
      return { donations: {}, success: false };
    }
  },

  getMpesaSettings: async () => {
    try {
      const response = await api.get('/settings/mpesa');
      return response?.data || { mpesa: {}, success: false };
    } catch (error) {
      console.error('[SETTINGS-SERVICE] Get M-Pesa settings error:', error);
      throw error;
    }
  },

  updateMpesaSettings: async (mpesaData) => {
    try {
      const response = await api.patch('/settings/mpesa', mpesaData);
      return response?.data || { success: false };
    } catch (error) {
      console.error('[SETTINGS-SERVICE] Update M-Pesa settings error:', error);
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
  contributions: contributionService,
  settings: donationSettingsService,
  analytics: analyticsService,
  audit: auditService
};