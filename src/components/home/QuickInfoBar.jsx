'use client';

import React from 'react';
import { Calendar, MapPin, Heart, MessageCircle, Users, Gift } from 'lucide-react';
import { CHURCH_INFO, SERVICE_TIMES } from '@/utils/constants';
import Link from 'next/link';

const QuickInfoBar = () => {
  const quickLinks = [
    {
      icon: Calendar,
      label: 'Service Times',
      value: `${SERVICE_TIMES.sunday.time}`,
      href: '/',                    // ← Changed from 'link' to 'href'
      color: 'text-blue-600'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: CHURCH_INFO.location,
      href: '/contact',
      color: 'text-red-600'
    },
    {
      icon: Heart,
      label: 'Get Involved',
      value: 'Join a Ministry',
      href: '/volunteer',
      color: 'text-pink-600'
    },
    {
      icon: MessageCircle,
      label: 'What We Believe',
      value: 'Learn More',
      href: '/about',
      color: 'text-green-600'
    },
    {
      icon: Users,
      label: 'Take the Next Step',
      value: 'Connect with Us',
      href: '/contact',
      color: 'text-purple-600'
    },
    {
      icon: Gift,
      label: 'Giving',
      value: 'Support Our Mission',
      href: '/donate',
      color: 'text-orange-600'
    }
  ];

  return (
    <section className="py-12 md:py-5 tw-py-3 tw-bg-grayscale-800">
      <div className="max-w-full mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={index} href={item.href}>  {/* ← Now using href, not to */}
                <div className="group bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-slate-100 group-hover:bg-blue-100 transition-colors ${item.color}`}>
                      <Icon size={28} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.value}
                      </p>
                    </div>
                    <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickInfoBar;