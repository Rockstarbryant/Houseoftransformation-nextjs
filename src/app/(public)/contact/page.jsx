"use client"

import React from 'react';
import ContactForm from '@/components/contact/ContactForm';
import MapSection from '@/components/contact/MapSection';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Zap } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="pt-24 pb-24 bg-[#F8FAFC] min-h-screen font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER: COMMAND CENTER STYLE */}
        <div className="relative mb-20">
          <div className="absolute -left-10 top-0 w-1 h-32 bg-red-600 hidden md:block" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em]">Communication Hub</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                </div>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 uppercase tracking-tighter leading-[0.85] mb-6">
                Connect <br /> <span className="text-red-600">With HQ</span>
              </h1>
              <p className="text-slate-500 font-bold text-lg uppercase tracking-tight">
                Direct Uplink to the House of Transformation. 
                <span className="text-slate-900 block md:inline"> We're standing by for your transmission.</span>
              </p>
            </div>

            {/* QUICK STATS / INFO PODS */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="p-6 bg-white border-2 border-slate-100 rounded-[32px] shadow-sm">
                <Clock className="text-red-600 mb-2" size={20} />
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active Hours</p>
                <p className="text-xs font-black text-slate-900 uppercase">Sun: 08:00 - 13:00</p>
              </div>
              <div className="p-6 bg-slate-900 rounded-[32px] shadow-xl shadow-slate-200">
                <ShieldCheck className="text-emerald-500 mb-2" size={20} />
                <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Encryption</p>
                <p className="text-xs font-black text-white uppercase">End-to-End Secure</p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN INTERFACE GRID */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: THE UPLINK FORM (7 COLS) */}
          <div className="lg:col-span-7 bg-white rounded-[48px] border-2 border-slate-100 p-8 md:p-12 shadow-sm relative overflow-hidden group hover:border-slate-900 transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap size={120} className="text-slate-900" />
            </div>
            <div className="relative z-10">
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Initialize Transmission</h2>
                <div className="h-1 w-20 bg-red-600" />
              </div>
              <ContactForm />
            </div>
          </div>

          {/* RIGHT: THE COORDINATES (5 COLS) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* PHYSICAL COORDINATES */}
            

            {/* MAP SECTION POD */}
            <div className="rounded-[24px] overflow-hidden border-2 border-slate-100 shadow-sm hover:border-slate-900 transition-all h-[850px]">
              <MapSection />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;