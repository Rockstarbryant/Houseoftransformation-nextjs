// src/components/layout/Footer.jsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Youtube, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';
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
    <footer className="bg-slate-900 text-slate-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Church Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                HT
              </div>
              <h3 className="font-bold text-lg text-white">{CHURCH_INFO.name}</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Transforming lives through God's love and the message of Jesus Christ in {CHURCH_INFO.location}.
            </p>
            <div className="flex gap-4">
              <a 
                href={SOCIAL_LINKS.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-slate-800 hover:bg-blue-600 p-2 rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href={SOCIAL_LINKS.youtube} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-slate-800 hover:bg-red-600 p-2 rounded-lg transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
              <a 
                href={SOCIAL_LINKS.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-slate-800 hover:bg-pink-600 p-2 rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link href="/sermons" className="hover:text-blue-400 transition-colors">Sermons</Link></li>
              <li><Link href="/events" className="hover:text-blue-400 transition-colors">Events</Link></li>
              <li><Link href="/gallery" className="hover:text-blue-400 transition-colors">Gallery</Link></li>
              <li><Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link></li>
              <li><Link href="/volunteer" className="hover:text-blue-400 transition-colors">Volunteer</Link></li>
              <li><Link href="/donate" className="hover:text-blue-400 transition-colors">Give</Link></li>
              <li><Link href="/donation" className="hover:text-blue-400 transition-colors">Donations</Link></li>
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Service Times</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-white mt-1">Sunday:</span>
                <div>
                  <p>{SERVICE_TIMES.sunday.time}</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-white mt-1">Wednesday:</span>
                <div>
                  <p>{SERVICE_TIMES.wednesday?.time || 'By appointment'}</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-white mt-1">Friday:</span>
                <div>
                  <p>{SERVICE_TIMES.friday?.time || 'By appointment'}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Stay Connected</h4>
            <p className="text-slate-400 text-sm mb-4">
              Get updates on services, events, and spiritual growth.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-600 transition-colors"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Mail size={16} /> Subscribe
              </button>
              {subscribeSuccess && (
                <p className="text-green-400 text-xs text-center">
                  Thank you for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="bg-slate-800 rounded-2xl p-6 md:p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <Phone className="text-blue-400" size={24} />
              <div>
                <p className="text-slate-400 text-sm">Phone</p>
                <a href={`tel:${CHURCH_INFO.phone}`} className="text-white font-semibold hover:text-blue-400 transition-colors">
                  {CHURCH_INFO.phone}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="text-blue-400" size={24} />
              <div>
                <p className="text-slate-400 text-sm">Email</p>
                <a href={`mailto:${CHURCH_INFO.email}`} className="text-white font-semibold hover:text-blue-400 transition-colors">
                  {CHURCH_INFO.email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="text-blue-400" size={24} />
              <div>
                <p className="text-slate-400 text-sm">Location</p>
                <p className="text-white font-semibold">{CHURCH_INFO.address || CHURCH_INFO.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700" />
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>
              &copy; {currentYear} {CHURCH_INFO.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-slate-600">|</span>
              <Link href="/terms" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1">
                Built with <Heart size={14} className="text-red-500" /> for God's glory
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;