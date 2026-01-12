"use client"

import React from 'react';
import { MapPin, Phone, Mail, Navigation2, Globe, Compass } from 'lucide-react';
import Card from '../common/Card';
import { CHURCH_INFO } from '@/utils/constants';

const MapSection = () => {
  return (
    <div className="space-y-8">
      {/* COORDINATES CARD: HQ STYLE */}
      <Card className="relative overflow-hidden bg-white border-2 border-slate-900 rounded-[40px] p-8 md:p-10 shadow-xl shadow-slate-200/50">
        {/* WATERMARK ICON */}
        <Compass className="absolute -right-8 -bottom-8 text-slate-50 rotate-12" size={200} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Physical Coordinates</span>
          </div>

          <div className="grid gap-8">
            {/* ADDRESS NODE */}
            <div className="group flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors">
                <MapPin className="text-white" size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Address</p>
                <p className="text-sm font-black text-slate-900 uppercase leading-tight tracking-tight">
                  {CHURCH_INFO.address}
                </p>
              </div>
            </div>

            {/* PHONE NODE */}
            <div className="group flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 transition-all border-2 border-slate-100 group-hover:border-slate-900">
                <Phone className="text-slate-900 group-hover:text-white transition-colors" size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Voice Line</p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  {CHURCH_INFO.phone}
                </p>
              </div>
            </div>

            {/* EMAIL NODE */}
            <div className="group flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 transition-all border-2 border-slate-100 group-hover:border-slate-900">
                <Mail className="text-slate-900 group-hover:text-white transition-colors" size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Digital Protocol</p>
                <p className="text-sm font-black text-slate-900 italic underline tracking-tight">
                  {CHURCH_INFO.email}
                </p>
              </div>
            </div>
          </div>

          {/* QUICK ACTION BUTTON */}
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${CHURCH_INFO.coordinates.lat},${CHURCH_INFO.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 w-full bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all border-2 border-slate-100 hover:border-slate-900"
          >
            Open Navigation <Navigation2 size={14} className="fill-current" />
          </a>
        </div>
      </Card>
      
      {/* MAP VIEWPORT */}
      <div className="group relative bg-slate-900 rounded-[48px] p-2 overflow-hidden shadow-2xl transition-all hover:shadow-red-900/10 h-[450px]">
        {/* INDUSTRIAL CORNER ACCENTS */}
        <div className="absolute top-6 left-6 z-10 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>

        <div className="w-full h-full rounded-[40px] overflow-hidden grayscale contrast-125 hover:grayscale-0 transition-all duration-700">
          <iframe
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.16244012423!2d${CHURCH_INFO.coordinates.lng}!3d${CHURCH_INFO.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBusia%2C%20Kenya!5e0!3m2!1sen!2sus!4v1234567890`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="HQ Strategy Map"
          />
        </div>

        {/* FLOATING COORDINATE TAG */}
        <div className="absolute bottom-8 right-8 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <p className="text-[8px] font-black text-white uppercase tracking-[0.2em]">
                LOC: {CHURCH_INFO.coordinates.lat}, {CHURCH_INFO.coordinates.lng}
            </p>
        </div>
      </div>
    </div>
  );
};

export default MapSection;