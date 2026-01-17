'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight, Users, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Card from '../common/Card';

const ServiceAreaCard = ({ name, description, imageUrl, teamCount, timeCommitment }) => {
  // --- Logic Preserved 100% ---
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');

  const fallbackImage = '/images/placeholder-service-area.jpg';

  return (
    <Card 
      className="group flex flex-col h-full bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:shadow-red-900/5 transition-all duration-500"
    >
      {/* Top Section: Visual Branding */}
      <div className="relative w-full h-64 overflow-hidden bg-slate-100 dark:bg-slate-700">
        {/* Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
        
        <Image
          src={imageUrl || fallbackImage}
          alt={`Service area: ${name}`}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={85}
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />

        {/* Floating Badge */}
        <div className="absolute top-6 left-6 z-20">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-[#8B1A1A]" /> Ministry Unit
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 flex flex-col flex-grow relative">
        {/* Title: Integrated with a subtle vertical line */}
        <div className="mb-4">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight group-hover:text-[#8B1A1A] transition-colors">
            {name}
          </h3>
        </div>

        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed mb-8 flex-grow">
          {description}
        </p>

        {/* Stats Grid: Modern & Minimal */}
        <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-slate-50 dark:border-slate-700">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#8B1A1A]">
              <Users size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Community</span>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{teamCount} Members</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#8B1A1A]">
              <Clock size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Time</span>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{timeCommitment}</span>
          </div>
        </div>

        {/* Action: Premium Button Style */}
        <Link
          href={`/service-areas/${slug}`}
          className="group/btn relative inline-flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-[#8B1A1A] dark:hover:bg-[#8B1A1A] transition-all duration-300 overflow-hidden"
          aria-label={`Learn more about ${name} service area`}
        >
          <span className="bg-white dark:bg-slate-800 relative z-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white group-hover/btn:text-white transition-colors">
            Explore Ministry
          </span>
          <div className="relative z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white group-hover/btn:rotate-[-45deg] transition-transform duration-500">
            <ChevronRight size={14} />
          </div>
        </Link>
      </div>
    </Card>
  );
};

export default ServiceAreaCard;