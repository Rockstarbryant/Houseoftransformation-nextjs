// src/app/portal/donations/components/TransactionAuditLogTab.jsx - FIXED
'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Search, Filter, Download, Shield, Clock, User } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/donationHelpers';
import { donationApi } from '@/services/api/donationService';

export default function TransactionAuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    transactionType: '',
    status: '',
    searchTerm: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 50
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [filters.transactionType, filters.status, filters.startDate, filters.endDate, filters.page]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[AUDIT-LOG] Fetching logs with filters:', filters);

      // Build query params
      const queryFilters = {};
      if (filters.transactionType) queryFilters.transactionType = filters.transactionType;
      if (filters.status) queryFilters.status = filters.status;
      if (filters.searchTerm) queryFilters.searchTerm = filters.searchTerm;
      if (filters.startDate) queryFilters.startDate = filters.startDate;
      if (filters.endDate) queryFilters.endDate = filters.endDate;
      if (filters.page) queryFilters.page = filters.page;
      if (filters.limit) queryFilters.limit = filters.limit;

      const response = await donationApi.audit.getAll(queryFilters);

      console.log('[AUDIT-LOG] Response:', response);

      if (response.success) {
        setLogs(response.logs || []);
        setPagination(response.pagination || {
          total: 0,
          pages: 0,
          currentPage: 1,
          limit: 50
        });
      } else {
        throw new Error(response.message || 'Failed to load audit logs');
      }
    } catch (err) {
      console.error('[AUDIT-LOG] Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await donationApi.audit.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('[AUDIT-STATS] Error:', err);
    }
  };

  const handleExport = async () => {
    try {
      console.log('[AUDIT-LOG] Exporting logs');
      
      const queryFilters = {};
      if (filters.transactionType) queryFilters.transactionType = filters.transactionType;
      if (filters.status) queryFilters.status = filters.status;
      if (filters.startDate) queryFilters.startDate = filters.startDate;
      if (filters.endDate) queryFilters.endDate = filters.endDate;

      const response = await donationApi.audit.exportCSV(queryFilters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[AUDIT-LOG] Export error:', err);
      alert('Failed to export audit logs');
    }
  };

  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchAuditLogs();
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      'payment_initiated': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      'payment_success': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'payment_failed': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      'pledge_created': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      'pledge_updated': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      'contribution_recorded': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200',
      'contribution_verified': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200',
      'admin_contribution_created': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200'
    };
    return colors[action] || 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'success': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200',
      'pending': 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200',
      'failed': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200',
      'processing': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200'
    };
    return colors[status] || 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="text-blue-600" size={28} />
              Transaction Audit Log
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Immutable record of all financial transactions for compliance and security
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Logs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-green-600 dark:text-green-400">Successful</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                {stats.byStatus?.find(s => s._id === 'success')?.count || 0}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                {stats.byStatus?.find(s => s._id === 'pending')?.count || 0}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-200">
                {stats.byStatus?.find(s => s._id === 'failed')?.count || 0}
              </p>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by transaction ID..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-white"
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <select
              value={filters.transactionType}
              onChange={(e) => setFilters({ ...filters, transactionType: e.target.value, page: 1 })}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="">All Transaction Types</option>
              <option value="payment_initiated">Payment Initiated</option>
              <option value="payment_success">Payment Success</option>
              <option value="payment_failed">Payment Failed</option>
              <option value="pledge_created">Pledge Created</option>
              <option value="pledge_updated">Pledge Updated</option>
              <option value="contribution">Contribution</option>
              <option value="contribution_verified">Contribution Verified</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="Start Date"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="End Date"
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {!loading && logs.length === 0 && !error && (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
          <Clock size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Audit Logs Yet</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Financial transactions will appear here with full audit trail including who, what, when, and why.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <h3 className="font-bold text-red-900 dark:text-red-200">Error Loading Audit Logs</h3>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Logs Table */}
      {logs.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {log.transactionId?.substring(0, 12)}...
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(log.action)}`}>
                        {log.action?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(log.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {log.paymentMethod?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBadgeColor(log.status)}`}>
                        {log.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {log.userEmail || log.userId?.substring(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} logs
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.currentPage === pagination.pages}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">✅ Audit Trail Information</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• All financial transactions are recorded immutably in the audit log</li>
          <li>• Each record includes: Transaction ID, User, Amount, Status, and Timestamp</li>
          <li>• Logs cannot be modified or deleted (compliance requirement)</li>
          <li>• Use filters to search transactions by date, type, or status</li>
        </ul>
      </div>
    </div>
  );
}