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
  // Destructure canPostSermon from the auth context to fix the ReferenceError
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
      console.error('Error fetching sermons:', err);
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

    if (selectedType !== 'all') {
      result = result.filter(s => detectSermonType(s) === selectedType);
    }

    if (selectedCategory !== 'All') {
      result = result.filter(s => s.category === selectedCategory);
    }

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
    <div className="min-h-screen bg-[#FDFCFB]"> {/* Warm Paper Reading Background */}
      
      {/* 1. SHINY GRADIENT HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-red-100/40 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-50/50 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Archive Live</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B1A1A] to-red-500">Word.</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-xl">
                Deepen your understanding through our curated library of teachings and Sunday messages.
              </p>
            </div>

            {canPostSermon && canPostSermon() && (
              <Button onClick={() => window.location.href = '/admin/sermons'} className="bg-slate-900 text-white rounded-2xl px-8 py-6 shadow-2xl hover:bg-[#8B1A1A] transition-all flex items-center gap-2 group">
                <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
                <span className="font-bold uppercase tracking-widest text-xs">Post Sermon</span>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* 2. GLASSMORPHIC SEARCH BAR */}
      <div className="sticky top-6 z-50 max-w-4xl mx-auto px-6">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2rem] p-2 flex flex-col md:flex-row items-center gap-2">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8B1A1A] transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search by title or pastor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent pl-14 pr-6 py-4 text-sm font-medium focus:outline-none placeholder:text-slate-400"
            />
          </div>
          <button 
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className={`flex items-center gap-2 px-6 py-4 rounded-[1.5rem] transition-all font-bold text-xs uppercase tracking-widest ${
              showAdvancedFilter ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-20">
        {/* Category Selector */}
        <div className="flex gap-2 overflow-x-auto pb-12 no-scrollbar justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-tighter transition-all duration-300 border ${
                selectedCategory === cat 
                ? 'bg-white border-[#8B1A1A] text-[#8B1A1A] shadow-md scale-110' 
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvancedFilter && (
          <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {[
              { id: 'all', label: 'All Media', icon: <Filter size={14} /> },
              { id: 'text', label: 'Transcripts', icon: <BookOpen size={14} /> },
              { id: 'video', label: 'Video', icon: <Video size={14} /> },
              { id: 'photo', label: 'Photos', icon: <ImageIcon size={14} /> }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${
                  selectedType === type.id 
                  ? 'border-[#8B1A1A] bg-red-50/30 text-[#8B1A1A]' 
                  : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                }`}
              >
                {type.icon}
                <span className="text-[9px] font-black uppercase tracking-widest">{type.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* 3. SERMON LIST AREA */}
        <div className="space-y-12">
          {filteredSermons.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No matching records found.</p>
              <button onClick={resetFilters} className="text-[#8B1A1A] text-xs font-black mt-4 uppercase hover:underline">Clear Search</button>
            </div>
          ) : (
            filteredSermons.map(sermon => (
              <div 
                key={sermon._id} 
                className="group relative bg-white rounded-[2.5rem] border border-slate-100/80 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out overflow-hidden"
              >
                {/* Subtle Hover Reveal Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 p-8 md:p-12">
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