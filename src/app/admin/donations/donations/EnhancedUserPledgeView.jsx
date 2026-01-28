import { useState, useMemo } from 'react';
import { Heart, Search, Download, Printer, Calendar, DollarSign, TrendingUp, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

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
    const rows = processedPledges.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.campaign_title || 'General'}</td>
        <td>${formatCurrency(p.pledged_amount)}</td>
        <td>${formatCurrency(p.paid_amount)}</td>
        <td>${formatCurrency(p.remaining_amount)}</td>
        <td>${p.status}</td>
        <td>${Math.round((p.paid_amount / p.pledged_amount) * 100)}%</td>
      </tr>
    `).join('');

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html><head><title>My Pledges</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #8B1A1A; border-bottom: 3px solid #8B1A1A; padding-bottom: 10px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
        .stat { background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 4px solid #8B1A1A; }
        .stat-label { font-size: 12px; color: #666; }
        .stat-value { font-size: 18px; font-weight: bold; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #8B1A1A; color: white; padding: 12px; text-align: left; font-size: 12px; }
        td { padding: 10px; border-bottom: 1px solid #ddd; font-size: 13px; }
        tr:nth-child(even) { background: #f9fafb; }
        @media print { .no-print { display: none; } }
      </style></head><body>
      <h1>My Pledges Summary</h1>
      <div class="stats">
        <div class="stat">
          <div class="stat-label">Total Pledged</div>
          <div class="stat-value">${formatCurrency(stats.totalPledged)}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Total Paid</div>
          <div class="stat-value" style="color: #059669;">${formatCurrency(stats.totalPaid)}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Remaining</div>
          <div class="stat-value" style="color: #dc2626;">${formatCurrency(stats.totalRemaining)}</div>
        </div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Campaign</th><th>Pledged</th><th>Paid</th><th>Balance</th><th>Status</th><th>Progress</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top: 30px; text-align: center; color: #666; font-size: 13px;">Generated: ${new Date().toLocaleString()} | House of Transformation Church</p>
      <button class="no-print" onclick="window.print()" style="position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #8B1A1A; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Print PDF</button>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold opacity-90">Total Pledges</p>
            <Heart size={20} className="opacity-70" />
          </div>
          <p className="text-3xl font-black mb-1">{stats.total}</p>
          <p className="text-sm opacity-90">{stats.active} active</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold opacity-90">Total Pledged</p>
            <DollarSign size={20} className="opacity-70" />
          </div>
          <p className="text-3xl font-black mb-1">{formatCurrency(stats.totalPledged)}</p>
          <p className="text-sm opacity-90">Commitment</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold opacity-90">Total Paid</p>
            <CheckCircle size={20} className="opacity-70" />
          </div>
          <p className="text-3xl font-black mb-1">{formatCurrency(stats.totalPaid)}</p>
          <p className="text-sm opacity-90">
            {stats.totalPledged > 0 ? Math.round((stats.totalPaid / stats.totalPledged) * 100) : 0}% complete
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold opacity-90">Remaining</p>
            <TrendingUp size={20} className="opacity-70" />
          </div>
          <p className="text-3xl font-black mb-1">{formatCurrency(stats.totalRemaining)}</p>
          {stats.overdue > 0 && (
            <p className="text-sm opacity-90 flex items-center gap-1">
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
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">Pledged</p>
                      <p className="text-lg font-bold text-slate-900">{formatCurrency(pledge.pledged_amount)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">Paid</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(pledge.paid_amount)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">Balance</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(pledge.remaining_amount)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">Progress</span>
                      <span className="text-sm font-bold text-slate-900">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Alerts */}
                  {overdue && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                      <AlertTriangle size={18} className="text-orange-600" />
                      <p className="text-sm text-orange-800 font-semibold">
                        Payment overdue by {Math.abs(daysLeft)} day(s)
                      </p>
                    </div>
                  )}

                  {!overdue && daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && pledge.status !== 'completed' && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                      <Clock size={18} className="text-yellow-600" />
                      <p className="text-sm text-yellow-800 font-semibold">
                        Due in {daysLeft} day(s) - {formatDate(pledge.due_date)}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {pledge.notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Notes</p>
                      <p className="text-sm text-blue-800">{pledge.notes}</p>
                    </div>
                  )}

                  {/* Action Button */}
                  {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onPayPledge && (
                    <button
                      onClick={() => onPayPledge(pledge)}
                      className="w-full py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors flex items-center justify-center gap-2"
                    >
                      <DollarSign size={20} />
                      Make Payment
                    </button>
                  )}

                  {pledge.status === 'completed' && (
                    <div className="flex items-center justify-center gap-2 text-green-600 font-semibold py-3">
                      <CheckCircle size={20} />
                      Pledge Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      {processedPledges.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-6">
              <div>
                <span className="text-slate-600">Showing:</span>
                <span className="ml-2 font-bold text-slate-900">{processedPledges.length} of {pledges.length}</span>
              </div>
              <div>
                <span className="text-slate-600">Completion Rate:</span>
                <span className="ml-2 font-bold text-slate-900">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}