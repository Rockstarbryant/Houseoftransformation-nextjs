import { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, XCircle, DollarSign, Calendar, Receipt } from 'lucide-react';
import { donationApi } from '@/services/api/donationService';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function PledgeHistoryModal({ pledge, onClose }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const handlePrintHistory = () => {
  
  if (!payments || payments.length === 0) {
    alert('No payment history to print');
    return;
  }
  const rows = payments.map((payment, i) => `

    <tr>
      <td>${i + 1}</td>
      <td>${formatCurrency(payment.amount)}</td>
      <td>${payment.payment_method === 'mpesa' ? 'M-Pesa' : payment.payment_method}</td>
      <td>${payment.status}</td>
      <td>${formatDate(payment.created_at)}</td>
      <td>${payment.mpesa_receipt_number || 'N/A'}</td>
    </tr>
  `).join('');

  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html>
    <html><head><title>Payment History - ${pledge.campaign_title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; }
      h1 { color: #8B1A1A; border-bottom: 3px solid #8B1A1A; padding-bottom: 10px; }
      .info { background: #f8f9fa; padding: 16px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #8B1A1A; }
      .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px; }
      .info-item { margin: 8px 0; }
      .label { font-size: 12px; color: #666; }
      .value { font-size: 16px; font-weight: bold; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th { background: #8B1A1A; color: white; padding: 12px; text-align: left; font-size: 11px; }
      td { padding: 10px; border-bottom: 1px solid #ddd; font-size: 12px; }
      tr:nth-child(even) { background: #f9fafb; }
      @media print { .no-print { display: none; } }
    </style></head><body>
    <h1>Payment History</h1>
    <h3>${pledge.campaign_title || 'General Offering'}</h3>
    <div style="background: rgb(224, 30, 30); border: 1px solid rgb(134, 12, 14); padding: 12px; border-radius: 8px; margin: 16px 0;">
    <h4 style="margin: 0 0 8px 0; color: #d8eef7; font-size: 14px;">Personal Information</h4>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 13px;">
        <div><strong>Name:</strong> ${pledge.member_name}</div>
        <div><strong>Email:</strong> ${pledge.member_email}</div>
        ${pledge.member_phone ? `<div><strong>Phone:</strong> ${pledge.member_phone}</div>` : ''}
    </div>
    </div>
    <div class="info">
      <div class="info-grid">
        <div class="info-item">
          <div class="label">Total Pledged</div>
          <div class="value">${formatCurrency(pledge.pledged_amount)}</div>
        </div>
        <div class="info-item">
          <div class="label">Amount Paid</div>
          <div class="value" style="color: #059669;">${formatCurrency(pledge.paid_amount)}</div>
        </div>
        <div class="info-item">
          <div class="label">Remaining Balance</div>
          <div class="value" style="color: #dc2626;">${formatCurrency(pledge.remaining_amount)}</div>
        </div>
      </div>
      <div style="margin-top: 16px;">
        <div class="label">Progress</div>
        <div style="background: #e5e7eb; height: 8px; border-radius: 4px; margin-top: 4px;">
          <div style="background: #059669; height: 8px; border-radius: 4px; width: ${Math.round((pledge.paid_amount / pledge.pledged_amount) * 100)}%;"></div>
        </div>
      </div>
    </div>
    <h2>Payment Timeline</h2>
    <table>
      <thead>
        <tr><th>#</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Receipt</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top: 30px; text-align: center; color: #666; font-size: 13px;">
      Generated: ${new Date().toLocaleString()} | ${payments.length} payment(s) | House of Transformation Church
    </p>
    <button class="no-print" onclick="window.print()" style="position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #8B1A1A; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Print PDF</button>
    </body></html>
  `);
  win.document.close();
};



  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
  try {
    setLoading(true);
    setError(null);

    // ✅ FIX: Filter payments by pledge_id on the client side
    const response = await donationApi.payments.getAll({
      limit: 1000 // Get all payments, we'll filter client-side
    });

    if (response.success) {
      // ✅ Filter to only show payments for THIS pledge
      const pledgePayments = (response.payments || []).filter(
        payment => payment.pledge_id === pledge.id
      );
      setPayments(pledgePayments);
    }
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'success') return <CheckCircle size={18} className="text-green-600" />;
    if (status === 'failed') return <XCircle size={18} className="text-red-600" />;
    return <Clock size={18} className="text-yellow-600" />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      success: { bg: 'bg-green-100', text: 'text-green-800', label: 'Success' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' }
    };
    return badges[status] || badges.pending;
  };

  const progress = pledge.pledged_amount > 0 
    ? (pledge.paid_amount / pledge.pledged_amount) * 100 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8B1A1A] rounded-lg flex items-center justify-center">
                <Receipt className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Payment History</h2>
                <p className="text-sm text-slate-600">
                  {pledge.campaign_title || 'General Offering'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Pledge Summary */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Total Pledged</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(pledge.pledged_amount)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200 bg-green-50">
              <p className="text-xs text-slate-600 mb-1">Amount Paid</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(pledge.paid_amount)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-red-200 bg-red-50">
              <p className="text-xs text-slate-600 mb-1">Remaining Balance</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(pledge.remaining_amount)}
              </p>
            </div>
          </div>

          {/* ✅ ADD: Member Information */}
            <div className="bg-green-400 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-bold text-blue-900 mb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                <span className="text-blue-600">Name:</span>
                <span className="ml-2 font-semibold text-blue-900">{pledge.member_name}</span>
                </div>
                <div>
                <span className="text-blue-600">Email:</span>
                <span className="ml-2 font-semibold text-blue-900">{pledge.member_email}</span>
                </div>
                {pledge.member_phone && (
                <div>
                    <span className="text-blue-600">Phone:</span>
                    <span className="ml-2 font-semibold text-blue-900">{pledge.member_phone}</span>
                </div>
                )}
            </div>
            </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Progress</span>
              <span className="text-sm font-bold text-slate-900">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Pledge Info */}
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-slate-600">Pledge Date</p>
              <p className="font-semibold text-slate-900">{formatDate(pledge.created_at)}</p>
            </div>
            {pledge.due_date && (
              <div>
                <p className="text-slate-600">Due Date</p>
                <p className="font-semibold text-slate-900">{formatDate(pledge.due_date)}</p>
              </div>
            )}
            {pledge.installment_plan && pledge.installment_plan !== 'lump-sum' && (
              <div>
                <p className="text-slate-600">Payment Plan</p>
                <p className="font-semibold text-slate-900 capitalize">
                  {pledge.installment_plan.replace('-', ' ')}
                </p>
              </div>
            )}
            <div>
              <p className="text-slate-600">Status</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                pledge.status === 'completed' ? 'bg-green-100 text-green-800' :
                pledge.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                pledge.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {pledge.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Timeline */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-[#8B1A1A]" />
            Payment Timeline
          </h3>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B1A1A]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
              <Receipt size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold text-slate-900 mb-2">No payments yet</p>
              <p className="text-sm text-slate-600">
                Payment records will appear here once you make a payment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment, index) => {
                const statusBadge = getStatusBadge(payment.status);
                
                return (
                  <div
                    key={payment.id}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payment.status)}
                        <div>
                          <p className="font-bold text-slate-900 text-lg">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-slate-600">
                            Payment #{payments.length - index}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-600 flex items-center gap-1">
                          <Calendar size={14} />
                          Date
                        </p>
                        <p className="font-semibold text-slate-900">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-slate-600 flex items-center gap-1">
                          <DollarSign size={14} />
                          Method
                        </p>
                        <p className="font-semibold text-slate-900 capitalize">
                          {payment.payment_method === 'mpesa' ? 'M-Pesa' : payment.payment_method}
                        </p>
                      </div>

                      {payment.mpesa_receipt_number && (
                        <div className="col-span-2">
                          <p className="text-slate-600">M-Pesa Receipt</p>
                          <p className="font-semibold text-slate-900 font-mono text-xs">
                            {payment.mpesa_receipt_number}
                          </p>
                        </div>
                      )}

                      {payment.mpesa_phone_number && (
                        <div className="col-span-2">
                          <p className="text-slate-600">Phone Number</p>
                          <p className="font-semibold text-slate-900">
                            {payment.mpesa_phone_number}
                          </p>
                        </div>
                      )}

                      {payment.notes && (
                        <div className="col-span-2">
                          <p className="text-slate-600">Notes</p>
                          <p className="text-slate-900 text-sm">{payment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6">
        <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600">
            Total Payments: <strong className="text-slate-900">{payments.length}</strong>
            </div>
            <div className="flex gap-3">
            {/* ✅ ADD PRINT BUTTON */}
            <button
                onClick={handlePrintHistory}
                disabled={payments.length === 0}
                className="px-6 py-2 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
            </button>
            <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
            >
                Close
            </button>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}