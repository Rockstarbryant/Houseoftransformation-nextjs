'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import {
  User, Calendar, BookOpen, ImageIcon, Heart, Users, Shield, BarChart3, LogOut, Home, Play, Newspaper, DollarSign, FileText, MessageSquare, Mail
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Portal Sidebar
 * Shows permission-based menu items
 * Only displays sections user has access to
 */
export default function PortalSidebar({ isOpen, onToggle }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { getAccessibleSections, isAdmin } = usePermissions();

  const sections = getAccessibleSections();

  const iconMap = {
    'User': <User size={20} />,
    'Calendar': <Calendar size={20} />,
    'BookOpen': <BookOpen size={20} />,
    'ImageIcon': <ImageIcon size={20} />,
    'Heart': <Heart size={20} />,
    'Users': <Users size={20} />,
    'Mail': <Mail size={20} />,
    'Shield': <Shield size={20} />,
    'BarChart3': <BarChart3 size={20} />,
    'Play': <Play size={20} />,
    'Newspaper': <Newspaper size={20} />,
    'DollarSign': <DollarSign size={20} />,
    'FileText': <FileText size={20} />,
    'MessageSquare': <MessageSquare size={20} />
  };

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Logo / Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#8B1A1A] flex items-center justify-center">
            <span className="text-white font-black text-lg">H</span>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Portal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAdmin() ? 'Admin' : user?.role?.name || 'Member'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Portal Home */}
        <Link
          href="/portal"
          onClick={onToggle} // Close sidebar on mobile after click
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all block
            ${isActive('/portal') && pathname === '/portal'
              ? 'bg-[#8B1A1A] text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }
          `}
        >
          <Home size={20} />
          <span className="text-sm font-semibold">Dashboard</span>
        </Link>

        {/* Menu Sections */}
        {sections && sections.length > 0 ? (
          sections.map((section) => {
            const active = isActive(section.href);
            const icon = iconMap[section.icon];

            return (
              <Link
                key={section.href}
                href={section.href}
                onClick={onToggle} // Close sidebar on mobile after click
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all block
                  ${active
                    ? 'bg-[#8B1A1A] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                {icon}
                <span className="text-sm font-semibold">{section.name}</span>
              </Link>
            );
          })
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400 p-4">
            No accessible sections
          </div>
        )}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-2">
        {/* Back to Site Button */}
        <a
          href="/"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white transition-all"
        >
          <Home size={20} />
          <span className="text-sm font-semibold">Back to Site</span>
        </a>

        {user && (
          <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
              {user?.email || 'email@example.com'}
            </p>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={async () => {
            await logout();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
        >
          <LogOut size={20} />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
}