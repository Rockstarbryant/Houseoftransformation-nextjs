'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Settings, ChevronDown, LogOut, LogIn } from 'lucide-react';

const MobileMenu = ({ 
  isOpen, 
  user, 
  isAdmin, 
  onAuthClick, 
  onLogout, 
  onClose 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Link arrays kept exactly as original
  const navLinks = [{ path: '/', label: 'Home' }, { path: '/about', label: 'About' }];
  const dropdownLinks = [
    { path: '/sermons', label: 'Sermons' },
    { path: '/livestream', label: 'Past Livestreams' },
    { path: '/events', label: 'Events' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/blog', label: 'Blogs' }
  ];
  const navLinksAfter = [
    { path: '/volunteer', label: 'Volunteer' },
    { path: '/users', label: 'Members' },
    { path: '/contact', label: 'Contact' },
    { path: '/feedback', label: 'Feedback' }
  ];

  if (!isOpen) return null;

  return (
    /* Classic Dropdown: Position absolute below the header, full width */
    <div className="absolute top-full left-0 w-full bg-[#8B1A1A] border-t border-white/10 shadow-xl lg:hidden max-h-[80vh] overflow-y-auto">
      <div className="flex flex-col p-4 space-y-1">
        
        {/* Main Links */}
        {navLinks.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            onClick={onClose}
            className="block py-3 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {link.label}
          </Link>
        ))}

        {/* Accordion Content Section */}
        <div className="flex flex-col">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-between py-3 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <span>Content</span>
            <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showDropdown && (
            <div className="bg-black/10 rounded-lg mt-1 mb-2">
              {dropdownLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={onClose}
                  className="block py-3 px-8 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {navLinksAfter.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            onClick={onClose}
            className="block py-3 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {link.label}
          </Link>
        ))}

        {/* Auth Section - Becomes part of the list */}
        <div className="mt-4 pt-4 border-t border-white/10">
          {user ? (
            <div className="space-y-3">
              <div className="px-4 py-3 bg-white/5 rounded-xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-white">{user.name}</p>
                <p className="text-[9px] font-bold text-white/50 uppercase">{user.role}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 bg-white text-[#8B1A1A] py-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
                  >
                    <Settings size={16} /> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { onLogout(); onClose(); }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/20 text-white"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { onAuthClick(); onClose(); }}
              className="w-full bg-white text-[#8B1A1A] py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              <LogIn size={16} /> Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;