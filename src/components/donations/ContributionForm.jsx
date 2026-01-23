'use client';

import { useState, useEffect } from 'react';
import { donationApi } from '@/services/api/donationService';
import { X, DollarSign, User, Mail, Phone, Building } from 'lucide-react';

export default function ContributionForm({ onClose, onSuccess, preselectedCampaign = null }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    campaignId: preselectedCampaign || '',
    contributorName: '',
    contributorEmail: '',
    contributorPhone: '',
    amount: '',
    paymentMethod: 'mpesa',
    mpesaRef: '',
    notes: '',
    isAnonymous: false
  });

  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await donationApi.campaigns.getAll({ status: 'active' });
      
      if (response.success) {
        setCampaigns(response.campaigns || []);
        
        if (preselectedCampaign) {
          const campaign = response.campaigns.find(c => c._id === preselectedCampaign);
          setSelectedCampaign(campaign);
        }
      }
    } catch (err) {
      console.error('Fetch campaigns error:', err);
    }
  };

  const handleCampaignChange = (campaignId) => {
    setFormData({ ...formData, campaignId });
    const campaign = campaigns.find(c => c._id === campaignId);
    setSelectedCampaign(campaign);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.campaignId) {
      setError('Please select a campaign');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!formData.isAnonymous) {
      if (!formData.contributorName || !formData.contributorEmail || !formData.contributorPhone) {
        setError('Please fill in all contributor details or check "Anonymous"');
        return;
      }
    }

    if (formData.paymentMethod === 'mpesa' && !formData.mpesaRef) {
      setError('Please provide M-Pesa transaction reference');
      return;
    }

    try {
      setLoading(true);

      const response = await donationApi.contributions.create({
        campaignId: formData.campaignId,
        contributorName: formData.isAnonymous ? 'Anonymous' : formData.contributorName,
        contributorEmail: formData.isAnonymous ? null : formData.contributorEmail,
        contributorPhone: formData.isAnonymous ? null : formData.contributorPhone,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        mpesaRef: formData.mpesaRef || null,
        notes: formData.notes,
        isAnonymous: formData.isAnonymous
      });

      if (response.success) {
        setSuccess('Contribution recorded successfully! Thank you for your generosity.');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setError(response.message || 'Failed to record contribution');
      }
    } catch (err) {
      console.error('Create contribution error:', err);
      setError(err.response?.data?.message || 'Failed to record contribution');
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
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Make a Contribution
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Support a campaign directly
                </p>
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
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-800 dark:text-green-200">
              {success}
            </div>
          )}

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
              disabled={loading || preselectedCampaign}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none disabled:opacity-50"
            >
              <option value="">-- Choose a Campaign --</option>
              {campaigns.map((campaign) => (
                <option key={campaign._id} value={campaign._id}>
                  {campaign.title}
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Details */}
          {selectedCampaign && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p><strong>Goal:</strong> Ksh {selectedCampaign.goalAmount.toLocaleString()}</p>
              <p><strong>Raised:</strong> Ksh {selectedCampaign.currentAmount.toLocaleString()}</p>
            </div>
          )}

          {/* Anonymous Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-600"
            />
            <label htmlFor="anonymous" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Make this contribution anonymous
            </label>
          </div>

          {/* Contributor Details */}
          {!formData.isAnonymous && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={formData.contributorName}
                    onChange={(e) => setFormData({ ...formData, contributorName: e.target.value })}
                    placeholder="John Doe"
                    required={!formData.isAnonymous}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={formData.contributorEmail}
                    onChange={(e) => setFormData({ ...formData, contributorEmail: e.target.value })}
                    placeholder="john@example.com"
                    required={!formData.isAnonymous}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="tel"
                    value={formData.contributorPhone}
                    onChange={(e) => setFormData({ ...formData, contributorPhone: e.target.value })}
                    placeholder="254712345678"
                    required={!formData.isAnonymous}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Contribution Amount (KES) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g., 1000"
                min="1"
                step="1"
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none"
            >
              <option value="mpesa">M-Pesa</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          {/* M-Pesa Reference */}
          {formData.paymentMethod === 'mpesa' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                M-Pesa Transaction Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={formData.mpesaRef}
                  onChange={(e) => setFormData({ ...formData, mpesaRef: e.target.value })}
                  placeholder="e.g., QJ12ABC34D"
                  required={formData.paymentMethod === 'mpesa'}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any special notes..."
              rows={3}
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign size={20} />
                  Submit Contribution
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}