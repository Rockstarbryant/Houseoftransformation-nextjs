'use client';

import { useState } from 'react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency } from '@/utils/donationHelpers';
import { X, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

export default function ManualPaymentModal({ pledge, onClose, onSuccess }) {
  const [amount, setAmount] = useState(pledge.remaining_amount);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [mpesaRef, setMpesaRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // FORM HANDLERS
  // ============================================

  const validateForm = () => {
    if (!amount || amount <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    if (amount > pledge.remaining_amount) {
      setError(`Amount cannot exceed remaining balance of ${formatCurrency(pledge.remaining_amount)}`);
      return false;
    }

    if (paymentMethod === 'mpesa' && !mpesaRef.trim()) {
      setError('M-Pesa reference number is required for M-Pesa payments');
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
      console.log('[MANUAL-PAYMENT] Recording payment:', {
        pledgeId: pledge.id,
        amount: Number(amount),
        method: paymentMethod
      });

      const response = await donationApi.payments.recordManual(
        pledge.id,
        Number(amount),
        paymentMethod,
        mpesaRef.trim() || null
      );

      if (response.success) {
        console.log('[MANUAL-PAYMENT] Payment recorded successfully');
        
        // Reset form
        setAmount(pledge.remaining_amount);
        setPaymentMethod('cash');
        setMpesaRef('');
        setNotes('');

        // Notify parent
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.message || 'Failed to record payment');
      }
    } catch (err) {
      console.error('[MANUAL-PAYMENT] Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to record payment');
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="text-green-600" size={28} />
              Record Manual Payment
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Recording payment for <strong>{pledge.member_name}</strong>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Pledge Info */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Pledge Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Member:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {pledge.member_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Phone:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {pledge.member_phone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Campaign:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {pledge.campaign_title || 'General'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <span className="text-slate-600 dark:text-slate-400">Total Pledged:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(pledge.pledged_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Already Paid:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(pledge.paid_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Remaining Balance:</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(pledge.remaining_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Payment Amount (KES) *
            </label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="Enter amount"
              min="1"
              max={pledge.remaining_amount}
              step="0.01"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Maximum: {formatCurrency(pledge.remaining_amount)}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Payment Method *
            </label>
            <select 
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              disabled={isSubmitting}
            >
              <option value="cash">Cash</option>
              <option value="mpesa">M-Pesa (Manual Entry)</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="manual">Other</option>
            </select>
          </div>

          {/* M-Pesa Reference (conditional) */}
          {paymentMethod === 'mpesa' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                M-Pesa Reference Number *
              </label>
              <input 
                type="text"
                value={mpesaRef}
                onChange={(e) => {
                  setMpesaRef(e.target.value);
                  setError(null);
                }}
                placeholder="e.g., QBR3X4Y5Z6"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter the M-Pesa confirmation code
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Any additional details about this payment..."
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 outline-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Summary */}
          {amount && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <h4 className="font-bold text-green-900 dark:text-green-200">
                  Payment Summary
                </h4>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700 dark:text-green-300">Amount:</span>
                  <span className="font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 dark:text-green-300">Method:</span>
                  <span className="font-semibold text-green-900 dark:text-green-100 capitalize">
                    {paymentMethod === 'bank-transfer' ? 'Bank Transfer' : paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between border-t border-green-200 dark:border-green-700 pt-1 mt-1">
                  <span className="text-green-700 dark:text-green-300">New Balance:</span>
                  <span className="font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(pledge.remaining_amount - Number(amount))}
                  </span>
                </div>
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
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Confirm Receipt
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}