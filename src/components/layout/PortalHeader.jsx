'use client';

import { Menu, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';

/**
 * Portal Header
 * Top navigation bar for portal
 * Shows notifications, user menu, etc.
 */
export default function PortalHeader({ onSidebarToggle, sidebarOpen }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
    <div className="h-full px-4 md:px-8 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {/* Left: Sidebar Toggle + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <Menu size={20} className="text-slate-600 dark:text-slate-400" />
          )}
        </button>

        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">
            Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome, {user?.name?.split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Right: Notifications + User Menu */}
      <div className="flex items-center gap-4">
        {/* Real-time Notification Bell */}
        <NotificationBell />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-[#8B1A1A] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-black">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white hidden md:inline">
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || 'email@example.com'}
                </p>
                {user?.role && (
                  <p className="text-xs font-semibold text-[#8B1A1A] mt-1 uppercase tracking-wider">
                    {user.role.name || 'Member'}
                  </p>
                )}
              </div>

              <nav className="p-2 space-y-1">
                <Link href="/portal/profile">
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left"
                  >
                    <User size={16} />
                    Profile
                  </button>
                </Link>

                <Link href="/portal/settings">
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}