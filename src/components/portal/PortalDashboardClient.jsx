'use client';

import { useState } from 'react';
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
  ArrowRight,
  Home,
  TrendingUp,
  FileText,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

/**
 * Portal Dashboard Client Component with Multi-Page Navigation
 */
export default function PortalDashboardClient() {
  const { user } = useAuth();
  const { getAccessibleSections, isAdmin } = usePermissions();
  const [currentPage, setCurrentPage] = useState(0);

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

  // Page 0: Original Portal Dashboard
  const renderPortalDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#8B1A1A] to-red-900 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-black mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 
        </h1>
        <p className="text-red-100">
          H.O.T: <span className="font-bold capitalize">{user?.role?.name || 'Member'}</span>
        </p>
        <p className="text-red-100 text-sm mt-2">
          {sections.length} accessible features
        </p>
      </div>

      {/* Admin Notice */}
      {isAdmin() && (
        <div className="bg-green-900 dark:bg-green-900 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-bold text-white dark:text-blue-200 mb-2">
            Administrator Access
          </h3>
          <p className="text-sm text-white dark:text-slate-300">
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

  // Page 1: Analytics Overview
  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-black mb-2">Analytics</h1>
        <p className="text-blue-100">Track your performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-500" size={24} />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">2,847</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Views</p>
          <p className="text-xs text-green-500 mt-1">+12.5% from last month</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">1,245</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Active Users</p>
          <p className="text-xs text-blue-500 mt-1">+8.3% from last month</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="text-red-500" size={24} />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">573</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Donations</p>
          <p className="text-xs text-red-500 mt-1">+15.2% from last month</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-purple-500" size={24} />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">28</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Events This Month</p>
          <p className="text-xs text-purple-500 mt-1">+4 from last month</p>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Weekly Activity</h3>
        <div className="flex items-end gap-2 h-48">
          {[65, 45, 80, 55, 70, 85, 60].map((height, i) => (
            <div key={i} className="flex-1 bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600" 
                 style={{ height: `${height}%` }}>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { user: 'John Doe', action: 'donated $50', time: '2 hours ago', color: 'bg-red-500' },
            { user: 'Jane Smith', action: 'registered for event', time: '5 hours ago', color: 'bg-blue-500' },
            { user: 'Mike Johnson', action: 'submitted feedback', time: '1 day ago', color: 'bg-green-500' },
            { user: 'Sarah Williams', action: 'updated profile', time: '2 days ago', color: 'bg-purple-500' }
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {activity.user}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activity.action}</p>
              </div>
              <span className="text-xs text-slate-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Page 2: Reports
  const renderReports = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-black mb-2">Reports</h1>
        <p className="text-purple-100">Generate and view system reports</p>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="text-purple-600" size={24} />
            </div>
            <ArrowRight className="text-slate-400" size={20} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Monthly Report</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Complete overview of January 2026
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Generated</span>
            <span className="text-xs text-slate-400">Last updated: Jan 20</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <ArrowRight className="text-slate-400" size={20} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Donation Trends</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Analyze donation patterns over time
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Pending</span>
            <span className="text-xs text-slate-400">Generating...</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
            <ArrowRight className="text-slate-400" size={20} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">User Engagement</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Track user activity and retention
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Generated</span>
            <span className="text-xs text-slate-400">Last updated: Jan 22</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Calendar className="text-red-600" size={24} />
            </div>
            <ArrowRight className="text-slate-400" size={20} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Event Analytics</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Review event attendance and feedback
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Generated</span>
            <span className="text-xs text-slate-400">Last updated: Jan 19</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Report Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">12</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Reports</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-2xl font-bold text-green-600">8</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Generated</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">3</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">In Progress</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-2xl font-bold text-red-600">1</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Failed</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Page 3: Profile Overview
  const renderProfile = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <User className="text-green-600" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black">{user?.name || 'User'}</h1>
            <p className="text-green-100">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Account Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Member Since</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Jan 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <span className="text-sm font-semibold text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Role</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                {user?.role?.name || 'Member'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Engagement</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Events Attended</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Donations Made</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Feedback Submitted</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">23</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Last Login</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Today</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Total Sessions</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">342</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Avg. Session Time</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">12 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Actions</h3>
        <div className="space-y-3">
          {[
            { action: 'Logged into portal', date: 'Today at 11:14 AM', icon: '🔐' },
            { action: 'Donated $25 to Community Fund', date: 'Jan 22, 2026', icon: '💝' },
            { action: 'Registered for Workshop Event', date: 'Jan 20, 2026', icon: '📅' },
            { action: 'Updated profile information', date: 'Jan 18, 2026', icon: '✏️' },
            { action: 'Submitted feedback form', date: 'Jan 15, 2026', icon: '📝' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.action}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Shortcut */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          Need to update your profile or change settings?
        </p>
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
          Go to Settings
        </button>
      </div>
    </div>
  );

  const pages = [
    renderPortalDashboard,
    renderAnalytics,
    renderReports,
    renderProfile
  ];

  const pageNames = ['Home', 'Explore', 'Journey', 'Profile'];

  return (
    <div className="pb-24 md:pb-8">
      {/* Content */}
      <div className="min-h-[calc(100vh-200px)]">
        {pages[currentPage]()}
      </div>

      {/* Bottom Navigation - Mobile Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:relative md:mt-8 md:border-0">
        <div className="max-w-7xl mx-auto px-4">
          {/* Mobile: Icon Navigation */}
          <div className="flex md:hidden items-center justify-around py-3">
            {[
              { icon: <Home size={24} />, label: 'Home' },
              { icon: <TrendingUp size={24} />, label: 'Explore' },
              { icon: <FileText size={24} />, label: 'Journey' },
              { icon: <User size={24} />, label: 'Profile' }
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === i
                    ? 'text-[#8B1A1A]'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop: Button Navigation */}
          <div className="hidden md:flex items-center justify-between py-4">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                currentPage === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-[#8B1A1A] text-white hover:bg-red-900 shadow-md'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentPage === i
                      ? 'bg-[#8B1A1A] w-8'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
              disabled={currentPage === pages.length - 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                currentPage === pages.length - 1
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-[#8B1A1A] text-white hover:bg-red-900 shadow-md'
              }`}
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}