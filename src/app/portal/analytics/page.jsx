// app/portal/analytics/page.jsx - PART 1: Imports, State & Overview Cards
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  BarChart3, Users, Calendar, BookOpen, MessageSquare, Heart, ImageIcon,
  TrendingUp, TrendingDown, Activity, Download, RefreshCw, Shield,
  CheckCircle, Clock, AlertCircle, Video
} from 'lucide-react';
import {
  getOverview, getUserAnalytics, getContentAnalytics, getEngagementAnalytics,
  getRecentActivity, getGrowthTrends, formatNumber, calculatePercentageChange,
  formatChartDate, getMonthName, getTrendColor, getTrendIcon
} from '@/services/api/analyticsService';
import Loader from '@/components/common/Loader';

/**
 * Analytics Dashboard
 * Comprehensive data visualization and insights
 */
export default function AnalyticsPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Data state
  const [overview, setOverview] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [contentAnalytics, setContentAnalytics] = useState(null);
  const [engagementAnalytics, setEngagementAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trends, setTrends] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, userData, contentData, engagementData, activityData, trendsData] = 
        await Promise.all([
          getOverview(),
          getUserAnalytics(),
          getContentAnalytics(),
          getEngagementAnalytics(),
          getRecentActivity(10),
          getGrowthTrends(timePeriod)
        ]);

      if (overviewData.success) setOverview(overviewData.stats);
      if (userData.success) setUserAnalytics(userData.analytics);
      if (contentData.success) setContentAnalytics(contentData.analytics);
      if (engagementData.success) setEngagementAnalytics(engagementData.analytics);
      if (activityData.success) setRecentActivity(activityData.activity);
      if (trendsData.success) setTrends(trendsData.trends);

    } catch (err) {
      console.error('[Analytics] Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [timePeriod]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]); // Now safe to include fetchAllData here


  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
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
          <BarChart3 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
           You don&apos;t have permission to view analytics
          </p>
        </div>
      </div>
    );
  }

  

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return <Loader fullScreen text="Loading analytics..." />;
  }

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
            Real-time insights and metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
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

      {/* Overview Stats Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                  Total Users
                </p>
                <p className="text-3xl font-black text-blue-900 dark:text-blue-100 mt-1">
                  {formatNumber(overview.users.total)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700 dark:text-blue-300">
                {overview.users.active} active
              </span>
              <span className="px-2 py-1 bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 rounded-full font-semibold">
                {overview.users.total > 0 ? Math.round((overview.users.active / overview.users.total) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Total Sermons */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-900 dark:text-green-200 uppercase tracking-wider">
                  Sermons
                </p>
                <p className="text-3xl font-black text-green-900 dark:text-green-100 mt-1">
                  {formatNumber(overview.sermons.total)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700 dark:text-green-300">
                {overview.sermons.recent} this month
              </span>
            </div>
          </div>

          {/* Total Events */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                  Events
                </p>
                <p className="text-3xl font-black text-purple-900 dark:text-purple-100 mt-1">
                  {formatNumber(overview.events.total)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-700 dark:text-purple-300">
                {overview.events.upcoming} upcoming
              </span>
            </div>
          </div>

          {/* Total Volunteers */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-orange-900 dark:text-orange-200 uppercase tracking-wider">
                  Volunteers
                </p>
                <p className="text-3xl font-black text-orange-900 dark:text-orange-100 mt-1">
                  {formatNumber(overview.volunteers.total)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-700 dark:text-orange-300">
                {overview.volunteers.pending} pending
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="text-slate-500" size={20} />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Feedback
              </p>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {formatNumber(overview.feedback.total)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon className="text-slate-500" size={20} />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Gallery
              </p>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {formatNumber(overview.gallery.total)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Video className="text-slate-500" size={20} />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Livestreams
              </p>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {formatNumber(overview.livestreams.total)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="text-slate-500" size={20} />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Blog Posts
              </p>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {formatNumber(overview.blogs.total)}
            </p>
          </div>
        </div>
      )}

      {/* Continued in Part 2 for Charts & Details... */}
      

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Role Distribution */}
        {userAnalytics && userAnalytics.roleDistribution && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users size={20} className="text-[#8B1A1A]" />
              User Role Distribution
            </h3>
            <div className="space-y-3">
              {userAnalytics.roleDistribution.map((role, idx) => {
                const total = userAnalytics.roleDistribution.reduce((sum, r) => sum + r.count, 0);
                const percentage = total > 0 ? Math.round((role.count / total) * 100) : 0;
                const colors = ['bg-[#8B1A1A]', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
                
                return (
                  <div key={role._id || idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                        {role._id || 'Unknown'}
                      </span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {role.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${colors[idx % colors.length]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sermon Categories */}
        {contentAnalytics && contentAnalytics.sermons?.byCategory && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-[#8B1A1A]" />
              Sermons by Category
            </h3>
            <div className="space-y-3">
              {contentAnalytics.sermons.byCategory.map((cat, idx) => {
                const total = contentAnalytics.sermons.byCategory.reduce((sum, c) => sum + c.count, 0);
                const percentage = total > 0 ? Math.round((cat.count / total) * 100) : 0;
                const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                
                return (
                  <div key={cat._id || idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {cat._id || 'Uncategorized'}
                      </span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {cat.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${colors[idx % colors.length]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Volunteer Ministry Distribution */}
        {engagementAnalytics && engagementAnalytics.volunteers?.byMinistry && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Heart size={20} className="text-[#8B1A1A]" />
              Volunteers by Ministry
            </h3>
            <div className="space-y-3">
              {engagementAnalytics.volunteers.byMinistry.map((ministry, idx) => {
                const total = engagementAnalytics.volunteers.byMinistry.reduce((sum, m) => sum + m.count, 0);
                const percentage = total > 0 ? Math.round((ministry.count / total) * 100) : 0;
                const colors = ['bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500', 'bg-cyan-500'];
                
                return (
                  <div key={ministry._id || idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {ministry._id || 'Unknown'}
                      </span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {ministry.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${colors[idx % colors.length]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback Categories */}
        {engagementAnalytics && engagementAnalytics.feedback?.byCategory && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-[#8B1A1A]" />
              Feedback by Category
            </h3>
            <div className="space-y-3">
              {engagementAnalytics.feedback.byCategory.map((cat, idx) => {
                const total = engagementAnalytics.feedback.byCategory.reduce((sum, c) => sum + c.count, 0);
                const percentage = total > 0 ? Math.round((cat.count / total) * 100) : 0;
                const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-pink-500'];
                
                return (
                  <div key={cat._id || idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                        {cat._id || 'Unknown'}
                      </span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {cat.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${colors[idx % colors.length]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Growth Trends */}
      {trends && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#8B1A1A]" />
            Growth Trends - {timePeriod === '7days' ? 'Last 7 Days' : timePeriod === '30days' ? 'Last 30 Days' : timePeriod === '6months' ? 'Last 6 Months' : 'Last Year'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* User Growth */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-blue-900 dark:text-blue-200">User Growth</span>
                <Users size={16} className="text-blue-600" />
              </div>
              <p className="text-2xl font-black text-blue-900 dark:text-blue-100">
                +{trends.users?.reduce((sum, item) => sum + item.count, 0) || 0}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                New registrations
              </p>
            </div>

            {/* Sermon Growth */}
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-green-900 dark:text-green-200">Sermon Growth</span>
                <BookOpen size={16} className="text-green-600" />
              </div>
              <p className="text-2xl font-black text-green-900 dark:text-green-100">
                +{trends.sermons?.reduce((sum, item) => sum + item.count, 0) || 0}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                New sermons
              </p>
            </div>

            {/* Event Growth */}
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-purple-900 dark:text-purple-200">Event Growth</span>
                <Calendar size={16} className="text-purple-600" />
              </div>
              <p className="text-2xl font-black text-purple-900 dark:text-purple-100">
                +{trends.events?.reduce((sum, item) => sum + item.count, 0) || 0}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                New events
              </p>
            </div>

            {/* Blog Growth */}
            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-orange-900 dark:text-orange-200">Blog Growth</span>
                <BookOpen size={16} className="text-orange-600" />
              </div>
              <p className="text-2xl font-black text-orange-900 dark:text-orange-100">
                +{trends.blogs?.reduce((sum, item) => sum + item.count, 0) || 0}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                New posts
              </p>
            </div>
          </div>

          {/* Simple Line Chart Visualization */}
          {trends.users && trends.users.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-white">User Registrations Timeline</h4>
              <div className="relative h-48 bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="flex items-end justify-around h-full gap-2">
                  {trends.users.slice(-12).map((item, idx) => {
                    const maxCount = Math.max(...trends.users.map(i => i.count));
                    const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                        <div className="relative w-full">
                          <div
                            className="w-full bg-gradient-to-t from-[#8B1A1A] to-red-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                            style={{ height: `${heightPercent}%`, minHeight: item.count > 0 ? '10px' : '0' }}
                            title={`${item.count} users`}
                          />
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                          {getMonthName(item._id.month)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Continued in Part 3 for Top Content & Recent Activity... */}
     

      {/* Top Performing Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sermons */}
        {contentAnalytics && contentAnalytics.sermons?.top && contentAnalytics.sermons.top.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#8B1A1A]" />
              Top Performing Sermons
            </h3>
            <div className="space-y-3">
              {contentAnalytics.sermons.top.slice(0, 5).map((sermon, idx) => (
                <div
                  key={sermon._id}
                  className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#8B1A1A] transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-[#8B1A1A] text-white font-bold rounded-full flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {sermon.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {sermon.pastor} • {new Date(sermon.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-blue-600">
                        <Activity size={14} />
                        {sermon.views || 0}
                      </span>
                      <span className="flex items-center gap-1 text-red-600">
                        <Heart size={14} />
                        {sermon.likes || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Blogs */}
        {contentAnalytics && contentAnalytics.blogs?.top && contentAnalytics.blogs.top.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#8B1A1A]" />
              Top Blog Posts
            </h3>
            <div className="space-y-3">
              {contentAnalytics.blogs.top.slice(0, 5).map((blog, idx) => (
                <div
                  key={blog._id}
                  className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#8B1A1A] transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white font-bold rounded-full flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {blog.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {blog.author?.name || 'Unknown'} • {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs text-red-600">
                      <Heart size={14} />
                      {blog.likes?.length || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      {recentActivity && recentActivity.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-[#8B1A1A]" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => {
              const getActivityColor = (action) => {
                if (action.includes('create')) return 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
                if (action.includes('update')) return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                if (action.includes('delete')) return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
                if (action.includes('login')) return 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
                return 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
              };

              const getActivityIcon = (action) => {
                if (action.includes('user')) return '👤';
                if (action.includes('sermon')) return '📖';
                if (action.includes('blog')) return '📝';
                if (action.includes('event')) return '📅';
                if (action.includes('gallery')) return '🖼️';
                if (action.includes('volunteer')) return '🤝';
                if (action.includes('feedback')) return '💬';
                if (action.includes('livestream')) return '📡';
                if (action.includes('login')) return '🔐';
                return '📌';
              };

              return (
                <div
                  key={activity._id || idx}
                  className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${getActivityColor(activity.action)}`}>
                    <span className="text-lg">{getActivityIcon(activity.action)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {activity.userName || activity.userEmail || 'System'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {activity.action.replace(/\./g, ' ').split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                          {activity.resourceName && (
                            <span className="font-semibold"> • {activity.resourceName}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className={activity.success ? 'text-green-600' : 'text-red-600'}>
                          {activity.success ? '✓' : '✗'}
                        </span>
                        {activity.method}
                      </span>
                      <span>{activity.endpoint}</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        activity.statusCode < 300 ? 'bg-green-100 text-green-700' :
                        activity.statusCode < 400 ? 'bg-blue-100 text-blue-700' :
                        activity.statusCode < 500 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {activity.statusCode}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      {engagementAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Volunteer Status */}
          {engagementAnalytics.volunteers?.byStatus && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-[#8B1A1A]" />
                Volunteer Applications
              </h4>
              <div className="space-y-2">
                {engagementAnalytics.volunteers.byStatus.map((status) => (
                  <div key={status._id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {status._id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      status._id === 'approved' ? 'bg-green-100 text-green-700' :
                      status._id === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      status._id === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {status.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Status */}
          {engagementAnalytics.feedback?.byStatus && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#8B1A1A]" />
                Feedback Status
              </h4>
              <div className="space-y-2">
                {engagementAnalytics.feedback.byStatus.map((status) => (
                  <div key={status._id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {status._id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      status._id === 'reviewed' ? 'bg-green-100 text-green-700' :
                      status._id === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      status._id === 'published' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {status.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Livestream Stats */}
          {engagementAnalytics.livestreams && engagementAnalytics.livestreams.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Video size={18} className="text-[#8B1A1A]" />
                Livestream Stats
              </h4>
              <div className="space-y-2">
                {engagementAnalytics.livestreams.map((stream) => (
                  <div key={stream._id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {stream._id}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-full text-xs font-bold">
                      {stream.count}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Total Views</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatNumber(engagementAnalytics.livestreams.reduce((sum, s) => sum + (s.totalViews || 0), 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}