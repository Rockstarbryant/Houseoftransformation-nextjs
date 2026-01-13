'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Calendar, User, Share2, Quote, Sparkles } from 'lucide-react';

export default function TestimonyDetailClient({ testimony, relatedTestimonies }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleShare = () => {
    const url = window.location.href;
    const title = testimony?.feedbackData?.title || 'Victory Report';
    if (navigator.share) {
      navigator.share({ title, text: 'Check out this victory report!', url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Transmission Link Copied!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      {/* GLOBAL TOP NAV - 100% PRESERVED */}
      <div className="bg-white border-b border-slate-200 py-6 px-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push('/feedback')} 
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={14} /> Back to Archives
          </button>
          <div className="flex gap-4">
            <button 
              onClick={handleShare} 
              className="p-3 bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
            >
              <Share2 size={18}/>
            </button>
            <button 
              onClick={() => setLiked(!liked)} 
              className={`p-3 rounded-xl transition-all ${liked ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-red-600'}`}
            >
              <Heart size={18} className={liked ? 'fill-current' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12">
        {/* HERO SECTION - 100% PRESERVED */}
        <div className="relative bg-slate-900 rounded-[48px] p-10 md:p-16 overflow-hidden mb-12 shadow-2xl shadow-slate-900/20">
          <Quote className="absolute -right-10 -bottom-10 text-white/5 rotate-12" size={300} />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full mb-8">
              <Sparkles size={10} /> {testimony.feedbackData?.testimonyType || 'Grace Report'}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8">
              {testimony.feedbackData?.title || 'Victory Report'}
            </h1>

            <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Source</span>
                <span className="text-white font-black uppercase tracking-tight flex items-center gap-2">
                  <User size={14} className="text-red-500"/> 
                  {testimony.isAnonymous ? 'Restricted' : (testimony.name || 'Community Member')}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Logged Date</span>
                <span className="text-white font-black uppercase tracking-tight flex items-center gap-2">
                  <Calendar size={14} className="text-red-500"/> 
                  {testimony.feedbackData?.testimonyDate ? formatDate(testimony.feedbackData.testimonyDate) : 'Archive Date'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STORY BODY - 100% PRESERVED */}
        <div className="bg-white border-2 border-slate-100 rounded-[48px] p-8 md:p-16 mb-12 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-medium mb-12 first-letter:text-6xl first-letter:font-black first-letter:text-red-600 first-letter:mr-3 first-letter:float-left">
              {testimony.feedbackData?.story || 'Report content not initialized.'}
            </p>

            {/* DYNAMIC DATA PODS - 100% PRESERVED */}
            <div className="space-y-4">
              {Object.entries(testimony.feedbackData || {}).map(([key, value]) => {
                if (!value || typeof value === 'object' || ['title', 'story', 'testimonyType', 'testimonyDate'].includes(key)) return null;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-slate-900 transition-colors">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-red-600 transition-colors">
                      {label}
                    </p>
                    <p className="text-slate-900 font-bold leading-relaxed">{String(value)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RELATED STORIES POD - 100% PRESERVED */}
        {relatedTestimonies.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
                Explore <span className="text-red-600">Others</span>
              </h2>
              <div className="h-[2px] flex-1 bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedTestimonies.map((related) => (
                <Link 
                  key={related._id} 
                  href={`/testimony/${related._id}`} 
                  className="group bg-white p-6 rounded-[32px] border-2 border-slate-100 hover:border-slate-900 transition-all"
                >
                  <span className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-3 block">
                    Archive Ref: {related._id.slice(-6)}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter group-hover:text-red-600 transition-colors line-clamp-2 mb-4 leading-tight">
                    {related.feedbackData?.title || 'Victory Report'}
                  </h3>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                    <span>Read Report</span>
                    <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={14} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}