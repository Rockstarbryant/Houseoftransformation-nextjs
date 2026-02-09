// src/components/donations/ContributionsTab.jsx - REDESIGNED
'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDate, getStatusBadge } from '@/utils/donationHelpers';
import { Eye, CheckCircle, Download, Filter, Search, DollarSign, X, Printer, Pencil, Trash2, AlertTriangle, AlertCircle, Info, TrendingUp, Users, Wallet } from 'lucide-react';
import ContributionDetailsModal from './ContributionDetailsModal';

// Confirmation Dialog
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText = 'Confirm', isLoading = false }) {
  if (!isOpen) return null;

  const typeStyles = {
    warning: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-900/10 text-rose-600 border-rose-200 dark:border-rose-800',
    info: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 border-blue-200 dark:border-blue-800'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/60 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
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

// Alert Component
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
  
  // State
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

  // Fetch data
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

  // Filtering
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

  // Statistics
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
      const campaign = c.campaign_title || 'General Offering';
      byCampaign[campaign] = (byCampaign[campaign] || 0) + Number(c.amount || 0);
    });

    return {
      total: filteredContributions.length,
      verified: verified.length,
      pending: filteredContributions.filter(c => c.status === 'pending').length,
      totalAmount: verified.reduce((sum, c) => sum + Number(c.amount || 0), 0),
      byMethod,
      byCampaign
    };
  }, [filteredContributions]);

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: (contributionId) => donationApi.contributions.verify(contributionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      setAlertMessage({ message: '✅ Contribution verified successfully!', type: 'success' });
    },
    onError: (error) => {
      setAlertMessage({ message: `❌ ${error.message}`, type: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (contributionId) => donationApi.contributions.delete(contributionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      setAlertMessage({ message: '✅ Contribution deleted successfully!', type: 'success' });
    },
    onError: (error) => {
      setAlertMessage({ message: `❌ ${error.message}`, type: 'error' });
    }
  });

  // Handlers
  const handleVerify = (contributionId) => {
    setConfirmDialog({
      isOpen: true,
      action: 'verify',
      contributionId,
      title: 'Verify Contribution?',
      message: 'This will mark the contribution as verified and update the campaign totals.',
      type: 'info'
    });
  };

  const handleDelete = (contributionId) => {
    setConfirmDialog({
      isOpen: true,
      action: 'delete',
      contributionId,
      title: 'Delete Contribution?',
      message: 'Are you sure you want to delete this contribution? This action cannot be undone.',
      type: 'danger'
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action === 'verify') {
      verifyMutation.mutate(confirmDialog.contributionId);
    } else if (confirmDialog.action === 'delete') {
      deleteMutation.mutate(confirmDialog.contributionId);
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

  const handleExportCSV = () => {
    const csv = [
      ['Contributor', 'Email', 'Phone', 'Campaign', 'Amount', 'Method', 'Status', 'Date'],
      ...filteredContributions.map(c => [
        c.is_anonymous ? 'Anonymous' : c.contributor_name,
        c.contributor_email || '',
        c.contributor_phone || '',
        c.campaign_title || 'General Offering',
        c.amount,
        c.payment_method || 'cash',
        c.status,
        formatDate(c.created_at)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contributions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      campaignId: '',
      searchTerm: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contributions */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white dark:bg-blue-900/50 rounded-xl">
              <Users size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{stats.total} Total</span>
          </div>
          <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">Verified</h3>
          <p className="text-2xl font-black text-blue-900 dark:text-blue-100">{stats.verified}</p>
        </div>

        {/* Total Amount */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white dark:bg-emerald-900/50 rounded-xl">
              <DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">Total Amount</h3>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{formatCurrency(stats.totalAmount)}</p>
        </div>

        {/* Pending */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white dark:bg-amber-900/50 rounded-xl">
              <AlertCircle size={24} className="text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1">Pending</h3>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-100">{stats.pending}</p>
        </div>

        {/* M-Pesa Amount */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white dark:bg-purple-900/50 rounded-xl">
              <Wallet size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-1">M-Pesa</h3>
          <p className="text-2xl font-black text-purple-900 dark:text-purple-100">{formatCurrency(stats.byMethod.mpesa)}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              placeholder="Search by name, email, phone, or campaign..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none text-slate-900 dark:text-white transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-[#8B1A1A] outline-none cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-[#8B1A1A] outline-none cursor-pointer"
          >
            <option value="">All Methods</option>
            <option value="mpesa">M-Pesa</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>

          <select
            value={filters.campaignId}
            onChange={(e) => setFilters({...filters, campaignId: e.target.value})}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-[#8B1A1A] outline-none cursor-pointer"
          >
            <option value="">All Campaigns</option>
            {campaigns.map(c => (
              <option key={c.supabaseId} value={c.supabaseId}>{c.title}</option>
            ))}
          </select>

          {(filters.status || filters.paymentMethod || filters.campaignId || filters.searchTerm) && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Payment Method Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.byMethod).map(([method, amount]) => (
            <div key={method} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">{method === 'bank_transfer' ? 'Bank Transfer' : method}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(amount)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contributions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
          </div>
        ) : filteredContributions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign size={56} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">No contributions found</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Try adjusting your filters</p>
            {(filters.status || filters.paymentMethod || filters.campaignId || filters.searchTerm) && (
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-[#8B1A1A] text-white rounded-xl hover:bg-[#6d1414] transition-all font-bold shadow-lg shadow-rose-500/20"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedContributions.size === filteredContributions.length && filteredContributions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded w-4 h-4 text-[#8B1A1A] focus:ring-[#8B1A1A]"
                    />
                  </th>
                  <th className="px-6 py-4 text-left font-black text-slate-700 dark:text-slate-300">Contributor</th>
                  <th className="px-6 py-4 text-left font-black text-slate-700 dark:text-slate-300">Campaign</th>
                  <th className="px-6 py-4 text-right font-black text-slate-700 dark:text-slate-300">Amount</th>
                  <th className="px-6 py-4 text-left font-black text-slate-700 dark:text-slate-300">Method</th>
                  <th className="px-6 py-4 text-left font-black text-slate-700 dark:text-slate-300">Ref</th>
                  <th className="px-6 py-4 text-left font-black text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left font-black text-slate-700 dark:text-slate-300">Date</th>
                  <th className="px-6 py-4 text-center font-black text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredContributions.map(contrib => {
                  const statusBadge = getStatusBadge(contrib.status);
                  
                  return (
                    <tr key={contrib.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedContributions.has(contrib.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedContributions);
                            if (e.target.checked) {
                              newSet.add(contrib.id);
                            } else {
                              newSet.delete(contrib.id);
                            }
                            setSelectedContributions(newSet);
                          }}
                          className="rounded w-4 h-4 text-[#8B1A1A] focus:ring-[#8B1A1A]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {contrib.is_anonymous ? 'Anonymous' : contrib.contributor_name}
                          </p>
                          {!contrib.is_anonymous && (
                            <>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{contrib.contributor_email}</p>
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
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {contrib.campaign_title || 'General Offering'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(contrib.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {(contrib.payment_method || 'cash').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {contrib.mpesa_ref ? (
                          <code className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg font-bold">
                            {contrib.mpesa_ref}
                          </code>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase ${statusBadge.bg} ${statusBadge.text}`}>
                            <span className={`w-2 h-2 rounded-full ${contrib.status === 'verified' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            {statusBadge.label}
                          </span>
                          {contrib.verified_by_name && contrib.status === 'verified' && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                              By {contrib.verified_by_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(contrib.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {contrib.status === 'pending' && (
                            <button
                              onClick={() => handleVerify(contrib.id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 rounded-xl transition-all"
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
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-xl transition-all"
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
                                 className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/50 rounded-xl transition-all"
                                 title="Edit Contribution"
                               >
                                 <Pencil size={18} />
                               </button>
                               
                               <button
                                 onClick={() => handleDelete(contrib.id)}
                                 className="p-2 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-xl transition-all"
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Campaigns Section */}
      {Object.keys(stats.byCampaign).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-950/50 rounded-xl">
              <TrendingUp size={22} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Top Campaigns by Contributions</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.byCampaign)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([campaign, amount], index) => (
                <div key={campaign} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-[#8B1A1A]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/30 shadow-sm flex items-center justify-center text-amber-900 dark:text-amber-100 font-black">
                      {index + 1}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{campaign}</span>
                  </div>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(amount)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modals */}
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

      {/* Alert */}
      {alertMessage.message && (
        <Alert 
          message={alertMessage.message} 
          type={alertMessage.type} 
          onClose={() => setAlertMessage({ message: null, type: 'success' })} 
        />
      )}
    </div>
  );
}