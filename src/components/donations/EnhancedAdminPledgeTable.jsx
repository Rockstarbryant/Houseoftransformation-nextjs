'use client';

import { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, Eye, Download, AlertCircle, ChevronUp, ChevronDown, Printer, History, Filter, X as CloseIcon } from 'lucide-react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDateShort, getStatusBadge } from '@/utils/donationHelpers';
import EditPledgeModal from './EditPledgeModal';
import ManualPaymentModal from './ManualPaymentModal';
import PledgeHistoryModal from './PledgeHistoryModal';

export default function EnhancedAdminPledgeTable({ campaignId = null, refreshTrigger = 0 }) {
  const [pledges, setPledges] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);  // Added to store users
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPledges, setSelectedPledges] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
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

  // Fetch pledges and campaigns
  useEffect(() => {
    fetchPledges();
    fetchCampaigns();
    fetchUsers();  // Added users fetch
  }, [campaignId, refreshTrigger]);

  // Fetch payment details for each pledge
  useEffect(() => {
    if (pledges.length > 0) {
      fetchPaymentDetails();
    }
  }, [pledges]);

  const fetchPledges = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (campaignId) {
        response = await donationApi.pledges.getCampaignPledges(campaignId);
      } else {
        response = await donationApi.pledges.getAllPledges();
      }

      if (response.success && response.pledges) {
        setPledges(response.pledges);
      } else {
        setError(response.message || 'Failed to fetch pledges');
      }
    } catch (err) {
      console.error('[PLEDGE-TABLE] Error:', err);
      setError(err.message || 'Error fetching pledges');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await donationApi.campaigns.getAll();
      
      if (response.success && response.campaigns) {
        setCampaigns(response.campaigns);
        console.log('[CAMPAIGNS] Loaded:', response.campaigns);
      }
    } catch (err) {
      console.error('[CAMPAIGNS] Error:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch users from API - adjust endpoint if needed
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success && data.users) {
        setUsers(data.users);
        console.log('[USERS] Loaded:', data.users);
      }
    } catch (err) {
      console.error('[USERS] Error:', err);
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      const { success, payments: allPayments } = await donationApi.payments.getAll();
      
      if (success && allPayments) {
        const paymentMap = {};
        allPayments.forEach(payment => {
          if (payment.pledge_id) {
            paymentMap[payment.pledge_id] = payment;
          }
        });
        setPayments(paymentMap);
      }
    } catch (err) {
      console.error('[PAYMENT-DETAILS] Error:', err);
    }
  };

  // Get campaign title - it should be in pledge.campaign_title from joinCampaignsWithPledges()
  // If not available, return 'General'
  const getCampaignTitle = (pledge) => {
    if (!pledge) return 'General';
    // Try campaign_title first (set by joinCampaignsWithPledges)
    if (pledge.campaign_title && pledge.campaign_title !== 'Unknown Campaign') {
      return pledge.campaign_title;
    }
    // Fallback to other possible fields
    return pledge.title || pledge.name || 'General';
  };

  const getVerifiedByName = (verifiedById) => {
    if (!verifiedById) return 'Pending';
    
    // If it's already a name (contains spaces or specific patterns), return it
    if (typeof verifiedById === 'string' && (verifiedById.includes(' ') || verifiedById.includes('@'))) {
      return verifiedById;
    }
    
    // Try to find user by id
    const user = users.find(u => 
      String(u.id) === String(verifiedById) || 
      String(u._id) === String(verifiedById) ||
      String(u.user_id) === String(verifiedById)
    );
    
    if (user) {
      return user.name || user.full_name || user.username || user.email || verifiedById;
    }
    
    // Return the ID if user not found (could be user ID that hasn't loaded)
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

  const handleCancelPledge = async (pledgeId) => {
    if (!window.confirm('Are you sure you want to cancel this pledge? This action cannot be undone.')) return;

    try {
      const response = await donationApi.pledges.cancel(pledgeId);
      if (response.success) {
        setPledges(pledges.filter(p => p.id !== pledgeId));
      } else {
        alert(response.message || 'Failed to cancel pledge');
      }
    } catch (err) {
      alert('Error cancelling pledge: ' + err.message);
    }
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

  if (loading) {
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
          <p className="text-red-700">{error}</p>
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
            fetchPledges();
          }}
        />
      )}

      {recordingPaymentFor && (
        <ManualPaymentModal
          pledge={recordingPaymentFor}
          onClose={() => setRecordingPaymentFor(null)}
          onSuccess={() => {
            setRecordingPaymentFor(null);
            fetchPledges();
            fetchPaymentDetails();
          }}
        />
      )}

      {viewingHistoryFor && (
        <PledgeHistoryModal
          pledge={viewingHistoryFor}
          onClose={() => setViewingHistoryFor(null)}
        />
      )}
    </div>
  );
}