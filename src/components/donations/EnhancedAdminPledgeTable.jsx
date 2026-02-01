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

  // Fetch users
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

  // Fetch payment details
  const { data: payments = {} } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { success, payments: allPayments } = await donationApi.payments.getAll();
      
      if (success && allPayments) {
        const paymentMap = {};
        allPayments.forEach(payment => {
          if (payment.pledge_id) {
            paymentMap[payment.pledge_id] = payment;
          }
        });
        return paymentMap;
      }
      return {};
    },
    enabled: pledges.length > 0,
    staleTime: 30000,
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

  // Helper functions
  const getCampaignTitle = (pledge) => {
    if (!pledge) return 'General';
    if (pledge.campaign_title && pledge.campaign_title !== 'Unknown Campaign') {
      return pledge.campaign_title;
    }
    return pledge.title || pledge.name || 'General';
  };

  const getVerifiedByName = (verifiedById) => {
    if (!verifiedById) return 'Pending';
    
    if (typeof verifiedById === 'string' && (verifiedById.includes(' ') || verifiedById.includes('@'))) {
      return verifiedById;
    }
    
    const user = users.find(u => 
      String(u.id) === String(verifiedById) || 
      String(u._id) === String(verifiedById) ||
      String(u.user_id) === String(verifiedById)
    );
    
    if (user) {
      return user.name || user.full_name || user.username || user.email || verifiedById;
    }
    
    return verifiedById;
  };

  const isOverdue = (pledge) => {
    if (!pledge.due_date || pledge.status === 'completed' || pledge.status === 'cancelled') {
      return false;
    }
    return new Date(pledge.due_date) < new Date();
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

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

  const handleConfirmAction = () => {
    const { action, pledgeId } = confirmDialog;
    
    if (action === 'cancel') {
      cancelMutation.mutate(pledgeId);
    }
    
    setConfirmDialog({ isOpen: false, action: null, pledgeId: null });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPledges(processedPledges.map(p => p.id));
    } else {
      setSelectedPledges([]);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    const html = `
      <html>
        <head>
          <title>Pledges Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <h2>Pledges Report</h2>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Campaign</th>
                <th>Email</th>
                <th>Phone</th>
                <th class="text-right">Pledged</th>
                <th class="text-right">Paid</th>
                <th class="text-right">Balance</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${processedPledges.map(pledge => `
                <tr>
                  <td>${pledge.member_name}</td>
                  <td>${getCampaignTitle(pledge)}</td>
                  <td>${pledge.member_email}</td>
                  <td>${pledge.member_phone}</td>
                  <td class="text-right">KES ${Number(pledge.pledged_amount).toFixed(2)}</td>
                  <td class="text-right">KES ${Number(pledge.paid_amount).toFixed(2)}</td>
                  <td class="text-right">KES ${Number(pledge.remaining_amount).toFixed(2)}</td>
                  <td>${pledge.status.toUpperCase()}</td>
                  <td>${pledge.due_date ? new Date(pledge.due_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExport = () => {
    const csv = [
      ['Member', 'Campaign', 'Email', 'Phone', 'Pledged', 'Paid', 'Balance', 'Status', 'Payment Method', 'Verified By', 'Processed At', 'Due Date'],
      ...processedPledges.map(pledge => {
        const payment = payments[pledge.id];
        return [
          pledge.member_name,
          getCampaignTitle(pledge),
          pledge.member_email,
          pledge.member_phone,
          pledge.pledged_amount,
          pledge.paid_amount,
          pledge.remaining_amount,
          pledge.status,
          payment?.payment_method || 'N/A',
          payment?.verified_by_id ? getVerifiedByName(payment.verified_by_id) : 'N/A',
          payment?.processed_at ? new Date(payment.processed_at).toLocaleDateString() : 'N/A',
          pledge.due_date ? new Date(pledge.due_date).toLocaleDateString() : 'N/A'
        ];
      })
    ];

    const csvContent = csv.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pledges-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const resetFilters = () => {
    setFilterPledgeStatus('all');
    setFilterCampaign('all');
    setFilterPaymentMethod('all');
    setFilterOverdueOnly(false);
    setFilterAmountMin('');
    setFilterAmountMax('');
    setSearchTerm('');
    setShowAdvancedFilters(false);
  };

  // Filter and sort
  const processedPledges = useMemo(() => {
    let filtered = pledges;

    // Status filter
    if (filterPledgeStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterPledgeStatus);
    }

    // Campaign filter - match campaign_title from pledge
    if (filterCampaign !== 'all') {
      filtered = filtered.filter(p => (p.campaign_title || 'General') === filterCampaign);
    }

    // Payment method filter
    if (filterPaymentMethod !== 'all') {
      filtered = filtered.filter(p => {
        const payment = payments[p.id];
        return payment?.payment_method === filterPaymentMethod;
      });
    }

    // Amount range filter
    if (filterAmountMin) {
      filtered = filtered.filter(p => p.pledged_amount >= Number(filterAmountMin));
    }
    if (filterAmountMax) {
      filtered = filtered.filter(p => p.pledged_amount <= Number(filterAmountMax));
    }

    // Overdue filter
    if (filterOverdueOnly) {
      filtered = filtered.filter(p => isOverdue(p));
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.member_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.member_phone?.includes(searchTerm) ||
        (p.campaign_title || 'General').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [pledges, sortConfig, filterPledgeStatus, filterCampaign, filterPaymentMethod, filterOverdueOnly, filterAmountMin, filterAmountMax, searchTerm, payments, campaigns]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
        <AlertCircle className="text-red-600" size={24} />
        <div>
          <h3 className="font-bold text-red-900">Error Loading Pledges</h3>
          <p className="text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Search by name, email, phone, or campaign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title="Show/hide advanced filters"
          >
            <Filter size={18} />
            Filters
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Print pledges"
          >
            <Printer size={18} />
            Print
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Export to CSV"
          >
            <Download size={18} />
            Export
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={filterPledgeStatus}
                  onChange={(e) => setFilterPledgeStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Campaign Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Campaign</label>
                <select
                  value={filterCampaign}
                  onChange={(e) => setFilterCampaign(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="all">All Campaigns</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id || campaign._id} value={campaign.id || campaign._id}>
                      {campaign.title || campaign.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                <select
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="all">All Methods</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="cash">Cash</option>
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              {/* Min Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Min Amount</label>
                <input
                  type="number"
                  value={filterAmountMin}
                  onChange={(e) => setFilterAmountMin(e.target.value)}
                  placeholder="Min amount"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Max Amount</label>
                <input
                  type="number"
                  value={filterAmountMax}
                  onChange={(e) => setFilterAmountMax(e.target.value)}
                  placeholder="Max amount"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              {/* Overdue Only */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={filterOverdueOnly}
                    onChange={(e) => setFilterOverdueOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">Overdue Only</span>
                </label>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-3 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 transition-colors text-sm font-medium"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedPledges.length > 0 && (
          <div className="text-sm text-slate-600">
            {selectedPledges.length} pledge(s) selected | Showing {processedPledges.length} of {pledges.length}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedPledges.length === processedPledges.length && processedPledges.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Member</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Campaign</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Phone</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700 cursor-pointer" onClick={() => handleSort('pledged_amount')}>
                  Pledged {sortConfig.key === 'pledged_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Paid</th>
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
                const payment = payments[pledge.id];
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
                    <td className="px-4 py-3 text-sm">
                      {payment ? (
                        <span className="capitalize text-slate-700 font-medium">{payment.payment_method}</span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {payment?.verified_by_id ? (
                        <div>
                          <p className="font-semibold text-slate-900">{getVerifiedByName(payment.verified_by_id)}</p>
                          <p className="text-xs text-slate-500">
                            {payment.verified_at ? new Date(payment.verified_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending</span>
                      )}
                    </td>
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
            queryClient.invalidateQueries({ queryKey: ['payments'] });
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