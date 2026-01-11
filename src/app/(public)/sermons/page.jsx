'use client';

import React, { useState, useEffect } from 'react';
import { Settings, X, Search, Plus, BookOpen, Video, Image as ImageIcon, Filter } from 'lucide-react';
import SermonCardText from '@/components/sermons/SermonCardText';
import SermonCard from '@/components/sermons/SermonCard';
import Loader from '@/components/common/Loader';
import { sermonService } from '@/services/api/sermonService';
import { useAuthContext } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import PermissionAlert from '@/components/common/PermissionAlert';

export default function SermonsPage() {
  const { canPostSermon, user } = useAuthContext();
  
  const [allSermons, setAllSermons] = useState([]);
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  const categories = ['All', 'Sunday Service', 'Bible Study', 'Special Event', 'Youth Ministry', 'Prayer Meeting'];

  useEffect(() => {
    fetchSermons();
  }, []);

  useEffect(() => {
    filterSermons();
  }, [selectedType, selectedCategory, searchTerm, allSermons]);

  const fetchSermons = async () => {
    try {
      setLoading(true);
      const data = await sermonService.getSermons({ limit: 100 });
      const sermons = data.sermons || data;
      const sermonsWithDefaults = sermons.map(s => ({
        ...s,
        type: s.type || detectSermonType(s),
        descriptionHtml: s.descriptionHtml || s.description || '',
        description: s.description || ''
      }));
      setAllSermons(sermonsWithDefaults);
      setError(null);
    } catch (err) {
      setError('Failed to load sermons');
    } finally {
      setLoading(false);
    }
  };

  const detectSermonType = (sermon) => {
    if (sermon.videoUrl) return 'video';
    if (sermon.thumbnail) return 'photo';
    return 'text';
  };

  const filterSermons = () => {
    let result = [...allSermons].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (selectedType !== 'all') result = result.filter(s => detectSermonType(s) === selectedType);
    if (selectedCategory !== 'All') result = result.filter(s => s.category === selectedCategory);
    if (searchTerm) {
      result = result.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.pastor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredSermons(result);
  };

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedCategory('All');
    setSearchTerm('');
    setShowAdvancedFilter(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      
      {/* 1. HERO SECTION - Adjusted padding for mobile */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-5%] left-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-red-100/40 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mx-auto md:mx-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Digital Archive</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B1A1A] to-red-500">Word.</span>
              </h1>
              <p className="text-sm md:text-lg text-slate-500 font-medium max-w-xl mx-auto md:mx-0">
                Biblically-centered messages for your spiritual growth.
              </p>
            </div>

            {canPostSermon && canPostSermon() && (
              <Button onClick={() => window.location.href = '/admin/sermons'} className="w-full md:w-auto bg-slate-900 text-white rounded-xl px-8 py-4 shadow-xl hover:bg-[#8B1A1A] transition-all flex items-center justify-center gap-2">
                <Plus size={18} /> <span className="font-bold uppercase tracking-widest text-[10px]">New Entry</span>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER - Full width on mobile */}
      <div className="sticky top-4 z-50 max-w-5xl mx-auto px-2 md:px-6">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-xl rounded-2xl md:rounded-[2rem] p-1.5 flex flex-col md:flex-row items-center gap-1.5">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search teachings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/50 md:bg-transparent rounded-xl md:rounded-none pl-12 pr-4 py-3 text-sm focus:outline-none placeholder:text-slate-400"
            />
          </div>
          <button 
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl md:rounded-[1.5rem] transition-all font-bold text-xs uppercase tracking-widest ${
              showAdvancedFilter ? 'bg-slate-900 text-white' : 'bg-slate-100 md:bg-transparent text-slate-600'
            }`}
          >
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-2 md:px-6 py-10 md:py-20">
        {/* Responsive Category Selector */}
        <div className="flex gap-2 overflow-x-auto pb-8 no-scrollbar md:justify-center px-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tight transition-all flex-shrink-0 border ${
                selectedCategory === cat 
                ? 'bg-white border-[#8B1A1A] text-[#8B1A1A] shadow-md' 
                : 'bg-transparent border-transparent text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter Drawer - Responsive Grid */}
        {showAdvancedFilter && (
          <div className="mb-10 grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {[
              { id: 'all', label: 'All', icon: <Filter size={14} /> },
              { id: 'text', label: 'Transcripts', icon: <BookOpen size={14} /> },
              { id: 'video', label: 'Video', icon: <Video size={14} /> },
              { id: 'photo', label: 'Photos', icon: <ImageIcon size={14} /> }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  selectedType === type.id 
                  ? 'border-[#8B1A1A] bg-red-50/50 text-[#8B1A1A]' 
                  : 'border-slate-100 bg-white text-slate-400'
                }`}
              >
                {type.icon}
                <span className="text-[9px] font-black uppercase tracking-widest">{type.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* 3. CONTENT AREA - Reduced padding for cards on mobile */}
        <div className="space-y-4 md:space-y-12">
          {filteredSermons.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 mx-2">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found.</p>
            </div>
          ) : (
            filteredSermons.map(sermon => (
              <div 
                key={sermon._id} 
                className="group relative bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden mx-1 md:mx-0"
              >
                {/* Padding reduced for mobile view (p-4) vs desktop (p-12) */}
                <div className="relative z-10 p-4 md:p-12">
                  {detectSermonType(sermon) === 'text' ? (
                    <SermonCardText sermon={sermon} />
                  ) : (
                    <SermonCard sermon={sermon} type={detectSermonType(sermon)} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}