import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Filter, RefreshCw, Eye,
  CheckCircle, XCircle, Clock, AlertCircle, Send,
  ShieldAlert, UserCheck, Calendar, Info, Search, Zap,
  Download, Trash2, CheckSquare, Square
} from 'lucide-react';

import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import { feedbackService } from '../../services/api/feedbackService';

const ManageFeedback = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseText, setResponseText] = useState('');
  
  // NEW: Bulk Actions State
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({ category: 'all', status: 'all', search: '' });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { applyFilters(); }, [feedback, filters]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fRes, sRes] = await Promise.all([
        feedbackService.getAllFeedback(),
        feedbackService.getStats()
      ]);
      if (fRes.success) setFeedback(fRes.feedback || []);
      if (sRes.success) setStats(sRes.stats);
    } catch (err) {
      setError('Database Connection Lost');
    } finally { setIsLoading(false); }
  };

  const applyFilters = () => {
    let filtered = [...feedback];
    if (filters.category !== 'all') filtered = filtered.filter(f => f.category === filters.category);
    if (filters.status !== 'all') filtered = filtered.filter(f => f.status === filters.status);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(f => f.name?.toLowerCase().includes(s) || f.category?.toLowerCase().includes(s));
    }
    setFilteredFeedback(filtered);
  };

  // NEW: Export Functionality
  const exportToCSV = () => {
    const headers = ["Date", "Name", "Category", "Status", "Message"];
    const rows = filteredFeedback.map(f => [
      new Date(f.createdAt).toLocaleDateString(),
      f.isAnonymous ? "Anonymous" : f.name,
      f.category,
      f.status,
      JSON.stringify(f.feedbackData).replace(/"/g, '')
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    window.open(encodeURI(csvContent));
  };

  // NEW: Bulk Actions Logic
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkArchive = async () => {
    if (!window.confirm(`Archive ${selectedIds.length} items?`)) return;
    setIsSubmitting(true);
    try {
      await Promise.all(selectedIds.map(id => feedbackService.updateStatus(id, { status: 'archived' })));
      setSelectedIds([]);
      fetchData();
    } finally { setIsSubmitting(false); }
  };

  const getStatusColor = (s) => {
    const colors = { pending: "bg-amber-100 text-amber-600", reviewed: "bg-blue-100 text-blue-600", published: "bg-emerald-100 text-emerald-600" };
    return colors[s] || "bg-slate-100 text-slate-500";
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* HEADER */}
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">HOT <span className="text-red-600">HQ</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Feedback Management System</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportToCSV} variant="secondary" className="flex gap-2 text-xs"><Download size={14}/> Export CSV</Button>
            <button onClick={fetchData} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-red-600 transition-all"><RefreshCw size={20}/></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-10">
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Active Logs</p>
            <p className="text-5xl font-black tracking-tighter text-slate-900">{stats?.total || 0}</p>
          </div>
          <div className="bg-amber-500 p-6 rounded-[32px] text-white shadow-lg shadow-amber-200">
            <p className="text-[10px] font-black uppercase text-white/60 mb-2">Awaiting Review</p>
            <p className="text-5xl font-black tracking-tighter">{stats?.pending || 0}</p>
          </div>
          {/* Urgent Prayer Card */}
          <div className="bg-red-600 p-6 rounded-[32px] text-white shadow-lg shadow-red-200 col-span-1 md:col-span-2 flex justify-between items-center overflow-hidden relative">
            <div>
              <p className="text-[10px] font-black uppercase text-white/60 mb-2">Urgent Intercession</p>
              <p className="text-5xl font-black tracking-tighter">{stats?.urgentPrayers || 0}</p>
            </div>
            <AlertCircle size={100} className="absolute -right-5 opacity-20 rotate-12" />
          </div>
        </div>

        {/* BULK ACTION BAR - Only shows when items are selected */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-bounce-in">
            <span className="text-xs font-black uppercase tracking-widest">{selectedIds.length} Selected</span>
            <div className="h-6 w-[1px] bg-white/20" />
            <button onClick={handleBulkArchive} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-[10px] font-black uppercase"><Trash2 size={16}/> Bulk Archive</button>
            <button onClick={() => setSelectedIds([])} className="text-white/40 hover:text-white text-[10px] font-black uppercase underline">Cancel</button>
          </div>
        )}

        {/* FILTER BAR */}
        <div className="bg-white p-4 rounded-[24px] border-2 border-slate-100 mb-6 flex gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-red-600"
              placeholder="Search database..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
             />
           </div>
        </div>

        {/* FEED LIST */}
        <div className="space-y-3">
          {filteredFeedback.map(item => (
            <div key={item._id} className={`bg-white p-5 rounded-[24px] border-2 transition-all flex items-center justify-between ${selectedIds.includes(item._id) ? 'border-red-600 bg-red-50' : 'border-slate-100'}`}>
              <div className="flex items-center gap-5">
                <button onClick={() => toggleSelect(item._id)} className="text-slate-300 hover:text-red-600 transition-colors">
                  {selectedIds.includes(item._id) ? <CheckSquare size={24} className="text-red-600" /> : <Square size={24} />}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black uppercase text-slate-900 tracking-tight">{item.feedbackData?.subject || item.category}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${getStatusColor(item.status)}`}>{item.status}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase italic">By: {item.isAnonymous ? "Anonymous" : item.name}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedFeedback(item); setIsModalOpen(true); }} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-red-600 transition-all">Inspect</button>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Details">
        {selectedFeedback && (
            <div className="space-y-6">
                 {Object.entries(selectedFeedback.feedbackData || {}).map(([key, value]) => (
                    <div key={key} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{key}</p>
                        <p className="text-sm font-medium text-slate-700">{String(value)}</p>
                    </div>
                 ))}
            </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageFeedback;