'use client';

import React, { useState, useEffect } from 'react';
import { Play, Calendar, Users, BookOpen, Share2, TrendingUp, ChevronDown, Monitor, Zap, LayoutGrid, List, X, Maximize2, Minimize2 } from 'lucide-react';
import { useLivestream } from '@/hooks/useLivestream';
// page.jsx snippet
import { usePiP } from '@/context/PiPContext';

const LiveStreamPage = () => {
  const { activeStream, archives, loading, fetchArchives } = useLivestream();
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('-startTime');
  const [selectedStream, setSelectedStream] = useState(null);
  const [gridView, setGridView] = useState(true);
  const [showCaptions, setShowCaptions] = useState(false);
 // const [floatingPiP, setFloatingPiP] = useState(null);
  //const [pipSize, setPipSize] = useState({ width: 360, height: 240 });
  //const [pipPosition, setPipPosition] = useState({ x: 20, y: 80 });
  //const [isDraggingPiP, setIsDraggingPiP] = useState(false);
  //const [isResizingPiP, setIsResizingPiP] = useState(false);
  //const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
 // const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 360, height: 240 });
  const { floatingPiP, setFloatingPiP } = usePiP(); // Use the global hook

  

  // FIX: Load archives on component mount with default filters
  useEffect(() => {
    fetchArchives({ type: filterType, sortBy: sortBy, limit: 100 });
  }, []);

  // Restore PiP from localStorage on mount and request wake lock
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPiP = localStorage.getItem('persistentPiP');
      const savedSize = localStorage.getItem('persistentPiPSize');
      const savedPosition = localStorage.getItem('persistentPiPPosition');
      
      if (savedPiP) {
        try {
          setFloatingPiP(JSON.parse(savedPiP));
          if (savedSize) setPipSize(JSON.parse(savedSize));
          if (savedPosition) setPipPosition(JSON.parse(savedPosition));
        } catch (e) {
          console.error('Failed to restore PiP:', e);
          localStorage.removeItem('persistentPiP');
        }
      }

      // Request wake lock to keep screen on while video is playing
      if (navigator.wakeLock && savedPiP) {
        navigator.wakeLock.request('screen').catch((err) => {
          console.log(`Wake Lock error: ${err.name}, ${err.message}`);
        });
      }

      // Handle visibility change to reacquire wake lock
      const handleVisibilityChange = async () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible' && floatingPiP) {
          try {
            await navigator.wakeLock.request('screen');
          } catch (err) {
            console.log(`Wake Lock error on visibility: ${err.name}, ${err.message}`);
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  // Save PiP to localStorage whenever it changes
/*  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (floatingPiP) {
        localStorage.setItem('persistentPiP', JSON.stringify(floatingPiP));
        localStorage.setItem('persistentPiPSize', JSON.stringify(pipSize));
        localStorage.setItem('persistentPiPPosition', JSON.stringify(pipPosition));
      }
    }
  }, [floatingPiP, pipSize, pipPosition]);  */

  const streamTypes = [
    { value: '', label: 'All Livestreams' },
    { value: 'sermon', label: 'ðŸŽ¤ Sermons' },
    { value: 'praise_worship', label: 'ðŸŽµ Praise & Worship' },
    { value: 'full_service', label: 'â›ª Full Service' },
    { value: 'sunday_school', label: 'ðŸ"š Sunday School' },
    { value: 'special_event', label: 'ðŸŽ‰ Special Events' }
  ];

  const handleFilterChange = (type) => {
    setFilterType(type);
    fetchArchives({ type, sortBy, limit: 100 });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    fetchArchives({ type: filterType, sortBy: sort, limit: 100 });
  };

  const getEmbedUrl = (stream) => {
    if (stream.youtubeVideoId) {
      return `https://www.youtube.com/embed/${stream.youtubeVideoId}`;
    }
    if (stream.youtubeUrl?.includes('youtube')) {
      return stream.youtubeUrl;
    }
    if (stream.facebookUrl) {
      return stream.facebookUrl;
    }
    return null;
  };

  const handleShare = (stream) => {
    const text = `Watch: ${stream.title}`;
    if (navigator.share) {
      navigator.share({ title: stream.title, text });
    } else {
      alert('Copy link to share: ' + window.location.href);
    }
  };

  const openFloatingPiP = async (stream) => {
    setFloatingPiP(stream); // This now sends the data to the Layout level

    // Request screen wake lock to prevent screen from sleeping
    if (typeof navigator !== 'undefined' && navigator.wakeLock) {
      try {
        await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired');
      } catch (err) {
        console.log(`Wake Lock error: ${err.name}, ${err.message}`);
      }
    }
  };

  const closeFloatingPiP = () => {
    setFloatingPiP(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('persistentPiP');
      localStorage.removeItem('persistentPiPSize');
      localStorage.removeItem('persistentPiPPosition');
    }
  };

  const getClientCoords = (e) => {
    if (e.touches) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

 /* const handlePiPDragStart = (e) => {
    e.preventDefault();
    const pipElement = document.getElementById('floating-pip');
    if (!pipElement) return; 
    
    const coords = getClientCoords(e);
    const rect = pipElement.getBoundingClientRect();
    setDragOffset({
      x: coords.x - rect.left,
      y: coords.y - rect.top
    });
    setIsDraggingPiP(true);
  };

  const handlePiPDragMove = (e) => {
    if (!isDraggingPiP) return;
    
    const pipElement = document.getElementById('floating-pip');
    if (!pipElement) return;
    
    const coords = getClientCoords(e);
    const newX = coords.x - dragOffset.x;
    const newY = coords.y - dragOffset.y;
    
    const boundedX = Math.max(0, Math.min(newX, window.innerWidth - pipSize.width));
    const boundedY = Math.max(0, Math.min(newY, window.innerHeight - pipSize.height));
    
    pipElement.style.left = `${boundedX}px`;
    pipElement.style.top = `${boundedY}px`;
    
    setPipPosition({ x: boundedX, y: boundedY });
  }; 

  const handlePiPDragEnd = () => {
    setIsDraggingPiP(false);
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pipElement = document.getElementById('floating-pip');
    if (!pipElement) return;
    
    const coords = getClientCoords(e);
    setResizeStart({
      x: coords.x,
      y: coords.y,
      width: pipSize.width,
      height: pipSize.height
    });
    setIsResizingPiP(true);
  };

  const handleResizeMove = (e) => {
    if (!isResizingPiP) return;
    
    const coords = getClientCoords(e);
    const deltaX = coords.x - resizeStart.x;
    const deltaY = coords.y - resizeStart.y;
    
    const newWidth = Math.max(280, resizeStart.width + deltaX);
    const newHeight = Math.max(180, resizeStart.height + deltaY);
    
    setPipSize({
      width: newWidth,
      height: newHeight
    });
  };

  const handleResizeEnd = () => {
    setIsResizingPiP(false);
  };  */

/*  useEffect(() => {
    if (isDraggingPiP) {
      window.addEventListener('mousemove', handlePiPDragMove);
      window.addEventListener('mouseup', handlePiPDragEnd);
      window.addEventListener('touchmove', handlePiPDragMove, { passive: false });
      window.addEventListener('touchend', handlePiPDragEnd);
      return () => {
        window.removeEventListener('mousemove', handlePiPDragMove);
        window.removeEventListener('mouseup', handlePiPDragEnd);
        window.removeEventListener('touchmove', handlePiPDragMove);
        window.removeEventListener('touchend', handlePiPDragEnd);
      };
    }
  }, [isDraggingPiP, dragOffset, pipSize]);

  useEffect(() => {
    if (isResizingPiP) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('touchmove', handleResizeMove, { passive: false });
      window.addEventListener('touchend', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
        window.removeEventListener('touchmove', handleResizeMove);
        window.removeEventListener('touchend', handleResizeEnd);
      };
    }
  }, [isResizingPiP, resizeStart]);
*/
  return (
    <div className="pt-20 min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      {/* ACTIVE STREAM: CINEMATIC COMMAND CENTER */}
      {activeStream && (
        <div className="bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden">
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/10 skew-x-12 translate-x-32" />
          
          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-ping absolute inset-0" />
                    <div className="w-3 h-3 bg-red-600 rounded-full relative" />
                  </div>
                  <span className="font-black uppercase tracking-[0.4em] text-[10px] text-red-500">Live Transmission</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter leading-none">
                  {activeStream.title}
                </h1>
                
                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                    <Monitor size={16} className="text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{activeStream.type.replace('_', ' ')}</span>
                  </div>
                  {activeStream.preacherNames?.length > 0 && (
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                      <Users size={16} className="text-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{activeStream.preacherNames.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-2/3">
                {getEmbedUrl(activeStream) && (
                  <div className="aspect-video rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.2)] border-2 border-white/10 bg-black relative group">
                    <button
                      onClick={() => openFloatingPiP(activeStream)}
                      className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-all shadow-lg active:scale-95 md:opacity-0 md:group-hover:opacity-100 opacity-100"
                      title="Picture in Picture"
                    >
                      <Maximize2 size={20} />
                    </button>
                    <iframe
                      src={getEmbedUrl(activeStream)}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay"
                      title={activeStream.title}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ARCHIVES SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
              Mission <br /> <span className="text-red-600">Archives</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Catch up on all past services and events</p>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-white outline-none pr-12 cursor-pointer transition-all"
              >
                {streamTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500" size={16} />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-white outline-none pr-12 cursor-pointer transition-all"
              >
                <option value="-startTime">Newest First</option>
                <option value="startTime">Oldest First</option>
                <option value="-viewCount">Most Watched</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500" size={16} />
            </div>

            <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-2xl">
              <button
                onClick={() => setGridView(true)}
                className={`p-3 rounded-xl transition-all ${gridView ? 'bg-slate-900 dark:bg-red-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setGridView(false)}
                className={`p-3 rounded-xl transition-all ${!gridView ? 'bg-slate-900 dark:bg-red-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400 font-bold">Loading archives...</p>
          </div>
        ) : (
          <div>
            {gridView ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {archives?.map((stream) => (
                  <div key={stream._id} className="group bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden border-2 border-slate-100 dark:border-slate-700 hover:border-red-600 dark:hover:border-red-600 transition-all hover:shadow-xl flex flex-col">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer" onClick={() => setSelectedStream(stream)}>
                      {stream.thumbnail && <img src={stream.thumbnail} alt={stream.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <Play size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex-1 flex flex-col">
                      <h3
                        className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-6 cursor-pointer hover:text-red-600 dark:hover:text-red-500 transition-colors line-clamp-3"
                        onClick={() => setSelectedStream(stream)}
                      >
                        {stream.title}
                      </h3>

                      {/* Metadata Nodes */}
                      <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-slate-50 dark:border-slate-700">
                        {stream.preacherNames?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users size={12} className="text-slate-400 dark:text-slate-500" />
                            <span className="text-[9px] font-black uppercase text-slate-900 dark:text-white truncate">{stream.preacherNames[0]}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <TrendingUp size={12} className="text-slate-400 dark:text-slate-500" />
                          <span className="text-[9px] font-black uppercase text-slate-900 dark:text-white">{stream.viewCount || 0} Views</span>
                        </div>
                      </div>

                      {/* AI Snippet */}
                      {stream.aiSummary?.summary && (
                        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl mb-8 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium line-clamp-2 italic leading-relaxed">
                            "{stream.aiSummary.summary}"
                          </p>
                        </div>
                      )}

                      {/* Actions Container */}
                      <div className="mt-auto flex gap-3">
                        <button
                          onClick={() => setSelectedStream(stream)}
                          className="flex-1 bg-slate-900 dark:bg-red-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-700 transition-all shadow-lg active:scale-95"
                        >
                          Watch Now
                        </button>
                        <button
                          onClick={() => handleShare(stream)}
                          className="p-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl hover:bg-slate-900 dark:hover:bg-slate-600 hover:text-white dark:hover:text-white transition-all"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {archives?.map((stream) => (
                  <div key={stream._id} className="group bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden border-2 border-slate-100 dark:border-slate-700 hover:border-red-600 dark:hover:border-red-600 transition-all hover:shadow-xl p-6 flex gap-8 cursor-pointer" onClick={() => setSelectedStream(stream)}>
                    {/* Thumbnail */}
                    <div className="relative w-40 h-24 bg-slate-900 rounded-2xl overflow-hidden flex-shrink-0">
                      {stream.thumbnail && <img src={stream.thumbnail} alt={stream.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <Play size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-3 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2">
                          {stream.title}
                        </h3>
                        {stream.aiSummary?.summary && (
                          <p className="text-[12px] text-slate-600 dark:text-slate-300 font-medium line-clamp-1 italic">
                            {stream.aiSummary.summary}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-[12px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                        {stream.preacherNames?.length > 0 && (
                          <span className="flex items-center gap-2">
                            <Users size={12} /> {stream.preacherNames[0]}
                          </span>
                        )}
                        <span className="flex items-center gap-2">
                          <TrendingUp size={12} /> {stream.viewCount || 0} Views
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 flex-col-reverse">
                      <button
                        onClick={() => handleShare(stream)}
                        className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 hover:text-white dark:hover:text-white transition-all"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedStream && (
        <div className="fixed inset-0 bg-slate-900/95 dark:bg-slate-950/95 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-xl" onClick={() => setSelectedStream(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-[48px] max-w-6xl w-full max-h-[90vh] overflow-hidden border-2 border-slate-900 dark:border-white flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
            
            {/* Left: Player Section */}
            <div className="flex-1 bg-black flex flex-col">
              <div className="aspect-video w-full relative group">
                {getEmbedUrl(selectedStream) && (
                  <>
                    <button
                      onClick={() => openFloatingPiP(selectedStream)}
                      className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-all shadow-lg active:scale-95 md:opacity-0 md:group-hover:opacity-100 opacity-100"
                      title="Picture in Picture"
                    >
                      <Maximize2 size={20} />
                    </button>
                    <iframe
                      src={getEmbedUrl(selectedStream)}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay"
                      title={selectedStream.title}
                    />
                  </>
                )}
              </div>
              <div className="p-10 text-white bg-slate-900 dark:bg-slate-950 flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 mb-6">
                  <Zap size={16} className="text-red-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Details</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
                  {selectedStream.title}
                </h2>
                <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl italic">
                  {selectedStream.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Right: Metadata & AI Intelligence */}
            <div className="w-full md:w-[400px] border-l-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-y-auto p-10">
              <div className="flex justify-between items-center mb-10">
                <div className="w-12 h-12 bg-red-600 dark:bg-red-700 text-white rounded-2xl flex items-center justify-center">
                  <Monitor size={20} />
                </div>
                <button onClick={() => setSelectedStream(null)} className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 hover:text-white dark:hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-10">
                {selectedStream.preacherNames?.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 border-b dark:border-slate-700 pb-2">Preacher(s)</h3>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedStream.preacherNames.join(', ')}</p>
                  </div>
                )}

                {selectedStream.scriptures?.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 border-b dark:border-slate-700 pb-2">Scriptures</h3>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedStream.scriptures.join(', ')}</p>
                  </div>
                )}

                {selectedStream.aiSummary?.keyPoints?.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 border-b dark:border-slate-700 pb-2">Key Points</h3>
                    <ul className="space-y-4">
                      {selectedStream.aiSummary.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex gap-3 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                          <span className="text-red-600">â€¢</span> {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedStream.aiSummary?.captions?.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-6 border-b dark:border-slate-700 pb-2">
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Captions</h3>
                      <button onClick={() => setShowCaptions(!showCaptions)} className="text-[9px] font-black text-red-600 dark:text-red-500 uppercase">
                        {showCaptions ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {showCaptions && (
                      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                        {selectedStream.aiSummary.captions.map((caption, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500">[{caption.timestamp}]</span>
                            <p className="text-[11px] font-bold text-slate-900 dark:text-white mt-1">{caption.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-sm text-slate-500 dark:text-slate-400 border-t dark:border-slate-700 pt-4">
                  <p>{new Date(selectedStream.startTime).toLocaleString()} â€¢ {selectedStream.viewCount || 0} views</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING PiP WINDOW - PERSISTENT 
      {floatingPiP && (
        <div
          id="floating-pip"
          className="fixed z-[200] rounded-[20px] overflow-hidden shadow-2xl border-2 border-red-600 bg-black hover:shadow-red-600/50 transition-shadow"
          style={{
            left: `${pipPosition.x}px`,
            top: `${pipPosition.y}px`,
            width: `${pipSize.width}px`,
            height: `${pipSize.height}px`,
          }}
        >
          { Header - Draggable }
          <div
            onMouseDown={handlePiPDragStart}
            onTouchStart={handlePiPDragStart}
            className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none h-11 touch-none"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0" />
              <span className="text-white font-black text-[10px] uppercase tracking-widest truncate">{floatingPiP.title}</span>
            </div>
            <button
              onClick={closeFloatingPiP}
              className="p-1 hover:bg-red-800 rounded transition-all ml-2 flex-shrink-0"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          { Video Container }
          <div className="w-full bg-black" style={{ height: `${pipSize.height - 44}px` }}>
            {getEmbedUrl(floatingPiP) && (
              <iframe
                src={getEmbedUrl(floatingPiP)}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay"
                title={floatingPiP.title}
              />
            )}
          </div>

          { Resize Handle }
          <div
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            className="absolute bottom-0 right-0 w-6 h-6 bg-red-600 hover:bg-red-700 cursor-se-resize rounded-tl-xl transition-colors touch-none"
            title="Drag to resize"
          />
        </div>
      )} */}
    </div>
  );
};

export default LiveStreamPage;