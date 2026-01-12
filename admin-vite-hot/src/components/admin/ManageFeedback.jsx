import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Filter, RefreshCw, Eye,
  CheckCircle, XCircle, Clock, AlertCircle, Send,
  ShieldAlert, UserCheck, Calendar, Info, Search, Zap
} from 'lucide-react';

// --- VITE COMPATIBLE IMPORTS ---
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

  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    anonymous: 'all',
    search: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedback, filters]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [feedbackRes, statsRes] = await Promise.all([
        feedbackService.getAllFeedback(),
        feedbackService.getStats()
      ]);

      if (feedbackRes.success) {
        setFeedback(feedbackRes.feedback || []);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('System Link Failure: Could not reach the feedback database.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedback];
    if (filters.category !== 'all') filtered = filtered.filter(item => item.category === filters.category);
    if (filters.status !== 'all') filtered = filtered.filter(item => item.status === filters.status);
    if (filters.anonymous === 'true') filtered = filtered.filter(item => item.isAnonymous === true);
    else if (filters.anonymous === 'false') filtered = filtered.filter(item => item.isAnonymous === false);
    
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term) ||
        item.feedbackData?.subject?.toLowerCase().includes(term)
      );
    }
    setFilteredFeedback(filtered);
  };

  // --- STYLING HELPERS ---
  const getStatusColor = (status) => {
    const map = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      reviewed: "bg-blue-100 text-blue-700 border-blue-200",
      published: "bg-emerald-100 text-emerald-700 border-emerald-200",
      responded: "bg-purple-100 text-purple-700 border-purple-200",
      archived: "bg-slate-100 text-slate-700 border-slate-200"
    };
    return map[status] || map.pending;
  };

  const getCategoryEmoji = (cat) => {
    const emojis = { sermon: '📖', service: '⛪', testimony: '🙏', suggestion: '💡', prayer: '🙌' };
    return emojis[cat] || '📋';
  };

  const handleViewDetails = (item) => {
    setSelectedFeedback(item);
    setResponseText('');
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50"><Loader /><p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initializing Command Center</p></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-6 px-6 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest mb-2 transition-all">
                <ArrowLeft size={14} /> Back to Control
              </button>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                Feedback <span className="text-red-600">Engine</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
                <p className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Operational
                </p>
              </div>
              <button onClick={fetchData} className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-slate-200">
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* STATISTICS GRID */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Total Logs</p>
              <p className="text-4xl font-black text-slate-900">{stats.total}</p>
              <Zap className="absolute -right-2 -bottom-2 text-slate-50 group-hover:text-amber-100 transition-colors" size={80} />
            </div>
            <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Pending Review</p>
              <p className="text-4xl font-black text-amber-500">{stats.pending}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl relative overflow-hidden border-2 border-slate-900">
              <p className="text-[10px] font-black uppercase text-white/40 mb-1 tracking-widest">Urgent Prayers</p>
              <p className="text-4xl font-black text-red-500">{stats.urgentPrayers || 0}</p>
              <AlertCircle className="absolute -right-2 -bottom-2 text-white/5" size={80} />
            </div>
            <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Conversion</p>
              <p className="text-4xl font-black text-slate-900">
                {stats.total > 0 ? Math.round((stats.anonymous / stats.total) * 100) : 0}% <span className="text-[10px] text-slate-300 italic">Anon</span>
              </p>
            </div>
          </div>
        )}

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white p-4 rounded-[28px] border-2 border-slate-100 mb-8 flex flex-wrap items-center gap-4 sticky top-[130px] z-10 shadow-sm">
          <div className="relative flex-1 min-w-[280px]">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, subject, or category..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-300"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="flex-1 lg:flex-none px-6 py-4 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">Categories</option>
              <option value="sermon">Sermon</option>
              <option value="service">Service</option>
              <option value="testimony">Testimony</option>
              <option value="prayer">Prayer</option>
            </select>
            <select 
              value={filters.status} 
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="flex-1 lg:flex-none px-6 py-4 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="published">Published</option>
              <option value="responded">Responded</option>
            </select>
          </div>
        </div>

        {/* DATA FEED */}
        <div className="space-y-4">
          {filteredFeedback.length === 0 ? (
            <div className="bg-white rounded-[48px] py-32 text-center border-2 border-dashed border-slate-200">
              <Info className="mx-auto text-slate-200 mb-4" size={64} />
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No matching logs found in system</p>
            </div>
          ) : (
            filteredFeedback.map((item) => (
              <div key={item._id} className="group bg-white rounded-[32px] border-2 border-slate-100 p-6 hover:border-slate-900 transition-all hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center text-4xl group-hover:bg-slate-900 group-hover:scale-105 transition-all shadow-inner">
                    {getCategoryEmoji(item.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h4 className="text-xl font-black uppercase tracking-tighter text-slate-900">
                        {item.feedbackData?.subject || `${item.category} Report`}
                      </h4>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${getStatusColor(item.status)}`}>
                        {item.status}
                      </div>
                      {item.category === 'prayer' && item.feedbackData?.urgency === 'Urgent' && (
                        <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-red-600 text-white animate-pulse">
                          Urgent
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(item.submittedAt || item.createdAt).toLocaleDateString()}</span>
                      <span className="text-slate-200">|</span>
                      {item.isAnonymous ? (
                        <span className="flex items-center gap-1.5 text-amber-600"><ShieldAlert size={12}/> Anonymous User</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-900"><UserCheck size={12}/> {item.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleViewDetails(item)}
                  className="w-full md:w-auto px-10 py-5 rounded-[20px] bg-slate-50 text-slate-900 font-black uppercase tracking-widest text-[11px] hover:bg-slate-900 hover:text-white transition-all border-2 border-transparent hover:border-slate-900 active:scale-95 shadow-sm"
                >
                  Analyze Submission
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* INSPECTION MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)} 
        title="Submission Inspection"
      >
        {selectedFeedback && (
          <div className="space-y-8 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Log Type</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{selectedFeedback.category}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${getStatusColor(selectedFeedback.status)}`}>
                <p className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">Status</p>
                <p className="text-xs font-black uppercase tracking-tight">{selectedFeedback.status}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Privacy</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{selectedFeedback.isAnonymous ? 'Restricted' : 'Public'}</p>
              </div>
            </div>

            {/* Content Logic Rendering */}
            <div className="space-y-6">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] pl-2 border-l-4 border-red-600">Core Content</p>
              {Object.entries(selectedFeedback.feedbackData || {}).map(([key, value]) => {
                if (!value || typeof value === 'object') return null;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} className="relative p-7 bg-white border-2 border-slate-100 rounded-[32px] group hover:border-slate-900 transition-colors">
                    <label className="absolute -top-3 left-8 bg-white px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{label}</label>
                    <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">{String(value)}</p>
                  </div>
                );
              })}
            </div>

            {/* RESPONSE CHANNEL */}
            {!selectedFeedback.isAnonymous && selectedFeedback.allowFollowUp && (
              <div className="p-8 bg-slate-900 rounded-[40px] shadow-2xl shadow-slate-900/20 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-600 rounded-lg"><Send size={16} /></div>
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em]">Official Response Channel</h5>
                </div>
                <textarea 
                  value={responseText} 
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full bg-white/10 border-2 border-white/10 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-red-600 transition-all outline-none min-h-[140px] placeholder:text-white/20"
                  placeholder="Draft your response to the user here..."
                />
                <button 
                  onClick={handleSendResponse} 
                  disabled={isSubmitting || !responseText.trim()} 
                  className="mt-6 w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-white/20 text-white rounded-2xl font-black py-5 uppercase tracking-widest text-[11px] transition-all shadow-lg"
                >
                  {isSubmitting ? 'Transmitting Data...' : 'Dispatch Official Response'}
                </button>
              </div>
            )}

            {/* CONTROL BUTTONS */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
              {selectedFeedback.status === 'pending' && (
                <button 
                  onClick={() => feedbackService.updateStatus(selectedFeedback._id, { status: 'reviewed' }).then(fetchData)}
                  className="flex-1 min-w-[150px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-4 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100 transition-all"
                >
                  Mark Reviewed
                </button>
              )}
              {selectedFeedback.category === 'testimony' && selectedFeedback.status !== 'published' && (
                <button 
                  onClick={() => feedbackService.publishTestimony(selectedFeedback._id).then(fetchData)}
                  className="flex-1 min-w-[150px] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100 transition-all"
                >
                  Publish Testimony
                </button>
              )}
              <button 
                onClick={() => feedbackService.updateStatus(selectedFeedback._id, { status: 'archived' }).then(fetchData)}
                className="flex-1 min-w-[150px] bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-900 rounded-2xl py-4 font-black uppercase text-[10px] tracking-widest transition-all"
              >
                Archive Log
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageFeedback;