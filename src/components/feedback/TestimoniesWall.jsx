'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Calendar, User, ArrowRight, Quote, Sparkles } from 'lucide-react';
import Card from '../common/Card';
import Loader from '../common/Loader';
import { getPublicTestimonies } from '@/lib/testimonies'; // ✅ Changed this import

const TestimoniesWall = () => {
  const [testimonies, setTestimonies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const fetchTestimonies = async () => {
  try {
    setIsLoading(true);
    console.log('🔍 Fetching testimonies...'); // Debug
    const data = await getPublicTestimonies();
    console.log('📦 Received data:', data); // Debug - check what you get
    
    if (data && data.length > 0) {
      console.log('✅ Setting testimonies:', data.slice(0, 6)); // Debug
      setTestimonies(data.slice(0, 6)); 
    } else {
      console.log('⚠️ No testimonies found or empty array'); // Debug
    }
  } catch (err) {
    console.error('❌ Error fetching testimonies:', err);
    setError('Failed to load testimonies');
  } finally {
    setIsLoading(false);
  }
};



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 140) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center py-20 bg-slate-50 rounded-[40px]">
      <Loader />
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Grace Logs</p>
    </div>
  );

  if (error || testimonies.length === 0) return null;

  return (
    <div className="py-12">
      {/* SECTION HEADER: BRUTALIST STYLE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
             <div className="h-[2px] w-12 bg-red-600" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 dark:text-red-600">Divine Reports</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
            Recent <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">Testimonies</span>
          </h2>
        </div>
        <p className="max-w-xs text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed border-l-2 border-slate-200 pl-4 uppercase tracking-tight">
          Real stories of transformation from the House of Transformation family.
        </p>
      </div>

      {/* GRID: HIGH DENSITY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonies.map((testimony) => (
          <Card key={testimony._id} className="group relative flex flex-col bg-white dark:bg-stone-800 border-2 border-slate-100 dark:border-slate-700 rounded-[10px] p-4 hover:border-slate-900 dark:hover:border-slate-50 transition-all hover:shadow-2xl hover:shadow-slate-200/50 h-full overflow-hidden">
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-1.5 bg-slate-900 dark:bg-stone-950 text-white dark:text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                  {testimony.feedbackData?.testimonyType || 'Grace Report'}
                </span>
                {testimony.feedbackData?.testimonyDate && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase">
                    <Calendar size={12} className="text-red-500" />
                    {formatDate(testimony.feedbackData.testimonyDate)}
                  </span>
                )}
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                {testimony.feedbackData?.title || 'Victory Report'}
              </h3>

              <div className="flex-grow">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8 italic">
                  "{truncateText(testimony.feedbackData?.story || '')}"
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 mt-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                       <User size={14} className="text-slate-400 dark:text-slate-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      {testimony.isAnonymous ? 'Restricted Identity' : (testimony.name || 'Anonymous')}
                    </span>
                  </div>
                  <Heart size={18} className="text-red-500 fill-red-500 animate-pulse" />
                </div>

                <Link
                  href={`/testimony/${testimony._id}`}
                  className="flex items-center justify-center gap-3 w-full bg-slate-50 group-hover:bg-slate-900 text-slate-900 group-hover:text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                >
                  Read full story <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* FOOTER ACTION */}
      {testimonies.length >= 6 && (
        <div className="flex flex-col items-center mt-20">
          <Link 
            href="/feedback"
            className="group relative flex items-center gap-4 bg-white dark:bg-slate-800 border-2 border-slate-900 px-12 py-6 rounded-full overflow-hidden transition-all hover:bg-slate-900"
          >
            <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white group-hover:text-white transition-colors">
              Access Full Archive
            </span>
            <ArrowRight size={20} className="relative z-10 text-red-600 transition-transform group-hover:translate-x-2" />
          </Link>
          <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Transformation Logs</p>
        </div>
      )}
    </div>
  );
};

export default TestimoniesWall;