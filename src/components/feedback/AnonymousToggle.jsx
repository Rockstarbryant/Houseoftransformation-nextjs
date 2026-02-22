'use client';

import React from 'react';
import { Shield, ShieldOff, Eye, EyeOff, CheckCircle2, Info } from 'lucide-react';

const AnonymousToggle = ({ isAnonymous, onToggle, user }) => {
  return (
    <div className={`rounded-2xl mt-6 border transition-colors duration-300 ${
      isAnonymous
        ? 'bg-slate-900 border-slate-700'
        : 'bg-red-900 dark:bg-red-800 border-slate-200 dark:border-slate-700'
    }`}>

      {/* ── Single compact row ── */}
      <div className="flex items-center gap-3 px-4 py-3.5">

        {/* Icon */}
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300 ${
          isAnonymous ? 'bg-[#8B1A1A]' : 'bg-slate-700 dark:bg-slate-700'
        }`}>
          {isAnonymous
            ? <ShieldOff size={17} className="text-white" strokeWidth={2.5} />
            : <Shield    size={17} className="text-slate-200 dark:text-slate-100" strokeWidth={2.5} />
          }
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className={`text-[9px] font-black uppercase tracking-[0.25em] leading-none mb-0.5 ${
            isAnonymous ? 'text-[#8B1A1A]' : 'text-slate-100 dark:text-slate-100'
          }`}>
            Submitting as
          </p>
          <p className={`text-[13px] mt-2 font-black uppercase tracking-tight leading-none truncate ${
            isAnonymous ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}>
            {isAnonymous ? 'Anonymous' : (user?.name || 'Guest')}
          </p>
        </div>

        {/* Switch */}
        <button
          onClick={() => onToggle(!isAnonymous)}
          role="switch"
          aria-checked={isAnonymous}
          aria-label="Toggle anonymous mode"
          className={`shrink-0 relative flex items-center rounded-full p-1 w-16 h-9 transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#8B1A1A]/50 ${
            isAnonymous ? 'bg-[#8B1A1A]' : 'bg-slate-200 dark:bg-slate-600'
          }`}
        >
          <div className={`w-7 h-7 rounded-full bg-white flex items-center justify-center transition-transform duration-300 ${
            isAnonymous ? 'translate-x-7' : 'translate-x-0'
          }`}>
            {isAnonymous
              ? <EyeOff size={13} className="text-[#8B1A1A]" strokeWidth={2.5} />
              : <Eye    size={13} className="text-slate-400"  strokeWidth={2.5} />
            }
          </div>
        </button>
      </div>

      {/* ── Context strip ── */}
      <div className={`px-4 pb-3.5 transition-colors duration-300`}>
        {isAnonymous ? (
          <div className="flex flex-wrap items-center gap-2 animate-in fade-in duration-300">
            {['No personal data stored', 'Fully private'].map((benefit) => (
              <div key={benefit} className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                <CheckCircle2 size={10} className="text-[#8B1A1A] shrink-0" />
                <span className="text-[8.5px] font-black text-white/60 uppercase tracking-widest whitespace-nowrap">{benefit}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 animate-in fade-in duration-300">
            <Info size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
            <p className="text-[9.5px] font-bold text-slate-100 dark:text-slate-100 uppercase tracking-wider leading-relaxed">
              We may reach out to follow up on your feedback or prayer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnonymousToggle;