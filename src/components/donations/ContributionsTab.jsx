'use client';

import { useState, useEffect, useMemo } from 'react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDate, getStatusBadge } from '@/utils/donationHelpers';
import { Eye, CheckCircle, Download, Filter, Search, DollarSign, X, Printer } from 'lucide-react';

export default function ContributionsTab() {
  // ============================================
  // STATE
  // ============================================
  const [allContributions, setAllContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContributions, setSelectedContributions] = useState(new Set());
  
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    campaignId: '',
    searchTerm: ''
  });

  const [campaigns, setCampaigns] = useState([]);

  // ============================================
  // FETCH DATA ON MOUNT
  // ============================================
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch contributions and campaigns in parallel
      const [contribResponse, campaignsResponse] = await Promise.all([
        donationApi.contributions.getAll({ limit: 1000 }),
        donationApi.campaigns.getAll()
      ]);

      if (contribResponse.success) {
        setAllContributions(contribResponse.contributions || []);
      }

      if (campaignsResponse.success) {
        setCampaigns(campaignsResponse.campaigns || []);
      }
    } catch (error) {
      console.error('[CONTRIBUTIONS] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CLIENT-SIDE FILTERING (NO REFETCH)
  // ============================================
  const filteredContributions = useMemo(() => {
    let filtered = [...allContributions];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    // Filter by payment method
    if (filters.paymentMethod) {
      filtered = filtered.filter(c => c.payment_method === filters.paymentMethod);
    }

    // Filter by campaign
    if (filters.campaignId) {
      filtered = filtered.filter(c => c.campaign_id === filters.campaignId);
    }

    // Filter by search term
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
    
    // Total by method
    const byMethod = {
      mpesa: 0,
      cash: 0,
      bank_transfer: 0
    };
    
    verified.forEach(c => {
      const method = c.payment_method || 'cash';
      byMethod[method] = (byMethod[method] || 0) + Number(c.amount || 0);
    });

    // Total by campaign
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
  // HANDLERS
  // ============================================
  const handleVerify = async (contributionId) => {
    if (!confirm('Verify this contribution? This will mark it as confirmed.')) return;

    try {
      const response = await donationApi.contributions.verify(contributionId);
      
      if (response.success) {
        // Update local state
        setAllContributions(prev => 
          prev.map(c => 
            c.id === contributionId 
              ? { ...c, status: 'verified', verified_at: new Date().toISOString() }
              : c
          )
        );
        alert('Contribution verified successfully');
      }
    } catch (error) {
      console.error('[CONTRIBUTIONS] Verify error:', error);
      alert('Failed to verify contribution');
    }
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
      alert('No data to print');
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
      alert('No data to export');
      return;
    }

    // Create CSV
    const headers = ['Contributor', 'Campaign', 'Amount', 'Method', 'M-Pesa Ref', 'Status', 'Date'];
    const csvRows = dataToPrint.map(c => [
      c.is_anonymous ? 'Anonymous' : c.contributor_name,
      c.campaign_title || 'General',
      c.amount,
      c.payment_method || 'cash',
      c.mpesa_ref || '',
      c.status,
      new Date(c.created_at).toLocaleDateString()
    ].join(','));

    const csv = [headers.join(','), ...csvRows].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contributions-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Direct Contributions</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            One-time donations without pledges
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Printer size={18} />
            Print {selectedContributions.size > 0 ? 'Selected' : 'All'}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Raised</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(stats.total)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Verified</p>
          <p className="text-2xl font-bold text-green-600">{stats.count.verified}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.count.pending}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.count.failed}</p>
        </div>
      </div>

      {/* Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">M-Pesa</p>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(stats.byMethod.mpesa)}</p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300 font-semibold">Cash</p>
          <p className="text-xl font-bold text-green-900 dark:text-green-100">{formatCurrency(stats.byMethod.cash)}</p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">Bank Transfer</p>
          <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(stats.byMethod.bank_transfer)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-slate-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Filters</h3>
          {(filters.status || filters.paymentMethod || filters.campaignId || filters.searchTerm) && (
            <button
              onClick={() => setFilters({ status: '', paymentMethod: '', campaignId: '', searchTerm: '' })}
              className="ml-auto text-xs text-red-600 hover:underline font-semibold flex items-center gap-1"
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Methods</option>
            <option value="mpesa">M-Pesa</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>

          <select
            value={filters.campaignId}
            onChange={(e) => setFilters(prev => ({ ...prev, campaignId: e.target.value }))}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Campaigns</option>
            {campaigns.map(campaign => (
              <option key={campaign.supabaseId} value={campaign.supabaseId}>
                {campaign.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContributions.size === filteredContributions.length && filteredContributions.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Contributor</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">M-Pesa Ref</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredContributions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400">No contributions found</p>
                  </td>
                </tr>
              ) : (
                filteredContributions.map(contrib => {
                  const statusBadge = getStatusBadge(contrib.status);
                  
                  return (
                    <tr key={contrib.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedContributions.has(contrib.id)}
                          onChange={() => handleSelectRow(contrib.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {contrib.is_anonymous ? 'Anonymous' : contrib.contributor_name}
                          </p>
                          {!contrib.is_anonymous && (
                            <>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{contrib.contributor_email}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-500">{contrib.contributor_phone}</p>
                            </>
                          )}
                          {contrib.created_by_name && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Added by {contrib.created_by_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {contrib.campaign_title || 'General Offering'}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(contrib.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                          {(contrib.payment_method || 'cash').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {contrib.mpesa_ref ? (
                          <code className="text-xs bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                            {contrib.mpesa_ref}
                          </code>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                        {contrib.verified_by_name && contrib.status === 'verified' && (
                          <p className="text-xs text-green-600 mt-1">
                            By {contrib.verified_by_name}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {formatDate(contrib.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {contrib.status === 'pending' && (
                            <button
                              onClick={() => handleVerify(contrib.id)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors"
                              title="Verify Contribution"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                            title="View Details"
                            onClick={() => alert(JSON.stringify(contrib, null, 2))}
                          >
                            <Eye size={18} />
                          </button>
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

      {/* Top Campaigns */}
      {Object.keys(stats.byCampaign).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Top Campaigns by Contributions</h4>
          <div className="space-y-2">
            {Object.entries(stats.byCampaign)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([campaign, amount]) => (
                <div key={campaign} className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                  <span className="text-slate-700 dark:text-slate-300">{campaign}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(amount)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}