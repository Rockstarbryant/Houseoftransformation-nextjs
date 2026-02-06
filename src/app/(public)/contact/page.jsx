"use client"

import React from 'react';
import ContactForm from '@/components/contact/ContactForm'; // Assuming in same folder for this example
import MapSection from '@/components/contact/MapSection';
import { Calendar, Heart } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-900 text-slate-600 dark:text-slate-3001 font-sans selection:bg-red-100 selection:text-red-900 pb-20">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-white dark:bg-slate-900 border-b border-stone-100 pt-32 pb-16 md:pt-40 md:pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-red-50 text-red-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest mb-6">
            Contact Us
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-300 tracking-tight mb-6">
            We'd love to hear <br className="hidden md:block"/> from you.
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-300 leading-relaxed">
            Whether you are new to Busia, looking for a spiritual home, or need prayer, 
            The House of Transformation is here for you.
          </p>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 md:-mt-16">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: CONTACT FORM (7 cols) */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <ContactForm />
          </div>

          {/* RIGHT COLUMN: INFO & MAP (5 cols) */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
            
            {/* Service Times Card */}
            <div className="bg-slate-900 dark:bg-slate-500 text-white dark:text-slate-200 p-8 rounded-[32px] shadow-xl shadow-slate-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <Calendar size={120} />
              </div>
              <h3 className="text-xl font-bold mb-6 relative z-10">Service Times</h3>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg"><Calendar size={18} /></div>
                    <span className="font-medium">Sunday Service</span>
                  </div>
                  <span className="font-bold text-red-400">08:00 - 13:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg"><Heart size={18} /></div>
                    <span className="font-medium">Midweek Prayer</span>
                  </div>
                  <span className="font-bold text-red-400">Wed, 17:30</span>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <MapSection />

          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ContactPage;