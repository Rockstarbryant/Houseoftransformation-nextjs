'use client';

import React, { useState } from 'react';
import { Play, X, Sparkles, MoveRight, Calendar } from 'lucide-react';
import Button from '../common/Button';

const HeroSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const youtubeEmbedUrl = "https://www.youtube.com/embed/peKWWYI70wI?si=4_lY8fmBlagW4x4";

  const churchImages = [
    {
      url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767444965/WhatsApp_Image_2026-01-03_at_15.54.45_mpogon.jpg',
      alt: 'Church worship'
    },
    {
      url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1768913903/church-gallery/tql6mjtmman1gxlzl91e.jpg',
      alt: 'Church community'
    },
    {
      url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1768895135/church-gallery/jy2zygpn8zqqddq7aqjv.jpg',
      alt: 'Church fellowship'
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-slate-950">
      {/* Background Image - CRITICAL: loads immediately */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
        style={{ backgroundImage: `url('${churchImages[0].url}')` }}
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

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
              H.O.T
              <span className="block text-red-800 drop-shadow-sm">Transforming.</span>
              <span className="text-red-800 font-semibold font-serif font-light tracking-normal">Lives.</span>
            </h1>

            <p className="max-w-lg text-lg md:text-xl text-slate-300 font-medium leading-relaxed mb-8 border-l-2 border-[#8B1A1A] pl-6">
              Touching and transforming lives through the anointed gospel of Jesus Christ. Join a community built on love and power.
            </p>

            <div className="flex items-center gap-4 mb-12 text-slate-400">
              <div className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Calendar size={18} className="text-[#8B1A1A]" />
              </div>
              <p className="text-xs md:text-sm font-bold uppercase tracking-widest">
                Sunday Services: <span className="text-white">9:00AM - 12:00PM</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                icon={Play}
                onClick={() => setIsModalOpen(true)}
                className="bg-[#8B1A1A] hover:bg-white hover:text-slate-900 border-none px-8 py-6 rounded-2xl shadow-2xl shadow-red-900/20 group transition-all"
              >
                <span className="font-black uppercase text-xs tracking-widest">Watch Service</span>
              </Button>

              <button className="flex items-center justify-center gap-3 px-8 py-6 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all group backdrop-blur-sm">
                <span className="font-black uppercase text-xs tracking-widest text-white">New Here?</span>
                <MoveRight size={18} className="text-[#8B1A1A] group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          {/* ========== RIGHT: CINEMATIC COLLAGE ========== */}
          <div className="relative lg:h-[600px] flex items-center justify-center lg:justify-end">
            {/* Main Center Frame */}
            <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl z-20 group">
              <img
                src={churchImages[0].url}
                alt={churchImages[0].alt}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            </div>

            {/* Top Floating Frame - LAZY LOAD */}
            <div className="absolute -top-10 -right-4 md:right-10 w-48 md:w-64 aspect-video rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl z-30 hidden sm:block animate-bounce-slow">
              <img
                src={churchImages[1].url}
                alt={churchImages[1].alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Bottom Floating Frame - LAZY LOAD */}
            <div className="absolute -bottom-10 -left-4 md:-left-10 w-48 md:w-72 aspect-video rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl z-30 hidden lg:block">
              <img
                src={churchImages[2].url}
                alt={churchImages[2].alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl px-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl shadow-[0_0_100px_rgba(139,26,26,0.3)]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-16 right-0 text-white/50 hover:text-white transition-all bg-white/5 p-3 rounded-full hover:rotate-90"
            >
              <X size={32} />
            </button>

            <div className="relative pt-[56.25%] bg-black rounded-[2rem] overflow-hidden border border-white/10">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`${youtubeEmbedUrl}&autoplay=1`}
                title="Live Stream"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;