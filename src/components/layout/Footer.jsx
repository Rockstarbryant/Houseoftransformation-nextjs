'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Youtube, Instagram, Mail, Phone, MapPin, Heart, ArrowRight } from 'lucide-react';
import { CHURCH_INFO, SERVICE_TIMES, SOCIAL_LINKS } from '@/utils/constants';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribeSuccess(true);
      setEmail('');
      setTimeout(() => setSubscribeSuccess(false), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-200 border-t-8 border-[#8B1A1A]">
      {/* 1. TOP BAR: Contact Grid (Sharp) */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div className="p-8 flex items-center gap-6 group hover:bg-slate-900 transition-colors">
            <Phone className="text-[#8B1A1A]" size={24} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Inquiries</p>
              <a href={`tel:${CHURCH_INFO.phone}`} className="text-sm font-bold text-white hover:text-[#8B1A1A] transition-colors uppercase tracking-tighter">
                {CHURCH_INFO.phone}
              </a>
            </div>
          </div>
          <div className="p-8 flex items-center gap-6 group hover:bg-slate-900 transition-colors">
            <Mail className="text-[#8B1A1A]" size={24} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Correspondence</p>
              <a href={`mailto:${CHURCH_INFO.email}`} className="text-sm font-bold text-white hover:text-[#8B1A1A] transition-colors uppercase tracking-tighter">
                {CHURCH_INFO.email}
              </a>
            </div>
          </div>
          <div className="p-8 flex items-center gap-6 group hover:bg-slate-900 transition-colors">
            <MapPin className="text-[#8B1A1A]" size={24} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Visit Us</p>
              <p className="text-sm font-bold text-white uppercase tracking-tighter">
                {CHURCH_INFO.address || CHURCH_INFO.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                {CHURCH_INFO.name} <br /> <span className="text-[#8B1A1A]">Ministry.</span>
              </h3>
              <div className="w-12 h-1 bg-[#8B1A1A]" />
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs uppercase tracking-wider">
              Transforming lives through God's love and the message of Jesus Christ in {CHURCH_INFO.location}.
            </p>
            <div className="flex gap-2">
              {[
                { icon: Facebook, href: SOCIAL_LINKS.facebook },
                { icon: Youtube, href: SOCIAL_LINKS.youtube },
                { icon: Instagram, href: SOCIAL_LINKS.instagram }
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href} 
                  target="_blank" 
                  className="size-10 border border-slate-800 flex items-center justify-center hover:bg-[#8B1A1A] hover:border-[#8B1A1A] transition-all"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links and Times Group */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-8">Navigation</h4>
              <ul className="space-y-4 text-slate-500 text-[11px] font-black uppercase tracking-widest">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/sermons" className="hover:text-white transition-colors">Sermons</Link></li>
                <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
                <li><Link href="/volunteer" className="hover:text-white transition-colors">Volunteer</Link></li>
                <li><Link href="/donate" className="hover:text-white transition-colors">Giving</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-8">Services</h4>
              <ul className="space-y-6 text-[11px] font-black uppercase tracking-widest">
                <li>
                  <p className="text-[#8B1A1A] mb-1">Sunday Worship</p>
                  <p className="text-slate-400">{SERVICE_TIMES.sunday.time}</p>
                </li>
                <li>
                  <p className="text-[#8B1A1A] mb-1">Midweek Growth</p>
                  <p className="text-slate-400">{SERVICE_TIMES.wednesday?.time || 'Wednesdays'}</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Newsletter</h4>
            <form onSubmit={handleSubscribe} className="space-y-0">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full px-6 py-5 bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#8B1A1A] transition-colors font-black text-[10px] tracking-widest"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-6 bg-[#8B1A1A] text-white hover:bg-white hover:text-slate-950 transition-all flex items-center justify-center"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
              {subscribeSuccess && (
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-4">
                  Confirmed. Welcome to the mission.
                </p>
              )}
            </form>
            <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.2em] leading-loose">
              By subscribing, you agree to receive spiritual resources and event updates.
            </p>
          </div>
        </div>
      </div>

      {/* 3. FINAL BAR */}
      <div className="border-t border-slate-900 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            &copy; {currentYear} {CHURCH_INFO.name}. BUILDING A LEGACY OF FAITH.
          </p>
          <div className="flex items-center gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span className="flex items-center gap-2 text-white">
              Built with <Heart size={12} className="text-[#8B1A1A] fill-[#8B1A1A]" /> for God's glory
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;