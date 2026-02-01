import { useState, useMemo, useEffect } from 'react';
import { Heart, Search, Download, Printer, Calendar, DollarSign, TrendingUp, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
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
  
  // ✅ FIX: Fetch campaigns and enrich pledges
  const [campaigns, setCampaigns] = useState([]);
  const [enrichedPledges, setEnrichedPledges] = useState([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  // ✅ Fetch campaigns when component mounts
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoadingCampaigns(true);
        console.log('[USER-PLEDGE-VIEW] Fetching campaigns...');
        
        const response = await donationApi.campaigns.getAll();
        
        if (response.success && response.campaigns) {
          console.log('[USER-PLEDGE-VIEW] Campaigns loaded:', response.campaigns);
          setCampaigns(response.campaigns);
        } else {
          console.error('[USER-PLEDGE-VIEW] Failed to load campaigns:', response);
        }
      } catch (error) {
        console.error('[USER-PLEDGE-VIEW] Error fetching campaigns:', error);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    fetchCampaigns();
  }, []);

  // ✅ Join campaigns with pledges whenever either changes
  useEffect(() => {
    if (campaigns.length > 0 && pledges.length > 0) {
      console.log('[USER-PLEDGE-VIEW] Joining campaigns with pledges...');
      console.log('[USER-PLEDGE-VIEW] Pledges:', pledges);
      console.log('[USER-PLEDGE-VIEW] Campaigns:', campaigns);
      
      const enriched = joinCampaignsWithPledges(pledges, campaigns);
      
      console.log('[USER-PLEDGE-VIEW] Enriched pledges:', enriched);
      setEnrichedPledges(enriched);
    } else if (pledges.length === 0) {
      setEnrichedPledges([]);
    } else {
      // Campaigns not loaded yet, but show pledges with fallback
      setEnrichedPledges(pledges);
    }
  }, [pledges, campaigns]);

  // Check if overdue
  const isOverdue = (pledge) => {
    if (pledge.status === 'completed' || pledge.status === 'cancelled') return false;
    return pledge.due_date && new Date(pledge.due_date) < new Date();
  };

  // Calculate days until due
  const daysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // ✅ Filter and sort using enriched pledges
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

    // Sort
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

  // ✅ Calculate stats using enriched pledges
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

  // Export CSV
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

  // Print
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
                <td colspan="2">${stats.total} pledges</td>
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

  // ✅ Show loading state while fetching campaigns
  if (isLoadingCampaigns && pledges.length > 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]" />
        <p className="ml-4 text-slate-600">Loading campaign details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Pledges</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Pledged</p>
          <p className="text-2xl font-bold text-[#8B1A1A]">{formatCurrency(stats.totalPledged)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Balance Remaining</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalRemaining)}</p>
          {stats.overdue > 0 && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertTriangle size={14} /> {stats.overdue} overdue
            </p>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#8B1A1A] outline-none">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#8B1A1A] outline-none">
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="progress">Sort by Progress</option>
            </select>

            <button onClick={handleExportCSV} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Download size={18} /> CSV
            </button>

            <button onClick={handlePrint} className="px-4 py-2 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-red-900 flex items-center gap-2">
              <Printer size={18} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Pledges List */}
      {processedPledges.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Heart size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No pledges match your filters' : 'No pledges yet'}
          </p>
          <p className="text-sm text-slate-600">
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
              <div key={pledge.id} className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {/* ✅ FIX: Now shows actual campaign title */}
                        {pledge.campaign_title || 'General Offering'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(pledge.created_at)}
                        </span>
                        {pledge.installment_plan && pledge.installment_plan !== 'lump-sum' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold capitalize">
                            {pledge.installment_plan.replace('-', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      pledge.status === 'completed' ? 'bg-green-100 text-green-800' :
                      pledge.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                      pledge.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pledge.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Amount Info */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Pledged</p>
                      <p className="text-lg font-bold text-slate-900">{formatCurrency(pledge.pledged_amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Paid</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(pledge.paid_amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Balance</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(pledge.remaining_amount)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Progress</span>
                      <span className="text-sm font-bold text-slate-900">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress === 100 ? 'bg-green-500' : progress > 50 ? 'bg-blue-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Warning/Info Messages */}
                  {overdue && pledge.status !== 'completed' && pledge.status !== 'cancelled' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                      <AlertTriangle className="text-red-600 flex-shrink-0" size={18} />
                      <p className="text-sm text-red-800">
                        Payment overdue by {Math.abs(daysLeft)} day(s)
                      </p>
                    </div>
                  )}

                  {!overdue && daysLeft !== null && daysLeft <= 7 && pledge.status !== 'completed' && pledge.status !== 'cancelled' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                      <Clock className="text-amber-600 flex-shrink-0" size={18} />
                      <p className="text-sm text-amber-800">
                        Payment due in {daysLeft} day(s)
                      </p>
                    </div>
                  )}

                  {pledge.status === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                      <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                      <p className="text-sm text-green-800 font-semibold">Pledge Completed</p>
                    </div>
                  )}

                  {/* Action Button */}
                  {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onPayPledge && (
                    <button
                      onClick={() => onPayPledge(pledge)}
                      className="w-full bg-[#8B1A1A] text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-900 transition-colors flex items-center justify-center gap-2"
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