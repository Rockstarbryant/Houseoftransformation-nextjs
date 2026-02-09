// components/donations/PledgeHistoryModal.jsx
// ✅ MODERN TIMELINE DESIGN - Clean, Responsive, Professional
// All logic, print generation, and data filtering strictly preserved.

import { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Calendar, 
  Receipt, 
  Printer, 
  User, 
  Smartphone, 
  Mail, 
  Phone,
  ArrowRight,
  History
} from 'lucide-react';
import { donationApi } from '@/services/api/donationService';

// ==========================================
// HELPERS (UNCHANGED)
// ==========================================
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
  // ==========================================
  // STATE & LOGIC (UNCHANGED)
  // ==========================================
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

      // Filter payments by pledge_id on the client side (Logic Preserved)
      const response = await donationApi.payments.getAll({
        limit: 1000 
      });

      if (response.success) {
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
    if (status === 'success') return <CheckCircle size={16} className="text-white" />;
    if (status === 'failed') return <XCircle size={16} className="text-white" />;
    return <Clock size={16} className="text-white" />;
  };

  const getStatusColor = (status) => {
    if (status === 'success') return 'bg-emerald-500 border-emerald-200';
    if (status === 'failed') return 'bg-red-500 border-red-200';
    return 'bg-amber-500 border-amber-200';
  };

  const progress = pledge.pledged_amount > 0 
    ? (pledge.paid_amount / pledge.pledged_amount) * 100 
    : 0;

  return (
    // OVERLAY
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      
      {/* MODAL CONTAINER */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* 1. HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">History & Receipts</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pledge.campaign_title || 'General Offering'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/30">
          <div className="p-6 space-y-8">
            
            {/* TOP SECTION: SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Pledged */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <DollarSign size={48} />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Goal</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(pledge.pledged_amount)}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <Calendar size={12} />
                  <span>Created: {formatDate(pledge.created_at)}</span>
                </div>
              </div>

              {/* Card 2: Paid */}
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(pledge.paid_amount)}</p>
                <div className="mt-3 w-full bg-emerald-200/50 dark:bg-emerald-900/50 rounded-full h-1.5">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(progress, 100)}%` }} 
                  />
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 text-right">{Math.round(progress)}% Complete</p>
              </div>

              {/* Card 3: Balance */}
              <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 shadow-sm">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Remaining</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{formatCurrency(pledge.remaining_amount)}</p>
                <div className="mt-3 inline-flex items-center px-2 py-1 rounded-md bg-white dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800">
                   <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                     {pledge.status}
                   </span>
                </div>
              </div>
            </div>

            {/* MEMBER STRIP */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
               <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                 <User size={20} />
               </div>
               <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="flex flex-col">
                   <span className="text-[10px] text-slate-400 uppercase font-semibold">Member Name</span>
                   <span className="text-sm font-semibold text-slate-900 dark:text-white">{pledge.member_name}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1"><Mail size={10} /> Email</span>
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{pledge.member_email}</span>
                 </div>
                 {pledge.member_phone && (
                   <div className="flex flex-col">
                     <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1"><Phone size={10} /> Phone</span>
                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{pledge.member_phone}</span>
                   </div>
                 )}
               </div>
            </div>

            {/* TIMELINE SECTION */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Receipt size={16} className="text-slate-400" />
                Transaction Timeline
              </h3>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-b-slate-600 mb-2"></div>
                  <p className="text-xs text-slate-500">Loading records...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm text-center border border-red-100">
                  {error}
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Receipt size={24} />
                  </div>
                  <p className="text-slate-900 dark:text-white font-medium">No payments recorded</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This pledge has no transaction history yet.</p>
                </div>
              ) : (
                <div className="relative pl-4 sm:pl-8 space-y-0">
                  {/* Vertical Line */}
                  <div className="absolute left-4 sm:left-8 top-2 bottom-6 w-px bg-slate-200 dark:bg-slate-700 transform -translate-x-1/2"></div>
                  
                  {payments.map((payment, index) => {
                    const isMpesa = payment.payment_method === 'mpesa';
                    
                    return (
                      <div key={payment.id} className="relative pb-8 last:pb-0 pl-6 sm:pl-8 group">
                        {/* Status Dot */}
                        <div className={`absolute left-0 sm:left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-950 z-10 transform -translate-x-1/2 ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                        </div>

                        {/* Card Content */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow group-hover:border-slate-300 dark:group-hover:border-slate-600">
                          
                          {/* Row 1: Main Info */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-slate-900 dark:text-white">
                                  {formatCurrency(payment.amount)}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
                                  ${payment.status === 'success' ? 'bg-green-100 text-green-700' : 
                                    payment.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {payment.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Clock size={12} />
                                {formatDate(payment.created_at)}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                                {isMpesa ? <Smartphone size={12} className="text-green-600" /> : <DollarSign size={12} className="text-slate-500" />}
                                {isMpesa ? 'M-Pesa' : 'Cash / Bank'}
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Metadata (M-Pesa specific or Notes) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            {isMpesa && (
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                                  <Receipt size={14} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Ref Code</span>
                                  <span className="text-xs font-mono font-medium text-slate-900 dark:text-white">{payment.mpesa_receipt_number || 'N/A'}</span>
                                </div>
                              </div>
                            )}

                             {isMpesa && payment.mpesa_phone_number && (
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                                  <Phone size={14} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Sender</span>
                                  <span className="text-xs font-mono font-medium text-slate-900 dark:text-white">{payment.mpesa_phone_number}</span>
                                </div>
                              </div>
                            )}
                            
                            {payment.notes && (
                              <div className="col-span-1 sm:col-span-2 text-xs bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-200 p-2 rounded-md border border-amber-100 dark:border-amber-900/20 mt-1">
                                <span className="font-bold">Note:</span> {payment.notes}
                              </div>
                            )}
                          </div>
                          
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 3. FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
           <div className="text-xs text-slate-500 hidden sm:block">
             Showing <strong className="text-slate-900 dark:text-white">{payments.length}</strong> transactions
           </div>
           
           <div className="flex w-full sm:w-auto gap-3">
             <button
               onClick={onClose}
               className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
             >
               Close
             </button>
             <button
               onClick={handlePrintHistory}
               disabled={payments.length === 0}
               className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200 dark:shadow-none"
             >
               <Printer size={16} />
               <span>Print History</span>
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}