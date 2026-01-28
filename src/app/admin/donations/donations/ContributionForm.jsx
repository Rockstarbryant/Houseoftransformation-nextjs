'use client';

import { useState, useEffect } from 'react';
import { donationApi } from '@/services/api/donationService';
import { X, DollarSign, User, Mail, Phone, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContributionForm({ onClose, onSuccess, preselectedCampaign = null }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Payment flow state
  const [paymentStep, setPaymentStep] = useState('form'); // 'form' | 'processing' | 'waiting'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    campaignId: preselectedCampaign || '',
    contributorName: '',
    contributorEmail: '',
    contributorPhone: '',
    amount: '',
    paymentMethod: 'mpesa',
    notes: '',
    isAnonymous: false
  });

  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // ============================================
  // FETCH CAMPAIGNS
  // ============================================

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

  // ============================================
  // HANDLERS
  // ============================================

  const handleCampaignChange = (campaignId) => {
    setFormData({ ...formData, campaignId });
    const campaign = campaigns.find(c => c._id === campaignId);
    setSelectedCampaign(campaign);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError(null);
  };

  const validateForm = () => {
  if (!formData.campaignId) {
    setError('Please select a campaign');
    return false;
  }

  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    setError('Please enter a valid amount');
    return false;
  }

  if (!formData.isAnonymous) {
    if (!formData.contributorName || !formData.contributorEmail || !formData.contributorPhone) {
      setError('Please fill in all contributor details or check "Anonymous"');
      return false;
    }
  }

  // M-PESA ONLY REQUIRES PHONE (for initiation)
  // No need to validate mpesaRef here - it comes from M-Pesa callback
  if (formData.paymentMethod === 'mpesa' && !formData.contributorPhone) {
    setError('Phone number is required for M-Pesa payment');
    return false;
  }

  return true;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    // IF M-PESA - INITIATE PAYMENT
    if (formData.paymentMethod === 'mpesa') {
      await initiateM2Payment();
      return;
    }

    // FOR OTHER METHODS - SUBMIT DIRECTLY
    await submitContribution();
  };

  // ============================================
  // M-PESA PAYMENT INITIATION
  // ============================================

  const initiateM2Payment = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setPaymentStep('processing');

      console.log('[CONTRIBUTION-MPESA] Initiating M-Pesa payment:', {
        campaignId: formData.campaignId,
        amount: formData.amount,
        phone: formData.contributorPhone
      });

      // Call M-Pesa initiation endpoint
      const response = await donationApi.contributions.initiateMpesa(
        formData.campaignId,
        parseFloat(formData.amount),
        formData.contributorPhone
      );

      if (response.success) {
        console.log('[CONTRIBUTION-MPESA] Payment initiated successfully');
        setPaymentStep('waiting');

        // Auto-close and submit after 10 seconds
        setTimeout(async () => {
          await submitContribution(response.contribution?.mpesa_ref);
          setPaymentStep('form');
          onSuccess?.();
          onClose();
        }, 10000);
      } else {
        setError(response.message || 'Failed to initiate M-Pesa payment');
        setPaymentStep('form');
      }
    } catch (err) {
      console.error('[CONTRIBUTION-MPESA] Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to initiate M-Pesa payment');
      setPaymentStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // SUBMIT CONTRIBUTION
  // ============================================

  const submitContribution = async (mpesaRef = null) => {
  try {
    setLoading(true);

    console.log('[CONTRIBUTION-FORM] Submitting contribution');

    const response = await donationApi.contributions.create({
      campaignId: formData.campaignId,
      contributorName: formData.isAnonymous ? 'Anonymous' : formData.contributorName,
      contributorEmail: formData.isAnonymous ? null : formData.contributorEmail,
      contributorPhone: formData.isAnonymous ? null : formData.contributorPhone,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      mpesaRef: mpesaRef || null,  // Can be null for M-Pesa (will be set by callback)
      notes: formData.notes || null,
      isAnonymous: formData.isAnonymous
    });

    if (response.success) {
      console.log('[CONTRIBUTION-FORM] Contribution created successfully');
      setSuccess('Contribution recorded successfully! Thank you for your generosity.');
      setPaymentStep('form');
    } else {
      setError(response.message || 'Failed to record contribution');
    }
  } catch (err) {
    console.error('[CONTRIBUTION-FORM] Submission error:', err);
    setError(err.response?.data?.message || 'Failed to record contribution');
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      onClose();
    }
  };

  // ============================================
  // RENDER - FORM STEP
  // ============================================

  if (paymentStep === 'form') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* HEADER */}
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
                onClick={handleClose}
                disabled={loading || isSubmitting}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* SUCCESS MESSAGE */}
            {success && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-800 dark:text-green-200 font-semibold">
                {success}
              </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200 font-semibold flex items-center gap-3">
                <AlertCircle size={20} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* CAMPAIGN SELECTION */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Campaign <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.campaignId}
                onChange={(e) => handleCampaignChange(e.target.value)}
                required
                disabled={loading || isSubmitting || preselectedCampaign}
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

            {/* CAMPAIGN DETAILS */}
            {selectedCampaign && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm space-y-1">
                <p><strong>Goal:</strong> Ksh {selectedCampaign.goalAmount?.toLocaleString() || '0'}</p>
                <p><strong>Raised:</strong> Ksh {selectedCampaign.currentAmount?.toLocaleString() || '0'}</p>
              </div>
            )}

            {/* ANONYMOUS TOGGLE */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                    disabled={loading || isSubmitting}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-600 cursor-pointer"
                  />
                  <label htmlFor="anonymous" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Make this contribution anonymous
                  </label>
                </div>

                {/* CONTRIBUTOR DETAILS - ALWAYS SHOW PHONE FOR M-PESA */}
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
                          onChange={(e) => handleInputChange('contributorName', e.target.value)}
                          placeholder="John Doe"
                          required={!formData.isAnonymous}
                          disabled={loading || isSubmitting}
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
                          onChange={(e) => handleInputChange('contributorEmail', e.target.value)}
                          placeholder="john@example.com"
                          required={!formData.isAnonymous}
                          disabled={loading || isSubmitting}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* PHONE NUMBER - ALWAYS REQUIRED */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="tel"
                      value={formData.contributorPhone}
                      onChange={(e) => handleInputChange('contributorPhone', e.target.value)}
                      placeholder="254712345678"
                      required
                      disabled={loading || isSubmitting}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formData.paymentMethod === 'mpesa' ? 'Required for M-Pesa payment' : 'For contact purposes'}
                  </p>
                </div>

            {/* AMOUNT */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Contribution Amount (KES) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="e.g., 1000"
                  min="1"
                  step="1"
                  required
                  disabled={loading || isSubmitting}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                required
                disabled={loading || isSubmitting}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none"
              >
                <option value="mpesa">M-Pesa (Auto Payment)</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            {/* NOTES */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any special notes..."
                rows={3}
                disabled={loading || isSubmitting}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none resize-none"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading || isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign size={20} />
                    {formData.paymentMethod === 'mpesa' ? 'Pay via M-Pesa' : 'Submit Contribution'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading || isSubmitting}
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

  // ============================================
  // RENDER - PROCESSING STEP
  // ============================================

  if (paymentStep === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Processing...
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Initiating M-Pesa payment. Please wait...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - WAITING STEP
  // ============================================

  if (paymentStep === 'waiting') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
          
          <div className="mb-6">
            <div className="animate-bounce">
              <Smartphone className="mx-auto text-green-600" size={64} />
            </div>
          </div>

          <div className="mb-6">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Check your phone!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We've sent an M-Pesa payment prompt to <strong className="text-slate-900 dark:text-white">{formData.contributorPhone}</strong>
            </p>
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                ✓ Enter your M-Pesa PIN to complete the payment
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">Amount:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                Ksh {parseFloat(formData.amount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Phone:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formData.contributorPhone}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Your contribution will be recorded after successful payment. This window will close automatically.
          </p>

          <button
            onClick={() => {
              setPaymentStep('form');
              onSuccess?.();
              onClose();
            }}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return null;
}