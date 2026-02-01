// components/donations/mobile/AdminPledgeCards.jsx
// ✅ ENHANCED VERSION - All PC features adapted for mobile with FULL-WIDTH edge-to-edge cards

'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDateShort, getStatusBadge } from '@/utils/donationHelpers';
import {
  Users, Search, Filter, X, ChevronDown, AlertTriangle, DollarSign,
  Download, Printer, CheckSquare, Square, TrendingUp, TrendingDown,
  Calendar, CreditCard, Phone, Mail, Edit, Trash2, Eye, History
} from 'lucide-react';

// ============================================
// HELPER FUNCTIONS
// ============================================

const isOverdue = (pledge) => {
  if (pledge.status === 'completed' || pledge.status === 'cancelled') return false;
  return pledge.due_date && new Date(pledge.due_date) < new Date();
};

const getCampaignTitle = (pledge) => {
  if (!pledge) return 'General';
  if (pledge.campaign_title && pledge.campaign_title !== 'Unknown Campaign') {
    return pledge.campaign_title;
  }
  return pledge.title || pledge.name || 'General';
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function EnhancedAdminPledgeCards({ 
  campaignId = null,
  refreshTrigger = 0,
  onRecordPayment, 
  onViewHistory,
  onEditPledge,      
  onCancelPledge     
}) {
  const queryClient = useQueryClient();

  // ============================================
  // STATE
  // ============================================
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedPledges, setSelectedPledges] = useState([]);

  // ✅ Filter states (from PC)
  const [filterPledgeStatus, setFilterPledgeStatus] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);
  const [filterAmountMin, setFilterAmountMin] = useState('');
  const [filterAmountMax, setFilterAmountMax] = useState('');

  // ============================================
  // ✅ DATA FETCHING WITH TANSTACK QUERY
  // ============================================

  // Fetch pledges
  const { data: pledges = [], isLoading, error } = useQuery({
    queryKey: ['pledges', campaignId, refreshTrigger],
    queryFn: async () => {
      let response;
      if (campaignId) {
        response = await donationApi.pledges.getCampaignPledges(campaignId);
      } else {
        response = await donationApi.pledges.getAllPledges(1, 200);
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

  // ✅ Fetch payments for payment method filtering
  const { data: payments = {} } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { success, payments: allPayments } = await donationApi.payments.getAll({ limit: 500 });
      
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

  // ============================================
  // ✅ FILTER AND SORT LOGIC (From PC)
  // ============================================

  const processedPledges = useMemo(() => {
    let filtered = pledges;

    // Status filter
    if (filterPledgeStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterPledgeStatus);
    }

    // Campaign filter
    if (filterCampaign !== 'all') {
      filtered = filtered.filter(p => getCampaignTitle(p) === filterCampaign);
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

    // Search
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.member_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.member_phone?.includes(searchTerm) ||
        getCampaignTitle(p).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (['pledged_amount', 'paid_amount', 'remaining_amount'].includes(sortConfig.key)) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortConfig.key === 'created_at' || sortConfig.key === 'due_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [pledges, sortConfig, filterPledgeStatus, filterCampaign, filterPaymentMethod, filterOverdueOnly, filterAmountMin, filterAmountMax, searchTerm, payments]);

  // ============================================
  // ✅ STATISTICS (From PC)
  // ============================================

  const stats = useMemo(() => ({
    total: processedPledges.length,
    pledged: processedPledges.reduce((s, p) => s + (p.pledged_amount || 0), 0),
    paid: processedPledges.reduce((s, p) => s + (p.paid_amount || 0), 0),
    remaining: processedPledges.reduce((s, p) => s + (p.remaining_amount || 0), 0),
    completed: processedPledges.filter(p => p.status === 'completed').length,
    overdue: processedPledges.filter(isOverdue).length,
    collectionRate: 0
  }), [processedPledges]);

  stats.collectionRate = stats.pledged > 0 ? Math.round((stats.paid / stats.pledged) * 100) : 0;

  // ============================================
  // ✅ HANDLERS
  // ============================================

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
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

  const hasFilters = searchTerm || 
    filterPledgeStatus !== 'all' || 
    filterCampaign !== 'all' ||
    filterPaymentMethod !== 'all' ||
    filterOverdueOnly ||
    filterAmountMin ||
    filterAmountMax;

  // ✅ Bulk select
  const handleSelectAll = () => {
    if (selectedPledges.length === processedPledges.length) {
      setSelectedPledges([]);
    } else {
      setSelectedPledges(processedPledges.map(p => p.id));
    }
  };

  const handleSelectPledge = (pledgeId) => {
    setSelectedPledges(prev =>
      prev.includes(pledgeId)
        ? prev.filter(id => id !== pledgeId)
        : [...prev, pledgeId]
    );
  };

  // ✅ Export to CSV
  const handleExport = () => {
    const exportPledges = selectedPledges.length > 0 
      ? processedPledges.filter(p => selectedPledges.includes(p.id))
      : processedPledges;

    const csv = [
      ['Member', 'Campaign', 'Email', 'Phone', 'Pledged', 'Paid', 'Balance', 'Status', 'Payment Method', 'Due Date'],
      ...exportPledges.map(pledge => {
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
    window.URL.revokeObjectURL(url);
  };

  // ✅ Print
  const handlePrint = () => {
    const printPledges = selectedPledges.length > 0 
      ? processedPledges.filter(p => selectedPledges.includes(p.id))
      : processedPledges;

    const printWindow = window.open('', '', 'height=600,width=800');
    const html = `
      <html>
        <head>
          <title>Pledges Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            h2 { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>Pledges Report</h2>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Total Pledges: ${printPledges.length}</p>
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
              ${printPledges.map(pledge => `
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

  // ============================================
  // LOADING & ERROR STATES
  // ============================================

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDB022]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3">
        <AlertTriangle className="text-red-600" size={24} />
        <div>
          <h3 className="font-bold text-red-900 dark:text-red-200">Error Loading Pledges</h3>
          <p className="text-red-700 dark:text-red-300 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="-mx-4 space-y-4">
      {/* ✅ FULL-WIDTH STATS SUMMARY - EDGE TO EDGE */}
      <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white p-4">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <Users size={14} />
              <p className="text-[10px] font-medium opacity-90">Total</p>
            </div>
            <p className="text-xl font-black">{stats.total}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign size={14} />
              <p className="text-[10px] font-medium opacity-90">Pledged</p>
            </div>
            <p className="text-xl font-black">{(stats.pledged / 1000).toFixed(0)}K</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={14} />
              <p className="text-[10px] font-medium opacity-90">Collected</p>
            </div>
            <p className="text-xl font-black">{(stats.paid / 1000).toFixed(0)}K</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown size={14} />
              <p className="text-[10px] font-medium opacity-90">Balance</p>
            </div>
            <p className="text-xl font-black">{(stats.remaining / 1000).toFixed(0)}K</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle size={14} />
              <p className="text-[10px] font-medium opacity-90">Overdue</p>
            </div>
            <p className="text-xl font-black text-orange-300">{stats.overdue}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign size={14} />
              <p className="text-[10px] font-medium opacity-90">Rate</p>
            </div>
            <p className="text-xl font-black text-green-300">{stats.collectionRate}%</p>
          </div>
        </div>
      </div>

      {/* ✅ SEARCH BAR */}
      <div className="relative px-4">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search member, email, phone, campaign..."
          className="w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#FDB022] outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ✅ TOOLBAR - FILTERS, SORT, EXPORT, PRINT, BULK SELECT */}
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
          onClick={() => handleSort(sortConfig.key)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
        >
          {sortConfig.direction === 'asc' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          Sort
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

        {processedPledges.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-purple-600 text-white"
          >
            {selectedPledges.length === processedPledges.length ? <CheckSquare size={16} /> : <Square size={16} />}
            {selectedPledges.length > 0 ? `${selectedPledges.length} Selected` : 'Select All'}
          </button>
        )}
      </div>

      {/* ✅ FILTERS PANEL */}
      {showFilters && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mx-4 space-y-3 border border-slate-200 dark:border-slate-700">
          {/* Basic Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Status
              </label>
              <select 
                value={filterPledgeStatus} 
                onChange={(e) => setFilterPledgeStatus(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Campaign
              </label>
              <select 
                value={filterCampaign} 
                onChange={(e) => setFilterCampaign(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map(c => (
                  <option key={c._id || c.id} value={c.title || c.name}>
                    {c.title || c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="w-full py-2 text-sm font-semibold text-[#FDB022] hover:underline flex items-center justify-center gap-1"
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            <ChevronDown size={14} className={showAdvancedFilters ? 'rotate-180' : ''} />
          </button>

          {/* ✅ ADVANCED FILTERS (From PC) */}
          {showAdvancedFilters && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Payment Method
                </label>
                <select 
                  value={filterPaymentMethod} 
                  onChange={(e) => setFilterPaymentMethod(e.target.value)} 
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
                >
                  <option value="all">All Methods</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Min Amount (KES)
                  </label>
                  <input 
                    type="number"
                    value={filterAmountMin}
                    onChange={(e) => setFilterAmountMin(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Max Amount (KES)
                  </label>
                  <input 
                    type="number"
                    value={filterAmountMax}
                    onChange={(e) => setFilterAmountMax(e.target.value)}
                    placeholder="∞"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={filterOverdueOnly}
                  onChange={(e) => setFilterOverdueOnly(e.target.checked)}
                  className="w-4 h-4 text-[#FDB022] rounded focus:ring-2 focus:ring-[#FDB022]"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Show Overdue Only
                </span>
              </label>
            </div>
          )}

          {/* Clear Filters */}
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

      {/* ✅ SORT OPTIONS PANEL */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mx-4 border border-slate-200 dark:border-slate-700">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Sort By:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'created_at', label: 'Date' },
            { key: 'member_name', label: 'Name' },
            { key: 'pledged_amount', label: 'Amount' },
            { key: 'status', label: 'Status' },
            { key: 'due_date', label: 'Due Date' }
          ].map(option => (
            <button
              key={option.key}
              onClick={() => handleSort(option.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sortConfig.key === option.key
                  ? 'bg-[#FDB022] text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {option.label}
              {sortConfig.key === option.key && (
                sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ NO RESULTS */}
      {processedPledges.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 mx-4 text-center border border-slate-200 dark:border-slate-700">
          <Users size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No pledges found
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {hasFilters ? 'Try adjusting your filters' : 'No pledges available'}
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
          {/* ✅ PLEDGE CARDS - FULL WIDTH EDGE TO EDGE */}
          <div className="space-y-0">
            {processedPledges.map((pledge, index) => {
              const overdue = isOverdue(pledge);
              const isExpanded = expandedCard === pledge.id;
              const isSelected = selectedPledges.includes(pledge.id);
              const progress = pledge.pledged_amount > 0 
                ? Math.round((pledge.paid_amount / pledge.pledged_amount) * 100) 
                : 0;

              return (
                <div 
                  key={pledge.id}
                  className={`w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 ${
                    index === 0 ? 'border-t' : ''
                  } ${isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
                >
                  {/* Card Header - Always Visible */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedCard(isExpanded ? null : pledge.id)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPledge(pledge.id);
                        }}
                        className="mt-1 flex-shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare size={20} className="text-[#FDB022]" />
                        ) : (
                          <Square size={20} className="text-slate-400" />
                        )}
                      </button>

                      {/* Member Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">
                          {pledge.member_name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                          <Mail size={12} className="flex-shrink-0" />
                          <span className="truncate">{pledge.member_email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Phone size={12} className="flex-shrink-0" />
                          <span>{pledge.member_phone}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-semibold truncate">
                          {getCampaignTitle(pledge)}
                        </p>
                      </div>

                      {/* Status & Expand */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          pledge.status === 'completed' ? 'bg-green-100 text-green-800' :
                          pledge.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                          pledge.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pledge.status}
                        </span>
                        <ChevronDown 
                          size={20} 
                          className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500">Pledged</p>
                        <p className="font-bold text-sm">{(pledge.pledged_amount / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500">Paid</p>
                        <p className="font-bold text-sm text-green-600">{(pledge.paid_amount / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500">Balance</p>
                        <p className="font-bold text-sm text-red-600">{(pledge.remaining_amount / 1000).toFixed(0)}K</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-green-600"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Overdue Warning */}
                    {overdue && (
                      <div className="flex items-center gap-1 text-orange-600 text-xs font-semibold">
                        <AlertTriangle size={12} /> Overdue
                      </div>
                    )}
                  </div>

                  {/* ✅ Expandable Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                      {/* Full Details */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-slate-500">Created</p>
                          <p className="font-semibold">{formatDateShort(pledge.created_at)}</p>
                        </div>
                        {pledge.due_date && (
                          <div>
                            <p className="text-slate-500">Due Date</p>
                            <p className="font-semibold">{formatDateShort(pledge.due_date)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-slate-500">Pledged</p>
                          <p className="font-semibold">{formatCurrency(pledge.pledged_amount)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Paid</p>
                          <p className="font-semibold text-green-600">{formatCurrency(pledge.paid_amount)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-500">Payment Method</p>
                          <p className="font-semibold">{payments[pledge.id]?.payment_method?.toUpperCase() || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onRecordPayment && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRecordPayment(pledge);
                            }}
                            className="py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                          >
                            <DollarSign size={14} />
                            Record Payment
                          </button>
                        )}

                        {onViewHistory && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewHistory(pledge);
                            }}
                            className="py-2.5 bg-purple-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                          >
                            <History size={14} />
                            History
                          </button>
                        )}

                        {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onEditPledge && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditPledge(pledge);
                            }}
                            className="py-2.5 bg-green-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                        )}

                        {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onCancelPledge && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancelPledge(pledge);
                            }}
                            className="py-2.5 bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                          >
                            <Trash2 size={14} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ✅ Footer Summary */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mx-4 text-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400">Collection Rate</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {stats.collectionRate}%
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400">Showing</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {processedPledges.length} pledges
              </span>
            </div>
            {selectedPledges.length > 0 && (
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-blue-600 dark:text-blue-400">Selected</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {selectedPledges.length} items
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}