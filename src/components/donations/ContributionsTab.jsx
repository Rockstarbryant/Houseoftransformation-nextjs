'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDate, getStatusBadge } from '@/utils/donationHelpers';
import { Eye, CheckCircle, Download, Filter, Search, DollarSign, X, Printer, Pencil, Trash2, AlertTriangle, AlertCircle, Info, TrendingUp } from 'lucide-react';
import ContributionDetailsModal from './ContributionDetailsModal';

// ✅ Gemini's Beautiful Confirmation Dialog
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText = 'Confirm', isLoading = false }) {
  if (!isOpen) return null;

  const typeStyles = {
    warning: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-900/10 text-rose-600 border-rose-200 dark:border-rose-800',
    info: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 border-blue-200 dark:border-blue-800'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/60 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className={`p-8 flex flex-col items-center text-center ${typeStyles[type]} border-b`}>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm mb-4">
            {type === 'danger' ? <Trash2 size={32} /> : type === 'warning' ? <AlertTriangle size={32} /> : <Info size={32} />}
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{message}</p>
        </div>
        <div className="p-6 flex gap-3">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 ${
              type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90'
            }`}
          >
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ Gemini's Beautiful Alert Component
function Alert({ message, type = 'success', onClose }) {
  if (!message) return null;
  
  const styles = {
    success: 'bg-emerald-500 text-white border-emerald-400',
    error: 'bg-rose-500 text-white border-rose-400'
  };
  
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-5 duration-300 ${styles[type]}`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <p className="font-bold">{message}</p>
      <button onClick={onClose} className="ml-4 hover:rotate-90 transition-transform"><X size={18} /></button>
    </div>
  );
}

export default function ContributionsTab() {
  const queryClient = useQueryClient();
  
  // ============================================
  // STATE (ALL PRESERVED)
  // ============================================
  const [selectedContributions, setSelectedContributions] = useState(new Set());
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, contributionId: null });
  const [alertMessage, setAlertMessage] = useState({ message: null, type: 'success' });
  
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    campaignId: '',
    searchTerm: ''
  });

  // ============================================
  // FETCH DATA WITH TANSTACK QUERY (ALL PRESERVED)
  // ============================================
  const { data: allContributions = [], isLoading } = useQuery({
    queryKey: ['contributions'],
    queryFn: async () => {
      const response = await donationApi.contributions.getAll({ limit: 1000 });
      console.log('[CONTRIBUTIONS] Fetched data:', response);
      if (response.success) {
        return response.contributions || [];
      }
      throw new Error('Failed to load contributions');
    },
    staleTime: 30000,
    placeholderData: [],
    refetchOnWindowFocus: true,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await donationApi.campaigns.getAll();
      if (response.success) {
        return response.campaigns || [];
      }
      return [];
    },
    staleTime: 60000,
    placeholderData: [],
  });

  // ============================================
  // CLIENT-SIDE FILTERING (ALL PRESERVED)
  // ============================================
  const filteredContributions = useMemo(() => {
    let filtered = [...allContributions];

    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter(c => c.payment_method === filters.paymentMethod);
    }

    if (filters.campaignId) {
      filtered = filtered.filter(c => c.campaign_id === filters.campaignId);
    }

    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.contributor_name?.toLowerCase().includes(search) ||
        c.contributor_email?.toLowerCase().includes(search) ||
        c.contributor_phone?.includes(search) ||
        c.campaign_title?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [allContributions, filters]);

  // ============================================
  // STATISTICS (ALL PRESERVED)
  // ============================================
  const stats = useMemo(() => {
    const verified = filteredContributions.filter(c => c.status === 'verified');
    
    const byMethod = {
      mpesa: 0,
      cash: 0,
      bank_transfer: 0
    };
    
    verified.forEach(c => {
      const method = c.payment_method || 'cash';
      byMethod[method] = (byMethod[method] || 0) + Number(c.amount || 0);
    });

    const byCampaign = {};
    verified.forEach(c => {
      const title = c.campaign_title || 'General Offering';
      if (!byCampaign[title]) {
        byCampaign[title] = 0;
      }
      byCampaign[title] += Number(c.amount || 0);
    });

    return {
      total: verified.reduce((sum, c) => sum + Number(c.amount || 0), 0),
      count: {
        verified: allContributions.filter(c => c.status === 'verified').length,
        pending: allContributions.filter(c => c.status === 'pending').length,
        failed: allContributions.filter(c => c.status === 'failed').length
      },
      byMethod,
      byCampaign
    };
  }, [allContributions, filteredContributions]);

  // ============================================
  // MUTATIONS (ALL PRESERVED)
  // ============================================
  const verifyMutation = useMutation({
    mutationFn: (contributionId) => donationApi.contributions.verify(contributionId),
    onMutate: async (contributionId) => {
      await queryClient.cancelQueries({ queryKey: ['contributions'] });
      const previousContributions = queryClient.getQueryData(['contributions']);
      
      queryClient.setQueryData(['contributions'], (old) =>
        old.map(c => c.id === contributionId ? { ...c, status: 'verified' } : c)
      );
      
      return { previousContributions };
    },
    onSuccess: (response, contributionId) => {
      console.log('[CONTRIBUTIONS] Verify response:', response);
      
      if (response.success && response.contribution) {
        queryClient.setQueryData(['contributions'], (old) =>
          old.map(c => c.id === contributionId ? response.contribution : c)
        );
        
        showAlert('Contribution verified successfully', 'success');
        console.log('[CONTRIBUTIONS] ✅ Local state updated');
      } else {
        showAlert(response.message || 'Failed to verify contribution', 'error');
      }
    },
    onError: (error, contributionId, context) => {
      queryClient.setQueryData(['contributions'], context.previousContributions);
      console.error('[CONTRIBUTIONS] Verify error:', error);
      showAlert(error.response?.data?.message || 'Failed to verify contribution', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (contributionId) => donationApi.contributions.delete(contributionId),
    onMutate: async (contributionId) => {
      await queryClient.cancelQueries({ queryKey: ['contributions'] });
      const previousContributions = queryClient.getQueryData(['contributions']);
      
      queryClient.setQueryData(['contributions'], (old) =>
        old.filter(c => c.id !== contributionId)
      );
      
      return { previousContributions };
    },
    onSuccess: () => {
      showAlert('Contribution deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
    },
    onError: (error, contributionId, context) => {
      queryClient.setQueryData(['contributions'], context.previousContributions);
      showAlert(error.response?.data?.message || 'Failed to delete contribution', 'error');
    },
  });

  // ============================================
  // HANDLERS (ALL PRESERVED)
  // ============================================
  const showAlert = (message, type = 'success') => {
    setAlertMessage({ message, type });
    setTimeout(() => setAlertMessage({ message: null, type: 'success' }), 5000);
  };

  const handleVerify = (contributionId) => {
    setConfirmDialog({
      isOpen: true,
      action: 'verify',
      contributionId,
      title: 'Verify Contribution',
      message: 'Verify this contribution? This will mark it as confirmed.',
      type: 'warning'
    });
  };

  const handleDelete = (contributionId) => {
    setConfirmDialog({
      isOpen: true,
      action: 'delete',
      contributionId,
      title: 'Delete Contribution',
      message: 'Are you sure you want to delete this contribution? This cannot be undone.',
      type: 'danger'
    });
  };

  const handleConfirmAction = () => {
    const { action, contributionId } = confirmDialog;
    
    switch (action) {
      case 'verify':
        verifyMutation.mutate(contributionId);
        break;
      case 'delete':
        deleteMutation.mutate(contributionId);
        break;
    }
    
    setConfirmDialog({ isOpen: false, action: null, contributionId: null });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedContributions(new Set(filteredContributions.map(c => c.id)));
    } else {
      setSelectedContributions(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedContributions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedContributions(newSelected);
  };

  const handlePrint = () => {
    const dataToPrint = selectedContributions.size > 0
      ? filteredContributions.filter(c => selectedContributions.has(c.id))
      : filteredContributions;

    if (dataToPrint.length === 0) {
      showAlert('No data to print', 'error');
      return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Contributions Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #1e293b; }
            .meta { text-align: center; color: #64748b; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 14px; }
            th { background-color: #f1f5f9; font-weight: 600; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .total { margin-top: 20px; font-size: 18px; font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <h1>Contributions Report</h1>
          <div class="meta">
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
            Total Records: ${dataToPrint.length}
          </div>
          <table>
            <thead>
              <tr>
                <th>Contributor</th>
                <th>Campaign</th>
                <th>Amount</th>
                <th>Method</th>
                <th>M-Pesa Ref</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${dataToPrint.map(c => `
                <tr>
                  <td>${c.is_anonymous ? 'Anonymous' : c.contributor_name}</td>
                  <td>${c.campaign_title || 'General'}</td>
                  <td><strong>KES ${Number(c.amount || 0).toLocaleString()}</strong></td>
                  <td>${(c.payment_method || 'cash').toUpperCase()}</td>
                  <td>${c.mpesa_ref || 'N/A'}</td>
                  <td>${c.status.toUpperCase()}</td>
                  <td>${new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total Amount: KES ${dataToPrint.reduce((sum, c) => sum + Number(c.amount || 0), 0).toLocaleString()}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const handleExport = () => {
    const dataToPrint = selectedContributions.size > 0
      ? filteredContributions.filter(c => selectedContributions.has(c.id))
      : filteredContributions;

    if (dataToPrint.length === 0) {
      showAlert('No data to export', 'error');
      return;
    }

    const headers = ['Contributor', 'Campaign', 'Amount', 'Method', 'M-Pesa Ref', 'Status', 'Date'];
    const csvRows = dataToPrint.map(c => [
      c.is_anonymous ? 'Anonymous' : c.contributor_name,
      c.campaign_title || 'General',
      c.amount,
      c.payment_method || 'cash',
      c.mpesa_ref || '',
      c.status,
      new Date(c.created_at).toLocaleDateString()
    ]);

    const csv = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contributions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ============================================
  // RENDER (Gemini Styling + All Features)
  // ============================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {alertMessage.message && (
        <Alert 
          message={alertMessage.message} 
          type={alertMessage.type} 
          onClose={() => setAlertMessage({ message: null, type: 'success' })}
        />
      )}

      {/* Statistics Cards - Gemini's Neumorphic Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Verified', value: formatCurrency(stats.total), icon: DollarSign, color: 'emerald' },
          { label: 'Verified Count', value: stats.count.verified, icon: CheckCircle, color: 'green' },
          { label: 'Pending', value: stats.count.pending, icon: AlertCircle, color: 'amber' },
          { label: 'Failed', value: stats.count.failed, icon: AlertTriangle, color: 'rose' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm group hover:border-[#8B1A1A]/30 transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters Section - Gemini's Premium Style */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <Filter size={20} className="text-slate-600 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Filter Contributions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#8B1A1A] transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#8B1A1A] transition-all font-medium text-slate-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>

          {/* Method Filter */}
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#8B1A1A] transition-all font-medium text-slate-900 dark:text-white"
          >
            <option value="">All Methods</option>
            <option value="mpesa">M-Pesa</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>

          {/* Campaign Filter */}
          <select
            value={filters.campaignId}
            onChange={(e) => setFilters(prev => ({ ...prev, campaignId: e.target.value }))}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#8B1A1A] transition-all font-medium text-slate-900 dark:text-white"
          >
            <option value="">All Campaigns</option>
            {campaigns.map(campaign => (
              <option key={campaign._id} value={campaign._id}>
                {campaign.title}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition-all active:scale-95 shadow-lg"
          >
            <Printer size={18} />
            Print {selectedContributions.size > 0 && `(${selectedContributions.size})`}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg"
          >
            <Download size={18} />
            Export CSV {selectedContributions.size > 0 && `(${selectedContributions.size})`}
          </button>
          {selectedContributions.size > 0 && (
            <button
              onClick={() => setSelectedContributions(new Set())}
              className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all active:scale-95 shadow-lg"
            >
              <X size={18} />
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Contributions Table - Gemini's Premium Table Style */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5">
                  <input
                    type="checkbox"
                    checked={selectedContributions.size === filteredContributions.length && filteredContributions.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-[#8B1A1A] focus:ring-[#8B1A1A]"
                  />
                </th>
                <th className="px-8 py-5 text-left">
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Contributor</span>
                </th>
                <th className="px-8 py-5 text-left">
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Campaign</span>
                </th>
                <th className="px-8 py-5 text-left">
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Amount</span>
                </th>
                <th className="px-8 py-5 text-left">
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Method</span>
                </th>
                <th className="px-8 py-5 text-left">
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">M-Pesa Ref</span>
                </th>
                <th className="px-8 py-5 text-left">
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Status</span>
                </th>
                <th className="px-8 py-5 text-left">
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Date</span>
                </th>
                <th className="px-8 py-5 text-right">
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-12 h-12 border-4 border-slate-200 border-t-[#8B1A1A] rounded-full animate-spin"></div>
                      <p className="text-slate-500 font-bold animate-pulse">Loading contributions...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredContributions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Info size={48} className="text-slate-300" />
                      <p className="text-slate-500 font-bold text-lg">No contributions found</p>
                      <p className="text-slate-400 text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContributions.map(contrib => {
                  const statusBadge = getStatusBadge(contrib.status);
                  
                  return (
                    <tr key={contrib.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-6">
                        <input
                          type="checkbox"
                          checked={selectedContributions.has(contrib.id)}
                          onChange={() => handleSelectRow(contrib.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#8B1A1A] focus:ring-[#8B1A1A]"
                        />
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#8B1A1A] transition-colors">
                            {contrib.is_anonymous ? 'Anonymous' : contrib.contributor_name}
                          </p>
                          {!contrib.is_anonymous && (
                            <>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{contrib.contributor_email}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-500">{contrib.contributor_phone}</p>
                            </>
                          )}
                          {contrib.created_by_name && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                              Added by {contrib.created_by_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {contrib.campaign_title || 'General Offering'}
                        </p>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900 dark:text-white text-base">
                        {formatCurrency(contrib.amount)}
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {(contrib.payment_method || 'cash').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {contrib.mpesa_ref ? (
                          <code className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-lg font-bold">
                            {contrib.mpesa_ref}
                          </code>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusBadge.bg} ${statusBadge.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${contrib.status === 'verified' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                            {statusBadge.label}
                          </span>
                          {contrib.verified_by_name && contrib.status === 'verified' && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                              By {contrib.verified_by_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(contrib.created_at)}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          {contrib.status === 'pending' && (
                            <button
                              onClick={() => handleVerify(contrib.id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                              title="Verify Contribution"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedContribution(contrib);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {(contrib.payment_method === 'cash' || contrib.payment_method === 'bank_transfer') && 
                           contrib.status !== 'verified' && (
                             <>
                               <button
                                 onClick={() => {
                                   setSelectedContribution(contrib);
                                   setShowEditModal(true);
                                 }}
                                 className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
                                 title="Edit Contribution"
                               >
                                 <Pencil size={18} />
                               </button>
                               
                               <button
                                 onClick={() => handleDelete(contrib.id)}
                                 className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                                 title="Delete Contribution"
                               >
                                 <Trash2 size={18} />
                               </button>
                             </>
                           )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Campaigns Section - Gemini's Premium Style */}
      {Object.keys(stats.byCampaign).length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Top Campaigns by Contributions</h4>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.byCampaign)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([campaign, amount], index) => (
                <div key={campaign} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-[#8B1A1A]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-900 dark:text-white font-black">
                      {index + 1}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{campaign}</span>
                  </div>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(amount)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Contribution Details Modal */}
      {showDetailsModal && selectedContribution && (
        <ContributionDetailsModal
          contribution={selectedContribution}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedContribution(null);
          }}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null, contributionId: null })}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        isLoading={
          (confirmDialog.action === 'verify' && verifyMutation.isPending) ||
          (confirmDialog.action === 'delete' && deleteMutation.isPending)
        }
      />
    </div>
  );
}