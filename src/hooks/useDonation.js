// src/hooks/useDonation.js
'use client';

import { useState, useCallback } from 'react';
import { donationApi } from '@/services/api/donationService';

export const useDonation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // CAMPAIGN OPERATIONS
  // ============================================

  const getCampaigns = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.campaigns.getAll(filters);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFeaturedCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.campaigns.getFeatured();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCampaignById = useCallback(async (campaignId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.campaigns.getById(campaignId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCampaign = useCallback(async (campaignData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.campaigns.create(campaignData);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCampaign = useCallback(async (campaignId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.campaigns.update(campaignId, updates);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // PLEDGE OPERATIONS
  // ============================================

  const createPledge = useCallback(async (pledgeData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.pledges.create(pledgeData);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyPledges = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.pledges.getMyPledges(page, limit);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPledgeById = useCallback(async (pledgeId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.pledges.getById(pledgeId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelPledge = useCallback(async (pledgeId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.pledges.cancel(pledgeId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // PAYMENT OPERATIONS
  // ============================================

  const initiateMpesaPayment = useCallback(async (pledgeId, amount, phoneNumber) => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.payments.initiateMpesa(
        pledgeId,
        amount,
        phoneNumber
      );
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllPayments = useCallback(async (filters = {}) => {
  setLoading(true);
  setError(null);
  try {
    const data = await donationApi.payments.getAll(filters);
    return data;
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

  const getPaymentHistory = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.payments.getHistory(page, limit);
      return data || { payments: [] };
    } catch (err) {
      setError(err.message);
      return { payments: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // SETTINGS OPERATIONS
  // ============================================

  const getPublicDonationSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.settings.getPublicSettings();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMpesaSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.settings.getMpesaSettings();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMpesaSettings = useCallback(async (mpesaData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await donationApi.settings.updateMpesaSettings(mpesaData);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    // Campaigns
    getCampaigns,
    getFeaturedCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    // Pledges
    createPledge,
    getMyPledges,
    getPledgeById,
    cancelPledge,
    // Payments
    getAllPayments,
    initiateMpesaPayment,
    getPaymentHistory,
    // Settings
    getPublicDonationSettings,
    getMpesaSettings,
    updateMpesaSettings
  };
};