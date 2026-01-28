// src/app/portal/donations/components/TransactionAuditLogTab.jsx
'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Search, Filter, Download, Shield, Clock, User } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/donationHelpers';

export default function TransactionAuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    searchId: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implement audit log fetch from API
      // For now, show empty state
      setLogs([]);
    } catch (err) {
      console.error('[AUDIT-LOG] Error:', err);
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('[AUDIT-LOG] Export audit logs');
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      'payment_initiated': 'bg-blue-100 text-blue-800',
      'payment_success': 'bg-green-100 text-green-800',
      'payment_failed': 'bg-red-100 text-red-800',
      'pledge_created': 'bg-purple-100 text-purple-800',
      'pledge_updated': 'bg-yellow-100 text-yellow-800',
      'contribution_recorded': 'bg-indigo-100 text-indigo-800',
      'contribution_verified': 'bg-emerald-100 text-emerald-800'
    };
    return colors[action] || 'bg-slate-100 text-slate-800';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'success': 'bg-green-50 border-green-200 text-green-800',
      'pending': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'failed': 'bg-red-50 border-red-200 text-red-800',
      'processing': 'bg-blue-50 border-blue-200 text-blue-800'
    };
    return colors[status] || 'bg-slate-50 border-slate-200 text-slate-800';
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
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="text-blue-600" size={28} />
              Transaction Audit Log
            </h2>
            <p className="text-slate-600 mt-1">
              Immutable record of all financial transactions for compliance and security
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by transaction ID..."
              value={filters.searchId}
              onChange={(e) => setFilters({ ...filters, searchId: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Transaction Types</option>
              <option value="payment_initiated">Payment Initiated</option>
              <option value="payment_success">Payment Success</option>
              <option value="payment_failed">Payment Failed</option>
              <option value="pledge_created">Pledge Created</option>
              <option value="pledge_updated">Pledge Updated</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {logs.length === 0 && !error && (
        <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
          <Clock size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Audit Logs Yet</h3>
          <p className="text-slate-600">
            Financial transactions will appear here with full audit trail including who, what, when, and why.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <h3 className="font-bold text-red-900">Error Loading Audit Logs</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Logs Table */}
      {logs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        {log.transactionId?.substring(0, 12)}...
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(log.transactionType)}`}>
                        {log.transactionType?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {formatCurrency(log.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBadgeColor(log.status)}`}>
                        {log.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-700">{log.userId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => console.log('Show details:', log)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-bold text-blue-900 mb-2">✅ Audit Trail Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All financial transactions are recorded immutably in the audit log</li>
          <li>• Each record includes: Transaction ID, User, Amount, Status, and Timestamp</li>
          <li>• Logs cannot be modified or deleted (compliance requirement)</li>
          <li>• Use filters to search transactions by date, type, or status</li>
        </ul>
      </div>
    </div>
  );
}