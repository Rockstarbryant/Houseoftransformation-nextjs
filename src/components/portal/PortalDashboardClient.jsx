'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

// ── Real service imports ────────────────────────────────────────────────────
import {
  getOverview,
  getUserAnalytics,
  getContentAnalytics,
  getFinancialAnalytics,
  getEngagementAnalytics,
  getSystemAnalytics,
  formatNumber,
  getMonthName,
} from '@/services/api/analyticsService';
import { getEvents } from '@/services/api/eventService';
import { feedbackService } from '@/services/api/feedbackService';
import { getMyProfile } from '@/services/api/userService';

// ── Charts ──────────────────────────────────────────────────────────────────
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ── Icons ───────────────────────────────────────────────────────────────────
import {
  Calendar, BookOpen, ImageIcon, Heart, Users, Shield,
  BarChart3, ArrowRight, Home, TrendingUp, Bell, User,
  ChevronLeft, ChevronRight, CheckCheck, Info, AlertTriangle,
  Zap, MessageSquare, DollarSign, Settings, Bookmark,
  HandHeart, ChevronUp, ChevronDown, AlertCircle, Mic,
  Star, RefreshCw, Mail, Play, FileText, Clock, Activity,
  Video, Volume2,
} from 'lucide-react';

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS & HELPERS
// ════════════════════════════════════════════════════════════════════════════

const HOT_RED = '#8B1A1A';

/** Maps section icon strings (from usePermissions) to Lucide components */
const ICON_MAP = {
  User: User, Bookmark: Bookmark, Bell: Bell, Calendar: Calendar,
  BookOpen: BookOpen, ImageIcon: ImageIcon, Heart: Heart, Users: Users,
  Mail: Mail, Zap: Zap, Newspaper: FileText, Shield: Shield,
  MessageSquare: MessageSquare, Play: Play, BarChart3: BarChart3,
  Megaphone: Volume2,
};

/** Priority styling for announcements — kept identical to original */
const PRIORITY_CONFIG = {
  low:    { icon: Info,          colorClass: 'text-blue-500',  bgClass: 'bg-blue-50 dark:bg-blue-950/40',   label: 'Low'    },
  normal: { icon: Bell,          colorClass: 'text-slate-500', bgClass: 'bg-slate-50 dark:bg-slate-700/50', label: 'Normal' },
  high:   { icon: AlertTriangle, colorClass: 'text-amber-500', bgClass: 'bg-amber-50 dark:bg-amber-950/40', label: 'High'   },
  urgent: { icon: Zap,           colorClass: 'text-red-600',   bgClass: 'bg-red-50 dark:bg-red-950/40',     label: 'Urgent' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatRelativeDate(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 60)  return `${m}m ago`;
  if (h < 24)  return `${h}h ago`;
  if (d <  7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

// ════════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, sub, trend, color = HOT_RED, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 animate-pulse">
        <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-xl mb-3" />
        <div className="h-7 w-16 bg-slate-100 dark:bg-slate-700 rounded mb-2" />
        <div className="h-3 w-24 bg-slate-50 dark:bg-slate-700 rounded" />
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}18` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend != null && (
          <span className={`flex items-center gap-0.5 text-xs font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value ?? '—'}</p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ title, action, actionLabel }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
      {action && (
        <button onClick={action} className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: HOT_RED }}>
          {actionLabel} <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

function ChartSkeleton({ height = 200 }) {
  return <div className="animate-pulse bg-slate-100 dark:bg-slate-700 rounded-xl" style={{ height }} />;
}

function ErrorRetry({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <AlertCircle size={24} className="text-slate-300 mb-2" />
      <p className="text-sm text-slate-400">{message || 'Failed to load data'}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 flex items-center gap-1.5 text-xs font-bold" style={{ color: HOT_RED }}>
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold capitalize">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 0 — HOME
// Fetches: getOverview, getEvents(upcoming), feedbackService.getStats,
//          getSystemAnalytics (recent activity)
// ════════════════════════════════════════════════════════════════════════════

function HomeTab({ user, sections, router, permissions }) {
  const [overview,      setOverview]      = useState(null);
  const [events,        setEvents]        = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [activity,      setActivity]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [errors,        setErrors]        = useState({});

  const firstName      = user?.name?.split(' ')[0] || 'Member';
  const roleName       = user?.role?.name || 'Member';
  const canFeedback    = permissions.canReadAnyFeedback?.();
  const canEvents      = permissions.canManageEvents?.();

  const load = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const results = await Promise.allSettled([
      getOverview(),
      getEvents({ limit: 3, status: 'upcoming' }),
      canFeedback ? feedbackService.getStats() : Promise.resolve(null),
      getSystemAnalytics(),
    ]);

    // All service functions return response.data. Backend may additionally
    // wrap in { success, data: {...} } — unwrap both shapes.
    const unwrap = (v) => v?.data ?? v ?? {};

    // ── DEV: log raw shapes so we know what backend returns ──
    if (process.env.NODE_ENV === 'development') {
      console.group('[Dashboard HomeTab] Raw API responses');
      console.log('overview raw:',  results[0].status === 'fulfilled' ? results[0].value : results[0].reason);
      console.log('events raw:',    results[1].status === 'fulfilled' ? results[1].value : results[1].reason);
      console.log('feedback raw:',  results[2].status === 'fulfilled' ? results[2].value : results[2].reason);
      console.log('system raw:',    results[3].status === 'fulfilled' ? results[3].value : results[3].reason);
      console.groupEnd();
    }

    // overview
    if (results[0].status === 'fulfilled') {
      setOverview(unwrap(results[0].value));
    } else setErrors(e => ({ ...e, overview: true }));

    // events — shape: { events: [], total } OR { data: { events: [] } }
    if (results[1].status === 'fulfilled') {
      const raw = results[1].value;
      const v   = raw?.data ?? raw;
      setEvents(Array.isArray(v?.events) ? v.events : Array.isArray(v) ? v : []);
    } else setErrors(e => ({ ...e, events: true }));

    // feedback stats
    if (results[2].status === 'fulfilled' && results[2].value) {
      setFeedbackStats(unwrap(results[2].value));
    }

    // system activity
    if (results[3].status === 'fulfilled') {
      const sys  = unwrap(results[3].value);
      const acts = sys.recentActivity ?? sys.auditLogs ?? sys.activity ?? [];
      setActivity(Array.isArray(acts) ? acts.slice(0, 8) : []);
    }

    setLoading(false);
  }, [canFeedback]);

  useEffect(() => { load(); }, [load]);

  const ov = overview ?? {};

  // Derive stat values defensively — the backend may nest them differently
  const totalMembers   = ov.totalUsers       ?? ov.users?.total     ?? ov.totalMembers;
  const upcomingEvents = ov.upcomingEvents   ?? ov.events?.upcoming ?? ov.totalEvents;
  const pendingFb      = ov.pendingFeedback  ?? ov.feedback?.pending ?? ov.totalFeedback;
  const totalAnn       = ov.totalAnnouncements ?? ov.announcements?.total;

  return (
    <div className="space-y-6 pb-6">

      {/* ── 2026 Recompense hero banner ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1a0e45 0%,#2e1a72 50%,#1a0e45 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 70% at 80% 50%,rgba(120,60,220,.35) 0%,transparent 70%)',
        }} />
        <div className="relative z-10 flex items-center justify-between p-5 md:p-6">
          <div>
            <p className="text-purple-300 text-xs font-semibold tracking-widest uppercase mb-1">{getGreeting()}</p>
            <h1 className="text-white text-2xl md:text-3xl font-black leading-tight">{firstName}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: `${HOT_RED}cc`, color: 'white' }}>
                {roleName}
              </span>
              <span className="text-purple-300 text-[11px]">
                {new Date().toLocaleDateString('en-KE', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              </span>
            </div>
          </div>

          {/* Compact 2026 motif */}
          <div className="flex flex-col items-center select-none shrink-0" style={{ fontFamily: 'Georgia,serif' }}>
            <div style={{ fontSize:'clamp(2rem,6vw,3.5rem)', fontWeight:900, lineHeight:1,
              background:'linear-gradient(180deg,#ffe86a 0%,#f5a623 60%,#c84a00 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              20
            </div>
            <div style={{ fontSize:'clamp(2.8rem,8vw,5rem)', fontWeight:900, lineHeight:.9,
              color:'white', textShadow:'0 4px 20px rgba(0,0,0,.8)', marginTop:'-.2em' }}>
              26
            </div>
            <div style={{ fontSize:'.45rem', letterSpacing:'.18em', color:'#00d4d4',
              fontFamily:'sans-serif', fontWeight:700, marginTop:'3px', textTransform:'uppercase' }}>
              Recompense
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard loading={loading} icon={Users}         label="Total Members"       value={formatNumber(totalMembers)}   color="#8B1A1A" />
        <StatCard loading={loading} icon={Calendar}      label="Upcoming Events"     value={formatNumber(upcomingEvents)} color="#2980b9" />
        <StatCard loading={loading} icon={MessageSquare} label="Pending Feedback"    value={formatNumber(pendingFb)}      color="#8e44ad" />
        <StatCard loading={loading} icon={Bell}          label="Announcements"       value={formatNumber(totalAnn)}       color="#e74c3c" />
      </div>

      {/* ── Quick actions + Activity feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

        {/* Quick actions */}
        <div className="lg:col-span-3">
          <SectionHeader title="Quick Actions" />
          {sections.length <= 1 ? (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-100 dark:border-slate-700">
              <p className="text-sm text-slate-500">No additional features assigned. Contact an admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sections.map((section) => {
                const Icon = ICON_MAP[section.icon] ?? Shield;
                return (
                  <Link key={section.href} href={section.href}>
                    <div className="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-[#8B1A1A] hover:shadow-md dark:hover:border-red-800 transition-all cursor-pointer h-full">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-[#8B1A1A] transition-colors">
                          <Icon size={16} className="text-slate-500 dark:text-slate-300 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-[#8B1A1A] transition-all" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#8B1A1A] transition-colors leading-tight">
                        {section.name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent activity from getSystemAnalytics */}
        <div className="lg:col-span-2">
          <SectionHeader title="Recent Activity" action={() => router.push('/portal/analytics')} actionLabel="View all" />
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-slate-100 dark:bg-slate-700 rounded-lg shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-3/4 mb-1" />
                      <div className="h-2 bg-slate-50 dark:bg-slate-700 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="p-6 text-center">
                <Activity size={20} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No recent activity</p>
              </div>
            ) : (
              activity.map((item, i) => (
                <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i < activity.length - 1 ? 'border-b border-slate-50 dark:border-slate-700/50' : ''}`}>
                  <div className="p-1.5 rounded-lg shrink-0 mt-0.5 bg-slate-100 dark:bg-slate-700">
                    <Activity size={13} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
                      {item.action ?? item.description ?? item.message ?? item.event ?? '—'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formatRelativeDate(item.createdAt ?? item.timestamp ?? item.date)}
                      {item.user?.name ? ` · ${item.user.name}` : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Upcoming events ── */}
      <div>
        <SectionHeader
          title="Upcoming Events"
          action={canEvents ? () => router.push('/portal/events') : null}
          actionLabel="Manage events"
        />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 animate-pulse">
                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2 mb-4" />
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full" />
              </div>
            ))}
          </div>
        ) : errors.events ? (
          <ErrorRetry message="Could not load events" onRetry={load} />
        ) : events.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-8 text-center">
            <Calendar size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No upcoming events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {events.map((ev, i) => {
              const regCount = ev.registrations?.length ?? ev.registrationCount ?? 0;
              const cap      = ev.capacity;
              const pct      = cap ? Math.round((regCount / cap) * 100) : null;
              const evDate   = ev.date
                ? new Date(ev.date).toLocaleDateString('en-KE', { weekday:'short', day:'numeric', month:'short', year:'numeric' })
                : 'TBA';
              return (
                <div key={ev._id ?? i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {ev.category ?? 'Event'}
                    </span>
                    {cap && <span className="text-[10px] font-bold text-slate-400">{regCount}/{cap}</span>}
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">{ev.title}</h3>
                  <div className="space-y-1 mb-3">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar size={11} /> {evDate}
                    </p>
                    {ev.time && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock size={11} /> {ev.time}
                      </p>
                    )}
                  </div>
                  {pct !== null && (
                    <>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width:`${Math.min(pct,100)}%`, background: pct > 80 ? '#e74c3c' : HOT_RED }} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{pct}% registered</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Feedback summary — only for users who can read feedback ── */}
      {canFeedback && (
        <div>
          <SectionHeader title="Feedback Overview" action={() => router.push('/portal/feedback')} actionLabel="Review all" />
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 text-center animate-pulse">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full mx-auto mb-2" />
                  <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-8 mx-auto mb-1" />
                  <div className="h-2 bg-slate-50 dark:bg-slate-700 rounded w-16 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Sermon',     icon: Mic,           key: 'sermon',     color: '#8B1A1A' },
                { label: 'Service',    icon: Star,          key: 'service',    color: '#d4a017' },
                { label: 'Testimony',  icon: Heart,         key: 'testimony',  color: '#27ae60' },
                { label: 'Prayer',     icon: HandHeart,     key: 'prayer',     color: '#2980b9' },
                { label: 'Suggestion', icon: MessageSquare, key: 'suggestion', color: '#8e44ad' },
              ].map(({ label, icon: Icon, key, color }) => {
                // Try multiple shapes the backend might return
                const count = feedbackStats?.[key]?.total
                  ?? feedbackStats?.byCategory?.[key]
                  ?? feedbackStats?.categories?.[key]
                  ?? feedbackStats?.[key]
                  ?? '—';
                return (
                  <div key={key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 text-center hover:shadow-md transition-shadow">
                    <div className="flex justify-center mb-2">
                      <div className="p-2.5 rounded-full" style={{ background:`${color}18` }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{count}</p>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1 — EXPLORE (Analytics)
// Fetches: getOverview, getContentAnalytics, getFinancialAnalytics,
//          getUserAnalytics, getEngagementAnalytics
// Gated by canViewAnalytics permission
// ════════════════════════════════════════════════════════════════════════════

function ExploreTab({ router, canViewAnalytics }) {
  const [data,    setData]    = useState({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const load = useCallback(async () => {
    if (!canViewAnalytics) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    try {
      const [ov, ct, fi, us, en] = await Promise.all([
        getOverview(),
        getContentAnalytics(),
        getFinancialAnalytics(),
        getUserAnalytics(),
        getEngagementAnalytics(),
      ]);
      // Services return response.data. Backend may additionally wrap in
      // { success, data: {...} } — unwrap both shapes with helper.
      const unwrap = (v) => v?.data ?? v ?? {};

      // All analytics functions already return response.data directly
      setData({
        overview:   unwrap(ov),
        content:    unwrap(ct),
        financial:  unwrap(fi),
        users:      unwrap(us),
        engagement: unwrap(en),
      });
    } catch (err) {
      console.error('[ExploreTab] Analytics load error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [canViewAnalytics]);

  useEffect(() => { load(); }, [load]);

  // ── No-access state ──
  if (!canViewAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield size={40} className="text-slate-200 dark:text-slate-700 mb-4" />
        <h2 className="text-lg font-black text-slate-700 dark:text-slate-300 mb-2">Analytics Restricted</h2>
        <p className="text-sm text-slate-400 max-w-xs">
          You need the <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">view:analytics</code> permission to access this section.
        </p>
      </div>
    );
  }

  const ov = data.overview   ?? {};
  const ct = data.content    ?? {};
  const fi = data.financial  ?? {};
  const us = data.users      ?? {};
  const en = data.engagement ?? {};

  // Build chart arrays — try several possible backend shapes
  const memberGrowthData = (us.monthly ?? us.growth ?? us.timeline ?? []).map(item => ({
    month:   item.month ? getMonthName(item.month) : (item.label ?? item.name ?? ''),
    members: item.total ?? item.count ?? item.members ?? 0,
  }));

  const contentChartData = (ct.monthly ?? ct.monthlyContent ?? ct.timeline ?? []).map(item => ({
    month:   item.month ? getMonthName(item.month) : (item.label ?? ''),
    sermons: item.sermons ?? 0,
    blogs:   item.blogs   ?? 0,
    events:  item.events  ?? 0,
  }));

  const financialChartData = (fi.monthly ?? fi.monthlyGiving ?? fi.timeline ?? []).map(item => ({
    month:  item.month ? getMonthName(item.month) : (item.label ?? ''),
    amount: item.total ?? item.amount ?? item.giving ?? 0,
  }));

  const roleData = (us.byRole ?? us.roles ?? []).map((r, i) => ({
    name:  r.role ?? r.name ?? `Role ${i + 1}`,
    value: r.count ?? r.total ?? r.value ?? 0,
    color: ['#8B1A1A','#c0392b','#d4a017','#2c3e50','#2980b9'][i % 5],
  }));

  return (
    <div className="space-y-6 pb-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Analytics</p>
        <h1 className="text-2xl md:text-3xl font-black">Ministry Insights</h1>
        <p className="text-slate-400 text-sm mt-1">House of Transformation — Busia Campus</p>
      </div>

      {error ? (
        <ErrorRetry message="Could not load analytics. Check your connection and try again." onRetry={load} />
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard loading={loading} icon={Users}        label="Total Members"  value={formatNumber(ov.totalUsers ?? ov.users?.total)}                                          color="#8B1A1A" />
            <StatCard loading={loading} icon={FileText}     label="Total Content"  value={formatNumber((ov.sermons?.total ?? 0) + (ov.blogs?.total ?? 0) + (ov.events?.total ?? 0) || ov.totalContent)} color="#8e44ad" />
            <StatCard loading={loading} icon={DollarSign}   label="Total Raised"   value={fi.campaigns?.totalRaised ? `KES ${formatNumber(fi.campaigns.totalRaised)}` : '—'}        color="#27ae60" />
            <StatCard loading={loading} icon={Heart}        label="Total Feedback" value={formatNumber(ov.totalFeedback ?? ov.feedback?.total ?? en.feedback?.total)}              color="#e74c3c" />
          </div>

          {/* Member growth line chart */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
            <SectionHeader title="Member Growth" action={() => router.push('/portal/analytics')} actionLabel="Full report" />
            {loading ? <ChartSkeleton height={200} /> : memberGrowthData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No growth data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={memberGrowthData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="members" name="Members" stroke={HOT_RED} strokeWidth={3}
                    dot={{ fill:HOT_RED, r:4 }} activeDot={{ r:6, fill:HOT_RED }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Content bar + Role donut */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
            <div className="md:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
              <SectionHeader title="Content Published" />
              {loading ? <ChartSkeleton height={200} /> : contentChartData.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">No content data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={contentChartData} margin={{ top:0, right:10, left:-20, bottom:0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize:11 }} />
                    <Bar dataKey="sermons" name="Sermons" fill={HOT_RED}  radius={[4,4,0,0]} />
                    <Bar dataKey="blogs"   name="Blogs"   fill="#d4a017"  radius={[4,4,0,0]} />
                    <Bar dataKey="events"  name="Events"  fill="#2980b9"  radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
              <SectionHeader title="Members by Role" />
              {loading ? <ChartSkeleton height={140} /> : roleData.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">No role data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={roleData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                        {roleData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {roleData.slice(0, 5).map((r, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium capitalize">{r.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Donations bar chart */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
            <SectionHeader title="Monthly Giving (KES)" action={() => router.push('/portal/donations')} actionLabel="Full report" />
            {loading ? <ChartSkeleton height={180} /> : financialChartData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No financial data available</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={financialChartData} margin={{ top:0, right:10, left:-10, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={v => [`KES ${Number(v).toLocaleString()}`, 'Giving']} />
                    <Bar dataKey="amount" name="Giving" fill="#27ae60" radius={[5,5,0,0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Campaign summary row */}
                {fi.campaigns && (
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    {[
                      { label: 'Active Campaigns',   value: fi.campaigns.active         ?? '—' },
                      { label: 'Total Raised',        value: fi.campaigns.totalRaised    ? `KES ${formatNumber(fi.campaigns.totalRaised)}` : '—' },
                      { label: 'Payments Verified',   value: fi.payments?.verified       ?? fi.payments?.total ?? '—' },
                    ].map((s, i) => (
                      <div key={i} className="text-center">
                        <p className="text-sm md:text-base font-black text-slate-900 dark:text-white">{s.value}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Engagement overview row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard loading={loading} icon={Users}        label="Volunteers"     value={formatNumber(en.volunteers?.total ?? en.volunteers?.active)}   color="#27ae60" />
            <StatCard loading={loading} icon={MessageSquare}label="Total Feedback" value={formatNumber(en.feedback?.total)}                               color="#8e44ad" />
            <StatCard loading={loading} icon={Video}        label="Livestreams"    value={formatNumber(en.livestreams?.total)}                            color="#e74c3c" />
            <StatCard loading={loading} icon={ImageIcon}    label="Gallery Photos" value={formatNumber(en.gallery?.total ?? en.photos?.total)}            color="#2980b9" />
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 2 — ANNOUNCEMENTS
// Real API — logic kept identical to the original working implementation.
// Uses: api.get('/announcements?page=&limit=10')
//       api.post('/announcements/:id/read')
// ════════════════════════════════════════════════════════════════════════════

function AnnouncementsTab({ router }) {
  const [announcements,       setAnnouncements]       = useState([]);
  const [loadingAnnouncements,setLoadingAnnouncements] = useState(false);
  const [announcementsPage,   setAnnouncementsPage]   = useState(1);
  const [activeFilter,        setActiveFilter]         = useState('All');

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

  const markAsRead = async (id) => {
    try {
      await api.post(`/announcements/${id}/read`);
      setAnnouncements(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
    } catch (error) {
      console.error('[Dashboard] Error marking as read:', error);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, [announcementsPage]);

  const unreadCount = announcements.filter(a => !a.isRead).length;
  const filtered    = announcements.filter(a => {
    if (activeFilter === 'Unread') return !a.isRead;
    if (activeFilter === 'Urgent') return a.priority === 'urgent' || a.priority === 'high';
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 md:pb-6">

      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden mb-6">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
              <Bell className="text-yellow-400" size={26} />
              Announcements
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <button
            onClick={() => router.push('/portal/announcements')}
            className="text-xs font-bold text-yellow-400 flex items-center gap-1 hover:gap-2 transition-all"
          >
            Archive <ArrowRight size={13} />
          </button>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 blur-3xl rounded-full pointer-events-none" />
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-5">
        {['All', 'Unread', 'Urgent'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className="px-4 py-1.5 rounded-full text-xs font-bold border transition-all"
            style={activeFilter === tab
              ? { background: HOT_RED, color: 'white', borderColor: 'transparent' }
              : { borderColor: '#e2e8f0', color: '#64748b' }}
          >
            {tab}
            {tab === 'Unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-white/20 rounded-full px-1.5 py-0.5 text-[9px]">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {loadingAnnouncements ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 animate-pulse flex gap-4">
                <div className="w-11 h-11 bg-slate-100 dark:bg-slate-700 rounded-xl shrink-0" />
                <div className="flex-1">
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-slate-50 dark:bg-slate-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700">
            <Bell size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold text-sm">Nothing here</p>
          </div>
        ) : (
          filtered.map(a => {
            const Cfg  = PRIORITY_CONFIG[a.priority] ?? PRIORITY_CONFIG.normal;
            const Icon = Cfg.icon;
            return (
              <div
                key={a._id}
                onClick={() => router.push(`/portal/announcements/${a._id}`)}
                className={`relative flex gap-4 p-4 md:p-5 rounded-2xl cursor-pointer transition-all
                  bg-white dark:bg-slate-800 border hover:shadow-md active:scale-[0.99]
                  ${!a.isRead
                    ? 'border-l-4 border-l-[#8B1A1A] border-slate-100 dark:border-slate-700'
                    : 'border-slate-100 dark:border-slate-700'}`}
              >
                {!a.isRead && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ background: HOT_RED }} />
                )}

                <div className={`p-2.5 rounded-xl shrink-0 h-fit ${Cfg.bgClass}`}>
                  <Icon size={18} className={Cfg.colorClass} />
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: HOT_RED }}>
                      {a.category}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${Cfg.bgClass} ${Cfg.colorClass}`}>
                      {Cfg.label}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">{formatRelativeDate(a.createdAt)}</span>
                  </div>
                  <h3 className={`text-sm mb-1 ${!a.isRead ? 'font-black text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400'}`}>
                    {a.title}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">{a.content}</p>
                </div>

                {!a.isRead && (
                  <button
                    onClick={e => { e.stopPropagation(); markAsRead(a._id); }}
                    className="shrink-0 self-center p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-300 hover:text-emerald-600 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck size={18} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 3 — PROFILE
// Uses: user from AuthContext (immediate) + getMyProfile() for extended data
// ════════════════════════════════════════════════════════════════════════════

function ProfileTab({ user, router }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // getMyProfile() returns response.data; backend may wrap in { success, data, user }
    getMyProfile()
      .then(res => {
        const unwrapped = res?.data ?? res ?? {};
        setProfile(unwrapped?.user ?? unwrapped);
      })
      .catch(() => { /* fall back gracefully to user from AuthContext */ })
      .finally(() => setLoading(false));
  }, []);

  const display  = profile ?? user ?? {};
  const name     = display.name   ?? 'Church Member';
  const email    = display.email  ?? '';
  const roleName = display.role?.name ?? user?.role?.name ?? 'Member';
  const avatar   = display.avatar ?? null;
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const joined   = display.createdAt
    ? new Date(display.createdAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
    : '—';

  const permissions = Array.isArray(user?.role?.permissions) ? user.role.permissions : [];

  // Group permissions into readable buckets
  const permGroups = {
    Management:    permissions.filter(p => p.startsWith('manage:')),
    'View Access': permissions.filter(p => p.startsWith('view:')),
    Feedback:      permissions.filter(p => p.includes('feedback') && !p.startsWith('manage:')),
    Donations:     permissions.filter(p =>
      ['donation', 'pledge', 'payment', 'campaign'].some(k => p.includes(k)) && !p.startsWith('manage:')),
  };

  const permGroupStyles = {
    Management:    { bg:'bg-red-50 dark:bg-red-950/40',    text:'text-red-700 dark:text-red-400',    dot:'bg-red-500'    },
    'View Access': { bg:'bg-blue-50 dark:bg-blue-950/40',  text:'text-blue-700 dark:text-blue-400',  dot:'bg-blue-500'   },
    Feedback:      { bg:'bg-purple-50 dark:bg-purple-950/40',text:'text-purple-700 dark:text-purple-400',dot:'bg-purple-500'},
    Donations:     { bg:'bg-green-50 dark:bg-green-950/40',text:'text-green-700 dark:text-green-400', dot:'bg-green-500'  },
  };

  // Strip permission prefixes to produce a human-readable label
  const permLabel = p =>
    p.replace(/^(manage:|view:|read:|respond:|publish:|archive:|approve:|create:|verify:|edit:|delete:|activate:|feature:|process:)/,'')
     .replace(/:feedback$/, '').replace(/[_:]/g, ' ').trim();

  return (
    <div className="space-y-6 pb-6">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden p-6 text-white"
        style={{ background:`linear-gradient(135deg,${HOT_RED} 0%,#6b1212 100%)` }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background:'radial-gradient(ellipse 50% 80% at 90% 50%,rgba(255,255,255,.08) 0%,transparent 70%)',
        }} />
        <div className="relative z-10 flex items-center gap-5">
          {avatar ? (
            <img src={avatar} alt={name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white/20 shrink-0" />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl font-black shrink-0 border-2 border-white/20"
              style={{ background:'rgba(255,255,255,.15)' }}>
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-black truncate">{name}</h1>
            <p className="text-red-200 text-sm truncate">{email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">{roleName}</span>
              {display.location && <span className="text-[10px] text-red-200">{display.location}</span>}
            </div>
          </div>
          <button
            onClick={() => router.push('/portal/profile')}
            className="shrink-0 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-lg border border-white/20 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Account details */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <SectionHeader title="Account Details" />
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-24" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {[
              { label: 'Member Since', value: joined },
              { label: 'Status',       value: display.isActive !== false ? 'Active' : 'Inactive', green: display.isActive !== false },
              { label: 'Role',         value: roleName },
              { label: 'Phone',        value: display.phone  ?? '—' },
              { label: 'Gender',       value: display.gender ? display.gender.charAt(0).toUpperCase() + display.gender.slice(1) : '—' },
              { label: 'Campus',       value: 'Busia' },
            ].map((row, i, arr) => (
              <div key={i} className={`flex justify-between items-center py-2.5 ${i < arr.length - 1 ? 'border-b border-slate-50 dark:border-slate-700/50' : ''}`}>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{row.label}</span>
                <span className={`text-xs font-bold ${row.green ? 'text-emerald-600' : 'text-slate-800 dark:text-white'}`}>{row.value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <button onClick={() => router.push('/portal/profile')}
            className="flex-1 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#8B1A1A] hover:text-[#8B1A1A] transition-colors">
            Edit Profile
          </button>
          <button onClick={() => router.push('/portal/settings')}
            className="flex-1 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 transition-colors flex items-center justify-center gap-1">
            <Settings size={13} /> Settings
          </button>
        </div>
      </div>

      {/* Permissions — grouped and human-readable */}
      {permissions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <SectionHeader title="Your Permissions" />
          <div className="space-y-4">
            {Object.entries(permGroups).map(([group, perms]) => {
              if (!perms.length) return null;
              const s = permGroupStyles[group];
              return (
                <div key={group}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((p, i) => (
                      <span key={i} className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {permLabel(p)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Profile',     icon: User,        href: '/portal/profile',   danger: false },
          { label: 'Bookmarks',      icon: Bookmark,    href: '/portal/bookmarks', danger: false },
          { label: 'Settings',       icon: Settings,    href: '/portal/settings',  danger: false },
          { label: 'Delete Account', icon: AlertCircle, href: '/portal/profile',   danger: true  },
        ].map((link, i) => {
          const Icon = link.icon;
          return (
            <Link key={i} href={link.href}>
              <div className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm
                ${link.danger
                  ? 'border-red-100 dark:border-red-900/40 hover:border-red-300 bg-red-50/50 dark:bg-red-950/20'
                  : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'}`}>
                <Icon size={16} className={link.danger ? 'text-red-500' : 'text-slate-400'} />
                <span className={`text-xs font-bold ${link.danger ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {link.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function PortalDashboardClient() {
  const { user }              = useAuth();
  const permissions           = usePermissions();
  const { getAccessibleSections, canViewAnalytics } = permissions;
  const router                = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const sections              = getAccessibleSections();

  const NAV = [
    { icon: Home,       label: 'Home'    },
    { icon: TrendingUp, label: 'Explore' },
    { icon: Bell,       label: 'Updates' },
    { icon: User,       label: 'Profile' },
  ];

  return (
    <div className="pb-24 md:pb-0">

      {/* Tab content — conditionally rendered (not mounted when hidden) */}
      <div className="min-h-[calc(100vh-180px)]">
        {currentPage === 0 && <HomeTab          user={user} sections={sections} router={router} permissions={permissions} />}
        {currentPage === 1 && <ExploreTab       router={router} canViewAnalytics={canViewAnalytics()} />}
        {currentPage === 2 && <AnnouncementsTab router={router} />}
        {currentPage === 3 && <ProfileTab       user={user} router={router} />}
      </div>

      {/* ── Mobile bottom navigation ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-stretch">
          {NAV.map((item, i) => {
            const Icon   = item.icon;
            const active = currentPage === i;
            return (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${active ? 'text-[#8B1A1A]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <div className={`w-5 h-0.5 rounded-full mb-1 transition-all ${active ? 'bg-[#8B1A1A]' : 'bg-transparent'}`} />
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop tab navigation ── */}
      <div className="hidden md:block mt-8 border-t border-slate-100 dark:border-slate-800 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {NAV.map((item, i) => {
              const Icon   = item.icon;
              const active = currentPage === i;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    active
                      ? 'text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  style={active ? { background: HOT_RED } : {}}
                >
                  <Icon size={16} /> {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(NAV.length - 1, p + 1))}
              disabled={currentPage === NAV.length - 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}