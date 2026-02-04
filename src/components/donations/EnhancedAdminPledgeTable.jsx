'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Eye, Download, AlertCircle, ChevronUp, ChevronDown, Printer, History, Filter, X as CloseIcon, AlertTriangle, Info } from 'lucide-react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDateShort, getStatusBadge } from '@/utils/donationHelpers';
import EditPledgeModal from './EditPledgeModal';
import ManualPaymentModal from './ManualPaymentModal';
import PledgeHistoryModal from './PledgeHistoryModal';

// Modern Confirmation Dialog Component
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
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
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

  // Fetch pledges with TanStack Query
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
        console.log('[CAMPAIGNS] Loaded:', response.campaigns);
        return response.campaigns;
      }
      return [];
    },
    staleTime: 60000,
  });

  // ✅ FIX: Fetch users properly
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success && data.users) {
        console.log('[USERS] Loaded:', data.users);
        return data.users;
      }
      return [];
    },
    staleTime: 300000, // 5 minutes
  });

  // ✅ FIX: Fetch ALL payments and create proper lookup map
  const { data: paymentsMap = {} } = useQuery({
    queryKey: ['payments-map'],
    queryFn: async () => {
      const { success, payments: allPayments } = await donationApi.payments.getAll({ limit: 10000 });
      
      console.log('[PAYMENTS] Raw payments data:', allPayments);
      
      if (success && allPayments) {
        // Create a map where key is pledge_id and value is the LATEST payment for that pledge
        const paymentMap = {};
        
        allPayments.forEach(payment => {
          if (payment.pledge_id) {
            // If we already have a payment for this pledge, keep the most recent one
            if (!paymentMap[payment.pledge_id] || 
                new Date(payment.created_at) > new Date(paymentMap[payment.pledge_id].created_at)) {
              paymentMap[payment.pledge_id] = payment;
            }
          }
        });
        
        console.log('[PAYMENTS] Payment map created:', paymentMap);
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

  // ✅ FIX: Helper function to get user name by ID
  const getUserName = (userId) => {
    if (!userId) return 'N/A';
    
    const user = users.find(u => u.id === userId);
    if (user) {
      return user.full_name || user.email || 'Unknown User';
    }
    
    return 'Unknown User';
  };

  // Helper functions
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

  // Sorting function
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

  // Advanced filtering
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
      // ✅ FIX: Filter by payment method from payments map
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
      title: 'Cancel Pledge',
      message: 'Are you sure you want to cancel this pledge? This action cannot be undone.',
      type: 'danger'
    });
  };

  // Handle confirm action
  const handleConfirmAction = () => {
    if (confirmDialog.action === 'cancel') {
      cancelMutation.mutate(confirmDialog.pledgeId);
    }
    setConfirmDialog({ isOpen: false, action: null, pledgeId: null });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (processedPledges.length === 0) {
      alert('No pledges to export');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Campaign', 'Pledged', 'Paid', 'Balance', 'Status', 'Due Date'];
    const rows = processedPledges.map(pledge => [
      pledge.member_name,
      pledge.member_email,
      pledge.member_phone,
      getCampaignTitle(pledge),
      pledge.pledged_amount,
      pledge.paid_amount,
      pledge.remaining_amount,
      pledge.status,
      pledge.due_date ? new Date(pledge.due_date).toLocaleDateString() : 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pledges-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Print table
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle size={20} />
          <p className="font-semibold">Error loading pledges: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[300px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, or campaign..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Filter size={18} />
          Filters
          {showAdvancedFilters && <ChevronUp size={16} />}
          {!showAdvancedFilters && <ChevronDown size={16} />}
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Printer size={18} />
          Print
        </button>

        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-[#8B1A1A] hover:bg-red-900 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={filterPledgeStatus}
                onChange={(e) => setFilterPledgeStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Campaign</label>
              <select
                value={filterCampaign}
                onChange={(e) => setFilterCampaign(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map(campaign => (
                  <option key={campaign.supabaseId} value={campaign.supabaseId}>
                    {campaign.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Methods</option>
                <option value="mpesa">M-Pesa</option>
                <option value="cash">Cash</option>
                <option value="bank-transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Amount</label>
              <input
                type="number"
                value={filterAmountMin}
                onChange={(e) => setFilterAmountMin(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Amount</label>
              <input
                type="number"
                value={filterAmountMax}
                onChange={(e) => setFilterAmountMax(e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterOverdueOnly}
                  onChange={(e) => setFilterOverdueOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-slate-700">Show Overdue Only</span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
            >
              <CloseIcon size={16} />
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-600">Total Pledges</p>
          <p className="text-2xl font-bold text-slate-900">{processedPledges.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-600">Total Pledged</p>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(processedPledges.reduce((sum, p) => sum + p.pledged_amount, 0))}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-600">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(processedPledges.reduce((sum, p) => sum + p.paid_amount, 0))}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-600">Total Balance</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(processedPledges.reduce((sum, p) => sum + p.remaining_amount, 0))}
          </p>
        </div>
      </div>

      {/* Pledges Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedPledges.length === processedPledges.length && processedPledges.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('member_name')}
                >
                  Name {sortConfig.key === 'member_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('campaign_title')}
                >
                  Campaign {sortConfig.key === 'campaign_title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Phone</th>
                <th 
                  className="px-4 py-3 text-right text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('pledged_amount')}
                >
                  Pledged {sortConfig.key === 'pledged_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('paid_amount')}
                >
                  Paid {sortConfig.key === 'paid_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Balance</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Payment Method</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Verified By</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Processed At</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Due Date</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {processedPledges.map(pledge => {
                const badge = getStatusBadge(pledge.status);
                const overdue = isOverdue(pledge);
                const payment = paymentsMap[pledge.id]; // ✅ FIX: Get payment from map
                const campaignName = getCampaignTitle(pledge);

                return (
                  <tr key={pledge.id} className={`hover:bg-slate-50 transition-colors ${overdue ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPledges.includes(pledge.id)}
                        onChange={(e) => setSelectedPledges(
                          e.target.checked
                            ? [...selectedPledges, pledge.id]
                            : selectedPledges.filter(id => id !== pledge.id)
                        )}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{pledge.member_name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{campaignName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{pledge.member_email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{pledge.member_phone}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatCurrency(pledge.pledged_amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">
                      {formatCurrency(pledge.paid_amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">
                      {formatCurrency(pledge.remaining_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    {/* ✅ FIX: Payment Method - now properly displays from payment data */}
                    <td className="px-4 py-3 text-sm">
                      {payment?.payment_method ? (
                        <span className="capitalize text-slate-700 font-medium">
                          {payment.payment_method === 'mpesa' ? 'M-Pesa' : 
                           payment.payment_method === 'bank-transfer' ? 'Bank Transfer' :
                           payment.payment_method === 'cash' ? 'Cash' : 
                           payment.payment_method}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    {/* ✅ FIX: Verified By - now properly shows name instead of ID */}
                    <td className="px-4 py-3 text-sm">
                      {payment?.verified_by_id ? (
                        <div>
                          <p className="font-semibold text-slate-900">
                            {getUserName(payment.verified_by_id)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {payment.verified_at ? new Date(payment.verified_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending</span>
                      )}
                    </td>
                    {/* ✅ FIX: Processed At - now properly displays from payment data */}
                    <td className="px-4 py-3 text-sm">
                      {payment?.processed_at ? (
                        <div>
                          <p className="font-semibold text-slate-900">
                            {new Date(payment.processed_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(payment.processed_at).toLocaleTimeString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not processed</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {pledge.due_date ? (
                        <div>
                          <p className={overdue ? 'font-bold text-red-600' : 'font-semibold text-slate-900'}>
                            {new Date(pledge.due_date).toLocaleDateString()}
                          </p>
                          {overdue && <p className="text-xs text-red-600 font-bold">OVERDUE</p>}
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex items-center justify-center gap-1 flex-wrap">
                      <button
                        onClick={() => setEditingPledge(pledge)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        title="Edit pledge"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setRecordingPaymentFor(pledge)}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                        title="Record payment"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setViewingHistoryFor(pledge)}
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-600"
                        title="View history"
                      >
                        <History size={16} />
                      </button>
                      <button
                        onClick={() => handleCancelPledge(pledge.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        title="Cancel pledge"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {processedPledges.length === 0 && (
          <div className="text-center py-12 text-slate-600">
            <p className="text-lg font-semibold">No pledges found</p>
            <p className="text-sm">Try adjusting your filters or search criteria</p>
            {(filterPledgeStatus !== 'all' || filterCampaign !== 'all' || filterPaymentMethod !== 'all' || searchTerm) && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Clear Filters
              </button>
            )}
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
            queryClient.invalidateQueries({ queryKey: ['payments-map'] }); // ✅ Also invalidate payments
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
            queryClient.invalidateQueries({ queryKey: ['payments-map'] }); // ✅ Also invalidate payments
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
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}