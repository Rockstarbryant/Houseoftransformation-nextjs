'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, CheckCircle, XCircle, Clock, Eye, Filter,
  Calendar, RefreshCw, AlertCircle, Info, Trash2,
  Mail, Phone, Building2, CalendarDays, ArrowUpRight,
  MoreHorizontal, ShieldCheck, MessageSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModalPortal, ModalPortalFooter } from '@/components/common/ModalPortal';
import { volunteerService } from '@/services/api/volunteerService';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND_RED = '#8B1A1A';
const BRAND_GOLD = '#d4a017';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  pending: {
    label: 'Pending',
    icon: Clock,
    badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
    rowBorder: 'border-l-amber-400',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    rowBorder: 'border-l-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    dot: 'bg-slate-400',
    rowBorder: 'border-l-slate-400',
  },
  interviewing: {
    label: 'Interviewing',
    icon: Users,
    badge: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
    dot: 'bg-sky-500',
    rowBorder: 'border-l-sky-500',
  },
};
const getStatus = (s) => STATUS[s] || STATUS.pending;

// ─── Toast system ─────────────────────────────────────────────────────────────
const TOAST_STYLES = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200',
  error:   'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200',
  info:    'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-200',
};
const TOAST_ICONS = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };

const ToastItem = ({ message, type, onClose }) => {
  const Icon = TOAST_ICONS[type];
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-in slide-in-from-right-full duration-300 ${TOAST_STYLES[type]}`}>
      <Icon size={16} className="flex-shrink-0 mt-0.5" />
      <p className="flex-1 leading-relaxed">{message}</p>
      <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-2">
        <XCircle size={15} />
      </button>
    </div>
  );
};
const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-4 right-4 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none" style={{ zIndex: 999999 }}>
    {toasts.map((t) => (
      <div key={t.id} className="pointer-events-auto">
        <ToastItem {...t} onClose={() => removeToast(t.id)} />
      </div>
    ))}
  </div>
);

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}15` }}>
      <Icon size={22} style={{ color: accent }} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{value ?? '—'}</p>
    </div>
  </div>
);

const DetailField = ({ label, value, icon: Icon }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1">
      {Icon && <Icon size={12} className="text-slate-400" />}
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
    </div>
    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{value || '—'}</p>
  </div>
);

const DetailBlock = ({ label, value, icon: Icon }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-2">
      {Icon && <Icon size={12} className="text-slate-400" />}
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
    </div>
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700">
      {value || '—'}
    </div>
  </div>
);

// ─── Initials helper ──────────────────────────────────────────────────────────
const getInitials = (name) =>
  name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '??';

// ─── Main component ───────────────────────────────────────────────────────────
const VolunteerApplicationsAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({ status: 'all', ministry: 'all' });
  const [stats, setStats] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') =>
    setToasts((p) => [...p, { id: Date.now(), message, type }]);
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  useEffect(() => { fetchApplications(); fetchStats(); }, []);
  useEffect(() => { applyFilters(); }, [applications, filters]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await volunteerService.getAllApplications();
      if (res.success) setApplications(res.applications);
      else showToast('Failed to load applications', 'error');
    } catch { showToast('Error loading applications', 'error'); }
    finally { setIsLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await volunteerService.getStats();
      if (res.success) setStats(res.stats);
    } catch { /* silent */ }
  };

  const applyFilters = () => {
    let f = [...applications];
    if (filters.status !== 'all') f = f.filter((a) => a.status === filters.status);
    if (filters.ministry !== 'all') f = f.filter((a) => a.ministry === filters.ministry);
    setFilteredApplications(f);
  };

  const openDetail = (app) => { setSelectedApp(app); setIsDetailOpen(true); };
  const closeDetail = () => { if (!isSubmitting) { setIsDetailOpen(false); setSelectedApp(null); } };

  const openDelete = (id) => { setDeleteTargetId(id); setIsDeleteOpen(true); };
  const closeDelete = () => { if (!isSubmitting) { setIsDeleteOpen(false); setDeleteTargetId(null); } };

  const handleUpdateStatus = async (status) => {
    if (!selectedApp) return;
    setIsSubmitting(true);
    try {
      const res = await volunteerService.updateStatus(selectedApp._id, {
        status,
        startDate: status === 'approved' ? new Date() : undefined,
      });
      if (res.success) {
        await fetchApplications(); await fetchStats();
        closeDetail();
        showToast(`Application ${status} successfully!`, 'success');
      } else showToast('Failed to update status', 'error');
    } catch { showToast('Failed to update status', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteApplication = async () => {
    if (!deleteTargetId) return;
    setIsSubmitting(true);
    try {
      const res = await volunteerService.deleteApplication(deleteTargetId);
      if (res.success) {
        await fetchApplications(); await fetchStats();
        closeDelete(); closeDetail();
        showToast('Application deleted successfully!', 'success');
      } else showToast('Failed to delete application', 'error');
    } catch { showToast('Failed to delete application', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const ministries = ["Worship Team", "Children's Ministry", "Ushering Team", "Technical Team", "Community Outreach"];

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-5 p-1">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-slate-800">
            <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-gray-50 dark:border-slate-800/50 last:border-0 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-28 bg-slate-50 dark:bg-slate-800/50 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 p-1">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Volunteer Applications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review, approve, and manage ministry applications
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchApplications} className="gap-2 self-start sm:self-auto">
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total"       value={stats.totalApplications}  icon={Users}        accent={BRAND_RED}  />
          <StatCard label="Pending"     value={stats.pendingApplications} icon={Clock}        accent="#d97706"    />
          <StatCard label="Approved"    value={stats.approvedVolunteers}  icon={CheckCircle}  accent="#059669"    />
          <StatCard label="Total Hours" value={stats.totalHours}          icon={Calendar}     accent={BRAND_GOLD} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 flex-shrink-0">
          <Filter size={15} />
          <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3 flex-1">
          <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
            <SelectTrigger className="w-auto min-w-[140px] h-9 text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.ministry} onValueChange={(v) => setFilters((f) => ({ ...f, ministry: v }))}>
            <SelectTrigger className="w-auto min-w-[160px] h-9 text-sm">
              <SelectValue placeholder="All Ministries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ministries</SelectItem>
              {ministries.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs font-semibold text-slate-400 flex-shrink-0">
          {filteredApplications.length} result{filteredApplications.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Column headers — desktop only */}
        <div className="hidden md:grid grid-cols-[1fr_180px_140px_160px_100px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800">
          {['Applicant', 'Ministry', 'Phone', 'Status & Date', 'Actions'].map((h) => (
            <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</span>
          ))}
        </div>

        {filteredApplications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${BRAND_RED}10` }}>
              <Users size={24} style={{ color: BRAND_RED }} />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">No applications found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
            {filteredApplications.map((app) => {
              const cfg = getStatus(app.status);
              return (
                <div
                  key={app._id}
                  className={`flex flex-col md:grid md:grid-cols-[1fr_180px_140px_160px_100px] gap-3 md:gap-4 px-5 py-4 border-l-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${cfg.rowBorder}`}
                >
                  {/* Applicant */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: BRAND_RED }}>
                      {getInitials(app.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{app.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{app.email}</p>
                    </div>
                  </div>

                  {/* Ministry */}
                  <div className="flex items-center md:block">
                    <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 flex-shrink-0">Ministry</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{app.ministry}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center md:block">
                    <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 flex-shrink-0">Phone</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{app.phone}</span>
                  </div>

                  {/* Status + date */}
                  <div className="flex items-center gap-3 md:block">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border mb-0 md:mb-1.5 ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      {new Date(app.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 md:justify-end">
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs text-white gap-1.5"
                      style={{ backgroundColor: BRAND_RED }}
                      onClick={() => openDetail(app)}
                    >
                      <Eye size={13} />
                      <span className="md:hidden lg:inline">View</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal size={15} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => openDetail(app)}>
                          <Eye size={14} className="mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50"
                          onClick={() => openDelete(app._id)}
                        >
                          <Trash2 size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Detail Modal (portal) ──────────────────────────────────────────────── */}
      <ModalPortal
        isOpen={isDetailOpen}
        onClose={closeDetail}
        title={selectedApp?.fullName ?? ''}
        description={selectedApp ? `${selectedApp.ministry} · Applied ${new Date(selectedApp.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
        size="lg"
      >
        {selectedApp && (() => {
          const cfg = getStatus(selectedApp.status);
          return (
            <div className="px-6 py-5 space-y-5">
              {/* Status badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>

              {/* Contact grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700">
                <DetailField label="Email"    value={selectedApp.email}    icon={Mail}        />
                <DetailField label="Phone"    value={selectedApp.phone}    icon={Phone}       />
                <DetailField label="Ministry" value={selectedApp.ministry} icon={Building2}   />
                <DetailField
                  label="Applied"
                  value={new Date(selectedApp.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  icon={CalendarDays}
                />
              </div>

              <Separator />

              <DetailBlock label="Availability"        value={selectedApp.availability}       icon={Clock}          />
              <DetailBlock label="Motivation"          value={selectedApp.motivation}         icon={MessageSquare}  />
              {selectedApp.previousExperience && (
                <DetailBlock label="Previous Experience" value={selectedApp.previousExperience} icon={ArrowUpRight} />
              )}
              {selectedApp.skills && (
                <DetailBlock label="Skills" value={selectedApp.skills} icon={ShieldCheck} />
              )}

              {/* Status action buttons */}
              {(selectedApp.status === 'pending' || selectedApp.status === 'interviewing') && (
                <>
                  <Separator />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                      Update Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="text-white gap-1.5"
                        style={{ backgroundColor: '#059669' }}
                        onClick={() => handleUpdateStatus('approved')}
                        disabled={isSubmitting}
                      >
                        <CheckCircle size={14} />
                        {isSubmitting ? 'Processing…' : 'Approve'}
                      </Button>

                      {selectedApp.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-900/20"
                          onClick={() => handleUpdateStatus('interviewing')}
                          disabled={isSubmitting}
                        >
                          <Users size={14} /> Move to Interview
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => handleUpdateStatus('rejected')}
                        disabled={isSubmitting}
                      >
                        <XCircle size={14} /> Reject
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Delete */}
              <Separator />
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => openDelete(selectedApp._id)}
                disabled={isSubmitting}
              >
                <Trash2 size={14} /> Delete Application
              </Button>

              <div className="h-4" />
            </div>
          );
        })()}
      </ModalPortal>

      {/* ── Delete confirmation (portal) ───────────────────────────────────────── */}
      <ModalPortal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        title="Delete Application"
        description="This action is permanent and cannot be undone."
        size="sm"
      >
        <div className="px-6 py-5 space-y-4">
          {/* Warning block */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
              The applicant's data will be permanently removed from the system. Are you sure you want to continue?
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={closeDelete}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
              onClick={handleDeleteApplication}
              disabled={isSubmitting}
            >
              <Trash2 size={14} />
              {isSubmitting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>

          <div className="h-2" />
        </div>
      </ModalPortal>
    </div>
  );
};

export default VolunteerApplicationsAdmin;