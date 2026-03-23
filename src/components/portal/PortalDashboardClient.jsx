'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

// ── Real service imports ────────────────────────────────────────────────────
import { getMyProfile } from '@/services/api/userService';

// ── Charts ──────────────────────────────────────────────────────────────────
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ── Icons ───────────────────────────────────────────────────────────────────
import {
  Calendar, BookOpen, ImageIcon, Heart, Users, Shield,
  BarChart3, ArrowRight, Home, Bell, User,
  ChevronLeft, ChevronRight, CheckCheck, Info, AlertTriangle,
  Zap, MessageSquare, DollarSign, Settings, Bookmark,
  ChevronUp, ChevronDown, AlertCircle,
  RefreshCw, Mail, Play, FileText, Clock,
  Video, Volume2, Phone, MapPin, ExternalLink, Globe,
  Facebook, Instagram, Twitter, Youtube, Linkedin,
  Mic2, HeartHandshake, UserCircle2, BookMarked, Church,
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

/** Priority styling for announcements */
const PRIORITY_CONFIG = {
  low:    { icon: Info,          colorClass: 'text-blue-500',  bgClass: 'bg-blue-50 dark:bg-blue-950/40',   label: 'Low'    },
  normal: { icon: Bell,          colorClass: 'text-slate-500', bgClass: 'bg-slate-50 dark:bg-slate-700/50', label: 'Normal' },
  high:   { icon: AlertTriangle, colorClass: 'text-amber-500', bgClass: 'bg-amber-50 dark:bg-amber-950/40', label: 'High'   },
  urgent: { icon: Zap,           colorClass: 'text-red-600',   bgClass: 'bg-red-50 dark:bg-red-950/40',     label: 'Urgent' },
};

/** Social media display config */
const SOCIAL_META = {
  facebook:  { label: 'Facebook',    color: '#1877F2', bg: '#1877F215' },
  twitter:   { label: 'X (Twitter)', color: '#000000', bg: '#00000012' },
  instagram: { label: 'Instagram',   color: '#E4405F', bg: '#E4405F15' },
  youtube:   { label: 'YouTube',     color: '#FF0000', bg: '#FF000015' },
  linkedin:  { label: 'LinkedIn',    color: '#0A66C2', bg: '#0A66C215' },
  whatsapp:  { label: 'WhatsApp',    color: '#25D366', bg: '#25D36615' },
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

function whatsappLink(phone) {
  const stripped = (phone ?? '').replace(/\D/g, '');
  return `https://wa.me/${stripped}`;
}

// WhatsApp SVG icon (lucide doesn't include brand icons)
function WhatsAppIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
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
// ════════════════════════════════════════════════════════════════════════════

function HomeTab({ user }) {
  const firstName = user?.name?.split(' ')[0] || 'Member';
  const roleName  = user?.role?.name || 'Member';

  const MEMBERSHIP_CARDS = [
    {
      icon: Users,
      color: HOT_RED,
      title: 'Why Membership Matters',
      scripture: 'Titus 3:14',
      quote: '"And let ours also learn to maintain good works for necessary uses, that they be not unfruitful."',
      body: 'As the church grows in the present day twenty-first century, it becomes very necessary to know the bona-fide members of our church. This ensures quick service delivery, while at the same time shielding the church from dubious and phony believers, especially in times of distress. It is therefore vitally important for you and the church, that we have honest and timely information regarding our faithful saints. These works include tithes, offerings and church attendance.',
    },
    {
      icon: Heart,
      color: '#2980b9',
      title: 'Membership Is Voluntary',
      scripture: 'John 1:12–13 · 1 Corinthians 12:13',
      quote: '"For by one Spirit are we all baptized into one….and have been all made to drink into one Spirit."',
      body: 'Membership to the Church (THE BODY OF CHRIST) is voluntary as we all know that salvation is very personal. As long as you have accepted Christ as your personal Saviour, and have received or desire to receive the Holy Spirit, you are more than welcome to be a part of the family of God.',
    },
    {
      icon: Church,
      color: '#27ae60',
      title: 'God Added You',
      scripture: 'Acts 2:47',
      quote: '"….And the Lord added to the church daily such as should be saved."',
      body: 'We want you to know that we acknowledge that God has added you to the fellowship because it is He who began the good work in you. Your presence here is not by accident — it is a divine appointment, and we celebrate the work God is doing in and through your life.',
    },
  ];

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

      {/* ── Membership form intro banner ── */}
      <div
        className="rounded-2xl p-5 md:p-6 border"
        style={{
          background: `linear-gradient(135deg,${HOT_RED}10 0%,${HOT_RED}05 100%)`,
          borderColor: `${HOT_RED}30`,
        }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl shrink-0" style={{ background: `${HOT_RED}18` }}>
            <BookMarked size={22} style={{ color: HOT_RED }} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: HOT_RED }}>
              Church Membership
            </p>
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              Welcome to the Family of God
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              We are glad you are here. Below is what membership in the Body of Christ means at our church.
            </p>
          </div>
        </div>
      </div>

      {/* ── Membership cards ── */}
      <div className="space-y-4">
        {MEMBERSHIP_CARDS.map(({ icon: Icon, color, title, scripture, quote, body }, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Card header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50 dark:border-slate-700/60">
              <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{title}</h3>
                <p className="text-[10px] font-bold mt-0.5" style={{ color }}>{scripture}</p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full shrink-0"
                style={{ background: `${color}15`, color }}>
                {i + 1}/{MEMBERSHIP_CARDS.length}
              </span>
            </div>

            {/* Body text */}
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>

              {/* Scripture quote */}
              <div
                className="rounded-xl px-4 py-3 border-l-4"
                style={{
                  background: `${color}08`,
                  borderLeftColor: color,
                }}
              >
                <p className="text-[11px] font-bold italic text-slate-700 dark:text-slate-200 leading-relaxed">
                  {quote}
                </p>
                <p className="text-[10px] font-black mt-1.5" style={{ color }}>{scripture}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer note ── */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 text-center">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Have questions about membership? Reach out to the{' '}
          <span className="font-bold" style={{ color: HOT_RED }}>New Members Desk</span>{' '}
          or speak with any member of our leadership team.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LEADER CARD
// ════════════════════════════════════════════════════════════════════════════

function LeaderCard({ leader }) {
  const initials = (leader.name ?? '?')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Avatar + identity */}
      <div className="flex items-center gap-3">
        {leader.avatar ? (
          <img
            src={leader.avatar}
            alt={leader.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 shrink-0"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
            style={{ background: HOT_RED }}
          >
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">{leader.name}</p>
          <p className="text-[11px] font-semibold" style={{ color: HOT_RED }}>{leader.title}</p>
          {leader.ministry && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{leader.ministry}</p>
          )}
        </div>
      </div>

      {/* Bio */}
      {leader.bio && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{leader.bio}</p>
      )}

      {/* Contact buttons */}
      <div className="flex flex-wrap gap-1.5">
        {leader.whatsapp && (
          <a
            href={whatsappLink(leader.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: '#25D36618', color: '#25D366' }}
          >
            <WhatsAppIcon size={10} color="#25D366" /> WhatsApp
          </a>
        )}
        {leader.phone && (
          <a
            href={`tel:${leader.phone.replace(/\s/g, '')}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: `${HOT_RED}15`, color: HOT_RED }}
          >
            <Phone size={10} /> Call
          </a>
        )}
        {leader.email && (
          <a
            href={`mailto:${leader.email}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          >
            <Mail size={10} /> Email
          </a>
        )}
        {leader.instagram && (
          <a
            href={leader.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: '#E4405F15', color: '#E4405F' }}
          >
            <Instagram size={10} /> IG
          </a>
        )}
        {leader.facebook && (
          <a
            href={leader.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: '#1877F215', color: '#1877F2' }}
          >
            <Facebook size={10} /> FB
          </a>
        )}
        {leader.twitter && (
          <a
            href={leader.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            <Twitter size={10} /> X
          </a>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1 — CONNECT (was Explore)
// Fetches church info from /api/settings/church-info (auth-gated, non-admin)
// ════════════════════════════════════════════════════════════════════════════

function ExploreTab({ router }) {
  const [churchInfo, setChurchInfo] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res  = await api.get('/settings/church-info');
      const data = res.data?.churchInfo ?? res.data ?? {};
      setChurchInfo(data);
    } catch (err) {
      console.error('[ConnectTab] Load error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 pb-6">
        {/* Banner skeleton */}
        <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse h-36" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 animate-pulse">
            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/3 mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-2/3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !churchInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={32} className="text-slate-300 mb-3" />
        <p className="text-sm text-slate-400 mb-3">Could not load church info</p>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-bold"
          style={{ color: HOT_RED }}
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  const social    = churchInfo.socialMedia  ?? {};
  const services  = churchInfo.serviceTimes ?? [];
  const leaders   = churchInfo.leadership   ?? [];
  const activeSocials = Object.entries(SOCIAL_META).filter(([key]) => social[key]);

  const hasAnyContact = churchInfo.contactPhone
    || churchInfo.contactEmail
    || activeSocials.length > 0
    || leaders.length > 0
    || churchInfo.prayerLine
    || churchInfo.counselingContact
    || churchInfo.newMembersContact;

  return (
    <div className="space-y-6 pb-6">

      {/* ── Church Identity Banner ────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1a0505 0%,#4a0e0e 60%,#1a0505 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 80% 40%,rgba(180,30,30,.35) 0%,transparent 70%)' }}
        />
        <div className="relative z-10 p-5 md:p-6">
          <p className="text-red-300 text-[10px] font-black uppercase tracking-widest mb-1">
            {churchInfo.siteTagline ?? 'Busia County, Kenya'}
          </p>
          <h1 className="text-white text-2xl md:text-3xl font-black leading-tight">
            {churchInfo.siteName ?? 'House of Transformation'}
          </h1>
          {churchInfo.churchMotto && (
            <p className="text-red-200 text-sm mt-2 italic">"{churchInfo.churchMotto}"</p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {churchInfo.foundedYear && (
              <span className="text-[10px] font-bold bg-white/15 text-white px-2.5 py-1 rounded-full">
                Est. {churchInfo.foundedYear}
              </span>
            )}
            {services.length > 0 && (
              <span className="text-[10px] font-bold bg-white/15 text-white px-2.5 py-1 rounded-full">
                {services.length} Service{services.length > 1 ? 's' : ''} / week
              </span>
            )}
            {leaders.length > 0 && (
              <span className="text-[10px] font-bold bg-white/15 text-white px-2.5 py-1 rounded-full">
                {leaders.length} Leader{leaders.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Contact ─────────────────────────────────────────────────── */}
      {(churchInfo.contactPhone || churchInfo.contactEmail || churchInfo.contactAddress) && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
          <SectionHeader title="Church Contact" />
          <div className="flex flex-wrap gap-2">
            {churchInfo.contactPhone && (
              <a
                href={`tel:${churchInfo.contactPhone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:border-[#8B1A1A] hover:shadow-sm transition-all"
                style={{ color: HOT_RED }}
              >
                <Phone size={13} /> {churchInfo.contactPhone}
              </a>
            )}
            {churchInfo.contactEmail && (
              <a
                href={`mailto:${churchInfo.contactEmail}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:border-slate-400 hover:shadow-sm transition-all text-slate-700 dark:text-slate-200"
              >
                <Mail size={13} /> {churchInfo.contactEmail}
              </a>
            )}
            {churchInfo.contactAddress && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                <MapPin size={13} /> {churchInfo.contactAddress}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Ministry Hotlines ─────────────────────────────────────────────── */}
      {(churchInfo.prayerLine || churchInfo.counselingContact || churchInfo.newMembersContact) && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
          <SectionHeader title="Ministry Hotlines" />
          <div className="space-y-2">
            {churchInfo.prayerLine && (
              <a
                href={`tel:${churchInfo.prayerLine.replace(/\s/g, '')}`}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-50 dark:border-slate-700/50 hover:border-red-200 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: `${HOT_RED}15` }}>
                    <Mic2 size={14} style={{ color: HOT_RED }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Prayer Line</p>
                    <p className="text-[10px] text-slate-400">24/7 intercessory prayer</p>
                  </div>
                </div>
                <span className="text-xs font-bold shrink-0 ml-2" style={{ color: HOT_RED }}>
                  {churchInfo.prayerLine}
                </span>
              </a>
            )}
            {churchInfo.counselingContact && (
              <a
                href={`tel:${churchInfo.counselingContact.replace(/\s/g, '')}`}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-50 dark:border-slate-700/50 hover:border-purple-200 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <HeartHandshake size={14} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Pastoral Counseling</p>
                    <p className="text-[10px] text-slate-400">Confidential pastoral support</p>
                  </div>
                </div>
                <span className="text-xs font-bold shrink-0 ml-2 text-purple-600">
                  {churchInfo.counselingContact}
                </span>
              </a>
            )}
            {churchInfo.newMembersContact && (
              <a
                href={`tel:${churchInfo.newMembersContact.replace(/\s/g, '')}`}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-50 dark:border-slate-700/50 hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <UserCircle2 size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">New Members Desk</p>
                    <p className="text-[10px] text-slate-400">Orientation & onboarding</p>
                  </div>
                </div>
                <span className="text-xs font-bold shrink-0 ml-2 text-emerald-600">
                  {churchInfo.newMembersContact}
                </span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Social Media Hub ──────────────────────────────────────────────── */}
      {activeSocials.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
          <SectionHeader title="Follow Us" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {activeSocials.map(([key, meta]) => {
              const href = key === 'whatsapp' ? whatsappLink(social[key]) : social[key];
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md hover:scale-[1.02] transition-all"
                >
                  <div className="p-2 rounded-lg shrink-0" style={{ background: meta.bg }}>
                    {key === 'facebook'  && <Facebook  size={16} style={{ color: meta.color }} />}
                    {key === 'instagram' && <Instagram size={16} style={{ color: meta.color }} />}
                    {key === 'twitter'   && <Twitter   size={16} style={{ color: meta.color }} />}
                    {key === 'youtube'   && <Youtube   size={16} style={{ color: meta.color }} />}
                    {key === 'linkedin'  && <Linkedin  size={16} style={{ color: meta.color }} />}
                    {key === 'whatsapp'  && <WhatsAppIcon size={16} color={meta.color} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-white truncate">{meta.label}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      View <ExternalLink size={9} />
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Service Schedule ──────────────────────────────────────────────── */}
      {services.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
          <SectionHeader title="Service Schedule" />
          <div className="space-y-2">
            {services.map((svc, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  i === 0
                    ? 'border-l-4 bg-slate-50 dark:bg-slate-700/30'
                    : 'border border-slate-50 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20'
                }`}
                style={i === 0 ? { borderLeftColor: HOT_RED } : {}}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${HOT_RED}15` }}>
                    <Clock size={13} style={{ color: HOT_RED }} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{svc.name}</p>
                    {svc.venue && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={9} /> {svc.venue}
                      </p>
                    )}
                    {svc.description && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{svc.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-black text-slate-800 dark:text-white">{svc.day}</p>
                  <p className="text-[10px] font-semibold" style={{ color: HOT_RED }}>{svc.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Leadership & Staff ────────────────────────────────────────────── */}
      {leaders.length > 0 && (
        <div>
          <SectionHeader title="Leadership & Staff" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {leaders.map((leader, i) => (
              <LeaderCard key={leader._id ?? i} leader={leader} />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!hasAnyContact && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-12 text-center">
          <Globe size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Church connect info not set up yet</p>
          <p className="text-xs text-slate-400 mt-1">An admin can add this via Settings → General</p>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 2 — ANNOUNCEMENTS
// ════════════════════════════════════════════════════════════════════════════

function AnnouncementsTab({ router }) {
  const [announcements,        setAnnouncements]        = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [announcementsPage,    setAnnouncementsPage]    = useState(1);
  const [activeFilter,         setActiveFilter]         = useState('All');

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
// ════════════════════════════════════════════════════════════════════════════

function ProfileTab({ user, router }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then(res => {
        const unwrapped = res?.data ?? res ?? {};
        setProfile(unwrapped?.user ?? unwrapped);
      })
      .catch(() => {})
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

      {/* Permissions */}
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
  const { user }                                  = useAuth();
  const permissions                               = usePermissions();
  const { getAccessibleSections, canViewAnalytics } = permissions;
  const router                                    = useRouter();
  const [currentPage, setCurrentPage]             = useState(0);
  const sections                                  = getAccessibleSections();

  const NAV = [
    { icon: Home,    label: 'Home'    },
    { icon: Users,   label: 'Connect' },
    { icon: Bell,    label: 'Updates' },
    { icon: User,    label: 'Profile' },
  ];

  return (
    <div className="pb-24 md:pb-0">

      {/* Tab content */}
      <div className="min-h-[calc(100vh-180px)]">
        {currentPage === 0 && <HomeTab          user={user} />}
        {currentPage === 1 && <ExploreTab       key={currentPage} router={router} />}
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