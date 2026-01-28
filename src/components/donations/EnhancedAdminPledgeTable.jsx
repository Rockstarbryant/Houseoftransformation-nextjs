'use client';

import { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, Eye, Download, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { donationApi } from '@/services/api/donationService';
import { formatCurrency, formatDateShort, getStatusBadge } from '@/utils/donationHelpers';
import EditPledgeModal from './EditPledgeModal';
import ManualPaymentModal from './ManualPaymentModal';

export default function EnhancedAdminPledgeTable({ campaignId = null, refreshTrigger = 0 }) {
  const [pledges, setPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPledges, setSelectedPledges] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingPledge, setEditingPledge] = useState(null);
  const [recordingPaymentFor, setRecordingPaymentFor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState({});

  // Fetch pledges
  useEffect(() => {
    fetchPledges();
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

  const handleDelete = async (pledgeId) => {
    if (!window.confirm('Are you sure you want to delete this pledge?')) return;

    try {
      const response = await donationApi.pledges.cancel(pledgeId);
      if (response.success) {
        setPledges(pledges.filter(p => p.id !== pledgeId));
      } else {
        alert(response.message || 'Failed to delete pledge');
      }
    } catch (err) {
      alert('Error deleting pledge: ' + err.message);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPledges(processedPledges.map(p => p.id));
    } else {
      setSelectedPledges([]);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Member', 'Email', 'Phone', 'Pledged', 'Paid', 'Balance', 'Status', 'Payment Method', 'Verified By', 'Processed At', 'Due Date'],
      ...processedPledges.map(pledge => {
        const payment = payments[pledge.id];
        return [
          pledge.member_name,
          pledge.member_email,
          pledge.member_phone,
          pledge.pledged_amount,
          pledge.paid_amount,
          pledge.remaining_amount,
          pledge.status,
          payment?.payment_method || 'N/A',
          payment?.verified_by_id || 'N/A',
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

  // Filter and sort
  const processedPledges = useMemo(() => {
    let filtered = pledges;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.member_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.member_phone?.includes(searchTerm)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [pledges, sortConfig, filterStatus, searchTerm]);

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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {selectedPledges.length > 0 && (
          <div className="text-sm text-slate-600">
            {selectedPledges.length} pledge(s) selected
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
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Phone</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700 cursor-pointer" onClick={() => handleSort('pledged_amount')}>
                  Pledged
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
                        <span className="capitalize text-slate-700">{payment.payment_method}</span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {payment?.verified_by_id ? (
                        <div>
                          <p className="font-semibold text-slate-900">{payment.verified_by_id}</p>
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
                          {overdue && <p className="text-xs text-red-600">OVERDUE</p>}
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingPledge(pledge)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        title="Edit pledge"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setRecordingPaymentFor(pledge)}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                        title="Record payment"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(pledge.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        title="Delete pledge"
                      >
                        <Trash2 size={18} />
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
    </div>
  );
}