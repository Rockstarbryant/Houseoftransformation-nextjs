// src/components/donations/EnhancedAdminPledgeTable.jsx - REDESIGNED
'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Edit, Trash2, Eye, Download, AlertCircle, ChevronUp, ChevronDown, 
  Printer, History, Filter, X as CloseIcon, AlertTriangle, Info, 
  Search, DollarSign, X  // ✅ ADD X here
} from 'lucide-react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDateShort, getStatusBadge } from '@/utils/donationHelpers';
import EditPledgeModal from './EditPledgeModal';
import ManualPaymentModal from './ManualPaymentModal';
import PledgeHistoryModal from './PledgeHistoryModal';

// Modern Confirmation Dialog
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${typeStyles[type]}`}>
              {typeIcons[type]}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
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
            className="px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30' 
                : 'bg-[#8B1A1A] hover:bg-[#6d1414] shadow-lg shadow-rose-500/30'
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

export default function EnhancedAdminPledgeTable({ campaignId = null, refreshTrigger = 0 }) {
  const queryClient = useQueryClient();
  
  const [selectedPledges, setSelectedPledges] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, pledgeId: null });
  
  // Filter states
  const [filterPledgeStatus, setFilterPledgeStatus] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);
  const [filterAmountMin, setFilterAmountMin] = useState('');
  const [filterAmountMax, setFilterAmountMax] = useState('');
  
  // Modal states
  const [editingPledge, setEditingPledge] = useState(null);
  const [recordingPaymentFor, setRecordingPaymentFor] = useState(null);
  const [viewingHistoryFor, setViewingHistoryFor] = useState(null);

  // Fetch pledges
  const { data: pledges = [], isLoading, error } = useQuery({
    queryKey: ['pledges', campaignId, refreshTrigger],
    queryFn: async () => {
      let response;
      if (campaignId) {
        response = await donationApi.pledges.getCampaignPledges(campaignId);
      } else {
        response = await donationApi.pledges.getAllPledges();
      }

      if (response.success && response.pledges) {
        return response.pledges;
      }
      throw new Error(response.message || 'Failed to fetch pledges');
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  // Fetch campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await donationApi.campaigns.getAll();
      if (response.success && response.campaigns) {
        return response.campaigns;
      }
      return [];
    },
    staleTime: 60000,
  });

  // Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success && data.users) {
        return data.users;
      }
      return [];
    },
    staleTime: 300000,
  });

  // Fetch payments map
  const { data: paymentsMap = {} } = useQuery({
    queryKey: ['payments-map'],
    queryFn: async () => {
      const { success, payments: allPayments } = await donationApi.payments.getAll({ limit: 10000 });
      
      if (success && allPayments) {
        const paymentMap = {};
        allPayments.forEach(payment => {
          if (payment.pledge_id) {
            if (!paymentMap[payment.pledge_id] || 
                new Date(payment.created_at) > new Date(paymentMap[payment.pledge_id].created_at)) {
              paymentMap[payment.pledge_id] = payment;
            }
          }
        });
        return paymentMap;
      }
      return {};
    },
    enabled: pledges.length > 0,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  // Mutations
  const cancelMutation = useMutation({
    mutationFn: (pledgeId) => donationApi.pledges.cancel(pledgeId),
    onSuccess: (response, pledgeId) => {
      if (response.success) {
        queryClient.setQueryData(['pledges', campaignId, refreshTrigger], (old) =>
          old.filter(p => p.id !== pledgeId)
        );
        queryClient.invalidateQueries({ queryKey: ['pledges'] });
      } else {
        alert(response.message || 'Failed to cancel pledge');
      }
    },
    onError: (error) => {
      alert('Error cancelling pledge: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
  mutationFn: (pledgeId) => donationApi.pledges.delete(pledgeId),
  onSuccess: (response, pledgeId) => {
    if (response.success) {
      queryClient.setQueryData(['pledges', campaignId, refreshTrigger], (old) =>
        old.filter(p => p.id !== pledgeId)
      );
      queryClient.invalidateQueries({ queryKey: ['pledges'] });
      setConfirmDialog({ isOpen: false, action: null, pledgeId: null });
    } else {
      alert(response.message || 'Failed to delete pledge');
    }
  },
  onError: (error) => {
    alert('Error deleting pledge: ' + error.message);
  },
});

const uncancelMutation = useMutation({
  mutationFn: (pledgeId) => donationApi.pledges.uncancel(pledgeId),
  onSuccess: (response) => {
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: ['pledges'] });
      setConfirmDialog({ isOpen: false, action: null, pledgeId: null });
    } else {
      // Show the actual error message from the server
      alert(response.message || 'Failed to restore pledge');
      setConfirmDialog({ isOpen: false, action: null, pledgeId: null });
    }
  },
  onError: (error) => {
    // Parse error response
    const errorMessage = error.response?.data?.message || error.message || 'Error restoring pledge';
    alert(errorMessage);
    setConfirmDialog({ isOpen: false, action: null, pledgeId: null });
  },
});

  // Helper functions
  const getUserName = (userId) => {
    if (!userId) return 'N/A';
    const user = users.find(u => u.id === userId);
    if (user) {
      return user.full_name || user.email || 'Unknown User';
    }
    return 'Unknown User';
  };

  const getCampaignTitle = (pledge) => {
    if (!pledge) return 'General';
    if (pledge.campaign_title && pledge.campaign_title !== 'Unknown Campaign') {
      return pledge.campaign_title;
    }
    const campaign = campaigns.find(c => c.supabaseId === pledge.campaign_id);
    return campaign?.title || 'General Offering';
  };

  const isOverdue = (pledge) => {
    if (!pledge.due_date || pledge.status === 'completed' || pledge.status === 'cancelled') return false;
    return new Date(pledge.due_date) < new Date();
  };

  // Sorting
  const sortedPledges = useMemo(() => {
    if (!pledges) return [];
    let sorted = [...pledges];
    
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (sortConfig.key === 'campaign_title') {
          aVal = getCampaignTitle(a);
          bVal = getCampaignTitle(b);
        }
        
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';
        
        if (typeof aVal === 'string') {
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    
    return sorted;
  }, [pledges, sortConfig, campaigns]);

  // Filtering
  const processedPledges = useMemo(() => {
    let filtered = sortedPledges;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.member_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.member_phone?.includes(searchTerm) ||
        getCampaignTitle(p).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPledgeStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterPledgeStatus);
    }

    if (filterCampaign !== 'all') {
      filtered = filtered.filter(p => p.campaign_id === filterCampaign);
    }

    if (filterPaymentMethod !== 'all') {
      filtered = filtered.filter(p => {
        const payment = paymentsMap[p.id];
        return payment?.payment_method === filterPaymentMethod;
      });
    }

    if (filterOverdueOnly) {
      filtered = filtered.filter(p => isOverdue(p));
    }

    if (filterAmountMin) {
      filtered = filtered.filter(p => p.pledged_amount >= parseFloat(filterAmountMin));
    }

    if (filterAmountMax) {
      filtered = filtered.filter(p => p.pledged_amount <= parseFloat(filterAmountMax));
    }

    return filtered;
  }, [sortedPledges, searchTerm, filterPledgeStatus, filterCampaign, filterPaymentMethod, filterOverdueOnly, filterAmountMin, filterAmountMax, paymentsMap]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPledges(processedPledges.map(p => p.id));
    } else {
      setSelectedPledges([]);
    }
  };

  // Handle cancel pledge
  const handleCancelPledge = (pledgeId) => {
    setConfirmDialog({
      isOpen: true,
      action: 'cancel',
      pledgeId,
      title: 'Cancel Pledge?',
      message: 'Are you sure you want to cancel this pledge? This action cannot be undone.',
      type: 'danger'
    });
  };

  const handleDeletePledge = (pledge) => {
  if (pledge.status !== 'cancelled') {
    alert('Only cancelled pledges can be deleted. Please cancel this pledge first.');
    return;
  }
  
  setConfirmDialog({
    isOpen: true,
    action: 'delete',
    pledgeId: pledge.id,
    title: 'Delete Pledge Permanently?',
    message: `Are you sure you want to permanently delete the pledge by ${pledge.member_name}?\n\nThis action cannot be undone and will remove all pledge records.`,
    type: 'danger'
  });
};

const handleUncancelPledge = (pledge) => {
  setConfirmDialog({
    isOpen: true,
    action: 'uncancel',
    pledgeId: pledge.id,
    title: 'Restore Cancelled Pledge?',
    message: `Restore the pledge by ${pledge.member_name}? The pledge status will be updated based on payment progress.`,
    type: 'info'
  });
};

  const handleConfirmAction = () => {
  if (confirmDialog.action === 'cancel' && confirmDialog.pledgeId) {
    cancelMutation.mutate(confirmDialog.pledgeId);
  } else if (confirmDialog.action === 'delete' && confirmDialog.pledgeId) {
    deleteMutation.mutate(confirmDialog.pledgeId);
  } else if (confirmDialog.action === 'uncancel' && confirmDialog.pledgeId) {
    uncancelMutation.mutate(confirmDialog.pledgeId);
  }
};

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterPledgeStatus('all');
    setFilterCampaign('all');
    setFilterPaymentMethod('all');
    setFilterOverdueOnly(false);
    setFilterAmountMin('');
    setFilterAmountMax('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = [
      ['Name', 'Campaign', 'Email', 'Phone', 'Pledged', 'Paid', 'Balance', 'Status', 'Due Date'],
      ...processedPledges.map(p => [
        p.member_name,
        getCampaignTitle(p),
        p.member_email,
        p.member_phone,
        p.pledged_amount,
        p.paid_amount,
        p.remaining_amount,
        p.status,
        p.due_date ? new Date(p.due_date).toLocaleDateString() : 'N/A'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pledges-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-8 flex items-center gap-4">
        <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
        <div>
          <h3 className="font-black text-red-900 dark:text-red-100 text-lg">Error Loading Pledges</h3>
          <p className="text-red-700 dark:text-red-300">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">Total Pledges</p>
          <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{processedPledges.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <p className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-1">Total Pledged</p>
          <p className="text-2xl font-black text-purple-900 dark:text-purple-100">
            {formatCurrency(processedPledges.reduce((sum, p) => sum + p.pledged_amount, 0))}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">Total Paid</p>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
            {formatCurrency(processedPledges.reduce((sum, p) => sum + p.paid_amount, 0))}
          </p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/20 rounded-2xl p-6 border border-rose-200 dark:border-rose-800">
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mb-1">Total Balance</p>
          <p className="text-2xl font-black text-rose-900 dark:text-rose-100">
            {formatCurrency(processedPledges.reduce((sum, p) => sum + p.remaining_amount, 0))}
          </p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, email, phone, or campaign..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none text-slate-900 dark:text-white transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                showAdvancedFilters
                  ? 'bg-[#8B1A1A] text-white shadow-lg shadow-rose-500/20'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Filter size={18} />
              Filters
            </button>
            
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
            value={filterPledgeStatus}
            onChange={(e) => setFilterPledgeStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-[#8B1A1A] outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-[#8B1A1A] outline-none cursor-pointer"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map(c => (
              <option key={c.supabaseId} value={c.supabaseId}>{c.title}</option>
            ))}
          </select>

          {(searchTerm || filterPledgeStatus !== 'all' || filterCampaign !== 'all' || filterOverdueOnly) && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
            >
              <CloseIcon size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Payment Method</label>
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#8B1A1A] outline-none"
              >
                <option value="all">All Methods</option>
                <option value="mpesa">M-Pesa</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Min Amount</label>
              <input
                type="number"
                value={filterAmountMin}
                onChange={(e) => setFilterAmountMin(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#8B1A1A] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Max Amount</label>
              <input
                type="number"
                value={filterAmountMax}
                onChange={(e) => setFilterAmountMax(e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#8B1A1A] outline-none"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterOverdueOnly}
                  onChange={(e) => setFilterOverdueOnly(e.target.checked)}
                  className="rounded w-5 h-5 text-[#8B1A1A] focus:ring-[#8B1A1A]"
                />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Overdue Only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Pledges Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
          </div>
        ) : processedPledges.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign size={56} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">No pledges found</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Try adjusting your filters or search criteria</p>
            {(filterPledgeStatus !== 'all' || filterCampaign !== 'all' || filterPaymentMethod !== 'all' || searchTerm) && (
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
                  <th className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPledges.length === processedPledges.length && processedPledges.length > 0}
                      onChange={handleSelectAll}
                      className="rounded w-4 h-4 text-[#8B1A1A] focus:ring-[#8B1A1A]"
                    />
                  </th>
                  <th 
                    className="px-4 py-4 text-left font-black text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('member_name')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {sortConfig.key === 'member_name' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-left font-black text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('campaign_title')}
                  >
                    <div className="flex items-center gap-2">
                      Campaign
                      {sortConfig.key === 'campaign_title' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-black text-slate-700 dark:text-slate-300">Contact</th>
                  <th 
                    className="px-4 py-4 text-right font-black text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('pledged_amount')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Pledged
                      {sortConfig.key === 'pledged_amount' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-right font-black text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('paid_amount')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Paid
                      {sortConfig.key === 'paid_amount' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right font-black text-slate-700 dark:text-slate-300">Balance</th>
                  <th className="px-4 py-4 text-left font-black text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-4 py-4 text-left font-black text-slate-700 dark:text-slate-300">Due Date</th>
                  <th className="px-4 py-4 text-center font-black text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {processedPledges.map(pledge => {
                  const badge = getStatusBadge(pledge.status);
                  const overdue = isOverdue(pledge);
                  const payment = paymentsMap[pledge.id];
                  const campaignName = getCampaignTitle(pledge);

                  return (
                    <tr 
                      key={pledge.id} 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        overdue ? 'bg-rose-50 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPledges.includes(pledge.id)}
                          onChange={(e) => setSelectedPledges(
                            e.target.checked
                              ? [...selectedPledges, pledge.id]
                              : selectedPledges.filter(id => id !== pledge.id)
                          )}
                          className="rounded w-4 h-4 text-[#8B1A1A] focus:ring-[#8B1A1A]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-900 dark:text-white">{pledge.member_name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{campaignName}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{pledge.member_email}</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-500">{pledge.member_phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(pledge.pledged_amount)}
                      </td>
                      <td className="px-4 py-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(pledge.paid_amount)}
                      </td>
                      <td className="px-4 py-4 text-right font-black text-rose-600 dark:text-rose-400">
                        {formatCurrency(pledge.remaining_amount)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {pledge.due_date ? (
                          <div>
                            <p className={`text-sm font-bold ${overdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                              {new Date(pledge.due_date).toLocaleDateString()}
                            </p>
                            {overdue && <p className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase">Overdue</p>}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingPledge(pledge)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-lg transition-colors text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit pledge"
                            disabled={pledge.status === 'cancelled' || uncancelMutation.isPending || deleteMutation.isPending}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setRecordingPaymentFor(pledge)}
                            className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 rounded-lg transition-colors text-emerald-600 dark:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Record payment"
                            disabled={pledge.status === 'cancelled' || pledge.status === 'completed' || uncancelMutation.isPending || deleteMutation.isPending}
                          >
                            <DollarSign size={16} />
                          </button>
                          <button
                            onClick={() => setViewingHistoryFor(pledge)}
                            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-950/50 rounded-lg transition-colors text-purple-600 dark:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="View history"
                            disabled={uncancelMutation.isPending || deleteMutation.isPending}
                          >
                            <History size={16} />
                          </button>
                          
                          {/* Show Uncancel button for cancelled pledges */}
                          {pledge.status === 'cancelled' ? (
                            <>
                              <button
                                onClick={() => handleUncancelPledge(pledge)}
                                className="p-2 hover:bg-amber-100 dark:hover:bg-amber-950/50 rounded-lg transition-colors text-amber-600 dark:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Restore pledge"
                                disabled={uncancelMutation.isPending || deleteMutation.isPending}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                  <path d="M21 3v5h-5"/>
                                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                  <path d="M8 16H3v5"/>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeletePledge(pledge)}
                                className="p-2 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg transition-colors text-rose-600 dark:text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete pledge permanently"
                                disabled={uncancelMutation.isPending || deleteMutation.isPending}
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleCancelPledge(pledge.id)}
                              className="p-2 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg transition-colors text-rose-600 dark:text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Cancel pledge"
                              disabled={cancelMutation.isPending || uncancelMutation.isPending || deleteMutation.isPending}
                            >
                              <X size={16} />
                            </button>
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

      {/* Modals */}
      {editingPledge && (
        <EditPledgeModal
          pledge={editingPledge}
          onClose={() => setEditingPledge(null)}
          onSuccess={() => {
            setEditingPledge(null);
            queryClient.invalidateQueries({ queryKey: ['pledges'] });
            queryClient.invalidateQueries({ queryKey: ['payments-map'] });
          }}
        />
      )}

      {recordingPaymentFor && (
        <ManualPaymentModal
          pledge={recordingPaymentFor}
          onClose={() => setRecordingPaymentFor(null)}
          onSuccess={() => {
            setRecordingPaymentFor(null);
            queryClient.invalidateQueries({ queryKey: ['pledges'] });
            queryClient.invalidateQueries({ queryKey: ['payments-map'] });
          }}
        />
      )}

      {viewingHistoryFor && (
        <PledgeHistoryModal
          pledge={viewingHistoryFor}
          onClose={() => setViewingHistoryFor(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null, pledgeId: null })}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        isLoading={cancelMutation.isPending || deleteMutation.isPending || uncancelMutation.isPending}  // ✅ UPDATE THIS
      />
    </div>
  );
}