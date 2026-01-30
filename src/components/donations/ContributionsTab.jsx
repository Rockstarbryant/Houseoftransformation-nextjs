'use client';

import { useState, useEffect } from 'react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDate, getStatusBadge } from '@/utils/donationHelpers';
import { Eye, CheckCircle, Download, Filter, Search, DollarSign, Printer } from 'lucide-react';

export default function ContributionsTab() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    campaignId: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContributions, setSelectedContributions] = useState(new Set());

  useEffect(() => {
    fetchContributions();
  }, [filters]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const response = await donationApi.contributions.getAll(filters);
      
      if (response.success) {
        setContributions(response.contributions || []);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('[CONTRIBUTIONS] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (contributionId) => {
    if (!confirm('Verify this contribution? This will mark it as confirmed.')) return;

    try {
      const response = await donationApi.contributions.verify(contributionId);
      
      if (response.success) {
        // Refresh list
        fetchContributions();
        alert('Contribution verified successfully');
      }
    } catch (error) {
      console.error('[CONTRIBUTIONS] Verify error:', error);
      alert('Failed to verify contribution');
    }
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    alert('Export feature coming soon');
  };

  // Handle select all
const handleSelectAll = (e) => {
  if (e.target.checked) {
    setSelectedContributions(new Set(contributions.map(c => c.id)));
  } else {
    setSelectedContributions(new Set());
  }
};

// Handle select one
const handleSelectRow = (id) => {
  const newSelected = new Set(selectedContributions);
  if (newSelected.has(id)) {
    newSelected.delete(id);
  } else {
    newSelected.add(id);
  }
  setSelectedContributions(newSelected);
};

// Print function
const handlePrint = () => {
  const dataToPrint = selectedContributions.size > 0
    ? contributions.filter(c => selectedContributions.has(c.id))
    : contributions;

  const printWindow = window.open('', '', 'height=600,width=800');
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Contributions Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Contributions Report</h1>
        <table>
          <thead>
            <tr>
              <th>Contributor</th>
              <th>Campaign</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${dataToPrint.map(c => `
              <tr>
                <td>${c.is_anonymous ? 'Anonymous' : c.contributor_name}</td>
                <td>${c.campaign_title}</td>
                <td>KES ${c.amount.toLocaleString()}</td>
                <td>${c.payment_method}</td>
                <td>${c.status}</td>
                <td>${new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
};

  // Calculate stats
  const stats = {
    total: contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0),
    pending: contributions.filter(c => c.status === 'pending').length,
    verified: contributions.filter(c => c.status === 'verified').length,
    failed: contributions.filter(c => c.status === 'failed').length
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
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <Printer size={18} className="inline mr-2" />
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
          <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-slate-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value, page: 1 })}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Methods</option>
            <option value="mpesa">M-Pesa</option>
            <option value="bank-transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>

          <button
            onClick={() => {
              setFilters({ status: '', paymentMethod: '', campaignId: '', page: 1, limit: 20 });
              setSearchTerm('');
            }}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3"><input type="checkbox" checked={selectedContributions.size === contributions.length} onChange={handleSelectAll}/></th>
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
              {contributions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400">No contributions found</p>
                  </td>
                </tr>
              ) : (
                contributions
                  .filter(contrib => {
                    if (!searchTerm) return true;
                    const search = searchTerm.toLowerCase();
                    return (
                      contrib.contributor_name?.toLowerCase().includes(search) ||
                      contrib.contributor_email?.toLowerCase().includes(search) ||
                      contrib.contributor_phone?.includes(search)
                    );
                  })
                  .map(contrib => {
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
                            {contrib.payment_method?.toUpperCase()}
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

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
            {pagination.total} contributions
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: pagination.currentPage - 1 })}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setFilters({ ...filters, page })}
                  className={`w-10 h-10 rounded-lg font-semibold ${
                    page === pagination.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFilters({ ...filters, page: pagination.currentPage + 1 })}
              disabled={pagination.currentPage === pagination.pages}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}