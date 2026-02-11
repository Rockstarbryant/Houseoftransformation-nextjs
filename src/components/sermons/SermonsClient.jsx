'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Video, Image as ImageIcon } from 'lucide-react';
import SermonCardText from '@/components/sermons/SermonCardText';
import SermonCard from '@/components/sermons/SermonCard';

//export const revalidate = 360;
export default function SermonsClient({ initialSermons }) {
  const [allSermons, setAllSermons] = useState(initialSermons);
  const [filteredSermons, setFilteredSermons] = useState(initialSermons);
  
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedSermons, setSelectedSermons] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  

  const categories = ['All', 'Sunday Service', 'Bible Study', 'Special Event', 'Youth Ministry', 'Prayer Meeting'];

  // Filter logic - runs on client only
  useEffect(() => {
    filterSermons();
  }, [selectedType, selectedCategory, searchTerm, allSermons]);

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


  return (
    <>
      {/* Search & Filter Bar - Sticky */}
<div className="z-50 max-w-5xl mx-auto px-2 md:px-6">
  <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[2rem] p-1.5 flex flex-col md:flex-row items-center gap-1.5">
    <div className="relative flex-1 w-full group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-100" size={18} />
      <input 
        type="text"
        placeholder="Search teachings..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-slate-100 dark:bg-slate-700 md:bg-transparent rounded-xl md:rounded-none pl-12 pr-4 py-3 text-sm focus:outline-none placeholder:text-slate-400 dark:text-slate-100"
      />
    </div>
    <button 
      onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
      className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl md:rounded-[1.5rem] transition-all font-bold text-xs uppercase tracking-widest ${
        showAdvancedFilter ? 'bg-red-900 dark:bg-red-700 text-white' : 'bg-slate-100 dark:bg-slate-700 md:bg-transparent text-slate-600 dark:text-slate-300'
      }`}
    >
      <Filter size={16} /> Filters
    </button>
    
    </div>
    </div>

      <main className="max-w-5xl mx-auto px-2 md:px-6 py-10 md:py-20">
        {/* Category Selector */}
        <div className="flex gap-2 overflow-x-auto pb-8 no-scrollbar md:justify-center px-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tight transition-all flex-shrink-0 border ${
                selectedCategory === cat 
                ? 'bg-white dark:bg-slate-900 border-[#8B1A1A] text-[#8B1A1A] shadow-md' 
                : 'bg-transparent border-transparent text-slate-400 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
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
                  : 'border-slate-100 bg-white dark:bg-slate-900 text-slate-400'
                }`}
              >
                {type.icon}
                <span className="text-[9px] font-black uppercase tracking-widest">{type.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Sermon Cards */}
        {/* Sermon Cards */}
<div className="space-y-4 md:space-y-12">
  {filteredSermons.length === 0 ? (
    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl mx-2">
      <p className="text-slate-400 dark:text-slate-200 font-bold uppercase tracking-widest text-xs">No records found.</p>
    </div>
  ) : (
    filteredSermons.map(sermon => (
      <div 
        key={sermon._id} 
        className="group relative bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2.5rem] overflow-hidden mx-1 md:mx-0"
      >
        {/* Checkbox for selection mode */}
        {isSelectionMode && (
          <div className="absolute top-4 left-4 z-10">
            <input
              type="checkbox"
              checked={selectedSermons.includes(sermon._id)}
              onChange={() => handleSelectSermon(sermon._id)}
              className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        )}
        
        {/* Print button for single sermon */}
        {!isSelectionMode && (
          <button
            onClick={() => handlePrintSingle(sermon)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-[#8B1A1A] hover:text-white transition-all opacity-0 group-hover:opacity-100"
            title="Print this sermon"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
          </button>
        )}
        
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
    </>
  );
}