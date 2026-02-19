'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  BarChart3, Users, Calendar, BookOpen, MessageSquare, Heart, ImageIcon,
  TrendingUp, TrendingDown, Activity, RefreshCw, Shield,
  CheckCircle, Clock, AlertCircle, Video, DollarSign, Mail, Bell,
  UserCheck, Award, Eye, Target, FileText, Camera, MonitorPlay
} from 'lucide-react';
import Loader from '@/components/common/Loader';
import api from '@/lib/api';

// ─────────────────────────────────────────────────────────────
// SHARED HELPERS  (used by both the dashboard and ContentView)
// ─────────────────────────────────────────────────────────────
const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000)     return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

const calculatePercentage = (part, total) => {
  if (!total) return 0;
  return ((part / total) * 100).toFixed(1);
};

const getChangeColor = (v) =>
  v > 0 ? 'text-green-600' : v < 0 ? 'text-red-600' : 'text-slate-600';

const getChangeIcon = (v) =>
  v > 0 ? <TrendingUp size={16} /> : v < 0 ? <TrendingDown size={16} /> : <Activity size={16} />;

// ─────────────────────────────────────────────────────────────
// SHARED STAT CARD
// ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = '#8B1A1A' }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center"
           style={{ backgroundColor: `${color}20` }}>
        <Icon size={24} style={{ color }} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 ${getChangeColor(trend)}`}>
          {getChangeIcon(trend)}
          <span className="text-sm font-bold">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">{title}</h3>
    <p className="text-3xl font-black text-slate-900 dark:text-white">{formatNumber(value)}</p>
    {subtitle && (
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// CONTENT VIEW — its own component so useState works correctly
// ─────────────────────────────────────────────────────────────
function ContentView({ contentStats }) {
  // These hooks are now INSIDE a real React component ✅
  const [sermonMetric, setSermonMetric] = useState('views'); // 'views' | 'likes'
  const [sermonPeriod, setSermonPeriod] = useState('all');   // 'all' | 'week' | 'month' | 'year'

  const s = contentStats?.sermons || {};

  // Pick the right leaderboard array based on current filters
  const getSermonRankingData = () => {
    if (sermonMetric === 'views') {
      if (sermonPeriod === 'week')  return s.topByViewsWeek  || [];
      if (sermonPeriod === 'month') return s.topByViewsMonth || [];
      if (sermonPeriod === 'year')  return s.topByViewsYear  || [];
      return s.topByViews || [];
    } else {
      if (sermonPeriod === 'week')  return s.topByLikesWeek  || [];
      if (sermonPeriod === 'month') return s.topByLikesMonth || [];
      if (sermonPeriod === 'year')  return s.topByLikesYear  || [];
      return s.topByLikes || [];
    }
  };

  const sermonRankingData = getSermonRankingData();
  const maxSermonValue = sermonRankingData.length
    ? Math.max(...sermonRankingData.map(sr => sermonMetric === 'views' ? (sr.views || 0) : (sr.likes || 0)), 1)
    : 1;

  const topGallery   = contentStats?.gallery?.topByLikes || [];
  const topEvents    = contentStats?.events?.topByRegistrations || [];
  const topBlogs     = contentStats?.blogs?.topByLikes || [];
  const catPerf      = contentStats?.sermons?.categoryPerformance || [];

  const maxGalleryLikes = topGallery.length
    ? Math.max(...topGallery.map(g => g.likes || 0), 1) : 1;
  const maxEventRegs = topEvents.length
    ? Math.max(...topEvents.map(e => e.totalRegistrations || 0), 1) : 1;
  const maxBlogLikes = topBlogs.length
    ? Math.max(...topBlogs.map(b => Array.isArray(b.likes) ? b.likes.length : (b.likes || 0)), 1) : 1;

  // Small reusable pill button
  const TabBtn = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
        active
          ? 'bg-[#8B1A1A] text-white'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
      }`}
    >
      {children}
    </button>
  );

  const medal = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

  return (
    <div className="space-y-8">

      {/* ── SERMONS OVERVIEW CARDS ─────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-[#8B1A1A]" /> Sermons
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} title="Total Sermons" value={s.total} />
          <StatCard icon={Eye}      title="Total Views"   value={s.totalViews}  color="#3B82F6" />
          <StatCard icon={Heart}    title="Total Likes"   value={s.totalLikes}  color="#EC4899" />
          <StatCard icon={Video}    title="Video Sermons"
            value={s.byType?.find(t => t._id === 'video')?.count || 0}
            color="#8B5CF6"
          />
        </div>
      </section>

      {/* ── TOP 10 SERMONS LEADERBOARD ─────────────────────────── */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-[#8B1A1A]" /> Top 10 Sermons
          </h3>

          <div className="flex flex-wrap gap-2">
            {/* Metric toggle */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
              <TabBtn active={sermonMetric === 'views'} onClick={() => setSermonMetric('views')}>
                👁 Views
              </TabBtn>
              <TabBtn active={sermonMetric === 'likes'} onClick={() => setSermonMetric('likes')}>
                ❤️ Likes
              </TabBtn>
            </div>
            {/* Period filter */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
              {['all', 'week', 'month', 'year'].map(p => (
                <TabBtn key={p} active={sermonPeriod === p} onClick={() => setSermonPeriod(p)}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </TabBtn>
              ))}
            </div>
          </div>
        </div>

        {sermonRankingData.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p>No sermons found for this period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sermonRankingData.map((sermon, idx) => {
              const value = sermonMetric === 'views' ? (sermon.views || 0) : (sermon.likes || 0);
              const pct   = Math.round((value / maxSermonValue) * 100);
              return (
                <div key={sermon._id} className="flex items-center gap-3">
                  <span className="w-8 text-center font-black text-slate-500 text-sm shrink-0">
                    {medal(idx)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate pr-3">
                        {sermon.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-400 capitalize hidden sm:block">
                          {sermon.category}
                        </span>
                        <span className={`text-sm font-black ${sermonMetric === 'views' ? 'text-blue-600' : 'text-pink-600'}`}>
                          {formatNumber(value)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          sermonMetric === 'views' ? 'bg-blue-500' : 'bg-pink-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── SERMON CATEGORY PERFORMANCE TABLE ─────────────────── */}
      {catPerf.length > 0 && (
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-[#8B1A1A]" /> Category Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                  <th className="pb-3 px-2 font-semibold text-slate-500 dark:text-slate-400">Category</th>
                  <th className="pb-3 px-2 font-semibold text-slate-500 dark:text-slate-400 text-right">Sermons</th>
                  <th className="pb-3 px-2 font-semibold text-blue-500 text-right">Views</th>
                  <th className="pb-3 px-2 font-semibold text-pink-500 text-right">Likes</th>
                  <th className="pb-3 px-2 font-semibold text-slate-500 dark:text-slate-400 text-right">Avg Views</th>
                </tr>
              </thead>
              <tbody>
                {catPerf.map((cat, idx) => (
                  <tr key={cat._id || idx}
                      className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-2 font-semibold text-slate-900 dark:text-white capitalize">
                      {cat._id || 'Uncategorized'}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-300">{cat.count}</td>
                    <td className="py-3 px-2 text-right text-blue-600 font-bold">{formatNumber(cat.totalViews)}</td>
                    <td className="py-3 px-2 text-right text-pink-600 font-bold">{formatNumber(cat.totalLikes)}</td>
                    <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-300">
                      {Math.round(cat.avgViews || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── BLOGS ─────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText size={20} className="text-[#8B1A1A]" /> Blogs
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={FileText}    title="Total Blogs" value={contentStats?.blogs?.total} />
          <StatCard icon={CheckCircle} title="Approved"    value={contentStats?.blogs?.approved} color="#10B981" />
          <StatCard icon={Clock}       title="Pending"     value={contentStats?.blogs?.pending}  color="#F59E0B" />
          <StatCard icon={Heart}       title="Total Likes" value={contentStats?.blogs?.totalLikes} color="#EC4899" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart size={18} className="text-pink-500" /> Top 10 Blogs by Likes
          </h3>
          {topBlogs.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No blog likes data yet</p>
          ) : (
            <div className="space-y-4">
              {topBlogs.map((blog, idx) => {
                const likes = Array.isArray(blog.likes) ? blog.likes.length : (blog.likes || 0);
                const pct   = Math.round((likes / maxBlogLikes) * 100);
                return (
                  <div key={blog._id} className="flex items-center gap-3">
                    <span className="w-6 text-xs font-black text-slate-400 shrink-0">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1.5">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate pr-3">
                          {blog.title}
                        </p>
                        <span className="text-sm font-black text-pink-600 shrink-0">{likes} ❤️</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                        <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── EVENTS ────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-[#8B1A1A]" /> Events
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Calendar}  title="Total Events"   value={contentStats?.events?.total} />
          <StatCard icon={Target}    title="Upcoming"       value={contentStats?.events?.upcoming}           color="#3B82F6" />
          <StatCard icon={UserCheck} title="Registrations"  value={contentStats?.events?.totalRegistrations}  color="#10B981" />
          <StatCard icon={Users}     title="Visitors"       value={contentStats?.events?.visitorRegistrations} color="#F59E0B" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award size={18} className="text-amber-500" /> Top Events by Registrations
          </h3>
          {topEvents.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No event registrations yet</p>
          ) : (
            <div className="space-y-4">
              {topEvents.map((event, idx) => {
                const pct     = Math.round((event.totalRegistrations / maxEventRegs) * 100);
                const fillPct = event.capacity
                  ? Math.min(Math.round((event.totalRegistrations / event.capacity) * 100), 100)
                  : null;
                return (
                  <div key={event._id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-black text-slate-400 shrink-0">{idx + 1}.</span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {event.title}
                        </p>
                      </div>
                      <span className="text-lg font-black text-green-600 shrink-0">
                        {event.totalRegistrations}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                      <span>👥 {event.memberRegistrations} members</span>
                      <span>🏃 {event.visitorRegistrations} visitors</span>
                      {fillPct !== null && (
                        <span className={fillPct >= 90 ? 'text-red-500 font-bold' : ''}>
                          {fillPct}% capacity
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all"
                           style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── GALLERY ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Camera size={20} className="text-[#8B1A1A]" /> Gallery
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard icon={Camera}    title="Total Photos" value={contentStats?.gallery?.total} />
          <StatCard icon={Heart}     title="Total Likes"  value={contentStats?.gallery?.totalLikes} color="#EC4899" />
          <StatCard icon={ImageIcon} title="Categories"   value={contentStats?.gallery?.byCategory?.length || 0} color="#8B5CF6" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart size={18} className="text-pink-500" /> Top 15 Photos by Likes
          </h3>
          {topGallery.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No gallery likes yet</p>
          ) : (
            <div className="space-y-3">
              {topGallery.map((photo, idx) => {
                const likes = photo.likes || 0;
                const pct   = Math.round((likes / maxGalleryLikes) * 100);
                return (
                  <div key={photo._id} className="flex items-center gap-3">
                    <span className="w-8 text-center text-sm font-black text-slate-400 shrink-0">
                      {medal(idx)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                          {photo.title || photo.caption || `Photo ${idx + 1}`}
                          <span className="ml-1 text-xs text-slate-400 capitalize">
                            ({photo.category})
                          </span>
                        </p>
                        <span className="text-sm font-black text-pink-600 shrink-0">
                          {likes} ❤️
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                        <div className="bg-pink-400 h-1.5 rounded-full"
                             style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// USERS VIEW
// ─────────────────────────────────────────────────────────────
const renderUsers = (userStats, totalUsers, formatNumber, calculatePercentage) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard icon={Users}       title="Total Users"    value={userStats.total} />
      <StatCard icon={CheckCircle} title="Active Users"   value={userStats.active}      color="#10B981" />
      <StatCard icon={AlertCircle} title="Banned Users"   value={userStats.banned}      color="#EF4444" />
      <StatCard icon={TrendingUp}  title="New This Month" value={userStats.newThisMonth} color="#3B82F6" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Users by Role</h3>
        <div className="space-y-3">
          {userStats.byRole?.map((role) => (
            <div key={role._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <span className="font-semibold text-slate-900 dark:text-white capitalize">{role._id}</span>
              <span className="px-3 py-1 bg-[#8B1A1A] text-white rounded-full text-sm font-bold">{role.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Users by Gender</h3>
        <div className="space-y-3">
          {userStats.byGender?.map((gender) => (
            <div key={gender._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <span className="font-semibold text-slate-900 dark:text-white capitalize">{gender._id || 'Not Specified'}</span>
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">{gender.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Sign-in Methods</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userStats.byAuthProvider?.map((provider) => (
          <div key={provider._id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{provider.count}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 capitalize">{provider._id}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const { user }           = useAuth();
  const { hasPermission }  = usePermissions();

  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [timeRange,  setTimeRange]  = useState('30days');

  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0, totalSermons: 0, totalBlogs: 0, totalEvents: 0,
    totalGallery: 0, totalFeedback: 0, totalVolunteers: 0, totalDonations: 0,
    userStats:          { total: 0, active: 0, banned: 0, newThisMonth: 0, byRole: [], byGender: [], byAuthProvider: [], growthTrend: [] },
    contentStats:       { sermons: { total: 0, byCategory: [], byType: [], totalLikes: 0, totalViews: 0, recentTrend: [], topByViews: [], topByLikes: [], topByViewsWeek: [], topByViewsMonth: [], topByViewsYear: [], topByLikesWeek: [], topByLikesMonth: [], topByLikesYear: [], categoryPerformance: [] }, blogs: { total: 0, approved: 0, pending: 0, byCategory: [], totalLikes: 0, recentTrend: [], topByLikes: [] }, gallery: { total: 0, byCategory: [], totalLikes: 0, recentTrend: [], topByLikes: [] }, events: { total: 0, upcoming: 0, past: 0, totalRegistrations: 0, memberRegistrations: 0, visitorRegistrations: 0, recentTrend: [], topByRegistrations: [] } },
    engagementStats:    { feedback: { total: 0, byCategory: [], byStatus: [], anonymous: 0, avgResponseTime: 0 }, volunteers: { total: 0, byStatus: [], byMinistry: [], totalHours: 0 }, livestreams: { total: 0, byStatus: [], totalViews: 0, avgDuration: 0 } },
    financialStats:     { campaigns: { total: 0, active: 0, completed: 0, byType: [], totalGoal: 0, totalRaised: 0, completionRate: 0 }, pledges: { total: 0, totalAmount: 0, byStatus: [], fulfillmentRate: 0 }, payments: { total: 0, totalAmount: 0, byMethod: [], successRate: 0, monthlyTrend: [] } },
    communicationStats: { emails: { totalSent: 0, successRate: 0, byType: [] }, announcements: { total: 0, active: 0, byPriority: [], avgReadRate: 0 } },
    systemStats:        { auditLogs: { totalActions: 0, successRate: 0, topActions: [], failedLogins: 0 }, bannedUsers: 0, recentActivity: [] },
  });

  // ── fetchers ──
  const fetch = (path) => api.get(path).then(r => r.data.success ? r.data.data : null).catch(() => null);

  const loadAllAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [overview, users, content, engagement, financial, communication, system] = await Promise.all([
        fetch('/analytics/overview'),
        fetch('/analytics/users'),
        fetch('/analytics/content'),
        fetch('/analytics/engagement'),
        fetch('/analytics/financial'),
        fetch('/analytics/communication'),
        fetch('/analytics/system'),
      ]);
      setDashboardData({
        totalUsers:      overview?.totalUsers      || 0,
        totalSermons:    overview?.totalSermons    || 0,
        totalBlogs:      overview?.totalBlogs      || 0,
        totalEvents:     overview?.totalEvents     || 0,
        totalGallery:    overview?.totalGallery    || 0,
        totalFeedback:   overview?.totalFeedback   || 0,
        totalVolunteers: overview?.totalVolunteers || 0,
        totalDonations:  overview?.totalDonations  || 0,
        userStats:          users          || {},
        contentStats:       content        || {},
        engagementStats:    engagement     || {},
        financialStats:     financial      || {},
        communicationStats: communication  || {},
        systemStats:        system         || {},
      });
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { loadAllAnalytics(); }, [loadAllAnalytics]);

  const handleRefresh = async () => { setRefreshing(true); await loadAllAnalytics(); setRefreshing(false); };

  const canViewAnalytics = hasPermission('view:analytics');

  if (!canViewAnalytics) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-slate-600 dark:text-slate-400">You don't have permission to view analytics</p>
      </div>
    </div>
  );

  if (loading) return <Loader fullScreen text="Loading analytics dashboard..." />;

  // ── overview render (inline is fine here — no hooks) ──
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users}      title="Total Users"     value={dashboardData.totalUsers}     subtitle={`${dashboardData.userStats.active} active`} trend={12.5} />
        <StatCard icon={BookOpen}   title="Sermons"         value={dashboardData.totalSermons}   subtitle={`${dashboardData.contentStats.sermons?.totalViews || 0} views`} trend={8.3} color="#3B82F6" />
        <StatCard icon={DollarSign} title="Total Donations" value={`KES ${formatNumber(dashboardData.totalDonations)}`} subtitle={`${dashboardData.financialStats.campaigns?.active || 0} active campaigns`} trend={15.7} color="#10B981" />
        <StatCard icon={Calendar}   title="Events"          value={dashboardData.totalEvents}    subtitle={`${dashboardData.contentStats.events?.totalRegistrations || 0} registrations`} trend={-2.1} color="#F59E0B" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={FileText}    title="Blog Posts"     value={dashboardData.totalBlogs}     subtitle={`${dashboardData.contentStats.blogs?.pending || 0} pending approval`} color="#8B5CF6" />
        <StatCard icon={Camera}      title="Gallery Photos" value={dashboardData.totalGallery}   subtitle={`${dashboardData.contentStats.gallery?.totalLikes || 0} total likes`} color="#EC4899" />
        <StatCard icon={MessageSquare} title="Feedback"     value={dashboardData.totalFeedback}  subtitle={`${dashboardData.engagementStats.feedback?.anonymous || 0} anonymous`} color="#06B6D4" />
        <StatCard icon={UserCheck}   title="Volunteers"     value={dashboardData.totalVolunteers} subtitle={`${dashboardData.engagementStats.volunteers?.totalHours || 0} total hours`} color="#14B8A6" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-[#8B1A1A]" /> User Distribution
          </h3>
          <div className="space-y-3">
            {dashboardData.userStats.byRole?.map((role) => (
              <div key={role._id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">{role._id}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-[#8B1A1A] h-2 rounded-full"
                         style={{ width: `${calculatePercentage(role.count, dashboardData.totalUsers)}%` }} />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white w-12 text-right">{role.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-[#8B1A1A]" /> Content Performance
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Sermons', value: dashboardData.contentStats.sermons?.totalViews || 0, unit: 'views', color: 'bg-blue-500', pct: 75 },
              { label: 'Blogs',   value: dashboardData.contentStats.blogs?.totalLikes   || 0, unit: 'likes', color: 'bg-purple-500', pct: 60 },
              { label: 'Gallery', value: dashboardData.contentStats.gallery?.totalLikes || 0, unit: 'likes', color: 'bg-pink-500', pct: 50 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formatNumber(item.value)} {item.unit}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEngagement = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={MessageSquare} title="Total Feedback" value={dashboardData.engagementStats.feedback?.total} />
          <StatCard icon={Clock}         title="Pending"        value={dashboardData.engagementStats.feedback?.byStatus?.find(s => s._id === 'pending')?.count || 0} color="#F59E0B" />
          <StatCard icon={CheckCircle}   title="Reviewed"       value={dashboardData.engagementStats.feedback?.byStatus?.find(s => s._id === 'reviewed')?.count || 0} color="#10B981" />
          <StatCard icon={Shield}        title="Anonymous"      value={dashboardData.engagementStats.feedback?.anonymous} color="#6B7280" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Volunteers</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={UserCheck}   title="Total Volunteers" value={dashboardData.engagementStats.volunteers?.total} />
          <StatCard icon={CheckCircle} title="Approved"         value={dashboardData.engagementStats.volunteers?.byStatus?.find(s => s._id === 'approved')?.count || 0} color="#10B981" />
          <StatCard icon={Clock}       title="Pending"          value={dashboardData.engagementStats.volunteers?.byStatus?.find(s => s._id === 'pending')?.count || 0} color="#F59E0B" />
          <StatCard icon={Award}       title="Total Hours"      value={dashboardData.engagementStats.volunteers?.totalHours} color="#8B5CF6" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Livestreams</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={MonitorPlay} title="Total Streams" value={dashboardData.engagementStats.livestreams?.total} />
          <StatCard icon={Eye}         title="Total Views"   value={dashboardData.engagementStats.livestreams?.totalViews} color="#3B82F6" />
          <StatCard icon={Activity}    title="Live Now"      value={dashboardData.engagementStats.livestreams?.byStatus?.find(s => s._id === 'live')?.count || 0} color="#EF4444" />
          <StatCard icon={Video}       title="Archived"      value={dashboardData.engagementStats.livestreams?.byStatus?.find(s => s._id === 'archived')?.count || 0} color="#6B7280" />
        </div>
      </div>
    </div>
  );

  const renderFinancial = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={Target}     title="Total Campaigns" value={dashboardData.financialStats.campaigns?.total} />
          <StatCard icon={Activity}   title="Active"          value={dashboardData.financialStats.campaigns?.active} color="#10B981" />
          <StatCard icon={DollarSign} title="Total Goal"      value={`KES ${formatNumber(dashboardData.financialStats.campaigns?.totalGoal)}`} color="#3B82F6" />
          <StatCard icon={TrendingUp} title="Total Raised"    value={`KES ${formatNumber(dashboardData.financialStats.campaigns?.totalRaised)}`} color="#8B5CF6" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Pledges</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={FileText}    title="Total Pledges" value={dashboardData.financialStats.pledges?.total} />
          <StatCard icon={DollarSign}  title="Total Amount"  value={`KES ${formatNumber(dashboardData.financialStats.pledges?.totalAmount)}`} color="#10B981" />
          <StatCard icon={CheckCircle} title="Fulfilled"     value={dashboardData.financialStats.pledges?.byStatus?.find(s => s._id === 'fulfilled')?.count || 0} color="#3B82F6" />
          <StatCard icon={TrendingUp}  title="Fulfillment %"  value={`${dashboardData.financialStats.pledges?.fulfillmentRate || 0}%`} color="#8B5CF6" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Payments</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={DollarSign}  title="Total Payments" value={dashboardData.financialStats.payments?.total} />
          <StatCard icon={TrendingUp}  title="Total Amount"   value={`KES ${formatNumber(dashboardData.financialStats.payments?.totalAmount)}`} color="#10B981" />
          <StatCard icon={CheckCircle} title="Success Rate"   value={`${dashboardData.financialStats.payments?.successRate || 0}%`} color="#3B82F6" />
          <StatCard icon={Activity}    title="M-Pesa"         value={dashboardData.financialStats.payments?.byMethod?.find(m => m._id === 'mpesa')?.count || 0} color="#10B981" />
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={Activity}    title="Total Actions" value={dashboardData.systemStats.auditLogs?.totalActions} />
        <StatCard icon={CheckCircle} title="Success Rate"  value={`${dashboardData.systemStats.auditLogs?.successRate || 0}%`} color="#10B981" />
        <StatCard icon={AlertCircle} title="Failed Logins" value={dashboardData.systemStats.auditLogs?.failedLogins} color="#EF4444" />
        <StatCard icon={Shield}      title="Banned Users"  value={dashboardData.systemStats.bannedUsers} color="#6B7280" />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity size={20} className="text-[#8B1A1A]" /> Recent Activity
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
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${activity.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {activity.statusCode}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview',    label: 'Overview',    icon: BarChart3      },
    { id: 'users',       label: 'Users',        icon: Users          },
    { id: 'content',     label: 'Content',      icon: BookOpen       },
    { id: 'engagement',  label: 'Engagement',   icon: MessageSquare  },
    { id: 'financial',   label: 'Financial',    icon: DollarSign     },
    { id: 'system',      label: 'System',       icon: Activity       },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Comprehensive system metrics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#8B1A1A] outline-none"
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

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-800 dark:text-red-200 font-semibold">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
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

      {/* Active view */}
      <div>
        {activeView === 'overview'   && renderOverview()}
        {activeView === 'users'      && renderUsers(dashboardData.userStats, dashboardData.totalUsers, formatNumber, calculatePercentage)}
        {/* ↓ ContentView is a real component, so useState works inside it */}
        {activeView === 'content'    && <ContentView contentStats={dashboardData.contentStats} />}
        {activeView === 'engagement' && renderEngagement()}
        {activeView === 'financial'  && renderFinancial()}
        {activeView === 'system'     && renderSystem()}
      </div>
    </div>
  );
}