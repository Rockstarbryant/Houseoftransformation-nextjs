// src/context/DonationContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { campaignService } from '../services/api/donation/campaignService';
import { pledgeService } from '../services/api/donation/pledgeService';
import { paymentService } from '../services/api/donation/paymentService';
import { reportService } from '../services/api/donation/reportService';

const DonationContext = createContext();

export const DonationProvider = ({ children }) => {
  // State
  const [campaigns, setCampaigns] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedPledge, setSelectedPledge] = useState(null);

  // Fetch all campaigns
  const fetchCampaigns = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await campaignService.getCampaigns(filters);
      if (result.success) {
        setCampaigns(result.campaigns || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch active campaigns only
  const fetchActiveCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await campaignService.getActiveCampaigns();
      if (result.success) {
        setCampaigns(result.campaigns || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single campaign
  const fetchCampaignById = useCallback(async (campaignId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await campaignService.getCampaignById(campaignId);
      if (result.success) {
        setSelectedCampaign(result.campaign);
        return result.campaign;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create campaign
  const createCampaign = useCallback(async (campaignData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await campaignService.createCampaign(campaignData);
      if (result.success) {
        setCampaigns([...campaigns, result.campaign]);
        return result.campaign;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [campaigns]);

  // Update campaign
  const updateCampaign = useCallback(async (campaignId, campaignData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await campaignService.updateCampaign(campaignId, campaignData);
      if (result.success) {
        setCampaigns(campaigns.map(c => c._id === campaignId ? result.campaign : c));
        return result.campaign;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [campaigns]);

  // Archive campaign
  const archiveCampaign = useCallback(async (campaignId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await campaignService.archiveCampaign(campaignId);
      if (result.success) {
        setCampaigns(campaigns.map(c => c._id === campaignId ? result.campaign : c));
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [campaigns]);

  // Delete campaign
  const deleteCampaign = useCallback(async (campaignId) => {
    setLoading(true);
    setError(null);
    try {
      await campaignService.deleteCampaign(campaignId);
      setCampaigns(campaigns.filter(c => c._id !== campaignId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [campaigns]);

  // Fetch user's pledges
  const fetchMyPledges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await pledgeService.getMyPledges();
      if (result.success) {
        setPledges(result.pledges || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all pledges (admin)
  const fetchAllPledges = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await pledgeService.getAllPledges(filters);
      if (result.success) {
        setPledges(result.pledges || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single pledge
  const fetchPledgeById = useCallback(async (pledgeId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await pledgeService.getPledgeById(pledgeId);
      if (result.success) {
        setSelectedPledge(result.pledge);
        return result.pledge;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create pledge
  const createPledge = useCallback(async (pledgeData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await pledgeService.createPledge(pledgeData);
      if (result.success) {
        setPledges([...pledges, result.pledge]);
        return result.pledge;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pledges]);

  // Update pledge
  const updatePledge = useCallback(async (pledgeId, pledgeData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await pledgeService.updatePledge(pledgeId, pledgeData);
      if (result.success) {
        setPledges(pledges.map(p => p._id === pledgeId ? result.pledge : p));
        return result.pledge;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pledges]);

  // Fetch payment history
  const fetchPaymentHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.getMyPaymentHistory();
      if (result.success) {
        setPayments(result.payments || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all payments (admin)
  const fetchAllPayments = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.getAllPayments(filters);
      if (result.success) {
        setPayments(result.payments || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initiate M-Pesa payment
  const initiatePayment = useCallback(async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.initiateMpesaPayment(paymentData);
      if (result.success) {
        return result;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Record manual payment (admin)
  const recordManualPayment = useCallback(async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.recordManualPayment(paymentData);
      if (result.success) {
        setPayments([...payments, result.payment]);
        return result.payment;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [payments]);

  // Fetch dashboard stats (member)
  const fetchMemberDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportService.getMemberDashboard();
      if (result.success) {
        setDashboardStats(result.stats);
        setPledges(result.pledges || []);
        return result;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dashboard stats (admin)
  const fetchAdminDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportService.getAdminDashboard();
      if (result.success) {
        setDashboardStats(result.stats);
        setPayments(result.recentPayments || []);
        return result;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Export functions
  const exportPaymentHistory = useCallback(async (filters) => {
    try {
      const result = await reportService.exportPaymentHistory(filters);
      return result.payments || [];
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const exportPledges = useCallback(async (filters) => {
    try {
      const result = await reportService.exportPledges(filters);
      return result.pledges || [];
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // PDF generation
  const generatePaymentReceipt = useCallback((payment, campaign, member) => {
    reportService.generatePaymentReceiptPDF(payment, campaign, member);
  }, []);

  const generatePledgeSummary = useCallback((pledge, campaign) => {
    reportService.generatePledgeSummaryPDF(pledge, campaign);
  }, []);

  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = {
    // State
    campaigns,
    pledges,
    payments,
    dashboardStats,
    loading,
    error,
    selectedCampaign,
    selectedPledge,

    // Campaign functions
    fetchCampaigns,
    fetchActiveCampaigns,
    fetchCampaignById,
    createCampaign,
    updateCampaign,
    archiveCampaign,
    deleteCampaign,

    // Pledge functions
    fetchMyPledges,
    fetchAllPledges,
    fetchPledgeById,
    createPledge,
    updatePledge,

    // Payment functions
    fetchPaymentHistory,
    fetchAllPayments,
    initiatePayment,
    recordManualPayment,

    // Dashboard functions
    fetchMemberDashboard,
    fetchAdminDashboard,

    // Export functions
    exportPaymentHistory,
    exportPledges,

    // PDF functions
    generatePaymentReceipt,
    generatePledgeSummary,

    // Utility
    clearError,
    setSelectedCampaign,
    setSelectedPledge
  };

  return (
    <DonationContext.Provider value={value}>
      {children}
    </DonationContext.Provider>
  );
};

// Custom hook
export const useDonation = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonation must be used within DonationProvider');
  }
  return context;
};

export default DonationContext;