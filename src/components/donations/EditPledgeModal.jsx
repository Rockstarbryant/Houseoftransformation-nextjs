// components/donations/EditPledgeModal.jsx
// ✅ MODERN DASHBOARD REDESIGN - Clean, Flat, Responsive
// All original logic and data bindings preserved.

import { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Calendar, 
  FileText, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  User,
  CheckCircle,
  Lock,
  ArrowRight,
  PieChart
} from 'lucide-react';

// ==========================================
// HELPERS (UNCHANGED)
// ==========================================
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
};

export default function EditPledgeModal({ pledge, onClose, onSuccess }) {
  // ==========================================
  // STATE & LOGIC (UNCHANGED)
  // ==========================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    pledged_amount: pledge?.pledged_amount || 0,
    installment_plan: pledge?.installment_plan || 'lump-sum',
    due_date: formatDate(pledge?.due_date) || '',
    notes: pledge?.notes || ''
  });

  useEffect(() => {
    if (pledge) {
      setFormData({
        pledged_amount: pledge.pledged_amount || 0,
        installment_plan: pledge.installment_plan || 'lump-sum',
        due_date: formatDate(pledge.due_date) || '',
        notes: pledge.notes || ''
      });
    }
  }, [pledge]);

  const handleSubmit = async () => {
    setError(null);

    if (!formData.pledged_amount || formData.pledged_amount <= 0) {
      setError('Pledged amount must be greater than 0');
      return;
    }

    if (formData.pledged_amount < pledge.paid_amount) {
      setError(`New pledged amount (${formatCurrency(formData.pledged_amount)}) cannot be less than amount already paid (${formatCurrency(pledge.paid_amount)})`);
      return;
    }

    if (!formData.installment_plan) {
      setError('Payment plan is required');
      return;
    }

    if (!formData.due_date) {
      setError('Due date is required');
      return;
    }

    const selectedDate = new Date(formData.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Due date cannot be in the past');
      return;
    }

    try {
      setLoading(true);
      // Dynamic import preserved from original logic
      const { donationApi } = await import('@/services/api/donationService');

      const response = await donationApi.pledges.update(pledge.id, {
        pledged_amount: parseFloat(formData.pledged_amount),
        installment_plan: formData.installment_plan,
        due_date: formData.due_date,
        notes: formData.notes
      });

      if (response.success) {
        onSuccess?.();
      } else {
        setError(response.message || 'Failed to update pledge');
      }
    } catch (err) {
      console.error('Update pledge error:', err);
      setError(err.response?.data?.message || 'Failed to update pledge');
    } finally {
      setLoading(false);
    }
  };

  if (!pledge) return null;

  // Calculations for UI (Preserved)
  const newRemainingAmount = formData.pledged_amount - pledge.paid_amount;
  const newProgress = formData.pledged_amount > 0 
    ? (pledge.paid_amount / formData.pledged_amount) * 100 
    : 0;

  const currentProgress = pledge.pledged_amount > 0 
    ? (pledge.paid_amount / pledge.pledged_amount) * 100 
    : 0;

  const hasChanges = formData.pledged_amount !== pledge.pledged_amount ||
                     formData.installment_plan !== pledge.installment_plan ||
                     formatDate(formData.due_date) !== formatDate(pledge.due_date) ||
                     formData.notes !== pledge.notes;

  return (
    // OVERLAY
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      
      {/* MODAL CONTAINER */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* 1. HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400">
                <Edit3 size={18} />
              </div>
              Edit Pledge
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Campaign: <span className="font-semibold text-slate-700 dark:text-slate-300">{pledge.campaign_title || 'General Offering'}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. SCROLLABLE BODY */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* INFO GRID (IMMUTABLE DATA) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Member */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-slate-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Member</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{pledge.member_name}</p>
              <p className="text-[10px] text-slate-500 truncate">{pledge.member_email}</p>
            </div>

            {/* Paid Amount (Fixed) */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Paid (Fixed)</span>
              </div>
              <p className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">{formatCurrency(pledge.paid_amount)}</p>
            </div>

            {/* Status */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/50 flex flex-col justify-center">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Status</span>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                  ${pledge.status === 'completed' ? 'bg-green-100 text-green-700' :
                    pledge.status === 'partial' ? 'bg-blue-100 text-blue-700' :
                    pledge.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'}
                `}>
                  {pledge.status}
                </span>
              </div>
            </div>
          </div>

          {/* VISUALIZATION SECTION */}
          <div className="space-y-4">
             {/* Current State */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-400">Current Progress</span>
                <span className="font-bold text-slate-900 dark:text-white">{Math.round(currentProgress)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-400 dark:bg-slate-500 transition-all duration-500"
                  style={{ width: `${Math.min(currentProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* Simulated State (Only if changes) */}
            {hasChanges && formData.pledged_amount !== pledge.pledged_amount && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3 animate-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">New Projected Progress</p>
                </div>
                
                <div className="h-2 w-full bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min(newProgress, 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-indigo-600 dark:text-indigo-400 block">New Total Goal</span>
                    <span className="font-bold text-indigo-900 dark:text-white text-sm">{formatCurrency(formData.pledged_amount)}</span>
                  </div>
                  <div>
                    <span className="text-indigo-600 dark:text-indigo-400 block">Remaining Balance</span>
                    <span className="font-bold text-indigo-900 dark:text-white text-sm">{formatCurrency(newRemainingAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={18} />
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          )}

          {/* FORM FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Amount */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Total Pledged Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <DollarSign size={18} />
                </div>
                <input
                  type="number"
                  value={formData.pledged_amount}
                  onChange={(e) => setFormData({ ...formData, pledged_amount: e.target.value })}
                  min={pledge.paid_amount}
                  step="0.01"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white font-semibold outline-none transition-all disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5 flex justify-between">
                <span>Original: {formatCurrency(pledge.pledged_amount)}</span>
                <span>Min: {formatCurrency(pledge.paid_amount)}</span>
              </p>
            </div>

            {/* Payment Plan */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Plan <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <PieChart size={18} />
                </div>
                <select
                  value={formData.installment_plan}
                  onChange={(e) => setFormData({ ...formData, installment_plan: e.target.value })}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white appearance-none outline-none transition-all disabled:opacity-50"
                >
                  <option value="lump-sum">Lump Sum (One-time)</option>
                  <option value="weekly">Weekly Installments</option>
                  <option value="bi-weekly">Bi-Weekly Installments</option>
                  <option value="monthly">Monthly Installments</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Target Due Date <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Calendar size={18} />
                </div>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Notes / Comments
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <FileText size={18} />
                </div>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special arrangements..."
                  rows={3}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 outline-none resize-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

          </div>
        </div>

        {/* 3. FOOTER - Sticky Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row gap-3 justify-end shrink-0">
           {hasChanges && (
            <div className="hidden sm:flex items-center gap-2 mr-auto text-xs text-slate-500">
              <AlertCircle size={14} />
              <span>Unsaved changes</span>
            </div>
          )}
          
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || !hasChanges}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                Save Changes
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}