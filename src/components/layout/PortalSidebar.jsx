'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import {
  User, Calendar, BookOpen, ImageIcon, Heart, Users, Shield, BarChart3, LogOut, Home, Play, Newspaper, DollarSign, FileText, MessageSquare, Mail, Bookmark, Bell, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PortalSidebar({ isCollapsed, onToggleCollapse, onCloseMobile }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { getAccessibleSections, isAdmin } = usePermissions();

  const sections = getAccessibleSections();

  const iconMap = {
    'User': <User size={22} />,
    'Bell': <Bell size={22} />,
    'Calendar': <Calendar size={22} />,
    'BookOpen': <BookOpen size={22} />,
    'ImageIcon': <ImageIcon size={22} />,
    'Heart': <Heart size={22} />,
    'Users': <Users size={22} />,
    'Mail': <Mail size={22} />,
    'Shield': <Shield size={22} />,
    'BarChart3': <BarChart3 size={22} />,
    'Play': <Play size={22} />,
    'Newspaper': <Newspaper size={22} />,
    'DollarSign': <DollarSign size={22} />,
    'FileText': <FileText size={22} />,
    'Bookmark': <Bookmark size={22} />,
    'MessageSquare': <MessageSquare size={22} />
  };

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
      
      {/* Brand Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="min-w-[40px] w-10 h-10 rounded-xl bg-[#8B1A1A] flex items-center justify-center">
            <span className="text-white font-black text-lg">H</span>
          </div>
          {!isCollapsed && (
            <div className="whitespace-nowrap">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Portal</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                {isAdmin() ? 'Admin' : user?.role?.name || 'Member'}
              </p>
            </div>
          )}
        </div>
        
        {/* Desktop Collapse Toggle */}
        {onToggleCollapse && (
          <button 
            onClick={onToggleCollapse}
            className="hidden md:flex text-slate-400"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <Link
          href="/portal"
          onClick={handleLinkClick}
          className={`
            flex items-center gap-4 p-3 rounded-2xl transition-colors
            ${isActive('/portal') && pathname === '/portal'
              ? 'bg-[#8B1A1A] text-white'
              : 'text-slate-500 dark:text-slate-400 bg-transparent'
            }
          `}
          title={isCollapsed ? "Dashboard" : undefined}
        >
          <div className="min-w-[24px] flex justify-center"><Home size={22} /></div>
          {!isCollapsed && <span className="text-sm font-semibold whitespace-nowrap">Dashboard</span>}
        </Link>

        {sections && sections.length > 0 && sections.map((section) => {
          const active = isActive(section.href);
          const icon = iconMap[section.icon];

          return (
            <Link
              key={section.href}
              href={section.href}
              onClick={handleLinkClick}
              className={`
                flex items-center gap-4 p-3 rounded-2xl transition-colors
                ${active
                  ? 'bg-[#8B1A1A] text-white'
                  : 'text-slate-500 dark:text-slate-400 bg-transparent'
                }
              `}
              title={isCollapsed ? section.name : undefined}
            >
              <div className="min-w-[24px] flex justify-center">{icon}</div>
              {!isCollapsed && <span className="text-sm font-semibold whitespace-nowrap">{section.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile Area */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className={`
          flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800
          ${isCollapsed ? 'justify-center' : 'justify-between'}
        `}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-[36px] w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <span className="text-slate-600 dark:text-slate-300 text-xs font-black">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
                  {user?.email || 'email@example.com'}
                </p>
              </div>
            )}
          </div>
          
          {/* Logout Icon */}
          <button
            onClick={logout}
            className={`text-slate-400 ${isCollapsed ? 'hidden' : 'block'}`}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Action purely for slim state logout */}
        {isCollapsed && (
          <button
            onClick={logout}
            className="w-full flex justify-center mt-2 p-3 text-slate-400"
            title="Logout"
          >
            <LogOut size={22} />
          </button>
        )}
      </div>
    </div>
  );
}