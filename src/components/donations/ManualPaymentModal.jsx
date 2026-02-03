// components/donations/ManualPaymentModal.jsx
// ✅ MODERN REDESIGN - Fully responsive (PC & Mobile) with ALL logic preserved

'use client';

import { useState } from 'react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency } from '@/utils/donationHelpers';
import { X, DollarSign, CheckCircle, AlertCircle, Zap, TrendingUp, CreditCard, Wallet } from 'lucide-react';

export default function ManualPaymentModal({ pledge, onClose, onSuccess }) {
  const [amount, setAmount] = useState(pledge.remaining_amount);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [mpesaRef, setMpesaRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  // ============================================
  // VALIDATION (ALL ORIGINAL LOGIC PRESERVED)
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
      setError('M-Pesa reference number is required');
      return false;
    }

    // ✅ Validate M-Pesa reference format
    if (paymentMethod === 'mpesa' && mpesaRef.trim()) {
      if (mpesaRef.trim().length < 10) {
        setError('Invalid M-Pesa reference format (minimum 10 characters)');
        return false;
      }

      if (!/^[A-Z0-9]+$/i.test(mpesaRef.trim())) {
        setError('M-Pesa reference must be alphanumeric');
        return false;
      }
    }

    return true;
  };

  // ============================================
  // SUBMIT (ALL ORIGINAL LOGIC PRESERVED)
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setIsDuplicate(false);

    try {
      console.log('[MANUAL-PAYMENT] Recording payment:', {
        pledgeId: pledge.id,
        amount: Number(amount),
        method: paymentMethod,
        mpesaRef: paymentMethod === 'mpesa' ? mpesaRef : null
      });

      const response = await donationApi.payments.recordManual(
        pledge.id,
        Number(amount),
        paymentMethod,
        mpesaRef.trim() || null,
        notes.trim() || null
      );

      if (response.success) {
        console.log('[MANUAL-PAYMENT] Payment recorded successfully');
        
        // ✅ Handle duplicate receipt detection
        if (response.details?.existingPaymentId) {
          setIsDuplicate(true);
          setError(`This M-Pesa receipt has already been used (Payment ID: ${response.details.existingPaymentId})`);
          setTimeout(() => {
            setIsSubmitting(false);
          }, 2000);
          return;
        }
        
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to record payment');
      }
    } catch (err) {
      console.error('[MANUAL-PAYMENT] Error:', err);
      
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'Failed to record payment';
      
      setError(errorMessage);
      
      if (errorMessage.includes('duplicate') || errorMessage.includes('already been recorded')) {
        setIsDuplicate(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        {/* HERO HEADER - Gradient */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 text-white p-6 md:p-8 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10">
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-0 right-0 p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>

            {/* Title */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                  <DollarSign size={28} />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black">Record Manual Payment</h3>
                  <p className="text-white/80 text-sm md:text-base mt-1">
                    For <strong>{pledge.member_name}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-white/70 text-xs mb-1">Total Pledged</p>
                  <p className="text-lg md:text-xl font-black">{formatCurrency(pledge.pledged_amount)}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs mb-1">Already Paid</p>
                  <p className="text-lg md:text-xl font-black text-emerald-300">{formatCurrency(pledge.paid_amount)}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs mb-1">Balance Due</p>
                  <p className="text-lg md:text-xl font-black text-orange-300">{formatCurrency(pledge.remaining_amount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        <div className="max-h-[calc(90vh-350px)] overflow-y-auto">
          {/* Duplicate Notice */}
          {isDuplicate && (
            <div className="mx-4 md:mx-6 mt-4 md:mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
              <div className="p-2 bg-amber-200 dark:bg-amber-800 rounded-xl">
                <Zap className="text-amber-700 dark:text-amber-200" size={20} />
              </div>
              <p className="text-amber-900 dark:text-amber-100 text-sm font-bold">
                Duplicate M-Pesa receipt detected
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-4 md:mx-6 mt-4 md:mt-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
              <div className="p-2 bg-red-200 dark:bg-red-800 rounded-xl">
                <AlertCircle className="text-red-700 dark:text-red-200" size={20} />
              </div>
              <p className="text-red-900 dark:text-red-100 text-sm font-bold flex-1">{error}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
            
            {/* Amount Input */}
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                Payment Amount (KES) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
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
                  className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-bold text-lg transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 ml-1">
                Maximum: <span className="font-bold text-emerald-600">{formatCurrency(pledge.remaining_amount)}</span>
              </p>
            </div>

            {/* Payment Method */}
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" />
                Payment Method *
              </label>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {[
                  { value: 'cash', label: 'Cash', icon: '💵', color: 'emerald' },
                  { value: 'mpesa', label: 'M-Pesa', icon: '📱', color: 'green' },
                  { value: 'bank_transfer', label: 'Bank', icon: '🏦', color: 'blue' }
                ].map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method.value);
                      setError(null);
                      if (method.value !== 'mpesa') {
                        setMpesaRef('');
                      }
                    }}
                    className={`p-3 md:p-4 rounded-xl border-2 transition-all text-center ${
                      paymentMethod === method.value
                        ? `border-${method.color}-500 bg-${method.color}-50 dark:bg-${method.color}-950/30`
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <div className={`text-xs font-bold ${
                      paymentMethod === method.value
                        ? `text-${method.color}-700 dark:text-${method.color}-300`
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {method.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* M-Pesa Reference (conditional) */}
            {paymentMethod === 'mpesa' && (
              <div className="animate-in slide-in-from-top duration-300">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 md:p-6">
                  <label className="block text-sm font-bold text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-green-200 dark:bg-green-800 rounded-lg">
                      <Wallet size={16} />
                    </div>
                    M-Pesa Reference Number *
                  </label>
                  <input 
                    type="text"
                    value={mpesaRef}
                    onChange={(e) => {
                      setMpesaRef(e.target.value.toUpperCase());
                      setError(null);
                      setIsDuplicate(false);
                    }}
                    placeholder="e.g., QBR3X4Y5Z6"
                    maxLength="15"
                    className="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-green-300 dark:border-green-700 bg-white dark:bg-green-950/50 text-slate-900 dark:text-white placeholder-green-400 dark:placeholder-green-600 focus:ring-2 focus:ring-green-500 outline-none uppercase font-mono font-bold text-lg"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-green-700 dark:text-green-300 mt-2 flex items-center gap-2">
                    <CheckCircle size={14} />
                    Receipt will be verified with M-Pesa API
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Notes (Optional)
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Any additional details..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Summary */}
            {amount > 0 && (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 md:p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-200 dark:bg-emerald-800 rounded-xl">
                    <CheckCircle className="text-emerald-700 dark:text-emerald-200" size={20} />
                  </div>
                  <h4 className="font-black text-emerald-900 dark:text-emerald-100 text-lg">Payment Summary</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Payment Amount:</span>
                    <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-emerald-200 dark:border-emerald-800">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">New Balance:</span>
                    <span className="text-xl font-black text-emerald-900 dark:text-emerald-100">
                      {formatCurrency(Math.max(0, pledge.remaining_amount - Number(amount)))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* FOOTER - Sticky */}
        <div className="sticky bottom-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 md:py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button 
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 md:py-4 rounded-xl font-black shadow-2xl shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
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
        </div>
      </div>
    </div>
  );
}