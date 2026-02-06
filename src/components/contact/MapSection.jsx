"use client"

import React from 'react';
import { MapPin, Navigation, Phone, Mail, Clock } from 'lucide-react';
import { CHURCH_INFO } from '@/utils/constants';

// Fallback data if CHURCH_INFO isn't loaded yet
const info = CHURCH_INFO || {
  address: "Main Street, Busia Town, Busia County, Kenya",
  phone: "+254 700 000 000",
  email: "info@houseoftransformation.org",
  coordinates: { lat: 0.4608, lng: 34.1115 } // Approximate Busia coords
};

const MapSection = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Map Visual */}
      <div className="h-[300px] md:h-[400px] w-full relative rounded-[32px] overflow-hidden shadow-sm border border-stone-200">
        <iframe
          src={`https://maps.google.com/maps?q=${info.coordinates.lat},${info.coordinates.lng}&hl=es;z=14&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Church Location"
          className="opacity-90 hover:opacity-100 transition-opacity duration-500"
        />
        
        {/* Floating Action Button */}
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${info.coordinates.lat},${info.coordinates.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 bg-white text-slate-900 px-5 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-slate-900 hover:text-white transition-all text-sm"
        >
          <Navigation size={16} />
          Get Directions
        </a>
      </div>

      {/* Info Cards below Map */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm text-red-600">
            <MapPin size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-1">Visit Us</h4>
            <p className="text-slate-600 text-sm leading-relaxed">{info.address}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
            <Phone size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-1">Call Us</h4>
            <p className="text-slate-600 text-sm">{info.phone}</p>
            <p className="text-slate-400 text-xs mt-1">Tue - Sun, 8am - 6pm</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSection;