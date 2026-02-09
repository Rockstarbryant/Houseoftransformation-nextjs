// components/donations/ManualPaymentModal.jsx
// ✅ MODERN DASHBOARD REDESIGN - Clean, Flat, Professional
// All original logic and data bindings preserved.

'use client';

import { useState } from 'react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency } from '@/utils/donationHelpers';
import { 
  X, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  CreditCard, 
  Wallet, 
  Banknote,
  Building2,
  Smartphone,
  ArrowRight
} from 'lucide-react';

export default function ManualPaymentModal({ pledge, onClose, onSuccess }) {
  // ============================================
  // STATE & LOGIC (UNCHANGED)
  // ============================================
  const [amount, setAmount] = useState(pledge.remaining_amount);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [mpesaRef, setMpesaRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

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
      const errorMessage = err.response?.data?.message || err.message || 'Failed to record payment';
      setError(errorMessage);
      if (errorMessage.includes('duplicate') || errorMessage.includes('already been recorded')) {
        setIsDuplicate(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  // Helper to calculate new balance for display
  const newBalance = Math.max(0, pledge.remaining_amount - (Number(amount) || 0));

  return (
    // OVERLAY
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* MODAL CONTAINER */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* 1. HEADER - Clean & Simple */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400">
                <Wallet size={18} />
              </div>
              Record Payment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Member: <span className="font-semibold text-slate-700 dark:text-slate-300">{pledge.member_name}</span>
            </p>
          </div>
          <button 
            onClick={handleClose} 
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. SCROLLABLE CONTENT */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Context Stats Card */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
            <div className="text-center border-r border-slate-200 dark:border-slate-700">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Pledged</p>
              <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white">{formatCurrency(pledge.pledged_amount)}</p>
            </div>
            <div className="text-center border-r border-slate-200 dark:border-slate-700">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Paid</p>
              <p className="text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(pledge.paid_amount)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Balance</p>
              <p className="text-sm md:text-base font-bold text-amber-600 dark:text-amber-400">{formatCurrency(pledge.remaining_amount)}</p>
            </div>
          </div>

          {/* ALERTS */}
          {error && (
            <div className={`p-4 rounded-lg flex items-start gap-3 text-sm ${
              isDuplicate 
                ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200' 
                : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
            }`}>
              {isDuplicate ? <Zap size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form id="payment-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Amount Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Amount
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <DollarSign size={16} />
                </div>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  placeholder="0.00"
                  min="1"
                  max={pledge.remaining_amount}
                  step="0.01"
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white font-semibold outline-none transition-all disabled:opacity-60"
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-slate-500">Max: {formatCurrency(pledge.remaining_amount)}</p>
                {amount > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    New Balance: {formatCurrency(newBalance)}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'cash', label: 'Cash', icon: Banknote },
                  { id: 'mpesa', label: 'M-Pesa', icon: Smartphone },
                  { id: 'bank_transfer', label: 'Bank', icon: Building2 },
                ].map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setPaymentMethod(method.id);
                        setError(null);
                        if (method.id !== 'mpesa') setMpesaRef('');
                      }}
                      className={`
                        flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all
                        ${isSelected 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 ring-1 ring-emerald-500' 
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300'}
                      `}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-semibold">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditional M-Pesa Input */}
            {paymentMethod === 'mpesa' && (
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/50 animate-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  M-Pesa Reference <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={mpesaRef}
                  onChange={(e) => {
                    setMpesaRef(e.target.value.toUpperCase());
                    setError(null);
                    setIsDuplicate(false);
                  }}
                  placeholder="e.g. QBR3X4Y5Z6"
                  maxLength="15"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white font-mono uppercase tracking-wide outline-none"
                />
              </div>
            )}

            {/* Notes Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                placeholder="Add any relevant details..."
                disabled={isSubmitting}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white text-sm outline-none resize-none"
              />
            </div>

          </form>
        </div>

        {/* 3. FOOTER - Sticky Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-end shrink-0">
          <button 
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            form="payment-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm Receipt
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
}