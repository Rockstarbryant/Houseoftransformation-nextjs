// app/portal/analytics/page.jsx - COMPLETELY REFACTORED
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  BarChart3, Users, Calendar, BookOpen, MessageSquare, Heart, ImageIcon,
  TrendingUp, TrendingDown, Activity, Download, RefreshCw, Shield,
  CheckCircle, Clock, AlertCircle, Video, DollarSign, Mail, Bell,
  UserCheck, Award, Eye, Zap, Target, FileText, Camera, MonitorPlay
} from 'lucide-react';
import Loader from '@/components/common/Loader';

// ============================================
// IMPORT API SERVICES
// ============================================
import api from '@/lib/api';

/**
 * Modern Analytics Dashboard
 * Comprehensive tracking of all system metrics
 */
export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('overview'); // overview, users, content, engagement, financial, system
  const [timeRange, setTimeRange] = useState('30days'); // 7days, 30days, 90days, 1year, all

  // Data states
  const [dashboardData, setDashboardData] = useState({
    // Overview
    totalUsers: 0,
    totalSermons: 0,
    totalBlogs: 0,
    totalEvents: 0,
    totalGallery: 0,
    totalFeedback: 0,
    totalVolunteers: 0,
    totalDonations: 0,
    
    // User Analytics
    userStats: {
      total: 0,
      active: 0,
      banned: 0,
      newThisMonth: 0,
      byRole: [],
      byGender: [],
      byAuthProvider: [],
      growthTrend: []
    },
    
    // Content Analytics
    contentStats: {
      sermons: {
        total: 0,
        byCategory: [],
        byType: [],
        totalLikes: 0,
        totalViews: 0,
        recentTrend: []
      },
      blogs: {
        total: 0,
        approved: 0,
        pending: 0,
        byCategory: [],
        totalLikes: 0,
        recentTrend: []
      },
      gallery: {
        total: 0,
        byCategory: [],
        totalLikes: 0,
        recentTrend: []
      },
      events: {
        total: 0,
        upcoming: 0,
        past: 0,
        totalRegistrations: 0,
        memberRegistrations: 0,
        visitorRegistrations: 0,
        recentTrend: []
      }
    },
    
    // Engagement Analytics
    engagementStats: {
      feedback: {
        total: 0,
        byCategory: [],
        byStatus: [],
        anonymous: 0,
        avgResponseTime: 0
      },
      volunteers: {
        total: 0,
        byStatus: [],
        byMinistry: [],
        totalHours: 0
      },
      livestreams: {
        total: 0,
        byStatus: [],
        totalViews: 0,
        avgDuration: 0
      }
    },
    
    // Financial Analytics
    financialStats: {
      campaigns: {
        total: 0,
        active: 0,
        completed: 0,
        byType: [],
        totalGoal: 0,
        totalRaised: 0,
        completionRate: 0
      },
      pledges: {
        total: 0,
        totalAmount: 0,
        byStatus: [],
        fulfillmentRate: 0
      },
      payments: {
        total: 0,
        totalAmount: 0,
        byMethod: [],
        successRate: 0,
        monthlyTrend: []
      }
    },
    
    // Communication Analytics
    communicationStats: {
      emails: {
        totalSent: 0,
        successRate: 0,
        byType: []
      },
      announcements: {
        total: 0,
        active: 0,
        byPriority: [],
        avgReadRate: 0
      }
    },
    
    // System Analytics
    systemStats: {
      auditLogs: {
        totalActions: 0,
        successRate: 0,
        topActions: [],
        failedLogins: 0
      },
      bannedUsers: 0,
      recentActivity: []
    }
  });

  // ============================================
  // DATA FETCHING FUNCTIONS
  // ============================================

  const fetchOverviewData = async () => {
    try {
      const response = await api.get('/analytics/overview');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching overview:', error);
      throw error;
    }
  };

  const fetchUserAnalytics = async () => {
    try {
      const response = await api.get('/analytics/users');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  };

  const fetchContentAnalytics = async () => {
    try {
      const response = await api.get('/analytics/content');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      throw error;
    }
  };

  const fetchEngagementAnalytics = async () => {
    try {
      const response = await api.get('/analytics/engagement');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching engagement analytics:', error);
      throw error;
    }
  };

  const fetchFinancialAnalytics = async () => {
    try {
      const response = await api.get('/analytics/financial');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching financial analytics:', error);
      throw error;
    }
  };

  const fetchCommunicationAnalytics = async () => {
    try {
      const response = await api.get('/analytics/communication');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching communication analytics:', error);
      throw error;
    }
  };

  const fetchSystemAnalytics = async () => {
    try {
      const response = await api.get('/analytics/system');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      throw error;
    }
  };

  const loadAllAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, users, content, engagement, financial, communication, system] = await Promise.all([
        fetchOverviewData(),
        fetchUserAnalytics(),
        fetchContentAnalytics(),
        fetchEngagementAnalytics(),
        fetchFinancialAnalytics(),
        fetchCommunicationAnalytics(),
        fetchSystemAnalytics()
      ]);

      setDashboardData({
        // Overview
        totalUsers: overview?.totalUsers || 0,
        totalSermons: overview?.totalSermons || 0,
        totalBlogs: overview?.totalBlogs || 0,
        totalEvents: overview?.totalEvents || 0,
        totalGallery: overview?.totalGallery || 0,
        totalFeedback: overview?.totalFeedback || 0,
        totalVolunteers: overview?.totalVolunteers || 0,
        totalDonations: overview?.totalDonations || 0,

        userStats: users || {},
        contentStats: content || {},
        engagementStats: engagement || {},
        financialStats: financial || {},
        communicationStats: communication || {},
        systemStats: system || {}
      });

    } catch (err) {
      console.error('[Analytics] Load error:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAllAnalytics();
  }, [loadAllAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllAnalytics();
    setRefreshing(false);
  };

  // ============================================
  // PERMISSION CHECK
  // ============================================
  
  const canViewAnalytics = hasPermission('view:analytics');

  if (!canViewAnalytics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have permission to view analytics
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return <Loader fullScreen text="Loading analytics dashboard..." />;
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const calculatePercentage = (part, total) => {
    if (!total) return 0;
    return ((part / total) * 100).toFixed(1);
  };

  const getChangeColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  const getChangeIcon = (value) => {
    if (value > 0) return <TrendingUp size={16} />;
    if (value < 0) return <TrendingDown size={16} />;
    return <Activity size={16} />;
  };

  // ============================================
  // STAT CARD COMPONENT
  // ============================================

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = '#8B1A1A' }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 ${getChangeColor(trend)}`}>
            {getChangeIcon(trend)}
            <span className="text-sm font-bold">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
          {title}
        </h3>
        <p className="text-3xl font-black text-slate-900 dark:text-white">
          {formatNumber(value)}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  // ============================================
  // RENDER VIEWS
  // ============================================

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Top Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          title="Total Users" 
          value={dashboardData.totalUsers}
          subtitle={`${dashboardData.userStats.active} active`}
          trend={12.5}
        />
        <StatCard 
          icon={BookOpen} 
          title="Sermons" 
          value={dashboardData.totalSermons}
          subtitle={`${dashboardData.contentStats.sermons?.totalViews || 0} views`}
          trend={8.3}
          color="#3B82F6"
        />
        <StatCard 
          icon={DollarSign} 
          title="Total Donations" 
          value={`KES ${formatNumber(dashboardData.totalDonations)}`}
          subtitle={`${dashboardData.financialStats.campaigns?.active || 0} active campaigns`}
          trend={15.7}
          color="#10B981"
        />
        <StatCard 
          icon={Calendar} 
          title="Events" 
          value={dashboardData.totalEvents}
          subtitle={`${dashboardData.contentStats.events?.totalRegistrations || 0} registrations`}
          trend={-2.1}
          color="#F59E0B"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FileText} 
          title="Blog Posts" 
          value={dashboardData.totalBlogs}
          subtitle={`${dashboardData.contentStats.blogs?.pending || 0} pending approval`}
          color="#8B5CF6"
        />
        <StatCard 
          icon={Camera} 
          title="Gallery Photos" 
          value={dashboardData.totalGallery}
          subtitle={`${dashboardData.contentStats.gallery?.totalLikes || 0} total likes`}
          color="#EC4899"
        />
        <StatCard 
          icon={MessageSquare} 
          title="Feedback" 
          value={dashboardData.totalFeedback}
          subtitle={`${dashboardData.engagementStats.feedback?.anonymous || 0} anonymous`}
          color="#06B6D4"
        />
        <StatCard 
          icon={UserCheck} 
          title="Volunteers" 
          value={dashboardData.totalVolunteers}
          subtitle={`${dashboardData.engagementStats.volunteers?.totalHours || 0} total hours`}
          color="#14B8A6"
        />
      </div>

      {/* Quick Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-[#8B1A1A]" />
            User Distribution
          </h3>
          <div className="space-y-3">
            {dashboardData.userStats.byRole?.map((role) => (
              <div key={role._id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                  {role._id}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-[#8B1A1A] h-2 rounded-full" 
                      style={{ width: `${calculatePercentage(role.count, dashboardData.totalUsers)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white w-12 text-right">
                    {role.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-[#8B1A1A]" />
            Content Performance
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sermons</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{dashboardData.contentStats.sermons?.totalViews || 0} views</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Blogs</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{dashboardData.contentStats.blogs?.totalLikes || 0} likes</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Gallery</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{dashboardData.contentStats.gallery?.totalLikes || 0} likes</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          title="Total Users" 
          value={dashboardData.userStats.total}
        />
        <StatCard 
          icon={CheckCircle} 
          title="Active Users" 
          value={dashboardData.userStats.active}
          color="#10B981"
        />
        <StatCard 
          icon={AlertCircle} 
          title="Banned Users" 
          value={dashboardData.userStats.banned}
          color="#EF4444"
        />
        <StatCard 
          icon={TrendingUp} 
          title="New This Month" 
          value={dashboardData.userStats.newThisMonth}
          color="#3B82F6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Role */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Users by Role</h3>
          <div className="space-y-3">
            {dashboardData.userStats.byRole?.map((role) => (
              <div key={role._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="font-semibold text-slate-900 dark:text-white capitalize">{role._id}</span>
                <span className="px-3 py-1 bg-[#8B1A1A] text-white rounded-full text-sm font-bold">
                  {role.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By Gender */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Users by Gender</h3>
          <div className="space-y-3">
            {dashboardData.userStats.byGender?.map((gender) => (
              <div key={gender._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="font-semibold text-slate-900 dark:text-white capitalize">{gender._id || 'Not Specified'}</span>
                <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">
                  {gender.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Providers */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Sign-in Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {dashboardData.userStats.byAuthProvider?.map((provider) => (
            <div key={provider._id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white">{provider.count}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 capitalize">{provider._id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      {/* Sermons */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Sermons</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={BookOpen} title="Total Sermons" value={dashboardData.contentStats.sermons?.total} />
          <StatCard icon={Eye} title="Total Views" value={dashboardData.contentStats.sermons?.totalViews} color="#3B82F6" />
          <StatCard icon={Heart} title="Total Likes" value={dashboardData.contentStats.sermons?.totalLikes} color="#EC4899" />
          <StatCard icon={Video} title="Video Sermons" value={dashboardData.contentStats.sermons?.byType?.find(t => t._id === 'video')?.count || 0} color="#8B5CF6" />
        </div>
      </div>

      {/* Blogs */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Blogs</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={FileText} title="Total Blogs" value={dashboardData.contentStats.blogs?.total} />
          <StatCard icon={CheckCircle} title="Approved" value={dashboardData.contentStats.blogs?.approved} color="#10B981" />
          <StatCard icon={Clock} title="Pending" value={dashboardData.contentStats.blogs?.pending} color="#F59E0B" />
          <StatCard icon={Heart} title="Total Likes" value={dashboardData.contentStats.blogs?.totalLikes} color="#EC4899" />
        </div>
      </div>

      {/* Events */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={Calendar} title="Total Events" value={dashboardData.contentStats.events?.total} />
          <StatCard icon={Target} title="Upcoming" value={dashboardData.contentStats.events?.upcoming} color="#3B82F6" />
          <StatCard icon={UserCheck} title="Registrations" value={dashboardData.contentStats.events?.totalRegistrations} color="#10B981" />
          <StatCard icon={Users} title="Visitors" value={dashboardData.contentStats.events?.visitorRegistrations} color="#F59E0B" />
        </div>
      </div>

      {/* Gallery */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Camera} title="Total Photos" value={dashboardData.contentStats.gallery?.total} />
          <StatCard icon={Heart} title="Total Likes" value={dashboardData.contentStats.gallery?.totalLikes} color="#EC4899" />
          <StatCard icon={ImageIcon} title="Categories" value={dashboardData.contentStats.gallery?.byCategory?.length || 0} color="#8B5CF6" />
        </div>
      </div>
    </div>
  );

  const renderEngagement = () => (
    <div className="space-y-6">
      {/* Feedback */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={MessageSquare} title="Total Feedback" value={dashboardData.engagementStats.feedback?.total} />
          <StatCard icon={Clock} title="Pending" value={dashboardData.engagementStats.feedback?.byStatus?.find(s => s._id === 'pending')?.count || 0} color="#F59E0B" />
          <StatCard icon={CheckCircle} title="Reviewed" value={dashboardData.engagementStats.feedback?.byStatus?.find(s => s._id === 'reviewed')?.count || 0} color="#10B981" />
          <StatCard icon={Shield} title="Anonymous" value={dashboardData.engagementStats.feedback?.anonymous} color="#6B7280" />
        </div>
      </div>

      {/* Volunteers */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Volunteers</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={UserCheck} title="Total Volunteers" value={dashboardData.engagementStats.volunteers?.total} />
          <StatCard icon={CheckCircle} title="Approved" value={dashboardData.engagementStats.volunteers?.byStatus?.find(s => s._id === 'approved')?.count || 0} color="#10B981" />
          <StatCard icon={Clock} title="Pending" value={dashboardData.engagementStats.volunteers?.byStatus?.find(s => s._id === 'pending')?.count || 0} color="#F59E0B" />
          <StatCard icon={Award} title="Total Hours" value={dashboardData.engagementStats.volunteers?.totalHours} color="#8B5CF6" />
        </div>
      </div>

      {/* Livestreams */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Livestreams</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={MonitorPlay} title="Total Streams" value={dashboardData.engagementStats.livestreams?.total} />
          <StatCard icon={Eye} title="Total Views" value={dashboardData.engagementStats.livestreams?.totalViews} color="#3B82F6" />
          <StatCard icon={Activity} title="Live Now" value={dashboardData.engagementStats.livestreams?.byStatus?.find(s => s._id === 'live')?.count || 0} color="#EF4444" />
          <StatCard icon={Video} title="Archived" value={dashboardData.engagementStats.livestreams?.byStatus?.find(s => s._id === 'archived')?.count || 0} color="#6B7280" />
        </div>
      </div>
    </div>
  );

  const renderFinancial = () => (
    <div className="space-y-6">
      {/* Campaigns */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={Target} title="Total Campaigns" value={dashboardData.financialStats.campaigns?.total} />
          <StatCard icon={Activity} title="Active" value={dashboardData.financialStats.campaigns?.active} color="#10B981" />
          <StatCard icon={DollarSign} title="Total Goal" value={`KES ${formatNumber(dashboardData.financialStats.campaigns?.totalGoal)}`} color="#3B82F6" />
          <StatCard icon={TrendingUp} title="Total Raised" value={`KES ${formatNumber(dashboardData.financialStats.campaigns?.totalRaised)}`} color="#8B5CF6" />
        </div>
      </div>

      {/* Pledges */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Pledges</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={FileText} title="Total Pledges" value={dashboardData.financialStats.pledges?.total} />
          <StatCard icon={DollarSign} title="Total Amount" value={`KES ${formatNumber(dashboardData.financialStats.pledges?.totalAmount)}`} color="#10B981" />
          <StatCard icon={CheckCircle} title="Fulfilled" value={dashboardData.financialStats.pledges?.byStatus?.find(s => s._id === 'fulfilled')?.count || 0} color="#3B82F6" />
          <StatCard icon={TrendingUp} title="Fulfillment Rate" value={`${dashboardData.financialStats.pledges?.fulfillmentRate || 0}%`} color="#8B5CF6" />
        </div>
      </div>

      {/* Payments */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Payments</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={DollarSign} title="Total Payments" value={dashboardData.financialStats.payments?.total} />
          <StatCard icon={TrendingUp} title="Total Amount" value={`KES ${formatNumber(dashboardData.financialStats.payments?.totalAmount)}`} color="#10B981" />
          <StatCard icon={CheckCircle} title="Success Rate" value={`${dashboardData.financialStats.payments?.successRate || 0}%`} color="#3B82F6" />
          <StatCard icon={Activity} title="M-Pesa" value={dashboardData.financialStats.payments?.byMethod?.find(m => m._id === 'mpesa')?.count || 0} color="#10B981" />
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      {/* Audit Logs */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">System Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={Activity} title="Total Actions" value={dashboardData.systemStats.auditLogs?.totalActions} />
          <StatCard icon={CheckCircle} title="Success Rate" value={`${dashboardData.systemStats.auditLogs?.successRate || 0}%`} color="#10B981" />
          <StatCard icon={AlertCircle} title="Failed Logins" value={dashboardData.systemStats.auditLogs?.failedLogins} color="#EF4444" />
          <StatCard icon={Shield} title="Banned Users" value={dashboardData.systemStats.bannedUsers} color="#6B7280" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity size={20} className="text-[#8B1A1A]" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {dashboardData.systemStats.recentActivity?.slice(0, 10).map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{activity.action}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{activity.userName || activity.userEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </p>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activity.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {activity.statusCode}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top Actions</h3>
        <div className="space-y-3">
          {dashboardData.systemStats.auditLogs?.topActions?.map((action) => (
            <div key={action._id} className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{action._id}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-[#8B1A1A] h-2 rounded-full" 
                    style={{ width: `${calculatePercentage(action.count, dashboardData.systemStats.auditLogs?.totalActions)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white w-12 text-right">
                  {action.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Comprehensive system metrics and insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-[#6B1515] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-800 dark:text-red-200 font-semibold">{error}</p>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'content', label: 'Content', icon: BookOpen },
          { id: 'engagement', label: 'Engagement', icon: MessageSquare },
          { id: 'financial', label: 'Financial', icon: DollarSign },
          { id: 'system', label: 'System', icon: Activity }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeView === tab.id
                ? 'bg-[#8B1A1A] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active View */}
      <div>
        {activeView === 'overview' && renderOverview()}
        {activeView === 'users' && renderUsers()}
        {activeView === 'content' && renderContent()}
        {activeView === 'engagement' && renderEngagement()}
        {activeView === 'financial' && renderFinancial()}
        {activeView === 'system' && renderSystem()}
      </div>
    </div>
  );
}