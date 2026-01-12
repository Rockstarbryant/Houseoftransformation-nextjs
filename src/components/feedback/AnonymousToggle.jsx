'use client';

import React from 'react';
import { Shield, ShieldOff, Eye, EyeOff, CheckCircle2, Info } from 'lucide-react';

const AnonymousToggle = ({ isAnonymous, onToggle, user }) => {
  return (
    <div 
      className={`rounded-[32px] p-8 border-2 transition-all duration-500 overflow-hidden relative ${
        isAnonymous 
          ? 'bg-slate-900 border-slate-900 shadow-2xl scale-[1.02]' 
          : 'bg-white border-slate-100 shadow-sm'
      }`}
    >
      {/* Background Decorative Icon */}
      <div className={`absolute -right-6 -bottom-6 transition-opacity duration-500 ${isAnonymous ? 'opacity-10' : 'opacity-0'}`}>
        <Shield size={180} color="white" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isAnonymous ? 'bg-[#8B1A1A] rotate-[10deg]' : 'bg-slate-100 rotate-0'
          }`}>
            {isAnonymous ? (
              <ShieldOff className="text-white" size={32} strokeWidth={2.5} />
            ) : (
              <Shield className="text-slate-400" size={32} strokeWidth={2.5} />
            )}
          </div>

          <div>
            <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-1 ${
              isAnonymous ? 'text-[#8B1A1A]' : 'text-slate-400'
            }`}>
              Submission Mode
            </h3>
            <p className={`text-2xl font-black uppercase tracking-tighter ${
              isAnonymous ? 'text-white' : 'text-slate-900'
            }`}>
              {isAnonymous ? 'Identity Hidden' : 'Public Profile'}
            </p>
          </div>
        </div>

        {/* Tactile Switch */}
        <button
          onClick={() => onToggle(!isAnonymous)}
          className={`group relative h-12 w-24 rounded-full transition-all duration-500 outline-none p-1 ${
            isAnonymous ? 'bg-[#8B1A1A]' : 'bg-slate-200'
          }`}
          role="switch"
          aria-checked={isAnonymous}
        >
          <div className={`h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-500 transform ${
            isAnonymous ? 'translate-x-12' : 'translate-x-0'
          }`}>
            {isAnonymous ? (
              <EyeOff className="text-[#8B1A1A]" size={20} strokeWidth={3} />
            ) : (
              <Eye className="text-slate-400" size={20} strokeWidth={3} />
            )}
          </div>
        </button>
      </div>

      {/* Narrative Section */}
      <div className={`mt-8 pt-8 border-t transition-colors duration-500 ${
        isAnonymous ? 'border-white/10' : 'border-slate-100'
      }`}>
        {isAnonymous ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">
              Anonymous mode is active. Your data will be encrypted and stripped of personal identifiers before reaching our team.
            </p>
            <div className="flex flex-wrap gap-4">
              {['No data tracking', 'Private processing', 'Secured IP'].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                  <CheckCircle2 size={14} className="text-[#8B1A1A]" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
            <Info className="text-slate-900 mt-1" size={18} />
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Submitting as <span className="text-slate-900">{user?.name || 'Guest'}</span>. 
              This allows us to reach out via email for updates or follow-up conversations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnonymousToggle;