'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  ArrowLeft, MessageSquare, Filter, RefreshCw, Eye, CheckCircle,
  XCircle, Clock, AlertCircle, Send, Archive, Trash2, RotateCcw,
  BookOpen, Sparkles, Users, Lightbulb, Heart, MessageCircle, Lock,
  FileText, Info, Star, Phone, Mail, User, Tag, CalendarDays,
  Mic2, HandHeart, Zap, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ModalPortal, ModalPortalFooter } from '@/components/common/ModalPortal';
import { feedbackService } from '@/services/api/feedbackService';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND_RED = '#8B1A1A';
const BRAND_GOLD = '#d4a017';

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { icon: Clock,        badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',   dot: 'bg-amber-500'   },
  reviewed:  { icon: Eye,          badge: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',               dot: 'bg-sky-500'     },
  published: { icon: CheckCircle,  badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',               dot: 'bg-emerald-500' },
  responded: { icon: Send,         badge: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300',                    dot: 'bg-violet-500'  },
  archived:  { icon: Archive,      badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',      dot: 'bg-slate-400'   },
};
const getStatusCfg = (s) => STATUS_CONFIG[s] || STATUS_CONFIG.pending;

// ─── Category config ───────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  sermon:      { icon: BookOpen,      color: 'text-sky-600 dark:text-sky-400',     bg: 'bg-sky-50 dark:bg-sky-900/20'      },
  service:     { icon: Sparkles,      color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  testimony:   { icon: Users,         color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20'   },
  suggestion:  { icon: Lightbulb,     color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  prayer:      { icon: Heart,         color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20'       },
  general:     { icon: MessageCircle, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/60'   },
};
const getCatCfg  = (c) => CATEGORY_CONFIG[c] || CATEGORY_CONFIG.general;
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

// ─── Toast ─────────────────────────────────────────────────────────────────────
const TOAST_STYLES = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200',
  error:   'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200',
  info:    'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-200',
};
const TOAST_ICONS = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };

const ToastItem = ({ message, type, onClose }) => {
  const Icon = TOAST_ICONS[type] || Info;
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-in slide-in-from-right-full duration-300 ${TOAST_STYLES[type]}`}>
      <Icon size={16} className="flex-shrink-0 mt-0.5" />
      <p className="flex-1 leading-relaxed">{message}</p>
      <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1">
        <XCircle size={15} />
      </button>
    </div>
  );
};
const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-4 right-4 flex flex-col gap-2 w-96 max-w-[calc(100vw-2rem)] pointer-events-none" style={{ zIndex: 999999 }}>
    {toasts.map((t) => (
      <div key={t.id} className="pointer-events-auto">
        <ToastItem {...t} onClose={() => removeToast(t.id)} />
      </div>
    ))}
  </div>
);

// ─── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent, icon: Icon }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}15` }}>
      <Icon size={20} style={{ color: accent }} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Detail field helpers ──────────────────────────────────────────────────────
const FieldBlock = ({ label, children }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700">
      {children}
    </div>
  </div>
);
const FieldText = ({ label, value }) => value ? (
  <FieldBlock label={label}><p className="whitespace-pre-wrap">{value}</p></FieldBlock>
) : null;

const InfoBanner = ({ icon: Icon, title, subtitle, color = 'blue' }) => {
  const colors = {
    blue:   'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200',
    green:  'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200',
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200',
    red:    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200',
  };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${colors[color]}`}>
      {Icon && <Icon size={18} className="flex-shrink-0 mt-0.5" />}
      <div>
        <p className="text-sm font-bold">{title}</p>
        {subtitle && <p className="text-xs mt-0.5 opacity-80">{subtitle}</p>}
      </div>
    </div>
  );
};

// ─── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = getStatusCfg(status);
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {capitalize(status)}
    </span>
  );
};

// ─── Formatters ────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════════
export default function FeedbackPage() {
  // eslint-disable-next-line no-unused-vars
  const router = useRouter();
  const { user } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [feedback, setFeedback]                   = useState([]);
  const [filteredFeedback, setFilteredFeedback]   = useState([]);
  const [stats, setStats]                         = useState(null);
  const [isLoading, setIsLoading]                 = useState(true);
  const [selectedFeedback, setSelectedFeedback]   = useState(null);
  const [isDetailOpen, setIsDetailOpen]           = useState(false);
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [responseText, setResponseText]           = useState('');
  const [recycledFeedback, setRecycledFeedback]   = useState([]);
  const [showRecycleBin, setShowRecycleBin]       = useState(false);
  const [loadingRecycle, setLoadingRecycle]       = useState(false);
  const [toasts, setToasts]                       = useState([]);
  // Confirm dialog state — replaces all window.confirm calls
  const [confirmDialog, setConfirmDialog]         = useState(null); // null | { message, onConfirm, danger }

  const [filters, setFilters] = useState({ category: 'all', status: 'all', anonymous: 'all' });

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const showToast = (message, type = 'info') =>
    setToasts((p) => [...p, { id: Date.now(), message, type }]);
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const confirm = (message, onConfirm, danger = true) =>
    setConfirmDialog({ message, onConfirm, danger });

  // ── Permission helpers ──────────────────────────────────────────────────────
  const canReadCategory     = (cat) => !!user?.role?.permissions && (user.role.permissions.includes('manage:feedback') || user.role.permissions.includes(`read:feedback:${cat}`));
  const canRespondCategory  = (cat) => !!user?.role?.permissions && (user.role.permissions.includes('manage:feedback') || user.role.permissions.includes(`respond:feedback:${cat}`));
  const canPublishTestimony = ()    => !!user?.role?.permissions && (user.role.permissions.includes('manage:feedback') || user.role.permissions.includes('publish:feedback:testimony'));
  const canArchiveCategory  = (cat) => !!user?.role?.permissions && (user.role.permissions.includes('manage:feedback') || user.role.permissions.includes(`archive:feedback:${cat}`));
  const canViewStats        = ()    => !!user?.role?.permissions && (user.role.permissions.includes('manage:feedback') || user.role.permissions.includes('view:feedback:stats'));
  const canAccessAnyFeedback = ()   => !!user?.role?.permissions && user.role.permissions.some((p) => p.includes('feedback'));

  // ── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (canAccessAnyFeedback()) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role?.permissions]);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [feedbackRes, statsRes] = await Promise.all([
        feedbackService.getAllFeedback(),
        feedbackService.getStats(),
      ]);
      if (feedbackRes.success) setFeedback(feedbackRes.feedback || []);
      else showToast('Failed to load feedback', 'error');
      if (statsRes.success) setStats(statsRes.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast(error.response?.data?.message || 'Failed to load feedback data. Please check your connection.', 'error');
      setFeedback([]);
      setStats({ total: 0, pending: 0, urgentPrayers: 0, anonymous: 0, thisWeek: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecycledFeedback = async () => {
    setLoadingRecycle(true);
    try {
      const data = await feedbackService.getRecycledFeedback();
      setRecycledFeedback(data.recycled || []);
    } catch (err) {
      console.error('Error fetching recycled feedback:', err);
      showToast('Failed to load recycled feedback', 'error');
    } finally {
      setLoadingRecycle(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedback];
    if (filters.category !== 'all') filtered = filtered.filter((i) => i.category === filters.category);
    if (filters.status   !== 'all') filtered = filtered.filter((i) => i.status   === filters.status);
    if (filters.anonymous === 'true')  filtered = filtered.filter((i) => i.isAnonymous === true);
    if (filters.anonymous === 'false') filtered = filtered.filter((i) => i.isAnonymous === false);
    setFilteredFeedback(filtered);
  };

  // ── Action handlers ─────────────────────────────────────────────────────────
  const handleViewDetails = (item) => {
    if (!canReadCategory(item.category)) {
      showToast(`You don't have permission to view ${item.category} feedback`, 'error');
      return;
    }
    setSelectedFeedback(item);
    setResponseText('');
    setIsDetailOpen(true);
  };

  const closeDetail = () => { if (!isSubmitting) { setIsDetailOpen(false); setSelectedFeedback(null); } };

  const handleUpdateStatus = async (status) => {
    if (!selectedFeedback) return;
    setIsSubmitting(true);
    try {
      const response = await feedbackService.updateStatus(selectedFeedback._id, { status, adminNotes: '' });
      if (response.success) {
        showToast(`Feedback marked as ${status}`, 'success');
        await fetchData();
        closeDetail();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishTestimony = async () => {
    if (!selectedFeedback || selectedFeedback.category !== 'testimony') return;
    if (!canPublishTestimony()) { showToast('You do not have permission to publish testimonies', 'error'); return; }
    setIsSubmitting(true);
    try {
      const response = await feedbackService.publishTestimony(selectedFeedback._id);
      if (response.success) {
        showToast('Testimony published successfully!', 'success');
        await fetchData();
        closeDetail();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish testimony', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveFeedback = async () => {
    if (!selectedFeedback) return;
    if (!canArchiveCategory(selectedFeedback.category)) {
      showToast(`You don't have permission to archive ${selectedFeedback.category} feedback`, 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await feedbackService.archiveFeedback?.(selectedFeedback._id);
      if (response?.success) {
        showToast('Feedback archived successfully', 'success');
        await fetchData();
        closeDetail();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to archive feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;
    if (!canRespondCategory(selectedFeedback.category)) {
      showToast(`You don't have permission to respond to ${selectedFeedback.category} feedback`, 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await feedbackService.respondToFeedback(selectedFeedback._id, responseText);
      if (response.success) {
        if (response.emailSent) {
          showToast('Response sent and email delivered successfully!', 'success');
        } else if (response.emailError) {
          showToast(`Response saved but email failed: ${response.emailError || 'Unknown error'}. Please contact user directly.`, 'warning');
        } else {
          showToast('Response saved successfully', 'success');
        }
        setResponseText('');
        await fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send response', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!selectedFeedback) return;
    setIsSubmitting(true);
    try {
      const response = await feedbackService.deleteFeedback(selectedFeedback._id);
      if (response.success) {
        showToast('Feedback permanently deleted', 'success');
        await fetchData();
        closeDetail();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!selectedFeedback) return;
    setIsSubmitting(true);
    try {
      const response = await feedbackService.softDeleteFeedback(selectedFeedback._id);
      if (response.success) {
        showToast('Feedback moved to recycle bin', 'success');
        await fetchData();
        closeDetail();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to move to recycle bin', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestoreFromRecycle = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await feedbackService.restoreFromRecycle(id);
      if (response.success) {
        showToast('Feedback restored from recycle bin', 'success');
        await fetchData();
        await fetchRecycledFeedback();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to restore feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecyclePermanentDelete = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await feedbackService.deleteFeedback(id);
      if (response.success) {
        showToast('Feedback permanently deleted', 'success');
        await fetchRecycledFeedback();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Access denied ──────────────────────────────────────────────────────────
  if (!canAccessAnyFeedback() && !isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Link href="/portal" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-red-100 dark:bg-red-900/30">
            <AlertCircle size={28} className="text-red-600" />
          </div>
          <h2 className="text-xl font-black text-red-900 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-sm text-red-700 dark:text-red-300">You do not have permission to access the feedback management page</p>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-5 p-1">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-gray-50 dark:border-slate-800/50 last:border-0 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-32 bg-slate-50 dark:bg-slate-800/50 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5 p-1">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Feedback Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review, respond to, and manage community feedback
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchData}
          disabled={isLoading}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      {stats && canViewStats() && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Feedback" value={stats.total}             sub={`${stats.thisWeek ?? 0} this week`} accent={BRAND_RED}  icon={MessageSquare} />
          <StatCard label="Pending"         value={stats.pending}           accent="#d97706"  icon={Clock}        />
          <StatCard label="Urgent Prayers"  value={stats.urgentPrayers ?? 0} accent="#dc2626"  icon={Heart}       />
          <StatCard
            label="Anonymous"
            value={`${stats.total > 0 ? Math.round((stats.anonymous / stats.total) * 100) : 0}%`}
            accent="#64748b"
            icon={Lock}
          />
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 flex-shrink-0">
          <Filter size={15} />
          <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
        </div>

        <div className="flex flex-wrap gap-3 flex-1">
          {/* Category */}
          <Select value={filters.category} onValueChange={(v) => setFilters((f) => ({ ...f, category: v }))}>
            <SelectTrigger className="w-auto min-w-[160px] h-9 text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="sermon">Sermon Feedback</SelectItem>
              <SelectItem value="service">Service Experience</SelectItem>
              <SelectItem value="testimony">Testimonies</SelectItem>
              <SelectItem value="suggestion">Suggestions</SelectItem>
              <SelectItem value="prayer">Prayer Requests</SelectItem>
              <SelectItem value="general">General Feedback</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
            <SelectTrigger className="w-auto min-w-[140px] h-9 text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* Anonymous */}
          <Select value={filters.anonymous} onValueChange={(v) => setFilters((f) => ({ ...f, anonymous: v }))}>
            <SelectTrigger className="w-auto min-w-[140px] h-9 text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="false">With Contact</SelectItem>
              <SelectItem value="true">Anonymous</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs font-semibold text-slate-400 flex-shrink-0">
          {filteredFeedback.length} result{filteredFeedback.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Feedback list ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Column headers — desktop */}
        <div className="hidden md:grid grid-cols-[auto_1fr_160px_120px_100px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800">
          {['', 'Submitter', 'Category', 'Status', 'Actions'].map((h) => (
            <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</span>
          ))}
        </div>

        {filteredFeedback.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${BRAND_RED}10` }}>
              <MessageSquare size={24} style={{ color: BRAND_RED }} />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {feedback.length === 0 ? 'No feedback submitted yet' : 'No feedback matches your filters'}
            </p>
            <p className="text-xs text-slate-400">
              {feedback.length > 0 ? 'Try adjusting your filters' : 'Feedback from the community will appear here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
            {filteredFeedback.map((item) => {
              const catCfg = getCatCfg(item.category);
              const CatIcon = catCfg.icon;
              return (
                <div
                  key={item._id}
                  className="flex flex-col md:grid md:grid-cols-[auto_1fr_160px_120px_100px] gap-3 md:gap-4 px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors items-start md:items-center"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${catCfg.bg}`}>
                    <CatIcon size={18} className={catCfg.color} />
                  </div>

                  {/* Submitter */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {capitalize(item.category)} Feedback
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      {item.isAnonymous
                        ? <><Lock size={11} /><span>Anonymous</span></>
                        : <span>{item.name}</span>
                      }
                      <span>·</span>
                      <span>{formatDate(item.submittedAt)}</span>
                    </p>
                  </div>

                  {/* Category badge */}
                  <div className="flex items-center md:block">
                    <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 flex-shrink-0">Category</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${catCfg.bg} ${catCfg.color}`}>
                      {capitalize(item.category)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center md:block">
                    <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 flex-shrink-0">Status</span>
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Action */}
                  <div>
                    {canReadCategory(item.category) && (
                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs text-white gap-1.5"
                        style={{ backgroundColor: BRAND_RED }}
                        onClick={() => handleViewDetails(item)}
                      >
                        <Eye size={13} />
                        <span className="md:hidden lg:inline">View</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Recycle bin ─────────────────────────────────────────────────────── */}
      <div>
        <Button
          variant="outline"
          className="gap-2 mb-4"
          onClick={() => {
            setShowRecycleBin((v) => !v);
            if (!showRecycleBin) fetchRecycledFeedback();
          }}
        >
          <Trash2 size={15} />
          {showRecycleBin ? 'Hide' : 'Show'} Recycle Bin
          {recycledFeedback.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
              {recycledFeedback.length}
            </span>
          )}
          {showRecycleBin ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>

        {showRecycleBin && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <Trash2 size={16} className="text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recycle Bin</h3>
              </div>
              <p className="text-xs text-slate-400">Items auto-deleted after 30 days</p>
            </div>

            {loadingRecycle ? (
              <div className="py-12 flex items-center justify-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-slate-100 border-t-slate-500 animate-spin" />
                <p className="text-sm text-slate-400">Loading recycle bin…</p>
              </div>
            ) : recycledFeedback.length === 0 ? (
              <div className="py-16 text-center">
                <Trash2 size={32} className="mx-auto mb-3 text-slate-200 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Recycle bin is empty</p>
                <p className="text-xs text-slate-400 mt-1">Soft-deleted feedback will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
                {recycledFeedback.map((item) => {
                  const catCfg = getCatCfg(item.category);
                  const CatIcon = catCfg.icon;
                  return (
                    <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 opacity-50 ${catCfg.bg}`}>
                          <CatIcon size={16} className={catCfg.color} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 line-through">
                            {capitalize(item.category)} Feedback
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            {item.isAnonymous
                              ? <><Lock size={10} /><span>Anonymous</span></>
                              : <span>{item.name}</span>
                            }
                            <span>·</span>
                            <span>Deleted {formatDate(item.deletedAt)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-400"
                          onClick={() => handleRestoreFromRecycle(item._id)}
                          disabled={isSubmitting}
                        >
                          <RotateCcw size={13} /> Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                          disabled={isSubmitting}
                          onClick={() =>
                            confirm(
                              'Permanently delete this feedback? This cannot be undone.',
                              () => handleRecyclePermanentDelete(item._id),
                            )
                          }
                        >
                          <Trash2 size={13} /> Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          DETAIL MODAL (portal — all 6 category renderers preserved)
      ════════════════════════════════════════════════════════════════════════ */}
      <ModalPortal
        isOpen={isDetailOpen}
        onClose={closeDetail}
        title={selectedFeedback ? `${capitalize(selectedFeedback.category)} Feedback` : ''}
        description={selectedFeedback ? formatDate(selectedFeedback.submittedAt) : ''}
        size="lg"
      >
        {selectedFeedback && (
          <>
            {/* Scrollable body */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto">

              {/* ── Meta row ─────────────────────────────────────────────── */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <p>Submitted: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(selectedFeedback.submittedAt)}</span></p>
                  {selectedFeedback.reviewedAt && (
                    <p>Reviewed by: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedFeedback.reviewedBy?.name}</span> on {formatDate(selectedFeedback.reviewedAt)}</p>
                  )}
                </div>
                <StatusBadge status={selectedFeedback.status} />
              </div>

              {/* ── Contact info ─────────────────────────────────────────── */}
              {!selectedFeedback.isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700">
                  {[
                    { icon: User,  label: 'Name',  val: selectedFeedback.name  },
                    { icon: Mail,  label: 'Email', val: selectedFeedback.email },
                    { icon: Phone, label: 'Phone', val: selectedFeedback.phone || 'Not provided' },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={11} className="text-slate-400" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{val || '—'}</p>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* ════════════════════════════════════════════════════════════
                  SERMON FEEDBACK
              ════════════════════════════════════════════════════════════ */}
              {selectedFeedback.category === 'sermon' && (
                <>
                  <FieldText label="Sermon Title"    value={selectedFeedback.feedbackData.sermonTitle} />
                  {selectedFeedback.feedbackData.sermonDate && (
                    <FieldText label="Sermon Date" value={new Date(selectedFeedback.feedbackData.sermonDate).toLocaleDateString()} />
                  )}
                  {selectedFeedback.feedbackData.rating && (
                    <FieldBlock label="Rating">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{'⭐'.repeat(selectedFeedback.feedbackData.rating)}</span>
                        <span className="text-sm text-slate-500">({selectedFeedback.feedbackData.rating}/5)</span>
                      </div>
                    </FieldBlock>
                  )}
                  <FieldText label="What Resonated Most" value={selectedFeedback.feedbackData.resonatedMost} />
                  <FieldText label="Application Steps"   value={selectedFeedback.feedbackData.application}   />
                  <FieldText label="Questions"           value={selectedFeedback.feedbackData.questions}      />
                  {selectedFeedback.feedbackData.wouldRecommend !== undefined && (
                    <FieldBlock label="Would Recommend">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${selectedFeedback.feedbackData.wouldRecommend ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedFeedback.feedbackData.wouldRecommend ? '✅ Yes' : '❌ No'}
                      </span>
                    </FieldBlock>
                  )}
                </>
              )}

              {/* ════════════════════════════════════════════════════════════
                  SERVICE FEEDBACK
              ════════════════════════════════════════════════════════════ */}
              {selectedFeedback.category === 'service' && (
                <>
                  {selectedFeedback.isFirstTimeVisitor && (
                    <InfoBanner color="blue" icon={Star} title="First Time Visitor" subtitle="This person is new to our church!" />
                  )}
                  {selectedFeedback.feedbackData.ratings && (
                    <FieldBlock label="Service Ratings">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedFeedback.feedbackData.ratings).map(([cat, rating]) =>
                          rating > 0 ? (
                            <div key={cat} className="bg-white dark:bg-slate-700 rounded-lg px-3 py-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{cat.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <div className="flex items-center gap-1.5">
                                <span>{'⭐'.repeat(rating)}</span>
                                <span className="text-[11px] text-slate-400">{rating}/5</span>
                              </div>
                            </div>
                          ) : null
                        )}
                      </div>
                    </FieldBlock>
                  )}
                  <FieldText label="What Went Well"           value={selectedFeedback.feedbackData.whatWentWell}  />
                  <FieldText label="Suggestions for Improvement" value={selectedFeedback.feedbackData.improvements} />
                  {selectedFeedback.feedbackData.wouldReturn && (
                    <FieldBlock label="Would Return / Recommend">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        selectedFeedback.feedbackData.wouldReturn === 'Yes'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedFeedback.feedbackData.wouldReturn === 'Maybe'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedFeedback.feedbackData.wouldReturn}
                      </span>
                    </FieldBlock>
                  )}
                </>
              )}

              {/* ════════════════════════════════════════════════════════════
                  TESTIMONY
              ════════════════════════════════════════════════════════════ */}
              {selectedFeedback.category === 'testimony' && (
                <>
                  {selectedFeedback.feedbackData.testimonyType && (
                    <FieldBlock label="Testimony Type">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200">
                        {selectedFeedback.feedbackData.testimonyType}
                      </span>
                    </FieldBlock>
                  )}
                  <FieldText label="Title"         value={selectedFeedback.feedbackData.title}   />
                  {selectedFeedback.feedbackData.testimonyDate && (
                    <FieldText label="Date of Occurrence" value={new Date(selectedFeedback.feedbackData.testimonyDate).toLocaleDateString()} />
                  )}
                  <FieldText label="Testimony Story" value={selectedFeedback.feedbackData.story} />
                  {selectedFeedback.feedbackData.shareInService && (
                    <InfoBanner color="green" icon={Mic2} title="Willing to Share in Service" subtitle="This person is open to sharing publicly" />
                  )}
                  {selectedFeedback.allowFollowUp && (
                    <InfoBanner color="blue" icon={Phone} title="Open to Contact" subtitle="Permission granted for follow-up" />
                  )}
                </>
              )}

              {/* ════════════════════════════════════════════════════════════
                  SUGGESTION
              ════════════════════════════════════════════════════════════ */}
              {selectedFeedback.category === 'suggestion' && (
                <>
                  {selectedFeedback.feedbackData.suggestionType && (
                    <FieldBlock label="Suggestion Category">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                        {selectedFeedback.feedbackData.suggestionType}
                      </span>
                    </FieldBlock>
                  )}
                  <FieldText label="Title" value={selectedFeedback.feedbackData.suggestionTitle} />
                  {selectedFeedback.feedbackData.priority && (
                    <FieldBlock label="Priority Level">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        selectedFeedback.feedbackData.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : selectedFeedback.feedbackData.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {selectedFeedback.feedbackData.priority} Priority
                      </span>
                    </FieldBlock>
                  )}
                  <FieldText label="Detailed Description"  value={selectedFeedback.feedbackData.description} />
                  <FieldText label="Why It's Important"    value={selectedFeedback.feedbackData.importance}  />
                  <FieldText label="Expected Impact / Benefit" value={selectedFeedback.feedbackData.benefit} />
                  {selectedFeedback.feedbackData.willingToHelp && (
                    <InfoBanner color="green" icon={HandHeart} title="Willing to Help Implement" subtitle="This person volunteered to assist" />
                  )}
                </>
              )}

              {/* ════════════════════════════════════════════════════════════
                  PRAYER REQUEST
              ════════════════════════════════════════════════════════════ */}
              {selectedFeedback.category === 'prayer' && (
                <>
                  {selectedFeedback.feedbackData.urgency && (
                    <FieldBlock label="Urgency Level">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        selectedFeedback.feedbackData.urgency === 'Urgent'
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {selectedFeedback.feedbackData.urgency === 'Urgent' ? 'URGENT PRAYER' : 'Regular Prayer'}
                      </span>
                    </FieldBlock>
                  )}
                  {selectedFeedback.feedbackData.prayerCategory && (
                    <FieldBlock label="Prayer Category">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200">
                        {selectedFeedback.feedbackData.prayerCategory}
                      </span>
                    </FieldBlock>
                  )}
                  <FieldText label="Prayer Request" value={selectedFeedback.feedbackData.request} />
                  {selectedFeedback.shareOnPrayerList && (
                    <InfoBanner color="blue" icon={Users} title="Share on Church Prayer List" subtitle="Permission to share with congregation" />
                  )}
                  {selectedFeedback.feedbackData.prayerNeeded && (
                    <InfoBanner color="amber" icon={Heart} title="Requesting Personal Prayer" subtitle="Wants someone to pray with them" />
                  )}
                  {(selectedFeedback.feedbackData.preferredContact || selectedFeedback.feedbackData.bestTimeToContact) && (
                    <FieldBlock label="Contact Preferences">
                      <div className="space-y-1">
                        {selectedFeedback.feedbackData.preferredContact && (
                          <p><span className="font-bold">Method:</span> {selectedFeedback.feedbackData.preferredContact}</p>
                        )}
                        {selectedFeedback.feedbackData.bestTimeToContact && (
                          <p><span className="font-bold">Best Time:</span> {selectedFeedback.feedbackData.bestTimeToContact}</p>
                        )}
                      </div>
                    </FieldBlock>
                  )}
                </>
              )}

              {/* ════════════════════════════════════════════════════════════
                  GENERAL FEEDBACK
              ════════════════════════════════════════════════════════════ */}
              {selectedFeedback.category === 'general' && (
                <>
                  {selectedFeedback.feedbackData.feedbackType && (
                    <FieldBlock label="Feedback Type">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {selectedFeedback.feedbackData.feedbackType}
                      </span>
                    </FieldBlock>
                  )}
                  <FieldText label="Subject" value={selectedFeedback.feedbackData.subject} />
                  <FieldText label="Message" value={selectedFeedback.feedbackData.message} />
                </>
              )}

              {/* ── Fallback for any unhandled feedbackData fields ─────────── */}
              {Object.entries(selectedFeedback.feedbackData || {})
                .filter(([key]) => {
                  const displayed = [
                    'sermonTitle','sermonDate','rating','resonatedMost','application','questions','wouldRecommend',
                    'ratings','whatWentWell','improvements','wouldReturn',
                    'testimonyType','title','story','testimonyDate','shareInService',
                    'suggestionType','suggestionTitle','description','importance','benefit','priority','willingToHelp',
                    'prayerCategory','request','urgency','prayerNeeded','preferredContact','bestTimeToContact',
                    'feedbackType','subject','message',
                  ];
                  return !displayed.includes(key);
                })
                .filter(([, value]) => value && typeof value !== 'object')
                .map(([key, value]) => (
                  <FieldText key={key} label={key.replace(/([A-Z])/g, ' $1')} value={String(value)} />
                ))
              }

              <Separator />

              {/* ── Response section ─────────────────────────────────────── */}
              {!selectedFeedback.isAnonymous &&
                selectedFeedback.allowFollowUp &&
                selectedFeedback.status !== 'responded' &&
                canRespondCategory(selectedFeedback.category) && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Send Response</p>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    disabled={isSubmitting}
                    placeholder="Type your response here…"
                    className="resize-none"
                  />
                  <Button
                    onClick={handleSendResponse}
                    disabled={isSubmitting || !responseText.trim()}
                    className="gap-2 text-white"
                    style={{ backgroundColor: BRAND_RED }}
                  >
                    <Send size={14} />
                    {isSubmitting ? 'Sending…' : 'Send Response'}
                  </Button>
                </div>
              )}

              <Separator />

              {/* ── Action buttons ───────────────────────────────────────── */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Actions</p>
                <div className="flex flex-wrap gap-2">

                  {selectedFeedback.status === 'pending' && (
                    <Button
                      size="sm"
                      className="gap-1.5 text-white"
                      style={{ backgroundColor: '#0284c7' }}
                      onClick={() => handleUpdateStatus('reviewed')}
                      disabled={isSubmitting}
                    >
                      <CheckCircle size={14} />
                      {isSubmitting ? 'Processing…' : 'Mark Reviewed'}
                    </Button>
                  )}

                  {selectedFeedback.category === 'testimony' &&
                    canPublishTestimony() &&
                    ['pending', 'reviewed'].includes(selectedFeedback.status) && (
                    <Button
                      size="sm"
                      className="gap-1.5 text-white"
                      style={{ backgroundColor: '#059669' }}
                      onClick={handlePublishTestimony}
                      disabled={isSubmitting}
                    >
                      <CheckCircle size={14} />
                      {isSubmitting ? 'Publishing…' : 'Publish Testimony'}
                    </Button>
                  )}

                  {canArchiveCategory(selectedFeedback.category) &&
                    selectedFeedback.status !== 'archived' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={handleArchiveFeedback}
                      disabled={isSubmitting}
                    >
                      <Archive size={14} /> Archive
                    </Button>
                  )}

                  {/* Soft delete — move to recycle bin */}
                  {!selectedFeedback.isDeleted && canArchiveCategory(selectedFeedback.category) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400"
                      disabled={isSubmitting}
                      onClick={() =>
                        confirm('Move this feedback to the recycle bin?', handleSoftDelete, false)
                      }
                    >
                      <Trash2 size={14} /> Move to Recycle Bin
                    </Button>
                  )}

                  {/* Permanent delete — only for already-deleted items */}
                  {selectedFeedback.isDeleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                      disabled={isSubmitting}
                      onClick={() =>
                        confirm('Permanently delete this feedback? This cannot be undone.', handleDeleteFeedback)
                      }
                    >
                      <Trash2 size={14} />
                      {isSubmitting ? 'Deleting…' : 'Permanently Delete'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="h-4" />
            </div>
          </>
        )}
      </ModalPortal>

      {/* ── Confirm dialog (replaces all window.confirm) ──────────────────── */}
      <ModalPortal
        isOpen={confirmDialog !== null}
        onClose={() => !isSubmitting && setConfirmDialog(null)}
        title="Confirm Action"
        size="sm"
      >
        <div className="px-6 py-5 space-y-4">
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${
            confirmDialog?.danger
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          }`}>
            <AlertCircle size={18} className={confirmDialog?.danger ? 'text-red-600 flex-shrink-0 mt-0.5' : 'text-amber-600 flex-shrink-0 mt-0.5'} />
            <p className={`text-sm leading-relaxed ${confirmDialog?.danger ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'}`}>
              {confirmDialog?.message}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmDialog(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 text-white gap-2 ${confirmDialog?.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
              disabled={isSubmitting}
              onClick={() => {
                confirmDialog?.onConfirm?.();
                setConfirmDialog(null);
              }}
            >
              {confirmDialog?.danger ? <Trash2 size={14} /> : <CheckCircle size={14} />}
              Confirm
            </Button>
          </div>
          <div className="h-2" />
        </div>
      </ModalPortal>
    </div>
  );
}