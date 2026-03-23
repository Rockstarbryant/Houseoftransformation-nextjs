'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, CheckCircle2, XCircle, Clock, Eye, Trash2,
  ChevronLeft, ChevronRight, X, AlertCircle, Loader2, UserCheck,
  Phone, MapPin, Mail, Calendar, Baby, Church, Droplets, Heart,
  Fingerprint, Check, RefreshCw, Download
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllMembers,
  getMemberStats,
  updateMemberStatus,
  deleteMember,
} from '@/services/api/membershipService';
import { usePermissions } from '@/hooks/usePermissions';

// ── Brand ──────────────────────────────────────────────────────────────────────
const RED  = '#8B1A1A';
const GOLD = '#d4a017';

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  icon: Clock      },
  approved: { label: 'Approved', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  icon: CheckCircle2 },
  rejected: { label: 'Rejected', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    icon: XCircle    },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

const fmt = (date) => date ? new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900">{value ?? '—'}</p>
      <p className="text-xs text-slate-500 font-semibold mt-0.5">{label}</p>
    </div>
  </div>
);

// ── Detail Modal ──────────────────────────────────────────────────────────────

const Section = ({ title, icon: Icon, children }) => (
  <div className="border border-slate-100 rounded-2xl overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
      <Icon size={15} style={{ color: RED }} />
      <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{title}</span>
    </div>
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
  </div>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm text-slate-800 font-medium">{value || <span className="text-slate-400 italic">Not provided</span>}</p>
  </div>
);

function MemberDetailModal({ member, onClose, onApprove, onReject, isActing }) {
  const [notes, setNotes] = useState('');

  if (!member) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gold gradient bar */}
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${RED}, ${GOLD})` }} />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">{member.fullName}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{member.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={member.status} />
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            <Section title="Personal Information" icon={UserCheck}>
              <Info label="Full Name"          value={member.fullName} />
              <Info label="Email"              value={member.email} />
              <Info label="Phone"              value={member.phone} />
              <Info label="Gender"             value={member.gender && member.gender.charAt(0).toUpperCase() + member.gender.slice(1)} />
              <Info label="Date of Birth"      value={fmt(member.dateOfBirth)} />
              <Info label="Marital Status"     value={member.maritalStatus && member.maritalStatus.charAt(0).toUpperCase() + member.maritalStatus.slice(1)} />
              <Info label="Residential Address" value={member.residentialAddress} />
              <Info label="Postal Address"     value={member.postalAddress} />
            </Section>

            {member.children?.length > 0 && (
              <Section title="Children" icon={Baby}>
                <div className="col-span-2">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-100">
                        <th className="text-left pb-2 font-semibold">Name</th>
                        <th className="text-left pb-2 font-semibold">Date of Birth</th>
                        <th className="text-left pb-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {member.children.map((child, idx) => (
                        <tr key={idx} className="py-1">
                          <td className="py-1.5 text-slate-800">{child.name || '—'}</td>
                          <td className="py-1.5 text-slate-800">{fmt(child.dateOfBirth)}</td>
                          <td className="py-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${child.isMember ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              {child.isMember ? 'Member' : 'Non-Member'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            <Section title="Church History" icon={Church}>
              <Info label="Member Since"          value={member.memberSince} />
              <Info label="Holy Spirit Baptism"   value={member.holySpiritBaptism} />
              <Info label="Water Baptism"         value={member.waterBaptism ? `Yes${member.waterBaptismDate ? ` — ${fmt(member.waterBaptismDate)}` : ''}` : 'No'} />
              <Info label="Desires Re-baptism"    value={member.desiresRebaptism ? 'Yes' : 'No'} />
              <Info label="Department Interest"   value={member.departmentInterest} />
            </Section>

            <Section title="Faith & Identity" icon={Heart}>
              <Info label="Believes in Jesus"   value={member.believesInJesus === true ? 'Yes' : member.believesInJesus === false ? 'No' : '—'} />
              <Info label="ID / Passport No."   value={member.idPassportNumber} />
              <Info label="Signature"           value={member.signatureName} />
              <Info label="Signature Date"      value={fmt(member.signatureDate)} />
            </Section>

            <Section title="Application Details" icon={Calendar}>
              <Info label="Submitted"   value={fmt(member.submittedAt)} />
              <Info label="Status"      value={<StatusBadge status={member.status} />} />
              {member.reviewedAt && (
                <>
                  <Info label="Reviewed"    value={fmt(member.reviewedAt)} />
                  <Info label="Reviewed By" value={member.reviewedBy?.name || '—'} />
                  {member.reviewNotes && (
                    <div className="col-span-2">
                      <Info label="Review Notes" value={member.reviewNotes} />
                    </div>
                  )}
                </>
              )}
            </Section>

            {/* Review notes input */}
            {member.status === 'pending' && (
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                  Review Notes (optional)
                </label>
                <textarea
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] resize-none"
                  rows={2}
                  placeholder="Add notes for this decision…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Footer actions */}
          {member.status === 'pending' && (
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => onReject(member._id, notes)}
                disabled={isActing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                {isActing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
              </button>
              <button
                onClick={() => onApprove(member._id, notes)}
                disabled={isActing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, #16a34a, #15803d)` }}
              >
                {isActing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── DELETE CONFIRM ────────────────────────────────────────────────────────────

function DeleteConfirmModal({ member, onConfirm, onCancel, isDeleting }) {
  if (!member) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <h3 className="text-lg font-black text-slate-900 text-center">Delete Record?</h3>
          <p className="text-sm text-slate-500 text-center mt-2">
            This will permanently delete <strong>{member.fullName}</strong>'s membership application.
            This cannot be undone.
          </p>
          <div className="flex gap-3 mt-6">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : null} Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function MembersPage() {
  const qc = useQueryClient();
  const { canManageMembers, isAdmin } = usePermissions();

  // Redirect guard
  if (!canManageMembers()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <p className="text-slate-600 font-semibold">You don't have permission to view this page.</p>
      </div>
    );
  }

  // ── State ──────────────────────────────────────────────────────────────────
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');     // '' | 'pending' | 'approved' | 'rejected'
  const [viewing, setViewing] = useState(null);   // full member object for detail modal
  const [deleting,setDeleting]= useState(null);   // member to delete

  // ── Queries ────────────────────────────────────────────────────────────────
  const statsQ = useQuery({
    queryKey:  ['membership-stats'],
    queryFn:   getMemberStats,
    staleTime: 30_000,
    select:    (d) => d.data,
  });

  const listQ = useQuery({
    queryKey:  ['members', page, search, status],
    queryFn:   () => getAllMembers({ page, limit: 15, search: search || undefined, status: status || undefined }),
    staleTime: 20_000,
    keepPreviousData: true,
  });

  const members    = listQ.data?.data        || [];
  const pagination = listQ.data?.pagination  || {};

  // ── Mutations ──────────────────────────────────────────────────────────────
  const statusMut = useMutation({
    mutationFn: ({ id, newStatus, notes }) => updateMemberStatus(id, newStatus, notes),
    onSuccess: (_, { newStatus }) => {
      toast.success(`Application ${newStatus}`);
      qc.invalidateQueries({ queryKey: ['members'] });
      qc.invalidateQueries({ queryKey: ['membership-stats'] });
      setViewing(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Action failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteMember(id),
    onSuccess: () => {
      toast.success('Record deleted');
      qc.invalidateQueries({ queryKey: ['members'] });
      qc.invalidateQueries({ queryKey: ['membership-stats'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Delete failed'),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleApprove = (id, notes) => statusMut.mutate({ id, newStatus: 'approved', notes });
  const handleReject  = (id, notes) => statusMut.mutate({ id, newStatus: 'rejected', notes });
  const handleDelete  = ()          => deleteMut.mutate(deleting._id);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (s) => {
    setStatus(s);
    setPage(1);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Church Membership</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review and manage membership applications</p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['members'] })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Stats Row ── */}
      {statsQ.data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Applications" value={statsQ.data.total}    icon={Users}       color="#64748b" />
          <StatCard label="Pending Review"      value={statsQ.data.pending}  icon={Clock}       color="#d97706" />
          <StatCard label="Approved Members"    value={statsQ.data.approved} icon={CheckCircle2}color="#16a34a" />
          <StatCard label="Rejected"            value={statsQ.data.rejected} icon={XCircle}     color="#dc2626" />
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: '',         label: 'All'      },
            { value: 'pending',  label: 'Pending'  },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                status === opt.value
                  ? 'border-[#8B1A1A] bg-[#8B1A1A] text-white'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {listQ.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-slate-400" />
          </div>
        ) : listQ.isError ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-slate-500 text-sm">Failed to load membership records.</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <UserCheck size={36} className="text-slate-300" />
            <p className="text-slate-400 text-sm font-medium">No applications found.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Name', 'Email', 'Phone', 'Submitted', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {members.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ background: RED }}>
                            {m.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{m.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{m.email}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{m.phone || '—'}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{fmt(m.submittedAt)}</td>
                      <td className="px-5 py-4"><StatusBadge status={m.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewing(m)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          {m.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(m._id, '')}
                                className="p-2 rounded-lg text-green-500 hover:text-green-700 hover:bg-green-50 transition-colors"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleReject(m._id, '')}
                                className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDeleting(m)}
                            className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-slate-100">
              {members.map((m) => (
                <div key={m._id} className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0" style={{ background: RED }}>
                    {m.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{m.fullName}</p>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{m.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{fmt(m.submittedAt)}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setViewing(m)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <Eye size={12} /> View
                      </button>
                      {m.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(m._id, '')}
                            className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(m._id, '')}
                            className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Showing {((page - 1) * 15) + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="text-sm font-bold text-slate-700">{page} / {pagination.pages}</span>
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {viewing && (
        <MemberDetailModal
          member={viewing}
          onClose={() => setViewing(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          isActing={statusMut.isPending}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleting && (
        <DeleteConfirmModal
          member={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          isDeleting={deleteMut.isPending}
        />
      )}
    </div>
  );
}