"use client"

import React, { useState } from 'react';
import { User, Mail, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Input from '../common/Input';

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate HQ Onboarding
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    setJoined(true);
  };

  if (joined) {
    return (
      <div className="bg-slate-900 rounded-[40px] p-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-900/20">
          <Sparkles className="text-white" size={32} />
        </div>
        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Welcome to HQ</h3>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-8">Onboarding Sequence Initiated</p>
        <p className="text-white/70 text-sm leading-relaxed mb-8">Check your digital mail. We've sent your first steps to transformation.</p>
        <button 
          onClick={() => setJoined(false)}
          className="text-white/40 hover:text-white text-[10px] font-black uppercase underline tracking-widest transition-colors"
        >
          Reset Transmission
        </button>
      </div>
    );
  }

  return (
    <div className="relative bg-white border-2 border-slate-900 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200">
      {/* DECORATIVE BADGE */}
      <div className="absolute -top-4 -right-4 bg-red-600 text-white p-4 rounded-2xl rotate-12 shadow-lg">
        <Zap size={24} fill="white" />
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-[2px] w-8 bg-red-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">New Member Entry</span>
        </div>
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">
          Start Your <br /> <span className="text-red-600 italic">Journey</span>
        </h2>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-tight">
          Join the community and receive weekly <br /> transformation blueprints.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <Input 
            name="name" 
            placeholder="Full Name" 
            icon={User} 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
          />
          <Input 
            name="email" 
            type="email" 
            placeholder="Digital Mail (Email)" 
            icon={Mail} 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-slate-900 hover:bg-red-600 text-white rounded-2xl py-6 font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-slate-300 shadow-xl shadow-slate-200"
        >
          {submitting ? 'Connecting...' : 'Join the Movement'}
          <ArrowRight size={16} className={submitting ? 'hidden' : 'block'} />
        </button>

        <div className="flex items-center justify-center gap-2 pt-4">
          <ShieldCheck size={14} className="text-emerald-500" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
            Privacy Protected // Secure Entry
          </p>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;