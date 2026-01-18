'use client';

import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import Link from 'next/link';
import {
  Calendar,
  BookOpen,
  ImageIcon,
  Heart,
  Users,
  Shield,
  BarChart3,
  ArrowRight
} from 'lucide-react';

/**
 * Portal Dashboard Client Component
 */
export default function PortalDashboardClient() {
  const { user } = useAuth();
  const { getAccessibleSections, isAdmin } = usePermissions();

  const sections = getAccessibleSections();

  const iconMap = {
    'User': <Users size={24} />,
    'Calendar': <Calendar size={24} />,
    'BookOpen': <BookOpen size={24} />,
    'ImageIcon': <ImageIcon size={24} />,
    'Heart': <Heart size={24} />,
    'Users': <Users size={24} />,
    'Shield': <Shield size={24} />,
    'BarChart3': <BarChart3 size={24} />
  };

  // Get permissions safely
  const permissions = Array.isArray(user?.role?.permissions) 
    ? user.role.permissions 
    : [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#8B1A1A] to-red-900 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-black mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-red-100">
          Role: <span className="font-bold capitalize">{user?.role?.name || 'Member'}</span>
        </p>
        <p className="text-red-100 text-sm mt-2">
          {sections.length} accessible features
        </p>
      </div>

      {/* Admin Notice */}
      {isAdmin() && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
            🔐 Administrator Access
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            You have full system access. Manage roles, users, and permissions from the portal.
          </p>
        </div>
      )}

      {/* Quick Access Features */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
          Your Features
        </h2>

        {sections.length === 1 ? (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 font-semibold">
              Only Profile access available. Contact an admin to gain more permissions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => {
              const icon = iconMap[section.icon];

              return (
                <Link key={section.href} href={section.href}>
                  <div className="
                    group block p-6 bg-white dark:bg-slate-800 rounded-xl
                    border border-slate-200 dark:border-slate-700
                    hover:border-[#8B1A1A] dark:hover:border-red-600
                    hover:shadow-lg dark:hover:shadow-red-950/50
                    transition-all duration-300 cursor-pointer
                  ">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-[#8B1A1A] group-hover:text-white transition-all">
                        {icon}
                      </div>
                      <ArrowRight 
                        size={20}
                        className="text-slate-400 group-hover:text-[#8B1A1A] transform group-hover:translate-x-1 transition-all"
                      />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-[#8B1A1A] transition-colors">
                      {section.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Manage and oversee {section.name.toLowerCase()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Role & Permissions Info */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">
          Your Permissions
        </h3>
        
        {/* Broad Permissions */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Management Permissions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.length > 0 ? (
              permissions.filter(p => p.includes('manage:') || p.includes('view:'))
                .map((perm) => (
                  <div 
                    key={perm}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {perm}
                    </span>
                  </div>
                ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No management permissions
              </p>
            )}
          </div>
        </div>

        {/* Granular Feedback Permissions */}
        {permissions.some(p => p.includes('feedback')) && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Feedback Permissions (by Category)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permissions.filter(p => p.includes('feedback'))
                .map((perm) => (
                  <div 
                    key={perm}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-lg border border-blue-200 dark:border-blue-600"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {perm}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Contact Admin */}
      <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Need additional permissions? Contact an administrator.
        </p>
      </div>
    </div>
  );
}