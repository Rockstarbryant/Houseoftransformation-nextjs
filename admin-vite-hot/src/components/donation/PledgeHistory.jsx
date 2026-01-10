// src/components/donation/PledgeHistory.jsx
import React, { useState, useEffect } from 'react';
import { Download, Eye, ArrowUpRight, Filter, Loader, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import { useDonation } from '../../context/DonationContext';
import { formatKES, formatDate, exportToCSV } from '../../utils/donationHelpers';

const PledgeHistory = ({ isAdmin = false, onViewDetails, onOpenPayment }) => {
  const { pledges, payments, loading, error, fetchMyPledges, fetchAllPledges, fetchPaymentHistory, fetchAllPayments, exportPledges, exportPaymentHistory } = useDonation();
  const [activeTab, setActiveTab] = useState('pledges');
  const [filterStatus, setFilterStatus] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'pledges') {
        fetchAllPledges();
      } else {
        fetchAllPayments();
      }
    } else {
      if (activeTab === 'pledges') {
        fetchMyPledges();
      } else {
        fetchPaymentHistory();
      }
    }
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (activeTab === 'pledges') {
      if (filterStatus) {
        setFilteredData(pledges.filter(p => p.status === filterStatus));
      } else {
        setFilteredData(pledges);
      }
    } else {
      if (filterStatus) {
        setFilteredData(payments.filter(p => p.status === filterStatus));
      } else {
        setFilteredData(payments);
      }
    }
  }, [pledges, payments, filterStatus, activeTab]);

  const handleExport = async () => {
    try {
      if (activeTab === 'pledges') {
        const data = await exportPledges();
        exportToCSV(data, 'pledges.csv');
      } else {
        const data = await exportPaymentHistory();
        exportToCSV(data, 'payment-history.csv');
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-300',
      partial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      pending: 'bg-blue-100 text-blue-800 border-blue-300',
      success: 'bg-green-100 text-green-800 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-300'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader className="animate-spin mr-3" size={24} />
        <p className="text-gray-600">Loading...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {activeTab === 'pledges' ? 'Pledge History' : 'Payment History'}
        </h2>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pledges')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'pledges'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Pledges ({pledges.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'payments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Payments ({payments.length})
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-sm"
        >
          <option value="">All {activeTab === 'pledges' ? 'Pledges' : 'Payments'}</option>
          {activeTab === 'pledges' ? (
            <>
              <option value="completed">Completed</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
            </>
          ) : (
            <>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </>
          )}
        </select>
      </div>

      {/* Table */}
      {filteredData.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">
            No {activeTab === 'pledges' ? 'pledges' : 'payments'} found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-bold text-gray-700">
                  {activeTab === 'pledges' ? 'Campaign' : 'Member'}
                </th>
                <th className="text-left py-3 px-4 font-bold text-gray-700">
                  {activeTab === 'pledges' ? 'Amount' : 'Payment Amount'}
                </th>
                <th className="text-left py-3 px-4 font-bold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700">Date</th>
                {isAdmin && <th className="text-left py-3 px-4 font-bold text-gray-700">Reference</th>}
                <th className="text-left py-3 px-4 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => {
                const isPayment = activeTab === 'payments';
                const amount = isPayment ? item.amount : item.pledgedAmount;
                const status = item.status;
                const date = isPayment ? item.completedAt || item.createdAt : item.createdAt;
                const title = isPayment ? item.campaignId?.name : item.campaignId?.name;
                const subTitle = isPayment ? item.memberId?.name : item.memberName;

                return (
                  <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{title}</p>
                        <p className="text-sm text-gray-600">{subTitle}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900">{formatKES(amount)}</p>
                      {!isPayment && (
                        <p className="text-xs text-gray-600">
                          Paid: {formatKES(item.paidAmount)}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(date)}
                    </td>
                    {isAdmin && isPayment && (
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {item.mpesaRef || item.mpesaReceiptNumber || '-'}
                      </td>
                    )}
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onViewDetails?.(item)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        {!isPayment && item.remainingAmount > 0 && (
                          <button
                            onClick={() => onOpenPayment?.(item)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                            title="Make payment"
                          >
                            <ArrowUpRight size={18} />
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
    </Card>
  );
};

export default PledgeHistory;