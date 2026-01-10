'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { CHURCH_INFO } from '@/utils/constants';
import AuthModal from '@/components/auth/AuthModal';
import MobileMenu from './MobileMenu';
import Image from 'next/image';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  const { user, isAdmin, logout } = useAuthContext();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowDropdown(false);
  }, [pathname]);

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

  const navLinksAfterDropdown = [
    { path: '/volunteer', label: 'Volunteer' },
    { path: '/users', label: 'Members' },
    { path: '/contact', label: 'Contact' },
    { path: '/feedback', label: 'Feedback' }
  ];

  const isActivePath = (path) => pathname === path;
  const isDropdownActive = () => dropdownLinks.some(link => isActivePath(link.path));

  const handleAuthClick = () => {
    setShowAuthModal(true);
    setAuthMode('login');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-red-900 shadow-lg' : 'bg-red-900'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity flex-shrink-0">
              <Image 
                src="https://pbs.twimg.com/profile_images/700352011582251008/wrxEHL3q.jpg"
                alt={CHURCH_INFO.name}
                width={72}
                height={72}
                className="rounded-full object-cover border-2 border-white"
              />
              <div className="flex flex-col">
                <h1 className="font-bold text-lg text-white leading-tight">
                  {CHURCH_INFO.name}
                </h1>
                <p className="text-white/90 text-sm font-semibold">{CHURCH_INFO.location}</p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-8 flex-grow justify-center">
              <div className="flex gap-6 items-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`font-medium transition-colors duration-200 ${
                      isActivePath(link.path) 
                        ? 'text-white font-bold border-b-2 border-white pb-1' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="relative group">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`font-medium transition-colors duration-200 flex items-center gap-2 pb-1 ${
                      isDropdownActive() 
                        ? 'text-white font-bold border-b-2 border-white' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Content
                    <ChevronDown 
                      size={18} 
                      className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div className={`absolute left-0 mt-0 w-48 bg-red-900 rounded-lg shadow-lg border border-red-800 overflow-hidden transition-all duration-200 origin-top ${
                    showDropdown 
                      ? 'opacity-100 visible scale-y-100' 
                      : 'opacity-0 invisible scale-y-95'
                  }`}>
                    <div className="py-2">
                      {dropdownLinks.map((link) => (
                        <Link
                          key={link.path}
                          href={link.path}
                          onClick={() => setShowDropdown(false)}
                          className={`block px-4 py-2.5 font-medium transition-all duration-200 ${
                            isActivePath(link.path)
                              ? 'bg-red-800 text-white border-l-4 border-white'
                              : 'text-white/90 hover:bg-red-800 hover:text-white'
                          }`}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {navLinksAfterDropdown.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`font-medium transition-colors duration-200 ${
                      isActivePath(link.path) 
                        ? 'text-white font-bold border-b-2 border-white pb-1' 
                        : 'text-white/80 hover:text-white'
                        }`}
                    >
                        {link.label}
                    </Link>
                    ))}
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-4 border-l border-white/30 pl-6">
              <div className="flex flex-col items-end">
                <span className="text-sm text-white font-semibold">{user.name}</span>
                <span className="text-xs text-white/70 capitalize">{user.role}</span>
              </div>
              {isAdmin() && (
                <Link
                  href="/admin"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  <Settings size={16} /> Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-white hover:text-white/80 transition-colors font-medium flex items-center gap-2 p-2 hover:bg-red-800 rounded-lg"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAuthClick}
              className="bg-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <LogIn size={18} /> Sign In
            </button>
          )}
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-white p-2 hover:bg-red-800 rounded-lg transition-colors ml-auto"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </div>

    <MobileMenu
      isOpen={isMobileMenuOpen}
      user={user}
      isAdmin={isAdmin()}
      onAuthClick={handleAuthClick}
      onLogout={handleLogout}
      onClose={() => setIsMobileMenuOpen(false)}
    />
  </nav>

  {showAuthModal && (
    <AuthModal
      mode={authMode}
      onClose={() => setShowAuthModal(false)}
      onSwitchMode={(mode) => setAuthMode(mode)}
    />
  )}
</>
);
};
export default Header;