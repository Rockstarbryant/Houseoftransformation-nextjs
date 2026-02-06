'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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
  
  const { user, isAdmin, logout, isLoading } = useAuth();
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
    { path: '/donate', label: 'Donations' },
    { path: '/contact', label: 'Contact' },
    { path: '/portal', label: 'portal' },
    { path: '/feedback', label: 'Feedback' }
  ];

  const isActivePath = (path) => pathname === path;
  const isDropdownActive = () => dropdownLinks.some(link => isActivePath(link.path));

  const handleAuthClick = () => {
  // Store current page in sessionStorage for redirect after login
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('redirectAfterLogin', pathname);
  }
  setShowAuthModal(true);
  setAuthMode('login');
};

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const userIsAdmin = isAdmin && isAdmin();

  return (
    <>
      {/* 1. Header locked to Red (#8B1A1A) with height transition only */}
      <nav className={`fixed w-full z-50 transition-all duration-300 bg-[#8B1A1A] ${
        isScrolled ? 'py-3 shadow-2xl' : 'py-5'
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* LOGO AREA: White text on Red background */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <Image 
                src="https://res.cloudinary.com/dcu8uuzrs/image/upload/v1768913903/church-gallery/tql6mjtmman1gxlzl91e.jpg"
                alt={CHURCH_INFO.name}
                width={48}
                height={48}
                className="rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <h1 className="font-black text-sm md:text-base tracking-tighter uppercase leading-none text-white">
                  {CHURCH_INFO.name}
                </h1>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80">
                  {CHURCH_INFO.location}
                </p>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION: Modern Typography, White Text */}
            <div className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-white/100 ${
                    isActivePath(link.path) ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="relative group/content">
                <button
                  onMouseEnter={() => setShowDropdown(true)}
                  aria-label="Toggle content menu"
                  aria-expanded={showDropdown}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 hover:text-white ${
                    isDropdownActive() ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'
                  }`}
                >
                  Content
                  <ChevronDown size={14} className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                <div 
                  onMouseLeave={() => setShowDropdown(false)}
                  className={`absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
                    showDropdown ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}
                >
                  <div className="py-2">
                    {dropdownLinks.map((link) => (
                      <Link
                        key={link.path}
                        href={link.path}
                        onClick={() => setShowDropdown(false)}
                        className={`flex items-center px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                          isActivePath(link.path) ? 'bg-slate-50 text-[#8B1A1A]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#8B1A1A]'
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
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-white/100 ${
                    isActivePath(link.path) ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* AUTH ACTIONS */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-white/20">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-[9px] font-bold text-white/60 uppercase">
                      {user?.role?.name}
                    </span>
                  </div>
                  
                  {userIsAdmin && (
                    <Link
                      href="/portal"
                      className="size-9 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-[#8B1A1A] transition-all shadow-lg"
                      aria-label="Go to Portal Dashboard"
                      title="Portal Dashboard"
                    >
                      <Settings size={16} />
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    aria-label="Logout from account"
                    className="size-9 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-red-600 transition-all"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  aria-label="Sign in to account"
                  className="hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white text-[#8B1A1A] hover:bg-slate-100 transition-all shadow-md"
                >
                  Sign In
                </button>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                aria-expanded={isMobileMenuOpen}
                className="lg:hidden p-2 text-white bg-white/10 rounded-lg"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        <MobileMenu
          isOpen={isMobileMenuOpen}
          user={{
          ...user,
            role: user?.role?.name || 'Member' // Pass only the role name
            }}
            isAdmin={userIsAdmin}
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