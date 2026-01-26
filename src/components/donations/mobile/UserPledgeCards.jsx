// components/donations/mobile/UserPledgeCards.jsx
// Mobile-optimized version of EnhancedUserPledgeView

import { useState, useMemo } from 'react';
import { Heart, Search, Calendar, DollarSign, AlertTriangle, Clock, CheckCircle, ChevronDown, Filter, X } from 'lucide-react';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function UserPledgeCards({ pledges = [], onPayPledge }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);

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

  // Filter and sort pledges
  const processedPledges = useMemo(() => {
    let result = pledges.filter(p => {
      const searchMatch = !searchTerm || 
        p.campaign_title?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'active' && (p.status === 'pending' || p.status === 'partial')) ||
        (statusFilter === 'overdue' && isOverdue(p)) ||
        p.status === statusFilter;

      return searchMatch && statusMatch;
    });

    result.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'amount') return (b.pledged_amount || 0) - (a.pledged_amount || 0);
      if (sortBy === 'progress') {
        const progressA = a.pledged_amount > 0 ? a.paid_amount / a.pledged_amount : 0;
        const progressB = b.pledged_amount > 0 ? b.paid_amount / b.pledged_amount : 0;
        return progressB - progressA;
      }
      return 0;
    });

    return result;
  }, [pledges, searchTerm, statusFilter, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const active = pledges.filter(p => p.status === 'pending' || p.status === 'partial');
    const overdue = pledges.filter(isOverdue);
    
    return {
      total: pledges.length,
      active: active.length,
      completed: pledges.filter(p => p.status === 'completed').length,
      overdue: overdue.length,
      totalPledged: pledges.reduce((s, p) => s + (p.pledged_amount || 0), 0),
      totalPaid: pledges.reduce((s, p) => s + (p.paid_amount || 0), 0),
      totalRemaining: pledges.reduce((s, p) => s + (p.remaining_amount || 0), 0)
    };
  }, [pledges]);

  return (
    <div className="space-y-4">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={16} />
            <p className="text-xs font-medium opacity-90">Active</p>
          </div>
          <p className="text-2xl font-black">{stats.active}</p>
          <p className="text-xs opacity-90">of {stats.total} total</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} />
            <p className="text-xs font-medium opacity-90">Pledged</p>
          </div>
          <p className="text-2xl font-black">{(stats.totalPledged / 1000).toFixed(0)}K</p>
          <p className="text-xs opacity-90">KES</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} />
            <p className="text-xs font-medium opacity-90">Paid</p>
          </div>
          <p className="text-2xl font-black">{(stats.totalPaid / 1000).toFixed(0)}K</p>
          <p className="text-xs opacity-90">
            {stats.totalPledged > 0 ? Math.round((stats.totalPaid / stats.totalPledged) * 100) : 0}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} />
            <p className="text-xs font-medium opacity-90">Balance</p>
          </div>
          <p className="text-2xl font-black">{(stats.totalRemaining / 1000).toFixed(0)}K</p>
          {stats.overdue > 0 && (
            <p className="text-xs opacity-90">{stats.overdue} overdue</p>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search campaigns..."
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

      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
          showFilters 
            ? 'bg-[#FDB022] text-white' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
        }`}
      >
        <Filter size={18} />
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3 border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Status
            </label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Sort By
            </label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="progress">Progress</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'all' || sortBy !== 'date') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSortBy('date');
              }}
              className="w-full py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Pledges List */}
      {processedPledges.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <Heart size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No matches found' : 'No pledges yet'}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting filters' : 'Create your first pledge'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {processedPledges.map(pledge => {
            const progress = pledge.pledged_amount > 0 ? (pledge.paid_amount / pledge.pledged_amount) * 100 : 0;
            const overdue = isOverdue(pledge);
            const daysLeft = daysUntilDue(pledge.due_date);

            return (
              <div 
                key={pledge.id} 
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                      {pledge.campaign_title || 'General Offering'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={12} />
                      {formatDate(pledge.created_at)}
                    </div>
                  </div>

                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    pledge.status === 'completed' ? 'bg-green-100 text-green-800' :
                    pledge.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                    pledge.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {pledge.status.toUpperCase()}
                  </span>
                </div>

                {/* Amount Grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pledged</p>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {(pledge.pledged_amount / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Paid</p>
                    <p className="font-bold text-sm text-green-600">
                      {(pledge.paid_amount / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Balance</p>
                    <p className="font-bold text-sm text-red-600">
                      {(pledge.remaining_amount / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Progress</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Alerts */}
                {overdue && (
                  <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={14} className="text-orange-600" />
                    <p className="text-xs text-orange-800 dark:text-orange-200 font-semibold">
                      Overdue by {Math.abs(daysLeft)} day(s)
                    </p>
                  </div>
                )}

                {!overdue && daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && pledge.status !== 'completed' && (
                  <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2">
                    <Clock size={14} className="text-yellow-600" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 font-semibold">
                      Due in {daysLeft} day(s)
                    </p>
                  </div>
                )}

                {/* Action Button */}
                {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onPayPledge && (
                  <button
                    onClick={() => onPayPledge(pledge)}
                    className="w-full py-2.5 bg-[#FDB022] text-white font-bold rounded-xl hover:bg-[#FF9500] transition-colors flex items-center justify-center gap-2"
                  >
                    <DollarSign size={18} />
                    Make Payment
                  </button>
                )}

                {pledge.status === 'completed' && (
                  <div className="flex items-center justify-center gap-2 text-green-600 font-semibold py-2">
                    <CheckCircle size={18} />
                    Completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      {processedPledges.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Showing</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {processedPledges.length} of {pledges.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}