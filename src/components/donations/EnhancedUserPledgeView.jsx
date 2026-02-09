// src/components/donations/EnhancedUserPledgeView.jsx - REDESIGNED
import { useState, useMemo, useEffect } from 'react';
import { Heart, Search, Download, Printer, Calendar, DollarSign, TrendingUp, AlertTriangle, Clock, CheckCircle, Filter } from 'lucide-react';
import { donationApi } from '@/services/api/donationService';
import { joinCampaignsWithPledges } from '@/utils/donationHelpers';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function EnhancedUserPledgeView({ pledges = [], onPayPledge }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  const [campaigns, setCampaigns] = useState([]);
  const [enrichedPledges, setEnrichedPledges] = useState([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoadingCampaigns(true);
        const response = await donationApi.campaigns.getAll();
        if (response.success && response.campaigns) {
          setCampaigns(response.campaigns);
        }
      } catch (error) {
        console.error('[USER-PLEDGE-VIEW] Error fetching campaigns:', error);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Join campaigns with pledges
  useEffect(() => {
    if (campaigns.length > 0 && pledges.length > 0) {
      const enriched = joinCampaignsWithPledges(pledges, campaigns);
      setEnrichedPledges(enriched);
    } else if (pledges.length === 0) {
      setEnrichedPledges([]);
    } else {
      setEnrichedPledges(pledges);
    }
  }, [pledges, campaigns]);

  const isOverdue = (pledge) => {
    if (pledge.status === 'completed' || pledge.status === 'cancelled') return false;
    return pledge.due_date && new Date(pledge.due_date) < new Date();
  };

  const daysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Filter and sort
  const processedPledges = useMemo(() => {
    let result = enrichedPledges.filter(p => {
      const searchMatch = !searchTerm || 
        p.campaign_title?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'active' && (p.status === 'pending' || p.status === 'partial')) ||
        (statusFilter === 'overdue' && isOverdue(p)) ||
        p.status === statusFilter;

      return searchMatch && statusMatch;
    });

    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'amount') {
        return (b.pledged_amount || 0) - (a.pledged_amount || 0);
      } else if (sortBy === 'progress') {
        const progressA = a.pledged_amount > 0 ? a.paid_amount / a.pledged_amount : 0;
        const progressB = b.pledged_amount > 0 ? b.paid_amount / b.pledged_amount : 0;
        return progressB - progressA;
      }
      return 0;
    });

    return result;
  }, [enrichedPledges, searchTerm, statusFilter, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const active = enrichedPledges.filter(p => p.status === 'pending' || p.status === 'partial');
    const overdue = enrichedPledges.filter(isOverdue);
    
    return {
      total: enrichedPledges.length,
      active: active.length,
      completed: enrichedPledges.filter(p => p.status === 'completed').length,
      overdue: overdue.length,
      totalPledged: enrichedPledges.reduce((s, p) => s + (p.pledged_amount || 0), 0),
      totalPaid: enrichedPledges.reduce((s, p) => s + (p.paid_amount || 0), 0),
      totalRemaining: enrichedPledges.reduce((s, p) => s + (p.remaining_amount || 0), 0)
    };
  }, [enrichedPledges]);

  const handleExportCSV = () => {
    const csv = [
      ['Campaign', 'Pledged', 'Paid', 'Balance', 'Status', 'Date', 'Due Date'],
      ...processedPledges.map(p => [
        p.campaign_title || 'General',
        p.pledged_amount,
        p.paid_amount,
        p.remaining_amount,
        p.status,
        formatDate(p.created_at),
        formatDate(p.due_date)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-pledges-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>My Pledges</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #8B1A1A; border-bottom: 2px solid #8B1A1A; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #8B1A1A; color: white; }
            .total-row { font-weight: bold; background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h1>My Pledges Report</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Pledged</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${processedPledges.map(p => `
                <tr>
                  <td>${p.campaign_title || 'General'}</td>
                  <td>${formatCurrency(p.pledged_amount)}</td>
                  <td>${formatCurrency(p.paid_amount)}</td>
                  <td>${formatCurrency(p.remaining_amount)}</td>
                  <td>${p.status}</td>
                  <td>${formatDate(p.created_at)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td>TOTAL</td>
                <td>${formatCurrency(stats.totalPledged)}</td>
                <td>${formatCurrency(stats.totalPaid)}</td>
                <td>${formatCurrency(stats.totalRemaining)}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pledged Card */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white dark:bg-blue-900/50 rounded-xl">
              <Heart size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{stats.total} Total</span>
          </div>
          <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">Total Pledged</h3>
          <p className="text-2xl font-black text-blue-900 dark:text-blue-100">{formatCurrency(stats.totalPledged)}</p>
        </div>

        {/* Total Paid Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white dark:bg-emerald-900/50 rounded-xl">
              <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {Math.round((stats.totalPaid / stats.totalPledged) * 100) || 0}%
            </span>
          </div>
          <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">Amount Paid</h3>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{formatCurrency(stats.totalPaid)}</p>
        </div>

        {/* Remaining Balance Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white dark:bg-amber-900/50 rounded-xl">
              <DollarSign size={24} className="text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{stats.active} Active</span>
          </div>
          <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1">Remaining</h3>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-100">{formatCurrency(stats.totalRemaining)}</p>
        </div>

        {/* Status Overview Card */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 rounded-2xl p-6 border border-rose-200 dark:border-rose-800">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white dark:bg-rose-900/50 rounded-xl">
              <TrendingUp size={24} className="text-rose-600 dark:text-rose-400" />
            </div>
            {stats.overdue > 0 && (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{stats.overdue} Overdue</span>
            )}
          </div>
          <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300 mb-1">Completed</h3>
          <p className="text-2xl font-black text-rose-900 dark:text-rose-100">{stats.completed}</p>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none text-slate-900 dark:text-white transition-all"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap gap-2">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#8B1A1A] outline-none transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#8B1A1A] outline-none transition-all cursor-pointer"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="progress">Sort by Progress</option>
            </select>

            <button 
              onClick={handleExportCSV} 
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Download size={18} />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button 
              onClick={handlePrint} 
              className="px-4 py-2.5 bg-[#8B1A1A] hover:bg-[#6d1414] text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20"
            >
              <Printer size={18} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pledges List */}
      {processedPledges.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Heart size={56} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No pledges match your filters' : 'No pledges yet'}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Start supporting campaigns by creating your first pledge'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {processedPledges.map(pledge => {
            const progress = pledge.pledged_amount > 0 ? (pledge.paid_amount / pledge.pledged_amount) * 100 : 0;
            const overdue = isOverdue(pledge);
            const daysLeft = daysUntilDue(pledge.due_date);

            return (
              <div key={pledge.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                        {pledge.campaign_title || 'General Offering'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={15} />
                          {formatDate(pledge.created_at)}
                        </span>
                        {pledge.installment_plan && pledge.installment_plan !== 'lump-sum' && (
                          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold capitalize">
                            {pledge.installment_plan.replace('-', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase ${
                      pledge.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' :
                      pledge.status === 'partial' ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300' :
                      pledge.status === 'cancelled' ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300' :
                      'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                    }`}>
                      {pledge.status}
                    </span>
                  </div>

                  {/* Amount Info Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Pledged</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(pledge.pledged_amount)}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">Paid</p>
                      <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(pledge.paid_amount)}</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-950/20 rounded-xl p-4 border border-rose-100 dark:border-rose-900">
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">Balance</p>
                      <p className="text-lg font-black text-rose-700 dark:text-rose-300">{formatCurrency(pledge.remaining_amount)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Progress</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress === 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 
                          progress > 50 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                          'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Alerts */}
                  {overdue && pledge.status !== 'completed' && pledge.status !== 'cancelled' && (
                    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-4 mb-4 flex items-center gap-3">
                      <AlertTriangle className="text-rose-600 dark:text-rose-400 flex-shrink-0" size={20} />
                      <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
                        Payment overdue by {Math.abs(daysLeft)} day(s)
                      </p>
                    </div>
                  )}

                  {!overdue && daysLeft !== null && daysLeft <= 7 && pledge.status !== 'completed' && pledge.status !== 'cancelled' && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4 flex items-center gap-3">
                      <Clock className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={20} />
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                        Payment due in {daysLeft} day(s)
                      </p>
                    </div>
                  )}

                  {pledge.status === 'completed' && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-4 flex items-center gap-3">
                      <CheckCircle className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" size={20} />
                      <p className="text-sm font-black text-emerald-800 dark:text-emerald-200">Pledge Completed! 🎉</p>
                    </div>
                  )}

                  {/* Action Button */}
                  {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onPayPledge && (
                    <button
                      onClick={() => onPayPledge(pledge)}
                      className="w-full bg-gradient-to-r from-[#8B1A1A] to-rose-700 hover:from-[#6d1414] hover:to-rose-800 text-white py-3.5 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30"
                    >
                      <DollarSign size={20} />
                      Make Payment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}