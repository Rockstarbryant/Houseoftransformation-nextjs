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
      url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1768913903/church-gallery/tql6mjtmman1gxlzl91e.jpg',
      alt: 'The vibrant Christian community gathering in Busia County'
    },
    {
      url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1768895135/church-gallery/jy2zygpn8zqqddq7aqjv.jpg',
      alt: 'Church fellowship and ministry at H.O.T Busia'
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-slate-950">
      {/* Background Image - CRITICAL: loads immediately */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 scale-105"
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

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-red-600 mb-8 leading-[0.9] tracking-tighter">
              <span className="sr-only">House of Transformation Busia</span>
              H.O.T
              <span className="block text-blue-500 drop-shadow-sm">Transforming.</span>
              <span className="block text-blue-500">Lives.</span>
            </h1>
            <p className="max-w-lg text-lg md:text-xl text-slate-200 font-medium leading-relaxed mb-8 border-l-2 border-[#8B1A1A] pl-6">
              Touching and transforming lives through the anointed gospel of Jesus Christ. Join a community built on love and power.
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
          <div className="relative lg:h-[600px] flex items-center justify-center lg:justify-end">
            {/* Main Center Frame */}
            <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl z-20 group">
              <Image
                src={churchImages[0].url}
                alt={churchImages[0].alt}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                priority   // ← replaces loading="eager" – good for LCP hero image
                sizes="(max-width: 768px) 100vw, 450px" // optional but improves performance
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            </div>

            {/* Top Floating Frame - LAZY LOAD */}
            <div className="absolute -top-10 -right-4 md:right-10 w-48 md:w-64 aspect-video rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl z-30 hidden sm:block animate-bounce-slow">
              <Image
                src={churchImages[1].url}
                alt={churchImages[1].alt}
                fill
                className="object-cover"
                sizes="256px" // roughly matches rendered size
              />
            </div>

            {/* Bottom Floating Frame - LAZY LOAD */}
           <div className="absolute -bottom-10 -left-4 md:-left-10 w-48 md:w-72 aspect-video rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl z-30 hidden lg:block">
              <Image
                src={churchImages[2].url}
                alt={churchImages[2].alt}
                fill
                className="object-cover"
                sizes="288px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= NEW HERE MODAL ================= */}
      {isNewHereOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsNewHereOpen(false)} />
          
          {/* Modal Card */}
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                    WE'VE BEEN <span className="text-[#8B1A1A]">EXPECTING</span> YOU.
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Everything you need to know to get started.</p>
                </div>
                <button onClick={() => setIsNewHereOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                {welcomeSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-[#8B1A1A]/30 transition-colors">
                    <div className="shrink-0 mt-1">{step.icon}</div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{step.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3">
                <Link href="/about" className="w-full">
                  <Button className="w-full py-4 rounded-xl bg-[#8B1A1A] text-white font-bold">
                    Learn More About Our Vision
                  </Button>
                </Link>
                <button 
                  onClick={() => setIsNewHereOpen(false)}
                  className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-[#8B1A1A] transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;