'use client';

import { useState } from 'react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, validateKenyanPhone } from '@/utils/donationHelpers';
import { X, Smartphone, CheckCircle, AlertCircle, Zap } from 'lucide-react';

export default function MpesaModal({ pledge, onClose, onSuccess }) {
  const [phone, setPhone] = useState('254');
  const [amount, setAmount] = useState(pledge.remaining_amount);
  const [step, setStep] = useState('input'); // 'input' | 'processing' | 'waiting' | 'duplicate'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  // ============================================
  // FORM VALIDATION
  // ============================================

  const validateForm = () => {
    // Validate phone number
    if (!validateKenyanPhone(phone)) {
      setError('Invalid phone number. Format: 254XXXXXXXXX (12 digits)');
      return false;
    }

    // Validate amount
    if (!amount || amount <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    if (amount > pledge.remaining_amount) {
      setError(`Amount cannot exceed remaining balance of ${formatCurrency(pledge.remaining_amount)}`);
      return false;
    }

    return true;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    const cleaned = value.replace(/\D/g, '');
    setPhone(cleaned);
    setError(null);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setError(null);
  };

  // ============================================
  // SUBMIT PAYMENT
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setStep('processing');

    try {
      console.log('[MPESA-MODAL] Initiating payment:', {
        pledgeId: pledge.id,
        amount: Number(amount),
        phone
      });

      const response = await donationApi.payments.initiateMpesa(
        pledge.id,
        Number(amount),
        phone
      );

      if (response.success) {
        // ✅ FIXED: Handle duplicate request properly
        if (response.isDuplicate) {
          console.log('[MPESA-MODAL] Duplicate request detected');
          setDuplicateInfo({
            paymentId: response.paymentId,
            status: response.status
          });
          setStep('duplicate');
          
          // Auto-close after showing duplicate message
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 3000);
        } else {
          console.log('[MPESA-MODAL] Payment initiated successfully');
          setStep('waiting');
          
          // Auto-close after 10 seconds and refresh parent
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 10000);
        }
      } else {
        setError(response.message || 'Failed to initiate payment');
        setStep('input');
      }
    } catch (err) {
      console.error('[MPESA-MODAL] Error:', err);
      
      // ✅ FIXED: Better error message extraction
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'Failed to initiate M-Pesa payment';
      
      setError(errorMessage);
      setStep('input');
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
  // RENDER - INPUT STEP
  // ============================================

  if (step === 'input') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl">
          
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="text-green-600" size={28} />
                Pay via M-Pesa
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Campaign: <strong>{pledge.campaign_title || 'General Offering'}</strong>
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Close"
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Pledge Info */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Total Pledged:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(pledge.pledged_amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Already Paid:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(pledge.paid_amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-2">
                <span className="text-slate-600 dark:text-slate-400">Remaining Balance:</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(pledge.remaining_amount)}
                </span>
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                M-Pesa Phone Number *
              </label>
              <input 
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="254712345678"
                maxLength="12"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none"
                required
                disabled={isSubmitting}
                aria-label="M-Pesa Phone Number"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Format: 254XXXXXXXXX (12 digits)
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Amount (KES) *
              </label>
              <input 
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="1000"
                min="1"
                max={pledge.remaining_amount}
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none"
                required
                disabled={isSubmitting}
                aria-label="Payment Amount"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Maximum: {formatCurrency(pledge.remaining_amount)}
              </p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending STK Push...
                </>
              ) : (
                <>
                  <Smartphone size={20} />
                  Send Payment Prompt
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full text-slate-600 dark:text-slate-400 text-sm hover:text-slate-900 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - PROCESSING STEP
  // ============================================

  if (step === 'processing') {
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
  // RENDER - DUPLICATE REQUEST STEP
  // ============================================

  if (step === 'duplicate') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
          
          {/* Duplicate Icon */}
          <div className="mb-6">
            <div className="animate-pulse">
              <Zap className="mx-auto text-yellow-500" size={64} />
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Payment Already Initiated
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This payment request was already processed. Please check your payment history.
            </p>
            {duplicateInfo && (
              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-left">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Payment ID:</strong> {duplicateInfo.paymentId}
                </p>
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Status:</strong> {duplicateInfo.status}
                </p>
              </div>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            This window will close automatically in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - WAITING STEP
  // ============================================

  if (step === 'waiting') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
          
          {/* Success Icon */}
          <div className="mb-6">
            <div className="animate-bounce">
              <Smartphone className="mx-auto text-green-600" size={64} />
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Check your phone!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We've sent an M-Pesa payment prompt to <strong className="text-slate-900 dark:text-white">{phone}</strong>
            </p>
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                ✓ Enter your M-Pesa PIN to complete the payment
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">Amount:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Phone:</span>
              <span className="font-bold text-slate-900 dark:text-white">{phone}</span>
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Your payment will be processed within a few seconds. This window will close automatically.
          </p>

          {/* Done Button */}
          <button
            onClick={() => {
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