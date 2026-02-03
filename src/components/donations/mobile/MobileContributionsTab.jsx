// components/donations/mobile/MobileContributionsTab.jsx
// ✅ MOBILE VERSION - All PC features with FULL-WIDTH edge-to-edge card design

'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDate, getStatusBadge } from '@/utils/donationHelpers';
import {
  Eye, CheckCircle, Download, Filter, Search, DollarSign, X, Printer,
  Trash2, AlertTriangle, AlertCircle, Info, TrendingUp, ChevronDown,
  Mail, Phone, Calendar, CreditCard, Square, CheckSquare, User
} from 'lucide-react';
import ContributionDetailsModal from '@/components/donations/ContributionDetailsModal';

// ============================================
// CONFIRM DIALOG COMPONENT
// ============================================
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText = 'Confirm', isLoading = false }) {
  if (!isOpen) return null;

  const typeStyles = {
    warning: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
  };

  const typeIcons = {
    warning: <AlertTriangle className="w-6 h-6" />,
    danger: <AlertCircle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${typeStyles[type]}`}>
              {typeIcons[type]}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-[#8B1A1A] hover:bg-red-900'
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

// ============================================
// ALERT COMPONENT
// ============================================
function Alert({ message, type = 'success', onClose }) {
  if (!message) return null;
  
  const styles = {
    success: 'bg-emerald-500 text-white border-emerald-400',
    error: 'bg-rose-500 text-white border-rose-400'
  };
  
  return (
    <div className={`fixed bottom-24 left-4 right-4 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-5 duration-300 ${styles[type]}`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <p className="font-bold flex-1">{message}</p>
      <button onClick={onClose} className="hover:rotate-90 transition-transform"><X size={18} /></button>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function MobileContributionsTab() {
  const queryClient = useQueryClient();
  
  // ============================================
  // STATE
  // ============================================
  const [selectedContributions, setSelectedContributions] = useState(new Set());
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, contributionId: null });
  const [alertMessage, setAlertMessage] = useState({ message: null, type: 'success' });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    campaignId: '',
    searchTerm: ''
  });

  // ============================================
  // FETCH DATA WITH TANSTACK QUERY
  // ============================================
  const { data: allContributions = [], isLoading } = useQuery({
    queryKey: ['contributions'],
    queryFn: async () => {
      const response = await donationApi.contributions.getAll({ limit: 1000 });
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
  // CLIENT-SIDE FILTERING
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
  // STATISTICS
  // ============================================
  const stats = useMemo(() => {
    const verified = filteredContributions.filter(c => c.status === 'verified');
    
    return {
      total: verified.reduce((sum, c) => sum + Number(c.amount || 0), 0),
      count: {
        verified: allContributions.filter(c => c.status === 'verified').length,
        pending: allContributions.filter(c => c.status === 'pending').length,
        failed: allContributions.filter(c => c.status === 'failed').length
      }
    };
  }, [allContributions, filteredContributions]);

  // ============================================
  // MUTATIONS
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
      if (response.success && response.contribution) {
        queryClient.setQueryData(['contributions'], (old) =>
          old.map(c => c.id === contributionId ? response.contribution : c)
        );
        showAlert('Contribution verified successfully', 'success');
      } else {
        showAlert(response.message || 'Failed to verify contribution', 'error');
      }
    },
    onError: (error, contributionId, context) => {
      queryClient.setQueryData(['contributions'], context.previousContributions);
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
  // HANDLERS
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

  const handleSelectAll = () => {
    if (selectedContributions.size === filteredContributions.length) {
      setSelectedContributions(new Set());
    } else {
      setSelectedContributions(new Set(filteredContributions.map(c => c.id)));
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

  const handleLongPressStart = (contributionId) => {
  const timer = setTimeout(() => {
    handleSelectRow(contributionId);
    if (navigator.vibrate) navigator.vibrate(50);
  }, 500);
  setLongPressTimer(timer);
};

const handleLongPressEnd = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    setLongPressTimer(null);
  }
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
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
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

  const resetFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      campaignId: '',
      searchTerm: ''
    });
  };

  const hasFilters = filters.status || filters.paymentMethod || filters.campaignId || filters.searchTerm;

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDB022]"></div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="-mx-4 space-y-4">
      {alertMessage.message && (
        <Alert 
          message={alertMessage.message} 
          type={alertMessage.type} 
          onClose={() => setAlertMessage({ message: null, type: 'success' })}
        />
      )}

      {/* ✅ FULL-WIDTH STATS - EDGE TO EDGE */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white p-4">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign size={14} />
              <p className="text-[10px] font-medium opacity-90">Total Verified</p>
            </div>
            <p className="text-xl font-black">{(stats.total / 1000).toFixed(0)}K</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle size={14} />
              <p className="text-[10px] font-medium opacity-90">Verified</p>
            </div>
            <p className="text-xl font-black text-green-300">{stats.count.verified}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle size={14} />
              <p className="text-[10px] font-medium opacity-90">Pending</p>
            </div>
            <p className="text-xl font-black text-amber-300">{stats.count.pending}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle size={14} />
              <p className="text-[10px] font-medium opacity-90">Failed</p>
            </div>
            <p className="text-xl font-black text-red-300">{stats.count.failed}</p>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative px-4">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={filters.searchTerm}
          onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          placeholder="Search name, email, phone..."
          className="w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#FDB022] outline-none"
        />
        {filters.searchTerm && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
            className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-2 px-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            hasFilters || showFilters
              ? 'bg-[#FDB022] text-white' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Filter size={16} />
          Filters
          {hasFilters && !showFilters && (
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">•</span>
          )}
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-blue-600 text-white"
        >
          <Download size={16} />
          CSV
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-slate-700 text-white"
        >
          <Printer size={16} />
          Print
        </button>

        {filteredContributions.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-purple-600 text-white"
          >
            {selectedContributions.size === filteredContributions.length ? <CheckSquare size={16} /> : <Square size={16} />}
            {selectedContributions.size > 0 ? `${selectedContributions.size} Selected` : 'Select All'}
          </button>
        )}
      </div>

      {/* FILTERS PANEL */}
      {showFilters && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mx-4 space-y-3 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Payment Method
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
              >
                <option value="">All Methods</option>
                <option value="mpesa">M-Pesa</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Campaign
              </label>
              <select
                value={filters.campaignId}
                onChange={(e) => setFilters(prev => ({ ...prev, campaignId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
              >
                <option value="">All Campaigns</option>
                {campaigns.map(c => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.title || c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="w-full py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg font-semibold text-sm border border-red-200 dark:border-red-800"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* NO RESULTS */}
      {filteredContributions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 mx-4 text-center border border-slate-200 dark:border-slate-700">
          <DollarSign size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No contributions found
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {hasFilters ? 'Try adjusting your filters' : 'No contributions available'}
          </p>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-[#FDB022] text-white rounded-lg font-semibold text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ✅ CONTRIBUTION CARDS - FULL WIDTH EDGE TO EDGE */}
          <div className="space-y-3">
            {filteredContributions.map((contribution, index) => {
              const isExpanded = expandedCard === contribution.id;
              const isSelected = selectedContributions.has(contribution.id);
              const statusInfo = getStatusBadge(contribution.status);

              return (
                <div 
                  key={contribution.id}
                  className={`w-full border-b border-slate-200 dark:border-slate-700 ${
                    index === 0 ? 'border-t' : ''
                  } ${isSelected ? 'bg-green-500 dark:bg-green-950/30 border-l-4 border-l-green-500' : 'bg-white dark:bg-slate-800'} transition-colors`}
                >
                  {/* Card Header */}
                  <div 
                    className="px-4 sm:px-5"
                    onClick={() => setExpandedCard(isExpanded ? null : contribution.id)}
                    onTouchStart={() => handleLongPressStart(contribution.id)}
                    onTouchEnd={handleLongPressEnd}
                    onTouchMove={handleLongPressEnd}
                    onMouseDown={() => handleLongPressStart(contribution.id)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 z-10">
                        <CheckSquare size={16} />
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Contributor Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">
                          {contribution.is_anonymous ? '👤 Anonymous' : contribution.contributor_name}
                        </h3>
                        {!contribution.is_anonymous && (
                          <>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                              <Mail size={12} className="flex-shrink-0" />
                              <span className="truncate">{contribution.contributor_email}</span>
                            </div>
                            {contribution.contributor_phone && (
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Phone size={12} className="flex-shrink-0" />
                                <span>{contribution.contributor_phone}</span>
                              </div>
                            )}
                          </>
                        )}
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-semibold truncate">
                          {contribution.campaign_title || 'General Offering'}
                        </p>
                      </div>

                      {/* Amount & Status */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="text-lg font-black text-[#FDB022]">
                          {(contribution.amount / 1000).toFixed(0)}K
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                        <ChevronDown 
                          size={20} 
                          className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500">Method</p>
                        <p className="font-bold text-xs truncate">{(contribution.payment_method || 'cash').toUpperCase()}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500">Date</p>
                        <p className="font-bold text-xs">{new Date(contribution.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500">Amount</p>
                        <p className="font-bold text-xs">{formatCurrency(contribution.amount)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                      {/* M-Pesa Ref */}
                      {contribution.mpesa_ref && (
                        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                          <p className="text-xs text-green-700 dark:text-green-300 mb-1">M-Pesa Reference</p>
                          <p className="font-mono font-bold text-green-900 dark:text-green-100 break-all">{contribution.mpesa_ref}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContribution(contribution);
                            setShowDetailsModal(true);
                          }}
                          className="py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        {contribution.status !== 'verified' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerify(contribution.id);
                            }}
                            className="py-2.5 bg-green-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={14} />
                            Verify
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(contribution.id);
                          }}
                          className="py-2.5 bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Summary */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400">Total Showing</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(filteredContributions.reduce((sum, c) => sum + Number(c.amount || 0), 0))}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400">Count</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredContributions.length} contributions
              </span>
            </div>
            {selectedContributions.size > 0 && (
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-blue-600 dark:text-blue-400">Selected</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {selectedContributions.size} items
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODALS */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null, contributionId: null })}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type || 'warning'}
        confirmText={confirmDialog.action === 'verify' ? 'Verify' : 'Delete'}
        isLoading={verifyMutation.isLoading || deleteMutation.isLoading}
      />

      {showDetailsModal && selectedContribution && (
        <ContributionDetailsModal
          contribution={selectedContribution}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedContribution(null);
          }}
        />
      )}
    </div>
  );
}