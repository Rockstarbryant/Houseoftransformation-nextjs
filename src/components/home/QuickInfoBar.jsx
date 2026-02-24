'use client';

import React from 'react';
import { Calendar, MapPin, Heart, MessageCircle, Users, Gift, ArrowUpRight, Zap } from 'lucide-react';
import { CHURCH_INFO, SERVICE_TIMES } from '@/utils/constants';
import Link from 'next/link';

const QuickInfoBar = () => {
  const quickLinks = [
    { icon: Calendar, label: 'Service Times', value: `${SERVICE_TIMES.sunday.time}`, href: '/', color: 'text-red-600' },
    { icon: MapPin, label: 'Location', value: CHURCH_INFO.location, href: '/contact', color: 'text-red-600' },
    { icon: Heart, label: 'Get Involved', value: 'Join a Ministry', href: '/volunteer', color: 'text-red-600' },
    { icon: MessageCircle, label: 'What We Believe', value: 'Learn More', href: '/about', color: 'text-red-600' },
    { icon: Users, label: 'Take the Next Step', value: 'Connect with Us', href: '/contact', color: 'text-red-600' },
    { icon: Gift, label: 'Giving', value: 'Support Our Mission', href: '/donate', color: 'text-red-600' }
  ];

  return (
    <section className="py-0 bg-white dark:bg-slate-900 dark:text-white transition-colors overflow-hidden">
      <div className="max-w-[1600px] mx-auto md:px-6">
        <div className="flex flex-col lg:flex-row bg-slate-100 dark:bg-slate-900 md:rounded-[1rem] overflow-hidden min-h-[800px]">
          
          {/* LEFT PANEL: High-Impact Visual */}
          <div className="lg:w-5/12 relative bg-[#8B1A1A] md:rounded-[1rem] p-6 sm:p-8 md:p-10 flex flex-col justify-between text-white shadow-xl min-h-[400px] lg:min-h-full">
            {/* Top icon */}
            <div>
              <Zap size={32} className="text-white/50" />
            </div>

            {/* Middle decorative content */}
            <div className="space-y-4">
              <div className="w-20 h-1 bg-white/40" />
              <p className="text-white/80 font-medium max-w-xs">
                Every resource you need to connect with the House of Transformation community.
              </p>
            </div>

            {/* Bottom stat */}
            <div>
              <p className="text-3xl sm:text-4xl font-black mb-2">36+</p>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] opacity-70">Years of Ministry</p>
            </div>
          </div>

          {/* RIGHT PANEL: The Navigation Hub */}
          <div className="lg:w-7/12 bg-white dark:bg-slate-800 p-8 md:p-20 flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
              {quickLinks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link key={index} href={item.href} className="group py-8 border-b border-slate-50 dark:border-slate-700 hover:border-[#8B1A1A] transition-all duration-500">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#8B1A1A] opacity-40">0{index + 1}</span>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-[0.2em] group-hover:text-[#8B1A1A] transition-colors">
                            {item.label}
                          </p>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:translate-x-2 transition-transform duration-500">
                          {item.value}
                        </h3>
                      </div>
                      
                      <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-300 group-hover:bg-[#8B1A1A] group-hover:text-white transition-all duration-500 rotate-45 group-hover:rotate-0">
                        <Icon size={20} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Bottom Contact Footer */}
            <div className="mt-16 flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest">
                Need Help? <span className="text-slate-900 dark:text-white ml-2">Contact Ministry Office</span>
              </p>
              <div className="flex gap-2">
                <div className="size-2 rounded-full bg-[#8B1A1A] animate-pulse" />
                <div className="size-2 rounded-full bg-slate-200 dark:bg-slate-600" />
                <div className="size-2 rounded-full bg-slate-200 dark:bg-slate-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickInfoBar;