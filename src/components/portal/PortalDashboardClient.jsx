'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
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
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCheck,
  AlertCircle,
  Info,
  AlertTriangle,
  Zap
} from 'lucide-react';

/**
 * Portal Dashboard Client Component with Multi-Page Navigation
 * Journey tab replaced with Announcements
 */
export default function PortalDashboardClient() {
  const { user } = useAuth();
  const { getAccessibleSections, isAdmin } = usePermissions();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  
  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [announcementsPage, setAnnouncementsPage] = useState(1);

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

  // Priority config for announcements
  const priorityConfig = {
    low: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Low' },
    normal: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Normal' },
    high: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', label: 'High' },
    urgent: { icon: Zap, color: 'text-red-600', bg: 'bg-red-50', label: 'Urgent' }
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const response = await api.get(`/announcements?page=${announcementsPage}&limit=10`);
      
      if (response.data.success) {
        setAnnouncements(response.data.announcements);
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching announcements:', error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Mark announcement as read
  const markAsRead = async (id) => {
    try {
      await api.post(`/announcements/${id}/read`);
      setAnnouncements(prev =>
        prev.map(a => a._id === id ? { ...a, isRead: true } : a)
      );
    } catch (error) {
      console.error('[Dashboard] Error marking as read:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  // Fetch announcements when tab is selected
  useEffect(() => {
    if (currentPage === 2) { // Announcements tab index
      fetchAnnouncements();
    }
  }, [currentPage, announcementsPage]);

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

  // Page 1: Analytics (keeping original)
  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-black mb-2">Explore</h1>
        <p className="text-purple-100">Discover insights and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Engagement</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">87%</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Monthly average</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Active Users</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">1,234</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">This month</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart3 className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Growth</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">+24%</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">vs last month</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { label: 'New registrations', value: '45', time: 'Today' },
            { label: 'Events attended', value: '128', time: 'This week' },
            { label: 'Donations received', value: '$2,450', time: 'This month' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
              </div>
              <p className="text-lg font-bold text-[#8B1A1A]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Page 2: ANNOUNCEMENTS (Replacing Journey)
  const renderAnnouncements = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
          <Bell size={40} />
          Announcements
        </h1>
        <p className="text-blue-100">Stay updated with the latest news and updates</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/portal/announcements')}
          className="px-4 py-2 bg-[#8B1A1A] text-white rounded-lg font-semibold hover:bg-red-900 transition-colors"
        >
          View All Announcements
        </button>
      </div>

      {/* Announcements List */}
      {loadingAnnouncements ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center">
          <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-semibold">
            No announcements yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.slice(0, 5).map((announcement) => {
            const PriorityIcon = priorityConfig[announcement.priority].icon;
            const priorityColor = priorityConfig[announcement.priority].color;
            const priorityBg = priorityConfig[announcement.priority].bg;

            return (
              <div
                key={announcement._id}
                onClick={() => router.push(`/portal/announcements/${announcement._id}`)}
                className={`
                  bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm cursor-pointer
                  hover:shadow-md transition-all border-l-4
                  ${!announcement.isRead ? 'border-l-[#8B1A1A] bg-red-50/30 dark:bg-red-950/10' : 'border-l-transparent'}
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Priority Icon */}
                  <div className={`p-3 ${priorityBg} dark:${priorityBg}/20 rounded-lg flex-shrink-0`}>
                    <PriorityIcon size={20} className={priorityColor} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {announcement.title}
                        {!announcement.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(announcement.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                      {announcement.content}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded capitalize">
                        {announcement.category}
                      </span>
                      <span className={`px-2 py-1 ${priorityBg} dark:${priorityBg}/20 ${priorityColor} rounded capitalize font-semibold`}>
                        {priorityConfig[announcement.priority].label}
                      </span>
                    </div>
                  </div>

                  {/* Mark as Read Button */}
                  {!announcement.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(announcement._id);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                      title="Mark as read"
                    >
                      <CheckCheck size={18} className="text-green-600" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Link */}
      {announcements.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => router.push('/portal/announcements')}
            className="text-[#8B1A1A] hover:text-red-900 font-semibold text-sm underline"
          >
            View all {announcements.length > 5 ? `${announcements.length} ` : ''}announcements →
          </button>
        </div>
      )}
    </div>
  );

  // Page 3: Profile (keeping original)
  const renderProfile = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white shadow-lg flex items-center gap-6">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
          <User className="text-green-600" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black">{user?.name || 'User'}</h1>
          <p className="text-green-100">{user?.email || 'user@example.com'}</p>
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
    renderAnnouncements,  // ← CHANGED: Announcements instead of renderReports
    renderProfile
  ];

  const pageNames = ['Home', 'Explore', 'Announcements', 'Profile']; // ← CHANGED: Journey → Announcements

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
              { icon: <Bell size={24} />, label: 'Announcements' }, // ← CHANGED: FileText → Bell, Journey → Announcements
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