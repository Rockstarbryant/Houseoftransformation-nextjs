// ============================================
// FILE 28: hooks/useDonation.js
// ============================================
import { useState, useCallback } from 'react';
import { donationService } from '../services/donationService';

export const useDonation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPledge = useCallback(async (pledgeData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await donationService.createPledge(pledgeData);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create pledge';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const initiatePayment = useCallback(async (paymentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await donationService.initiatePayment(paymentData);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to initiate payment';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordManualPayment = useCallback(async (paymentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await donationService.recordManualPayment(paymentData);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to record payment';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createPledge,
    initiatePayment,
    recordManualPayment
  };
};