import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Filter, RefreshCw, Eye,
  CheckCircle, XCircle, Clock, AlertCircle, Send,
  ShieldAlert, UserCheck, Calendar, Info, Search
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
      } else {
        setError('Failed to load feedback');
      }

      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to connect to the server.');
      setFeedback([]);
      setStats({ total: 0, pending: 0, urgentPrayers: 0, anonymous: 0, thisWeek: 0 });
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
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.feedbackData?.subject?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    setFilteredFeedback(filtered);
  };

  const handleViewDetails = (item) => {
    setSelectedFeedback(item);
    setResponseText('');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedFeedback) return;
    setIsSubmitting(true);
    try {
      const response = await feedbackService.updateStatus(selectedFeedback._id, { status });
      if (response.success) {
        await fetchData();
        setIsModalOpen(false);
        setSelectedFeedback(null);
      }
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    } finally { setIsSubmitting(false); }
  };

  const handlePublishTestimony = async () => {
    if (!selectedFeedback || selectedFeedback.category !== 'testimony') return;
    setIsSubmitting(true);
    try {
      const response = await feedbackService.publishTestimony(selectedFeedback._id);
      if (response.success) {
        await fetchData();
        setIsModalOpen(false);
        setSelectedFeedback(null);
      }
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    } finally { setIsSubmitting(false); }
  };

  const handleSendResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await feedbackService.respondToFeedback(selectedFeedback._id, responseText);
      if (response.success) {
        await fetchData();
        setResponseText('');
        alert('Response sent successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally { setIsSubmitting(false); }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      reviewed: "bg-blue-100 text-blue-700 border-blue-200",
      published: "bg-emerald-100 text-emerald-700 border-emerald-200",
      responded: "bg-purple-100 text-purple-700 border-purple-200",
      archived: "bg-slate-100 text-slate-700 border-slate-200"
    };
    return styles[status] || styles.pending;
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="bg-white border-b pt-8 pb-6 px-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
               <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Feedback Dashboard</h1>
          </div>
          <Button variant="secondary" onClick={fetchData} className="flex gap-2">
            <RefreshCw size={16} /> Sync
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* FILTERS */}
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-12 pr-4 py-2 bg-slate-50 border-none rounded-xl"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <select 
            value={filters.category} 
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold"
          >
            <option value="all">All Categories</option>
            <option value="sermon">Sermon</option>
            <option value="prayer">Prayer</option>
            <option value="testimony">Testimony</option>
          </select>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <div key={item._id} className="bg-white rounded-3xl border-2 border-slate-100 p-6 flex justify-between items-center">
              <div>
                <h4 className="font-black uppercase text-slate-900">{item.feedbackData?.subject || item.category}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase">{item.isAnonymous ? 'Anonymous' : item.name}</p>
              </div>
              <Button onClick={() => handleViewDetails(item)}>View</Button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)} 
        title="Details"
      >
        {selectedFeedback && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-black uppercase text-slate-400">Status</p>
                <p className="text-xs font-bold">{selectedFeedback.status}</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(selectedFeedback.feedbackData || {}).map(([key, value]) => (
                <div key={key} className="p-4 bg-white border rounded-2xl relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">{key}</label>
                  <p className="text-sm">{String(value)}</p>
                </div>
              ))}
            </div>

            {!selectedFeedback.isAnonymous && (
              <div className="p-6 bg-slate-900 rounded-3xl">
                <textarea 
                  value={responseText} 
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full bg-white/10 text-white p-4 rounded-xl text-sm"
                  placeholder="Draft response..."
                />
                <Button onClick={handleSendResponse} className="mt-4 w-full bg-white text-black" disabled={!responseText.trim()}>
                   Send Response
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageFeedback;