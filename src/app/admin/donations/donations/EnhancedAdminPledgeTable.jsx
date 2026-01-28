import { useState, useMemo } from 'react';
import { Users, CheckCircle, Search, Filter, Download, Printer, ChevronDown, ChevronUp, AlertTriangle, X } from 'lucide-react';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusBadge = (status) => {
  const badges = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    partial: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Partial' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
  };
  return badges[status] || badges.pending;
};

export default function EnhancedPledgeTable({ 
  pledges = [], 
  onRecordPayment, 
  onViewHistory,
  onEditPledge,      
  onCancelPledge     
}) {
  const [selectedPledges, setSelectedPledges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState({
    status: 'all',
    campaign: 'all',
    dateFrom: '',
    dateTo: ''
  });

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
      
      const dateMatch = (!filters.dateFrom || new Date(p.created_at) >= new Date(filters.dateFrom)) &&
                       (!filters.dateTo || new Date(p.created_at) <= new Date(filters.dateTo));

      return searchMatch && statusMatch && campaignMatch && dateMatch;
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

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExportCSV = () => {
    const data = selectedPledges.length > 0 
      ? processedPledges.filter(p => selectedPledges.includes(p.id))
      : processedPledges;

    const csv = [
      ['Member', 'Email', 'Campaign', 'Pledged', 'Paid', 'Balance', 'Status', 'Date'],
      ...data.map(p => [
        p.member_name, p.member_email, p.campaign_title || 'General',
        p.pledged_amount, p.paid_amount, p.remaining_amount, 
        p.status, formatDate(p.created_at)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pledges-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handlePrint = () => {
    const data = selectedPledges.length > 0 
      ? processedPledges.filter(p => selectedPledges.includes(p.id))
      : processedPledges;

    const rows = data.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.member_name}</td>
        <td>${p.campaign_title || 'General'}</td>
        <td>${formatCurrency(p.pledged_amount)}</td>
        <td>${formatCurrency(p.paid_amount)}</td>
        <td>${formatCurrency(p.remaining_amount)}</td>
        <td>${p.status}</td>
      </tr>
    `).join('');

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html><head><title>Pledge Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #8B1A1A; border-bottom: 3px solid #8B1A1A; padding-bottom: 10px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
        .stat { background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 4px solid #8B1A1A; }
        .stat-label { font-size: 12px; color: #666; }
        .stat-value { font-size: 18px; font-weight: bold; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #8B1A1A; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f9fafb; }
        @media print { .no-print { display: none; } }
      </style></head><body>
      <h1>Pledge Report</h1>
      <div class="stats">
        <div class="stat"><div class="stat-label">Total</div><div class="stat-value">${stats.total}</div></div>
        <div class="stat"><div class="stat-label">Pledged</div><div class="stat-value">${formatCurrency(stats.pledged)}</div></div>
        <div class="stat"><div class="stat-label">Collected</div><div class="stat-value">${formatCurrency(stats.paid)}</div></div>
        <div class="stat"><div class="stat-label">Outstanding</div><div class="stat-value">${formatCurrency(stats.remaining)}</div></div>
      </div>
      <table><thead><tr><th>#</th><th>Member</th><th>Campaign</th><th>Pledged</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <p style="margin-top: 30px; text-align: center; color: #666;">Generated: ${new Date().toLocaleString()}</p>
      <button class="no-print" onclick="window.print()" style="position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #8B1A1A; color: white; border: none; border-radius: 8px; cursor: pointer;">Print PDF</button>
      </body></html>
    `);
    win.document.close();
  };

  const hasFilters = searchTerm || filters.status !== 'all' || filters.campaign !== 'all' || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {/* Header */}
      <div className="p-6 border-b bg-slate-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users size={24} className="text-[#8B1A1A]" />
              All Member Pledges
            </h3>
            <p className="text-sm text-slate-600 mt-1">Comprehensive pledge view</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 font-semibold rounded-lg flex items-center gap-2 ${
                hasFilters ? 'bg-[#8B1A1A] text-white' : 'bg-slate-200 hover:bg-slate-300'
              }`}
            >
              <Filter size={18} />
              Filters
            </button>
            <button onClick={handleExportCSV} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Download size={18} /> CSV
            </button>
            <button onClick={handlePrint} className="px-4 py-2 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-red-900 flex items-center gap-2">
              <Printer size={18} /> Print
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or campaign..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] outline-none"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="px-3 py-2 border rounded-lg">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>

              <select value={filters.campaign} onChange={(e) => setFilters({...filters, campaign: e.target.value})} className="px-3 py-2 border rounded-lg">
                <option value="all">All Campaigns</option>
                {campaigns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({...filters, dateFrom: e.target.value})} className="px-3 py-2 border rounded-lg" />
              <input type="date" value={filters.dateTo} onChange={(e) => setFilters({...filters, dateTo: e.target.value})} className="px-3 py-2 border rounded-lg" />
            </div>
            {hasFilters && (
              <button onClick={() => { setFilters({status: 'all', campaign: 'all', dateFrom: '', dateTo: ''}); setSearchTerm(''); }} className="mt-3 px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 flex items-center gap-2">
                <X size={16} /> Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          <div className="bg-white border rounded-lg p-3">
            <p className="text-xs text-slate-600">Total</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <p className="text-xs text-slate-600">Pledged</p>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(stats.pledged)}</p>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <p className="text-xs text-slate-600">Collected</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(stats.paid)}</p>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <p className="text-xs text-slate-600">Outstanding</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(stats.remaining)}</p>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <p className="text-xs text-slate-600">Overdue</p>
            <p className="text-lg font-bold text-orange-600">{stats.overdue}</p>
          </div>
        </div>

        {selectedPledges.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between">
            <p className="text-sm text-blue-800 font-semibold">{selectedPledges.length} selected</p>
            <button onClick={() => setSelectedPledges([])} className="text-blue-600 text-sm font-semibold">Clear</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {processedPledges.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-semibold mb-2">No pledges found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" onChange={(e) => setSelectedPledges(e.target.checked ? processedPledges.map(p => p.id) : [])} />
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-200" onClick={() => handleSort('member_name')}>
                  Member {sortConfig.key === 'member_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-200" onClick={() => handleSort('campaign_title')}>
                  Campaign {sortConfig.key === 'campaign_title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-200" onClick={() => handleSort('pledged_amount')}>
                  Pledged {sortConfig.key === 'pledged_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-200" onClick={() => handleSort('paid_amount')}>
                  Paid {sortConfig.key === 'paid_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedPledges.map(pledge => {
                const badge = getStatusBadge(pledge.status);
                const overdue = isOverdue(pledge);
                
                return (
                  <tr key={pledge.id} className="border-b hover:bg-slate-50">
                     <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedPledges.includes(pledge.id)}
                        onChange={(e) => setSelectedPledges(e.target.checked ? [...selectedPledges, pledge.id] : selectedPledges.filter(id => id !== pledge.id))}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{pledge.member_name}</div>
                      <div className="text-xs text-slate-500">{pledge.member_email}</div>
                    </td>
                    <td className="px-4 py-3">{pledge.campaign_title || 'General'}</td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(pledge.pledged_amount)}</td>
                    <td className="px-4 py-3 font-bold text-green-600">{formatCurrency(pledge.paid_amount)}</td>
                    <td className="px-4 py-3 font-bold text-red-600">{formatCurrency(pledge.remaining_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      {overdue && (
                        <div className="flex items-center gap-1 text-orange-600 text-xs mt-1">
                          <AlertTriangle size={12} /> Overdue
                        </div>
                      )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(pledge.created_at)}</td>
                    <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                            {/* Record Payment */}
                            {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onRecordPayment && (
                            <button 
                                onClick={() => onRecordPayment(pledge)} 
                                className="text-blue-600 hover:text-blue-800 font-semibold text-xs text-left"
                            >
                                Record Payment
                            </button>
                            )}
                            
                            {/* View History */}
                            {onViewHistory && (
                            <button 
                                onClick={() => onViewHistory(pledge)} 
                                className="text-purple-600 hover:text-purple-800 font-semibold text-xs text-left"
                            >
                                View History
                            </button>
                            )}

                            {/* ✅ ADD: Edit Pledge */}
                            {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onEditPledge && (
                            <button 
                                onClick={() => onEditPledge(pledge)} 
                                className="text-green-600 hover:text-green-800 font-semibold text-xs text-left"
                            >
                                Edit Pledge
                            </button>
                            )}

                            {/* ✅ ADD: Cancel Pledge */}
                            {pledge.status !== 'completed' && pledge.status !== 'cancelled' && onCancelPledge && (
                            <button 
                                onClick={() => onCancelPledge(pledge)} 
                                className="text-red-600 hover:text-red-800 font-semibold text-xs text-left"
                            >
                                Cancel Pledge
                            </button>
                            )}
                        </div>

                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {processedPledges.length > 0 && (
        <div className="bg-slate-50 border-t px-6 py-4 flex justify-between text-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-slate-600">Collection Rate:</span>
              <span className="ml-2 font-bold">{stats.pledged > 0 ? Math.round((stats.paid / stats.pledged) * 100) : 0}%</span>
            </div>
            <div>
              <span className="text-slate-600">Completion:</span>
              <span className="ml-2 font-bold">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
            </div>
          </div>
          <div className="text-slate-600">
            Showing <strong>{processedPledges.length}</strong> pledges
          </div>
        </div>
      )}
    </div>
  );
}