'use client';

import { useState, useEffect } from 'react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, validatePledgeAmount, calculateInstallment } from '@/utils/donationHelpers';
import { X, Heart, Calendar, DollarSign, AlertCircle } from 'lucide-react';

export default function PledgeForm({ onClose, onSuccess }) {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    campaignId: '',
    pledgedAmount: '',
    installmentPlan: 'lump-sum',
    notes: ''
  });

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [installmentPreview, setInstallmentPreview] = useState(null);

  // ============================================
  // LOAD CAMPAIGNS ON MOUNT
  // ============================================

  useEffect(() => {
    loadActiveCampaigns();
  }, []);

  const loadActiveCampaigns = async () => {
    setIsLoadingCampaigns(true);
    try {
      const response = await donationApi.campaigns.getAll({ status: 'active' });
      
      if (response.success) {
        setCampaigns(response.campaigns || []);
        console.log('[PLEDGE-FORM] Loaded campaigns:', response.campaigns?.length);
      } else {
        setError('Failed to load active campaigns');
      }
    } catch (err) {
      console.error('[PLEDGE-FORM] Error loading campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // ============================================
  // CALCULATE INSTALLMENT PREVIEW
  // ============================================

  useEffect(() => {
    if (selectedCampaign && formData.pledgedAmount && formData.installmentPlan !== 'lump-sum') {
      const preview = calculateInstallment(
        Number(formData.pledgedAmount),
        formData.installmentPlan,
        selectedCampaign.startDate,
        selectedCampaign.endDate
      );
      setInstallmentPreview(preview);
    } else {
      setInstallmentPreview(null);
    }
  }, [formData.pledgedAmount, formData.installmentPlan, selectedCampaign]);

  // ============================================
  // FORM HANDLERS
  // ============================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update selected campaign when campaign changes
    if (name === 'campaignId') {
      const campaign = campaigns.find(c => c._id === value);
      setSelectedCampaign(campaign || null);
    }

    setError(null);
  };

  const validateForm = () => {
    if (!formData.campaignId) {
      setError('Please select a campaign');
      return false;
    }

    const amountValidation = validatePledgeAmount(Number(formData.pledgedAmount));
    if (!amountValidation.valid) {
      setError(amountValidation.error);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('[PLEDGE-FORM] Submitting pledge:', formData);

      const pledgeData = {
        campaignId: formData.campaignId,
        pledgedAmount: Number(formData.pledgedAmount),
        installmentPlan: formData.installmentPlan,
        notes: formData.notes.trim() || null
      };

      const response = await donationApi.pledges.create(pledgeData);

      if (response.success) {
        console.log('[PLEDGE-FORM] Pledge created:', response.pledge.id);
        
        // Reset form
        setFormData({
          campaignId: '',
          pledgedAmount: '',
          installmentPlan: 'lump-sum',
          notes: ''
        });
        setSelectedCampaign(null);

        // Notify parent
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.message || 'Failed to create pledge');
      }
    } catch (err) {
      console.error('[PLEDGE-FORM] Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create pledge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="text-[#8B1A1A]" size={28} />
              Make a New Pledge
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Commit to supporting a campaign
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-800 dark:text-red-200 text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoadingCampaigns ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A] mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading active campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <Heart size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No Active Campaigns
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              There are currently no active campaigns accepting pledges
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Campaign Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Campaign *
              </label>
              <select 
                name="campaignId"
                value={formData.campaignId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                required
                disabled={isSubmitting}
              >
                <option value="">-- Choose a Campaign --</option>
                {campaigns.map(campaign => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.title} (Goal: {formatCurrency(campaign.goalAmount)})
                  </option>
                ))}
              </select>
            </div>

            {/* Campaign Info Card */}
            {selectedCampaign && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  {selectedCampaign.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {selectedCampaign.description}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Goal:</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(selectedCampaign.goalAmount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Raised:</span>
                    <p className="font-bold text-green-600">
                      {formatCurrency(selectedCampaign.currentAmount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Type:</span>
                    <p className="font-semibold text-slate-900 dark:text-white capitalize">
                      {selectedCampaign.campaignType}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">End Date:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {new Date(selectedCampaign.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pledge Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <DollarSign size={16} />
                Pledge Amount (KES) *
              </label>
              <input 
                type="number"
                name="pledgedAmount"
                value={formData.pledgedAmount}
                onChange={handleChange}
                placeholder="e.g., 5000"
                min="1"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter the total amount you wish to pledge
              </p>
            </div>

            {/* Payment Plan */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Payment Plan *
              </label>
              <select 
                name="installmentPlan"
                value={formData.installmentPlan}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                disabled={isSubmitting}
              >
                <option value="lump-sum">Lump Sum (Pay all at once)</option>
                <option value="weekly">Weekly Installments</option>
                <option value="bi-weekly">Bi-Weekly Installments</option>
                <option value="monthly">Monthly Installments</option>
              </select>

              {/* Installment Preview */}
              {installmentPreview && (
                <div className="mt-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">
                    💡 Installment Preview:
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {installmentPreview.numberOfInstallments} payments of{' '}
                    <strong>{formatCurrency(installmentPreview.installmentAmount)}</strong> each
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Notes (Optional)
              </label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Add any special notes or dedication..."
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Summary */}
            {formData.pledgedAmount && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">
                  Pledge Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Total Pledge:</span>
                    <span className="font-bold text-green-900 dark:text-green-100">
                      {formatCurrency(formData.pledgedAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Payment Plan:</span>
                    <span className="font-semibold text-green-900 dark:text-green-100 capitalize">
                      {formData.installmentPlan.replace('-', ' ')}
                    </span>
                  </div>
                  {installmentPreview && (
                    <div className="flex justify-between">
                      <span className="text-green-700 dark:text-green-300">Per Installment:</span>
                      <span className="font-semibold text-green-900 dark:text-green-100">
                        {formatCurrency(installmentPreview.installmentAmount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button 
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#8B1A1A] text-white py-3 rounded-lg font-bold hover:bg-red-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart size={20} />
                    Confirm Pledge
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}