'use client';

import { formatCurrency, formatDate, getStatusBadge } from '@/utils/donationHelpers';
import { Users, TrendingUp, CheckCircle } from 'lucide-react';

export default function AdminPledgeTable({ pledges, onRecordPayment }) {
  // ============================================
  // CALCULATE TABLE STATS
  // ============================================

  const tableStats = {
    totalPledges: pledges.length,
    totalPledgedAmount: pledges.reduce((sum, p) => sum + Number(p.pledged_amount || 0), 0),
    totalPaidAmount: pledges.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0),
    totalRemainingAmount: pledges.reduce((sum, p) => sum + Number(p.remaining_amount || 0), 0),
    completedCount: pledges.filter(p => p.status === 'completed').length
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      
      {/* Header with Stats */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={24} className="text-[#8B1A1A]" />
              All Member Pledges
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Comprehensive view of all pledges
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Pledges</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {tableStats.totalPledges}
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Pledged</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(tableStats.totalPledgedAmount)}
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Collected</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(tableStats.totalPaidAmount)}
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Outstanding</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(tableStats.totalRemainingAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      {pledges.length === 0 ? (
        <div className="p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No pledges found
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Pledges will appear here when members make commitments
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-bold">Member</th>
                <th className="px-6 py-4 font-bold">Campaign</th>
                <th className="px-6 py-4 font-bold">Pledged</th>
                <th className="px-6 py-4 font-bold">Paid</th>
                <th className="px-6 py-4 font-bold">Balance</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Date</th>
                {onRecordPayment && <th className="px-6 py-4 font-bold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {pledges.map((pledge) => {
                const statusBadge = getStatusBadge(pledge.status);
                const completionPercentage = pledge.pledged_amount > 0
                  ? Math.round((pledge.paid_amount / pledge.pledged_amount) * 100)
                  : 0;

                return (
                  <tr
                    key={pledge.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    {/* Member Info */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {pledge.member_name}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs">
                          {pledge.member_phone}
                        </div>
                        {pledge.member_email && (
                          <div className="text-slate-500 dark:text-slate-400 text-xs">
                            {pledge.member_email}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Campaign */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {pledge.campaign_title || 'General Offering'}
                      </div>
                      {pledge.campaign_type && (
                        <div className="text-slate-500 dark:text-slate-400 text-xs capitalize">
                          {pledge.campaign_type}
                        </div>
                      )}
                    </td>

                    {/* Pledged Amount */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(pledge.pledged_amount)}
                      </div>
                    </td>

                    {/* Paid Amount */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-green-600">
                        {formatCurrency(pledge.paid_amount)}
                      </div>
                      {pledge.pledged_amount > 0 && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {completionPercentage}% complete
                        </div>
                      )}
                    </td>

                    {/* Remaining Balance */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-red-600">
                        {formatCurrency(pledge.remaining_amount)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge.bg} ${statusBadge.text}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="text-slate-600 dark:text-slate-400 text-xs">
                        {formatDate(pledge.created_at)}
                      </div>
                      {pledge.installment_plan && pledge.installment_plan !== 'lump-sum' && (
                        <div className="text-slate-500 dark:text-slate-400 text-xs capitalize">
                          {pledge.installment_plan.replace('-', ' ')}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    {onRecordPayment && (
                      <td className="px-6 py-4">
                        {pledge.status !== 'completed' && (
                          <button
                            onClick={() => onRecordPayment(pledge)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-semibold transition-colors"
                          >
                            Record Payment
                          </button>
                        )}
                        {pledge.status === 'completed' && (
                          <div className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle size={14} />
                            Completed
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Summary */}
      {pledges.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-600 dark:text-slate-400">Collection Rate:</span>
                <span className="ml-2 font-bold text-slate-900 dark:text-white">
                  {tableStats.totalPledgedAmount > 0
                    ? Math.round((tableStats.totalPaidAmount / tableStats.totalPledgedAmount) * 100)
                    : 0}%
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Completion Rate:</span>
                <span className="ml-2 font-bold text-slate-900 dark:text-white">
                  {tableStats.totalPledges > 0
                    ? Math.round((tableStats.completedCount / tableStats.totalPledges) * 100)
                    : 0}%
                </span>
              </div>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Showing <strong className="text-slate-900 dark:text-white">{pledges.length}</strong> pledges
            </div>
          </div>
        </div>
      )}
    </div>
  );
}