'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { donationApi } from '@/services/api/donationService';
import { X, Heart, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function PledgeForm({ onClose, onSuccess, preselectedCampaign = null }) {
  const { user } = useAuth();
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ── ALL reminder fields live in the same formData state ──────────────────
  const [formData, setFormData] = useState({
    campaignId:         preselectedCampaign || '',
    pledgedAmount:      '',
    installmentPlan:    'lump-sum',
    installmentCount:   1,
    notes:              '',
    // reminder fields
    reminderEnabled:    true,
    reminderChannels:   ['email'],
    reminderFrequency:  'weekly',
    reminderCustomDays: 7,
    reminderMaxCount:   3,
  });

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [maxInstallments, setMaxInstallments] = useState(1);
  const [installmentPreview, setInstallmentPreview] = useState({
    count: 1,
    amount: 0,
    frequency: 'once'
  });

  // Fetch active campaigns that allow pledges
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await donationApi.campaigns.getAll({ status: 'active' });
      if (response.success) {
        const pledgeableCampaigns = response.campaigns.filter(c => c.allowPledges === true);
        setCampaigns(pledgeableCampaigns);
        if (preselectedCampaign) {
          const campaign = pledgeableCampaigns.find(c => c._id === preselectedCampaign);
          setSelectedCampaign(campaign);
        }
      }
    } catch (err) {
      console.error('Fetch campaigns error:', err);
      setError('Failed to load campaigns');
    }
  };

  // Calculate max installments based on campaign end date
  useEffect(() => {
    if (!selectedCampaign) { setMaxInstallments(1); return; }

    const now = new Date();
    const endDate = new Date(selectedCampaign.endDate);
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) { setMaxInstallments(1); return; }

    let maxCount = 1;
    switch (formData.installmentPlan) {
      case 'weekly':    maxCount = Math.floor(daysRemaining / 7);  break;
      case 'bi-weekly': maxCount = Math.floor(daysRemaining / 14); break;
      case 'monthly':   maxCount = Math.floor(daysRemaining / 30); break;
      default:          maxCount = 1;
    }

    setMaxInstallments(Math.max(1, maxCount));
    if (formData.installmentCount > maxCount) {
      setFormData(prev => ({ ...prev, installmentCount: maxCount }));
    }
  }, [selectedCampaign, formData.installmentPlan]);

  // Calculate installment preview
  useEffect(() => {
    if (!formData.pledgedAmount || !selectedCampaign) {
      setInstallmentPreview({ count: 1, amount: 0, frequency: 'once' });
      return;
    }

    const amount = parseFloat(formData.pledgedAmount);
    if (isNaN(amount) || amount <= 0) {
      setInstallmentPreview({ count: 1, amount: 0, frequency: 'once' });
      return;
    }

    if (formData.installmentPlan === 'lump-sum') {
      setInstallmentPreview({ count: 1, amount, frequency: 'once' });
      return;
    }

    const count = parseInt(formData.installmentCount) || 1;
    const installmentAmount = amount / count;

    const frequencyMap = { weekly: 'week', 'bi-weekly': 'bi-week', monthly: 'month' };
    setInstallmentPreview({
      count,
      amount: installmentAmount,
      frequency: frequencyMap[formData.installmentPlan] || 'payment'
    });
  }, [formData.pledgedAmount, formData.installmentPlan, formData.installmentCount, selectedCampaign]);

  const handleCampaignChange = (campaignId) => {
    setFormData(prev => ({ ...prev, campaignId }));
    const campaign = campaigns.find(c => c._id === campaignId);
    setSelectedCampaign(campaign);
    setError(null);
  };

  // ── Helper: toggle a reminder channel on/off ─────────────────────────────
  const toggleChannel = (ch, checked) => {
    setFormData(prev => ({
      ...prev,
      reminderChannels: checked
        ? [...(prev.reminderChannels || []), ch]
        : (prev.reminderChannels || []).filter(c => c !== ch)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.campaignId) {
      setError('Please select a campaign');
      return;
    }
    if (!formData.pledgedAmount || parseFloat(formData.pledgedAmount) <= 0) {
      setError('Please enter a valid pledge amount');
      return;
    }

    try {
      setLoading(true);

      const response = await donationApi.pledges.create({
        campaignId:         formData.campaignId,
        pledgedAmount:      parseFloat(formData.pledgedAmount),
        installmentPlan:    formData.installmentPlan,
        notes:              formData.notes,
        // reminder preferences
        reminderEnabled:    formData.reminderEnabled,
        reminderChannels:   formData.reminderChannels,
        reminderFrequency:  formData.reminderFrequency,
        reminderCustomDays: formData.reminderCustomDays,
        reminderMaxCount:   formData.reminderMaxCount,
      });

      if (response.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(response.message || 'Failed to create pledge');
      }
    } catch (err) {
      console.error('Create pledge error:', err);
      setError(err.response?.data?.message || 'Failed to create pledge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8B1A1A] rounded-lg flex items-center justify-center">
                <Heart className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Make a Pledge</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Commit to supporting a campaign</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Campaign Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Campaign <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.campaignId}
              onChange={(e) => handleCampaignChange(e.target.value)}
              required
              disabled={loading || !!preselectedCampaign}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
            >
              <option value="">-- Choose a Campaign --</option>
              {campaigns.map((campaign) => (
                <option key={campaign._id} value={campaign._id}>
                  {campaign.title} (Goal: Ksh {campaign.goalAmount.toLocaleString()})
                </option>
              ))}
            </select>
            {campaigns.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                No active campaigns accepting pledges at the moment
              </p>
            )}
          </div>

          {/* Campaign Details */}
          {selectedCampaign && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-blue-600" />
                <span className="text-sm font-bold text-blue-900 dark:text-blue-200">Campaign Details</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Type:</span>
                  <span className="ml-2 font-semibold capitalize">{selectedCampaign.campaignType}</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Ends:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(selectedCampaign.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Goal:</span>
                  <span className="ml-2 font-semibold">Ksh {selectedCampaign.goalAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Raised:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    Ksh {selectedCampaign.currentAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pledge Amount */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Pledge Amount (KES) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="number"
                value={formData.pledgedAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, pledgedAmount: e.target.value }))}
                placeholder="e.g., 5000"
                min="1"
                step="1"
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter the total amount you wish to pledge
            </p>
          </div>

          {/* Payment Plan */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Payment Plan <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.installmentPlan}
              onChange={(e) => setFormData(prev => ({ ...prev, installmentPlan: e.target.value, installmentCount: 1 }))}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
            >
              <option value="lump-sum">Lump Sum (Pay all at once)</option>
              <option value="weekly">Weekly Installments</option>
              <option value="bi-weekly">Bi-Weekly Installments</option>
              <option value="monthly">Monthly Installments</option>
            </select>
          </div>

          {/* Installment Count */}
          {formData.installmentPlan !== 'lump-sum' && selectedCampaign && (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Number of Installments <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.installmentCount}
                onChange={(e) => setFormData(prev => ({ ...prev, installmentCount: parseInt(e.target.value) }))}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none disabled:opacity-50"
              >
                {Array.from({ length: maxInstallments }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    {num} {formData.installmentPlan.replace('-', ' ')} payment{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Maximum {maxInstallments} installments based on campaign duration
              </p>
            </div>
          )}

          {/* Installment Preview */}
          {formData.installmentPlan !== 'lump-sum' && formData.pledgedAmount && selectedCampaign && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm font-bold text-green-900 dark:text-green-200">💡 Installment Preview</span>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                You will make <strong>{installmentPreview.count}</strong> payment
                {installmentPreview.count > 1 ? 's' : ''} of{' '}
                <strong>
                  Ksh {installmentPreview.amount.toLocaleString('en-KE', { maximumFractionDigits: 2 })}
                </strong>{' '}
                each {installmentPreview.count > 1 ? `(${installmentPreview.frequency})` : ''}
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any special notes or dedication..."
              rows={3}
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B1A1A] outline-none resize-none disabled:opacity-50"
            />
          </div>

          {/* ── Reminder Preferences ────────────────────────────────────────────── */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Payment Reminders
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Get notified when a payment is due
                </p>
              </div>
              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, reminderEnabled: !prev.reminderEnabled }))}
                className={`w-11 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:ring-offset-2 ${
                  formData.reminderEnabled ? 'bg-[#8B1A1A]' : 'bg-slate-300 dark:bg-slate-600'
                }`}
                aria-label="Toggle reminders"
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  formData.reminderEnabled ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            {formData.reminderEnabled && (
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">

                {/* Channels */}
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    Remind me via
                  </p>
                  <div className="flex gap-4">
                    {['email', 'sms'].map(ch => (
                      <label key={ch} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData.reminderChannels || ['email']).includes(ch)}
                          onChange={(e) => toggleChannel(ch, e.target.checked)}
                          className="w-4 h-4 rounded accent-[#8B1A1A]"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                          {ch}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    Reminder frequency
                  </p>
                  <select
                    value={formData.reminderFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderFrequency: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom interval</option>
                  </select>
                </div>

                {/* Custom days input */}
                {formData.reminderFrequency === 'custom' && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                      Every how many days?
                    </p>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.reminderCustomDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, reminderCustomDays: parseInt(e.target.value) || 7 }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                    />
                  </div>
                )}

                {/* Max reminders slider */}
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    Maximum reminders:{' '}
                    <span className="text-[#8B1A1A] font-black">{formData.reminderMaxCount}</span>
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.reminderMaxCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderMaxCount: parseInt(e.target.value) }))}
                    className="w-full accent-[#8B1A1A]"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1</span><span>5</span><span>10</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    We will stop reminding you after{' '}
                    <strong>{formData.reminderMaxCount}</strong> reminder
                    {formData.reminderMaxCount > 1 ? 's' : ''}
                  </p>
                </div>

              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.campaignId || !formData.pledgedAmount}
              className="flex-1 px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Pledge...
                </>
              ) : (
                <>
                  <Heart size={20} />
                  Create Pledge
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}