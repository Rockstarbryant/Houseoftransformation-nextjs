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

    if (parseFloat(formData.amount) < 10) {
      setError('Minimum contribution amount is KES 10');
      return false;
    }

    if (parseFloat(formData.amount) > 500000) {
      setError('Maximum contribution amount is KES 500,000');
      return false;
    }

    if (!formData.isAnonymous) {
      if (!formData.contributorName || !formData.contributorEmail || !formData.contributorPhone) {
        setError('Please fill in all contributor details or check "Anonymous"');
        return false;
      }
    }

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
      await initiateMpesaPayment();
      return;
    }

    // FOR OTHER METHODS - SUBMIT DIRECTLY
    await submitContribution();
  };

  // ============================================
  // M-PESA PAYMENT INITIATION - ✅ FINAL FIX
  // ============================================

  const initiateMpesaPayment = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setPaymentStep('processing');

      console.log('[CONTRIBUTION-MPESA] Initiating M-Pesa payment:', {
        campaignId: formData.campaignId,
        amount: formData.amount,
        phone: formData.contributorPhone
      });

      const response = await donationApi.contributions.initiateMpesa(
        formData.campaignId,
        parseFloat(formData.amount),
        formData.contributorPhone
      );

      if (response.success) {
        console.log('[CONTRIBUTION-MPESA] ✅ STK Push initiated successfully');
        setPaymentStep('waiting');

        // ✅ CRITICAL FIX: DON'T CALL submitContribution()!
        // The M-Pesa callback will create the contribution
        // Just show success message and close after delay
        setTimeout(() => {
          setSuccess('Payment initiated! Check your phone to complete payment.');
          setPaymentStep('form');
          
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 3000);
        }, 15000); // 15 seconds to complete payment

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
  // SUBMIT CONTRIBUTION (Cash/Bank only)
  // ============================================

  const submitContribution = async () => {
    try {
      setLoading(true);

      console.log('[CONTRIBUTION-FORM] Submitting contribution (cash/bank)');

      const response = await donationApi.contributions.create({
        campaignId: formData.campaignId,
        contributorName: formData.isAnonymous ? 'Anonymous' : formData.contributorName,
        contributorEmail: formData.isAnonymous ? null : formData.contributorEmail,
        contributorPhone: formData.isAnonymous ? null : formData.contributorPhone,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || null,
        isAnonymous: formData.isAnonymous
      });

      if (response.success) {
        console.log('[CONTRIBUTION-FORM] ✅ Contribution created successfully');
        setSuccess('Contribution recorded successfully! Thank you for your generosity.');
        
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
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
  // RENDER - SUCCESS MESSAGE
  // ============================================

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
          <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Success!
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {success}
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - MAIN FORM
  // ============================================

  if (paymentStep === 'form') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
          {/* HEADER */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Make a Contribution
            </h2>
            <button
              onClick={handleClose}
              disabled={loading || isSubmitting}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* CAMPAIGN SELECT */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Campaign <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.campaignId}
                onChange={(e) => handleCampaignChange(e.target.value)}
                required
                disabled={loading || isSubmitting || !!preselectedCampaign}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none disabled:opacity-50"
              >
                <option value="">-- Select a Campaign --</option>
                {campaigns.map(campaign => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
            </div>

            {/* ANONYMOUS TOGGLE */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                disabled={loading || isSubmitting}
                className="w-5 h-5 text-green-600 bg-slate-100 border-slate-300 rounded focus:ring-green-600 focus:ring-2"
              />
              <label htmlFor="isAnonymous" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Make this contribution anonymous
              </label>
            </div>

            {/* CONTRIBUTOR DETAILS (if not anonymous) */}
            {!formData.isAnonymous && (
              <>
                {/* NAME */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
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

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
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
                  min="10"
                  max="500000"
                  step="1"
                  required
                  disabled={loading || isSubmitting}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Min: KES 10 | Max: KES 500,000
              </p>
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
                <option value="bank_transfer">Bank Transfer</option>
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
                KES {parseFloat(formData.amount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Phone:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formData.contributorPhone}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Your contribution will be recorded automatically after successful payment.
          </p>

          <button
            onClick={() => {
              setPaymentStep('form');
              if (onSuccess) onSuccess();
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