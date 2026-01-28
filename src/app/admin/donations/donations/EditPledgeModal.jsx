import { useState, useEffect } from 'react';
import { X, Edit, Calendar, FileText, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Edit className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Edit Pledge</h2>
                <p className="text-sm text-slate-600">
                  {pledge.campaign_title || 'General Offering'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Member</p>
              <p className="text-lg font-bold text-slate-900">{pledge.member_name}</p>
              <p className="text-xs text-slate-500">{pledge.member_email}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200 bg-green-50">
              <p className="text-xs text-slate-600 mb-1">Amount Paid (Fixed)</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(pledge.paid_amount)}
              </p>
              <p className="text-xs text-slate-500">Cannot be changed here</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200 bg-blue-50">
              <p className="text-xs text-slate-600 mb-1">Current Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                pledge.status === 'completed' ? 'bg-green-100 text-green-800' :
                pledge.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                pledge.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {pledge.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Current Progress</span>
              <span className="text-sm font-bold text-slate-900">{Math.round(currentProgress)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${Math.min(currentProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formatCurrency(pledge.paid_amount)} of {formatCurrency(pledge.pledged_amount)}
            </p>
          </div>

          {hasChanges && formData.pledged_amount !== pledge.pledged_amount && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-purple-600" />
                <p className="font-semibold text-purple-900">Preview: New Progress</p>
              </div>
              <div className="w-full h-3 bg-purple-200 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${Math.min(newProgress, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-purple-600">New Total:</span>
                  <span className="ml-1 font-bold text-purple-900">{formatCurrency(formData.pledged_amount)}</span>
                </div>
                <div>
                  <span className="text-purple-600">New Remaining:</span>
                  <span className="ml-1 font-bold text-purple-900">{formatCurrency(newRemainingAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Pledged Amount (KES) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="number"
                value={formData.pledged_amount}
                onChange={(e) => setFormData({ ...formData, pledged_amount: e.target.value })}
                min={pledge.paid_amount}
                step="0.01"
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-green-600 outline-none disabled:opacity-50"
              />
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <p className="text-slate-500">
                Original: <strong>{formatCurrency(pledge.pledged_amount)}</strong>
              </p>
              <p className="text-slate-500">
                Minimum: <strong>{formatCurrency(pledge.paid_amount)}</strong> (amount paid)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Payment Plan <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.installment_plan}
              onChange={(e) => setFormData({ ...formData, installment_plan: e.target.value })}
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-green-600 outline-none disabled:opacity-50"
            >
              <option value="lump-sum">Lump Sum (Pay all at once)</option>
              <option value="weekly">Weekly Installments</option>
              <option value="bi-weekly">Bi-Weekly Installments</option>
              <option value="monthly">Monthly Installments</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Current plan: <strong className="capitalize">{pledge.installment_plan?.replace('-', ' ')}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-green-600 outline-none disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Original due date: <strong>{formatDate(pledge.due_date)}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-slate-400" size={20} />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any special notes or comments..."
                rows={4}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-600 outline-none resize-none disabled:opacity-50"
              />
            </div>
          </div>

          {hasChanges && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Changes detected</p>
                <p>Click "Update Pledge" to save your modifications.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading || !hasChanges}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit size={20} />
                  Update Pledge
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-slate-200 text-slate-900 font-bold rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}