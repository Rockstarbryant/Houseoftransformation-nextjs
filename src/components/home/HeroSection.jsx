'use client';

import React, { useState } from 'react';
import { Play, X, Sparkles, MoveRight, Calendar } from 'lucide-react';
import Button from '../common/Button';
import Link from 'next/link';
import Image from 'next/image';

const HeroSection = () => {
  const [isNewHereOpen, setIsNewHereOpen] = useState(false); 

const welcomeSteps = [
  {
    title: "Welcome Home",
    desc: "We are so glad you're here. House of Transformation is a community dedicated to your growth.",
    icon: <Sparkles className="text-red-500" size={24} />
  },
  {
    title: "Join a Service",
    desc: "We meet every Sunday at 9:00 AM & 11:00 AM at our Busia Main Campus.",
    icon: <Calendar className="text-blue-500" size={24} />
  },
  {
    title: "Get Connected",
    desc: "Whether you want to join a department or a life group, there's a place for you.",
    icon: <MoveRight className="text-[#8B1A1A]" size={24} />
  }
];

  const churchImages = [
    {
      url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767444965/WhatsApp_Image_2026-01-03_at_15.54.45_mpogon.jpg',
      alt: 'Praise and worship service at House of Transformation Church Busia'
    },
    {
      url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1770703875/church-gallery/castwqxhl9wzg97y6mz0.jpg',
      alt: 'The vibrant Christian community gathering in Busia County'
    },
    {
      url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1770703781/church-gallery/bhj152bvdgxhtlpjj6en.jpg',
      alt: 'Church fellowship and ministry at H.O.T Busia'
    },
    {
      url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1770702213/church-gallery/pln6fcqe7jhcfsvugtzw.jpg',
      alt: 'Bishop Aloys Rutivi'
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-slate-950">
      {/* Background Image - CRITICAL: loads immediately */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 scale-105"
        style={{ backgroundImage: `url('${churchImages[0].url}')` }}
        role="img"
        aria-label="House of Transformation Church building and worship atmosphere"
      />
      <div className="absolute inset-0 bg-white/5" />
      
      {/* Animated accent glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#8B1A1A]/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* ========== LEFT: EDITORIAL CONTENT ========== */}
          <div className="text-white">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-16 animate-in fade-in slide-in-from-left-4 duration-700">
              <Sparkles size={14} className="text-[#8B1A1A]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/90">Welcome to House of Transformation</span>
            </div>

            <h1 className="text-4xl md:text-7xl lg:text-7xl font-black mb-8 tracking-tighter select-none">
              <span className="sr-only">House of Transformation Busia</span>

              {/* Line 1: H.O.T */}
              <div className="overflow-hidden pb-2 -mb-2 md:-mb-4">
                <span className="block animate-reveal-1 origin-bottom">
                  <span className="bg-gradient-to-r from-red-900 via-blue-700 to-slate-400 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer-infinite">
                    BUSIA H.O.T
                  </span>
                </span>
              </div>

              {/* Line 2: Transforming. - FIXED: removed overflow-hidden completely */}
              <div className="pb-2 -mb-2 md:-mb-3">
                <span className="block animate-reveal-2 origin-bottom">
                  <span className="bg-gradient-to-r from-blue-500 via-red-300 to-slate-500 bg-[length:150%_100%] bg-clip-text text-transparent animate-shimmer-infinite">
                    TRANSFORMING.
                  </span>
                </span>
              </div>

              {/* Line 3: Lives. */}
              <div className="overflow-hidden pb-4">
                <span className="block animate-reveal-3 origin-bottom">
                  <span className="bg-gradient-to-r from-slate-200 via-red-600 to-blue-500 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer-infinite">
                    LIVES.
                  </span>
                </span>
              </div>
            </h1>
            <p className="max-w-lg text-lg md:text-xl text-slate-100 font-medium leading-relaxed mb-8 border-l-2 border-[#8B1A1A] pl-6 opacity-0 animate-fade-subtext">
              Touching and transforming lives through the anointed gospel of Jesus Christ. 
              Join a community built on love and power.
            </p>

            <div className="flex items-center gap-4 mb-12 text-slate-300">
              <div className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Calendar size={18} className="text-[#8B1A1A]" />
              </div>
              <p className="text-xs md:text-sm font-bold uppercase tracking-widest">
                Sunday Services: <span className="text-white">9:00AM - 12:00PM</span>
              </p>
            </div>

            <div className="flex flex-row gap-3 w-full">
            {/* Watch Live button */}
            <Link href="/livestream" className="flex-2">
              <Button 
                variant="primary" 
                className="w-full bg-[#8B1A1A] hover:bg-[#6B1515] text-white px-4 py-4 rounded-full flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <div className="relative flex items-center justify-center">
                  <Play size={20} fill="currentColor" />
                  <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-20"></span>
                </div>
                <span className="font-bold text-xs sm:text-sm uppercase tracking-widest">Watch Live</span>
              </Button>
            </Link>

            {/* New Here button */}
            <Button 
              variant="secondary" 
              className="flex-1 border-white/20 text-white hover:bg-white/10 px-4 py-4 rounded-full text-xs sm:text-sm"
              onClick={() => setIsNewHereOpen(true)}
            >
              New Here?
            </Button>
          </div>
          </div>

          {/* ========== RIGHT: CINEMATIC COLLAGE ========== */}
          <div className="relative lg:h-[650px] flex items-center justify-center lg:justify-end">
            {/* Main Center Frame */}
            <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-[1rem] overflow-hidden border-4 border-white/10 shadow-2xl z-20 group">
              <Image
                src={churchImages[3].url}
                alt={churchImages[3].alt}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                priority   // ← replaces loading="eager" – good for LCP hero image
                sizes="(max-width: 768px) 100vw, 450px" // optional but improves performance
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            </div>

            {/* Top Floating Frame - visible on all screens */}
            <div className="absolute -top-6 -right-2 w-32 h-20 md:-top-10 md:-right-6 md:right-10 md:w-48 md:h-28 lg:w-72 lg:h-40 rounded-lg md:rounded-xl overflow-hidden border-2 border-slate-900 shadow-2xl z-30 animate-bounce-slow">
              <Image
                src={churchImages[1].url}
                alt={churchImages[1].alt}
                fill
                className="object-cover object-[center_30%]"
                sizes="(max-width: 640px) 128px, (max-width: 768px) 192px, 288px"
              />
            </div>

            {/* Bottom Floating Frame - visible on all screens */}
            <div className="absolute -bottom-6 -left-2 w-32 h-20 md:-bottom-10 md:-left-6 lg:-left-10 md:w-48 md:h-28 lg:w-72 lg:h-40 rounded-lg md:rounded-xl overflow-hidden border-2 border-slate-900 shadow-2xl z-30 animate-bounce-slow">
              <Image
                src={churchImages[2].url}
                alt={churchImages[2].alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 128px, (max-width: 768px) 192px, 288px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= NEW HERE MODAL (REDESIGNED) ================= */}
      {isNewHereOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4">
          
          {/* 1. Backdrop */}
          {/* Added nicer blur and darker fade for focus */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsNewHereOpen(false)} 
          />

          {/* 2. Modal Card */}
          {/* Mobile: Rounded top only, sits at bottom. Desktop: Rounded all, centered. */}
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row max-h-[85vh] sm:max-h-[600px] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            
            {/* Close Button - Floated top right */}
            <button 
              onClick={() => setIsNewHereOpen(false)} 
              className="absolute top-4 right-4 z-20 p-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md rounded-full text-slate-500 dark:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>

            {/* 3. Visual Side (Top on Mobile / Left on Desktop) */}
            <div className="relative w-full mb-4 sm:w-2/5 h-32 sm:h-auto shrink-0 bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop" 
                alt="Community" 
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay for text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/5" />
            </div>

            {/* 4. Content Side */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10">
              <div className="flex flex-col h-full justify-center space-y-6">
                
                {/* Header */}
                <div>
                  <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Welcome <span className="text-[#8B1A1A]">Home.</span>
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
                    We are so glad you're here. Whether you are looking for a new community or just visiting, we'd love to connect.
                  </p>
                </div>

                {/* Simplified Steps - Stacked vertically */}
                <div className="space-y-4">
                  {/* Replace with your specific icons/steps if needed */}
                  <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group cursor-default">
                     <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-[#8B1A1A] group-hover:scale-110 transition-transform">
                        {/* Icon placeholder - swap for your actual step icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-900 dark:text-white text-sm">Join the Family</h4>
                       <p className="text-xs text-slate-500">Find your place in our community.</p>
                     </div>
                  </div>

                   <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group cursor-default">
                     <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-[#8B1A1A] group-hover:scale-110 transition-transform">
                        {/* Icon placeholder */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-900 dark:text-white text-sm">Plan a Visit</h4>
                       <p className="text-xs text-slate-500">Service times and directions.</p>
                     </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <Link href="/about" className="flex-1">
                    <button className="w-full py-3 px-6 rounded-xl bg-[#8B1A1A] hover:bg-[#701515] text-white font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95">
                      I'm New Here
                    </button>
                  </Link>
                  <button 
                    onClick={() => setIsNewHereOpen(false)}
                    className="py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                  >
                    Just Browsing
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;