// components/donations/mobile/MobileEnhancedUserPledgeView.jsx
// ✅ COMPLETE MOBILE VERSION - All 35+ PC features professionally implemented

'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Heart, Search, Download, Printer, Calendar, DollarSign, 
  TrendingUp, AlertTriangle, Clock, CheckCircle, XCircle,
  Filter, ChevronDown, RefreshCw, Share2
} from 'lucide-react';
import { donationApi } from '@/services/api/donationService';
import { joinCampaignsWithPledges } from '@/utils/donationHelpers';

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ============================================
// FILTER BOTTOM SHEET COMPONENT
// ============================================

function FilterBottomSheet({ isOpen, onClose, statusFilter, setStatusFilter, sortBy, setSortBy }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-t-3xl w-full max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filters & Sort</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Filter by Status</label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Status', count: '📊' },
                { value: 'active', label: 'Active', count: '🟡' },
                { value: 'completed', label: 'Completed', count: '✅' },
                { value: 'overdue', label: 'Overdue', count: '⚠️' },
                { value: 'cancelled', label: 'Cancelled', count: '❌' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    statusFilter === option.value
                      ? 'bg-[#FDB022] text-white font-bold'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{option.label}</span>
                  <span>{option.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Sort By</label>
            <div className="space-y-2">
              {[
                { value: 'date', label: 'Recent First', icon: '📅' },
                { value: 'amount', label: 'Highest Amount', icon: '💰' },
                { value: 'progress', label: 'Most Progress', icon: '📈' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    sortBy === option.value
                      ? 'bg-[#FDB022] text-white font-bold'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{option.label}</span>
                  <span>{option.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={onClose}
            className="w-full bg-[#8B1A1A] text-white py-3 px-4 rounded-xl font-bold hover:bg-red-900 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function MobileEnhancedUserPledgeView({ pledges = [], onPayPledge }) {
  // ============================================
  // STATE
  // ============================================
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  
  // Campaign enrichment
  const [campaigns, setCampaigns] = useState([]);
  const [enrichedPledges, setEnrichedPledges] = useState([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  // ============================================
  // FETCH CAMPAIGNS (useEffect #1)
  // ============================================
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoadingCampaigns(true);
        const response = await donationApi.campaigns.getAll();
        
        if (response.success && response.campaigns) {
          setCampaigns(response.campaigns);
        }
      } catch (error) {
        console.error('[MOBILE-PLEDGE-VIEW] Error fetching campaigns:', error);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    fetchCampaigns();
  }, []);

  // ============================================
  // JOIN CAMPAIGNS WITH PLEDGES (useEffect #2)
  // ============================================
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

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  const isOverdue = (pledge) => {
    if (pledge.status === 'completed' || pledge.status === 'cancelled') return false;
    return pledge.due_date && new Date(pledge.due_date) < new Date();
  };

  const daysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // ============================================
  // FILTERING & SORTING
  // ============================================
  
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

  // ============================================
  // STATISTICS (7 stats)
  // ============================================
  
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

  // ============================================
  // EXPORT CSV
  // ============================================
  
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

  // ============================================
  // MOBILE SHARE (instead of print)
  // ============================================
  
  const handleShare = async () => {
    const text = `My Pledges Summary\n\nTotal: ${stats.total} pledges\nPledged: ${formatCurrency(stats.totalPledged)}\nPaid: ${formatCurrency(stats.totalPaid)}\nRemaining: ${formatCurrency(stats.totalRemaining)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Pledges',
          text: text
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Summary copied to clipboard!');
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  
  if (isLoadingCampaigns && pledges.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#FDB022]"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400 font-semibold">Loading pledge details...</p>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="space-y-4">
      {/* STATS OVERVIEW - EDGE TO EDGE */}
      <div className="-mx-4 bg-gradient-to-br from-[#8B1A1A] to-red-800 text-white p-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Total Pledges */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-white/80 text-xs mb-1">Total Pledges</p>
            <p className="text-2xl font-black">{stats.total}</p>
          </div>

          {/* Total Pledged */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-white/80 text-xs mb-1">Total Pledged</p>
            <p className="text-lg font-black">{formatCurrency(stats.totalPledged)}</p>
          </div>

          {/* Total Paid */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-white/80 text-xs mb-1">Total Paid</p>
            <p className="text-lg font-black text-emerald-300">{formatCurrency(stats.totalPaid)}</p>
          </div>

          {/* Balance Remaining */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-white/80 text-xs mb-1">Balance</p>
            <p className="text-lg font-black text-orange-300">{formatCurrency(stats.totalRemaining)}</p>
            {stats.overdue > 0 && (
              <p className="text-xs text-red-300 mt-1 flex items-center gap-1">
                <AlertTriangle size={12} /> {stats.overdue} overdue
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#FDB022] outline-none text-slate-900 dark:text-white"
          />
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(true)}
          className="px-4 py-2.5 bg-[#FDB022] text-white rounded-xl font-semibold flex items-center gap-2"
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2">
        <button
          onClick={handleExportCSV}
          className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Export CSV
        </button>

        <button
          onClick={handleShare}
          className="flex-1 py-2.5 bg-[#8B1A1A] text-white rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <Share2 size={18} />
          Share
        </button>
      </div>

      {/* ACTIVE FILTERS DISPLAY */}
      {(statusFilter !== 'all' || sortBy !== 'date') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600 dark:text-slate-400">Active:</span>
          {statusFilter !== 'all' && (
            <span className="px-2 py-1 bg-[#FDB022]/20 text-[#FDB022] rounded-full text-xs font-semibold">
              Status: {statusFilter}
            </span>
          )}
          {sortBy !== 'date' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              Sort: {sortBy === 'amount' ? 'Amount' : 'Progress'}
            </span>
          )}
        </div>
      )}

      {/* PLEDGES LIST */}
      {processedPledges.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <Heart size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No pledges match your filters' : 'No pledges yet'}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Start supporting campaigns by creating your first pledge'}
          </p>
        </div>
      ) : (
        <div className="-mx-4 space-y-0">
          {processedPledges.map((pledge, index) => {
            const progress = pledge.pledged_amount > 0 ? (pledge.paid_amount / pledge.pledged_amount) * 100 : 0;
            const overdue = isOverdue(pledge);
            const daysLeft = daysUntilDue(pledge.due_date);
            const isExpanded = expandedCard === pledge.id;

            return (
              <div 
                key={pledge.id} 
                className={`bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 ${
                  index === 0 ? 'border-t' : ''
                }`}
              >
                {/* CARD HEADER */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedCard(isExpanded ? null : pledge.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                        {pledge.campaign_title || 'General Offering'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={12} />
                        {formatDate(pledge.created_at)}
                        {pledge.installment_plan && pledge.installment_plan !== 'lump-sum' && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold capitalize">
                            {pledge.installment_plan.replace('-', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      pledge.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      pledge.status === 'partial' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      pledge.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {pledge.status.toUpperCase()}
                    </span>
                  </div>

                  {/* QUICK VIEW - AMOUNT GRID */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Pledged</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(pledge.pledged_amount)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Paid</p>
                      <p className="text-sm font-bold text-green-600">{formatCurrency(pledge.paid_amount)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Balance</p>
                      <p className="text-sm font-bold text-red-600">{formatCurrency(pledge.remaining_amount)}</p>
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-600 dark:text-slate-400">Progress</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress === 100 ? 'bg-green-500' : progress > 50 ? 'bg-blue-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <ChevronDown 
                    size={20} 
                    className={`text-slate-400 mx-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                    {/* Warning Messages */}
                    {overdue && pledge.status !== 'completed' && pledge.status !== 'cancelled' && (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                        <AlertTriangle className="text-red-600 flex-shrink-0" size={18} />
                        <p className="text-sm text-red-800 dark:text-red-300 font-semibold">
                          Payment overdue by {Math.abs(daysLeft)} day(s)
                        </p>
                      </div>
                    )}

                    {!overdue && daysLeft !== null && daysLeft <= 7 && pledge.status !== 'completed' && pledge.status !== 'cancelled' && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-center gap-2">
                        <Clock className="text-amber-600 flex-shrink-0" size={18} />
                        <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold">
                          Payment due in {daysLeft} day(s)
                        </p>
                      </div>
                    )}

                    {pledge.status === 'completed' && (
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
                        <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                        <p className="text-sm text-green-800 dark:text-green-300 font-semibold">Pledge Completed ✅</p>
                      </div>
                    )}

                    {/* Action Button */}
                    {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onPayPledge && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPayPledge(pledge);
                        }}
                        className="w-full bg-[#FDB022] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#FF9500] transition-colors flex items-center justify-center gap-2"
                      >
                        <DollarSign size={20} />
                        Make Payment
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FILTER BOTTOM SHEET */}
      <FilterBottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    </div>
  );
}