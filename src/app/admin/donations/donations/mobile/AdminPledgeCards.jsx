// components/donations/mobile/AdminPledgeCards.jsx
// Mobile-optimized version of EnhancedAdminPledgeTable

import { useState, useMemo } from 'react';
import { Users, Search, Filter, X, ChevronDown, AlertTriangle, MoreVertical } from 'lucide-react';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function AdminPledgeCards({ 
  pledges = [], 
  onRecordPayment, 
  onViewHistory,
  onEditPledge,      
  onCancelPledge     
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState({
    status: 'all',
    campaign: 'all'
  });
  const [expandedCard, setExpandedCard] = useState(null);

  // Get unique campaigns
  const campaigns = useMemo(() => {
    return [...new Set(pledges.map(p => p.campaign_title).filter(Boolean))];
  }, [pledges]);

  // Check if overdue
  const isOverdue = (pledge) => {
    if (pledge.status === 'completed' || pledge.status === 'cancelled') return false;
    return pledge.due_date && new Date(pledge.due_date) < new Date();
  };

  // Filter and sort
  const processedPledges = useMemo(() => {
    let result = pledges.filter(p => {
      const searchMatch = !searchTerm || 
        p.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.member_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.campaign_title?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = filters.status === 'all' || 
        (filters.status === 'overdue' ? isOverdue(p) : p.status === filters.status);
      
      const campaignMatch = filters.campaign === 'all' || p.campaign_title === filters.campaign;

      return searchMatch && statusMatch && campaignMatch;
    });

    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (['pledged_amount', 'paid_amount', 'remaining_amount'].includes(sortConfig.key)) {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (sortConfig.key === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      return sortConfig.direction === 'asc' 
        ? (aVal > bVal ? 1 : -1)
        : (aVal < bVal ? 1 : -1);
    });

    return result;
  }, [pledges, searchTerm, filters, sortConfig]);

  // Stats
  const stats = useMemo(() => ({
    total: processedPledges.length,
    pledged: processedPledges.reduce((s, p) => s + (p.pledged_amount || 0), 0),
    paid: processedPledges.reduce((s, p) => s + (p.paid_amount || 0), 0),
    remaining: processedPledges.reduce((s, p) => s + (p.remaining_amount || 0), 0),
    completed: processedPledges.filter(p => p.status === 'completed').length,
    overdue: processedPledges.filter(isOverdue).length
  }), [processedPledges]);

  const hasFilters = searchTerm || filters.status !== 'all' || filters.campaign !== 'all';

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400">Total</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400">Pledged</p>
          <p className="text-xl font-bold text-blue-600">{(stats.pledged / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400">Collected</p>
          <p className="text-xl font-bold text-green-600">{(stats.paid / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400">Overdue</p>
          <p className="text-xl font-bold text-orange-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search member or campaign..."
          className="w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#FDB022] outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
          hasFilters || showFilters
            ? 'bg-[#FDB022] text-white' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
        }`}
      >
        <Filter size={18} />
        {showFilters ? 'Hide Filters' : 'Show Filters'}
        {hasFilters && !showFilters && (
          <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">Active</span>
        )}
      </button>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3 border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Status
            </label>
            <select 
              value={filters.status} 
              onChange={(e) => setFilters({...filters, status: e.target.value})} 
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Campaign
            </label>
            <select 
              value={filters.campaign} 
              onChange={(e) => setFilters({...filters, campaign: e.target.value})} 
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={() => { 
                setFilters({status: 'all', campaign: 'all'}); 
                setSearchTerm(''); 
              }}
              className="w-full py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
            >
              <X size={16} /> Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Pledges Cards */}
      {processedPledges.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <Users size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No pledges found
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {processedPledges.map(pledge => {
            const overdue = isOverdue(pledge);
            const isExpanded = expandedCard === pledge.id;
            const progress = pledge.pledged_amount > 0 
              ? Math.round((pledge.paid_amount / pledge.pledged_amount) * 100) 
              : 0;

            return (
              <div 
                key={pledge.id}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700"
              >
                {/* Card Header - Always Visible */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedCard(isExpanded ? null : pledge.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                        {pledge.member_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {pledge.member_email}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {pledge.campaign_title || 'General'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        pledge.status === 'completed' ? 'bg-green-100 text-green-800' :
                        pledge.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                        pledge.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pledge.status}
                      </span>
                      <ChevronDown 
                        size={20} 
                        className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-slate-500">Pledged</p>
                      <p className="font-bold text-sm">{(pledge.pledged_amount / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="font-bold text-sm text-green-600">{(pledge.paid_amount / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Balance</p>
                      <p className="font-bold text-sm text-red-600">{(pledge.remaining_amount / 1000).toFixed(0)}K</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Overdue Warning */}
                  {overdue && (
                    <div className="mt-2 flex items-center gap-1 text-orange-600 text-xs">
                      <AlertTriangle size={12} /> Overdue
                    </div>
                  )}
                </div>

                {/* Expandable Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                    {/* Full Details */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500">Created</p>
                        <p className="font-semibold">{formatDate(pledge.created_at)}</p>
                      </div>
                      {pledge.due_date && (
                        <div>
                          <p className="text-slate-500">Due Date</p>
                          <p className="font-semibold">{formatDate(pledge.due_date)}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onRecordPayment && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRecordPayment(pledge);
                          }}
                          className="py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                        >
                          Record Payment
                        </button>
                      )}

                      {onViewHistory && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewHistory(pledge);
                          }}
                          className="py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold"
                        >
                          View History
                        </button>
                      )}

                      {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onEditPledge && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPledge(pledge);
                          }}
                          className="py-2 bg-green-600 text-white rounded-lg text-xs font-semibold"
                        >
                          Edit Pledge
                        </button>
                      )}

                      {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onCancelPledge && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancelPledge(pledge);
                          }}
                          className="py-2 bg-red-600 text-white rounded-lg text-xs font-semibold"
                        >
                          Cancel Pledge
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Summary */}
      {processedPledges.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between mb-2">
            <span className="text-slate-600 dark:text-slate-400">Collection Rate</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {stats.pledged > 0 ? Math.round((stats.paid / stats.pledged) * 100) : 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Showing</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {processedPledges.length} pledges
            </span>
          </div>
        </div>
      )}
    </div>
  );
}