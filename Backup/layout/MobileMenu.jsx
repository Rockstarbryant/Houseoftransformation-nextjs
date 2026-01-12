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

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' }
  ];

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
    <div className="lg:hidden bg-red-900 text-white px-4 pb-4 max-h-[calc(100vh-80px)] overflow-y-auto">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          onClick={onClose}
          className="block py-3 text-lg hover:bg-red-800 transition-colors px-2 rounded border-b border-red-800"
        >
          {link.label}
        </Link>
      ))}

      <div className="border-b border-red-800">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between py-3 text-lg hover:bg-red-800 transition-colors px-2 rounded"
        >
          <span>Content</span>
          <ChevronDown 
            size={20}
            className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
          />
        </button>
        
        {showDropdown && (
          <div className="bg-red-800 py-2">
            {dropdownLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => {
                  setShowDropdown(false);
                  onClose();
                }}
                className="block py-2.5 px-4 text-base hover:bg-red-700 transition-colors"
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
          className="block py-3 text-lg hover:bg-red-800 transition-colors px-2 rounded border-b border-red-800"
        >
          {link.label}
        </Link>
      ))}

      <div className="mt-4 pt-4 border-t border-red-800">
        {user ? (
          <div className="space-y-3">
            <div className="px-2 py-2 bg-red-800 rounded">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-red-200 capitalize">{user.role}</p>
            </div>
            
            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
              >
                <Settings size={18} /> Admin Dashboard
              </Link>
            )}
            
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full bg-white/20 text-white py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              onAuthClick();
              onClose();
            }}
            className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <LogIn size={18} /> Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;