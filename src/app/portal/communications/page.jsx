'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail, MessageSquare, Users, User, Send, Clock, CheckCircle2,
  XCircle, Loader2, FileText, History, BarChart3, Plus, Trash2,
  AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';
import communicationService from '@/services/api/communicationService';

// ── Constants ─────────────────────────────────────────────────────────────────
const CHANNELS = [
  { id: 'email', label: 'Email',     icon: Mail,           color: 'blue'  },
  { id: 'sms',   label: 'SMS',       icon: MessageSquare,  color: 'green' },
];

const RECIPIENT_TYPES = [
  { id: 'all',    label: 'All Members',     icon: Users,  desc: 'Send to every member'     },
  { id: 'role',   label: 'By Role',         icon: Users,  desc: 'Target a specific role'   },
  { id: 'bulk',   label: 'Select Users',    icon: User,   desc: 'Pick individual members'  },
];

const TEMPLATE_CATEGORIES = [
  { value: 'announcement', label: 'Announcement'    },
  { value: 'event',        label: 'Event Invitation'},
  { value: 'newsletter',   label: 'Newsletter'      },
  { value: 'reminder',     label: 'Reminder'        },
  { value: 'welcome',      label: 'Welcome'         },
  { value: 'other',        label: 'Other'           },
];

const STATUS_STYLES = {
  queued:    'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  sending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  sent:      'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  partial:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  failed:    'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
  scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-KE', { year:'numeric', month:'short', day:'numeric' }) : '—';
const fmtDT    = (d) => d ? new Date(d).toLocaleString('en-KE') : '—';
const channels = (arr = []) => arr.map(c => c.toUpperCase()).join(' + ');

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('compose');
  const qc = useQueryClient();

  // ── Global data queries ───────────────────────────────────────────────────
  const { data: usersData  } = useQuery({ queryKey: ['comm-users'],     queryFn: () => communicationService.getUsers(),    staleTime: 60_000 });
  const { data: rolesData  } = useQuery({ queryKey: ['comm-roles'],     queryFn: () => communicationService.getRoles(),    staleTime: 60_000 });
  const { data: statsData  } = useQuery({ queryKey: ['comm-stats'],     queryFn: () => communicationService.getStats(),    refetchInterval: 30_000 });
  const { data: tmplData   } = useQuery({ queryKey: ['comm-templates'], queryFn: () => communicationService.getTemplates(), staleTime: 30_000 });

  const users     = usersData?.users     || [];
  const roles     = rolesData?.roles     || [];
  const stats     = statsData?.stats     || {};
  const templates = tmplData?.templates  || [];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: (data) => communicationService.send(data),
    onSuccess:  () => {
      qc.invalidateQueries(['comm-stats']);
      qc.invalidateQueries(['comm-history']);
    },
  });

  const deleteTmplMutation = useMutation({
    mutationFn: (id) => communicationService.deleteTemplate(id),
    onSuccess:  () => qc.invalidateQueries(['comm-templates']),
  });

  const deleteCommMutation = useMutation({
    mutationFn: (id) => communicationService.deleteById(id),
    onSuccess:  () => qc.invalidateQueries(['comm-history']),
  });

  const TABS = [
    { id: 'compose',   label: 'Compose',   icon: Send    },
    { id: 'history',   label: 'History',   icon: History },
    { id: 'templates', label: 'Templates', icon: FileText},
    { id: 'stats',     label: 'Analytics', icon: BarChart3},
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#8B1A1A] flex items-center justify-center shadow-md flex-shrink-0">
            <Zap className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Communications
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Reach your congregation via Email and SMS — powered by Brevo & Africa's Talking
            </p>
          </div>
        </div>

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Sent',       value: stats.totalSent     || 0, icon: CheckCircle2, color: 'text-green-500'  },
            { label: 'In Queue',   value: stats.totalQueued   || 0, icon: Clock,        color: 'text-blue-500'   },
            { label: 'Failed',     value: stats.totalFailed   || 0, icon: XCircle,      color: 'text-red-500'    },
            { label: 'Scheduled',  value: stats.totalScheduled|| 0, icon: Clock,        color: 'text-purple-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <Icon className={color} size={22} />
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tab Navigation ──────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-1.5">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-[#8B1A1A] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────────── */}
        {activeTab === 'compose' && (
          <ComposeTab
            users={users}
            roles={roles}
            templates={templates}
            sendMutation={sendMutation}
            onTemplateCreate={() => qc.invalidateQueries(['comm-templates'])}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab deleteCommMutation={deleteCommMutation} />
        )}
        {activeTab === 'templates' && (
          <TemplatesTab
            templates={templates}
            deleteTmplMutation={deleteTmplMutation}
            onCreated={() => qc.invalidateQueries(['comm-templates'])}
            onLoadTemplate={(t) => {
              setActiveTab('compose');
            }}
          />
        )}
        {activeTab === 'stats' && (
          <StatsTab stats={stats} />
        )}

      </div>
    </div>
  );
}

// ── Compose Tab ───────────────────────────────────────────────────────────────
function ComposeTab({ users, roles, templates, sendMutation, onTemplateCreate }) {
  const [channels,       setChannels]       = useState(['email']);
  const [recipientType,  setRecipientType]  = useState('all');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedUsers,  setSelectedUsers]  = useState([]);
  const [subject,        setSubject]        = useState('');
  const [message,        setMessage]        = useState('');
  const [scheduledFor,   setScheduledFor]   = useState('');
  const [result,         setResult]         = useState(null);
  const [userSearch,     setUserSearch]     = useState('');

  const toggleChannel = (ch) => {
    setChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const toggleUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const applyTemplate = (template) => {
    if (template.subject) setSubject(template.subject);
    if (template.message) setMessage(template.message);
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleSend = async () => {
    if (!message.trim()) return alert('Message is required');
    if (!channels.length) return alert('Select at least one channel');
    if (channels.includes('email') && !subject.trim()) return alert('Subject is required for Email');
    if (recipientType === 'role' && !selectedRoleId) return alert('Please select a role');
    if (recipientType === 'bulk' && selectedUsers.length === 0) return alert('Please select at least one user');

    const payload = {
      subject:       subject.trim() || undefined,
      message:       message.trim(),
      channels,
      recipientType,
      targetRoles:   recipientType === 'role' ? [selectedRoleId] : [],
      targetUserIds: ['bulk', 'single'].includes(recipientType) ? selectedUsers : [],
      scheduledFor:  scheduledFor || undefined,
    };

    try {
      const res = await sendMutation.mutateAsync(payload);
      setResult(res);
      if (res.success) {
        setSubject(''); setMessage(''); setScheduledFor('');
        setSelectedUsers([]); setSelectedRoleId('');
      }
    } catch (err) {
      setResult({ success: false, message: err?.response?.data?.message || 'Failed to send' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left: Configuration */}
      <div className="lg:col-span-1 space-y-4">

        {/* Channel selector */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
            Channel
          </h3>
          <div className="space-y-2">
            {CHANNELS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => toggleChannel(id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  channels.includes(id)
                    ? 'border-[#8B1A1A] bg-[#8B1A1A]/5 dark:bg-[#8B1A1A]/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon
                  size={18}
                  className={channels.includes(id) ? 'text-[#8B1A1A]' : 'text-slate-400'}
                />
                <span className={`font-semibold text-sm ${
                  channels.includes(id) ? 'text-[#8B1A1A]' : 'text-slate-700 dark:text-slate-300'
                }`}>{label}</span>
                {channels.includes(id) && (
                  <CheckCircle2 size={16} className="ml-auto text-[#8B1A1A]" />
                )}
              </button>
            ))}
          </div>
          {channels.length === 0 && (
            <p className="mt-2 text-xs text-red-500">Select at least one channel</p>
          )}
        </div>

        {/* Recipient type */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
            Recipients
          </h3>
          <div className="space-y-2">
            {RECIPIENT_TYPES.map(({ id, label, desc }) => (
              <button
                key={id}
                onClick={() => { setRecipientType(id); setSelectedUsers([]); setSelectedRoleId(''); }}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  recipientType === id
                    ? 'border-[#8B1A1A] bg-[#8B1A1A]/5 dark:bg-[#8B1A1A]/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <p className={`font-semibold text-sm ${recipientType === id ? 'text-[#8B1A1A]' : 'text-slate-800 dark:text-slate-200'}`}>
                  {label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>

          {/* Role selector */}
          {recipientType === 'role' && (
            <div className="mt-3">
              <select
                value={selectedRoleId}
                onChange={e => setSelectedRoleId(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              >
                <option value="">— Select role —</option>
                {roles.map(r => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* User picker */}
          {recipientType === 'bulk' && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
              <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                {filteredUsers.map(u => (
                  <label key={u._id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u._id)}
                      onChange={() => toggleUser(u._id)}
                      className="rounded text-[#8B1A1A] focus:ring-[#8B1A1A]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{u.name}</p>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{selectedUsers.length} selected</p>
            </div>
          )}
        </div>

        {/* Summary box */}
        <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-4 text-sm">
          <p className="font-bold text-slate-700 dark:text-slate-300 mb-2">Summary</p>
          <div className="space-y-1 text-slate-600 dark:text-slate-400">
            <p>Channels: <span className="font-semibold text-slate-900 dark:text-white">{channels.length ? channels.join(' + ').toUpperCase() : '—'}</span></p>
            <p>Recipients: <span className="font-semibold text-slate-900 dark:text-white capitalize">{
              recipientType === 'all'  ? `All members (${users.length})` :
              recipientType === 'role' ? (selectedRoleId ? roles.find(r => r._id === selectedRoleId)?.name || 'Selected role' : 'No role selected') :
              recipientType === 'bulk' ? `${selectedUsers.length} selected` : '—'
            }</span></p>
          </div>
        </div>

      </div>

      {/* Right: Compose */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Compose Message</h3>
            {templates.length > 0 && (
              <select
                defaultValue=""
                onChange={e => {
                  const t = templates.find(t => t._id === e.target.value);
                  if (t) applyTemplate(t);
                }}
                className="text-sm px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="" disabled>Load template…</option>
                {templates.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Subject (email only) */}
          {channels.includes('email') && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Sunday Service Announcement"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
              />
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Message <span className="text-red-500">*</span>
              {channels.includes('sms') && (
                <span className="ml-2 font-normal text-slate-500">
                  ({message.length}/155 chars for SMS)
                </span>
              )}
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={8}
              placeholder="Type your message here…"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent resize-none"
            />
            {channels.includes('sms') && message.length > 155 && (
              <p className="mt-1 text-xs text-orange-500 flex items-center gap-1">
                <AlertTriangle size={12} />
                SMS will be truncated to 155 characters
              </p>
            )}
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Schedule (optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={e => setScheduledFor(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>

          {/* Send button */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSend}
              disabled={sendMutation.isPending || !channels.length || !message.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#8B1A1A] hover:bg-[#6d1414] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-sm"
            >
              {sendMutation.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> Processing…</>
              ) : scheduledFor ? (
                <><Clock size={18} /> Schedule</>
              ) : (
                <><Send size={18} /> Send Now</>
              )}
            </button>
          </div>
        </div>

        {/* Result feedback */}
        {result && (
          <div className={`rounded-xl p-5 border ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50   dark:bg-red-900/20   border-red-200   dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {result.success
                ? <CheckCircle2 className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                : <XCircle      className="text-red-600   dark:text-red-400   flex-shrink-0 mt-0.5" size={20} />
              }
              <div>
                <p className={`font-bold text-sm ${result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                  {result.success ? '✅ Queued Successfully' : '❌ Failed'}
                </p>
                <p className={`text-sm mt-0.5 ${result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {result.message}
                </p>
                {result.success && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Delivery is processing in the background. Check History for updates.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────
function HistoryTab({ deleteCommMutation }) {
  const [page,         setPage]         = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter,setChannelFilter]= useState('');
  const LIMIT = 15;

  const { data, isLoading, refetch } = useQuery({
    queryKey:  ['comm-history', page, statusFilter, channelFilter],
    queryFn:   () => communicationService.getAll({ page, limit: LIMIT, status: statusFilter || null, channel: channelFilter || null }),
    keepPreviousData: true,
  });

  const comms      = data?.communications || [];
  const total      = data?.total          || 0;
  const totalPages = data?.totalPages     || 1;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-200 dark:border-slate-700">
        <h2 className="font-bold text-slate-900 dark:text-white">
          Communication History
          <span className="ml-2 text-sm font-normal text-slate-500">({total} total)</span>
        </h2>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="">All statuses</option>
            {['queued','sending','sent','partial','failed','scheduled'].map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <select
            value={channelFilter}
            onChange={e => { setChannelFilter(e.target.value); setPage(1); }}
            className="text-sm px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="">All channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
          <button
            onClick={() => refetch()}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-[#8B1A1A] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : comms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <History size={48} className="mb-3 opacity-30" />
          <p className="font-semibold">No communications found</p>
          <p className="text-sm mt-1">Send your first message to see history here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-left">
                {['Subject / Message', 'Channels', 'Recipients', 'Delivered', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {comms.map(comm => (
                <tr key={comm._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{comm.subject || '—'}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs truncate mt-0.5">{comm.message?.substring(0, 60)}…</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">by {comm.createdBy?.name || 'Unknown'}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {(comm.channels || []).map(c => (
                        <span key={c} className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          c === 'email' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300 font-mono">
                    {comm.totalRecipients?.toLocaleString() || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {(comm.channels || []).includes('email') && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        ✉ {comm.emailSuccessCount || 0} / {(comm.emailSuccessCount || 0) + (comm.emailFailedCount || 0)}
                      </p>
                    )}
                    {(comm.channels || []).includes('sms') && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        💬 {comm.smsSuccessCount || 0} / {(comm.smsSuccessCount || 0) + (comm.smsFailedCount || 0)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[comm.status] || ''}`}>
                      {comm.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                    {fmtDate(comm.createdAt)}
                    {comm.sentAt && <p className="text-slate-400 dark:text-slate-500">sent {fmtDate(comm.sentAt)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        if (confirm('Delete this communication record?')) {
                          deleteCommMutation.mutate(comm._id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages} · {total} records
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Templates Tab ─────────────────────────────────────────────────────────────
function TemplatesTab({ templates, deleteTmplMutation, onCreated, onLoadTemplate }) {
  const [showForm,  setShowForm]  = useState(false);
  const [editTmpl,  setEditTmpl]  = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900 dark:text-white">
          Message Templates
          <span className="ml-2 text-sm font-normal text-slate-500">({templates.length})</span>
        </h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditTmpl(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B1A1A] hover:bg-[#6d1414] text-white text-sm font-bold rounded-lg transition-colors"
        >
          <Plus size={16} /> New Template
        </button>
      </div>

      {/* Create / Edit form */}
      {(showForm || editTmpl) && (
        <TemplateForm
          initialData={editTmpl}
          onSuccess={() => { setShowForm(false); setEditTmpl(null); onCreated(); }}
          onCancel={() => { setShowForm(false); setEditTmpl(null); }}
        />
      )}

      {/* Templates grid */}
      {templates.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm flex flex-col items-center py-16 text-slate-400">
          <FileText size={48} className="mb-3 opacity-30" />
          <p className="font-semibold">No templates yet</p>
          <p className="text-sm mt-1">Create reusable templates to speed up communications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{t.name}</h3>
                  {t.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{t.description}</p>
                  )}
                </div>
                <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
                  {t.category}
                </span>
              </div>
              {t.subject && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Subject:</span> {t.subject}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2 flex-1">
                {t.message}
              </p>
              <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => onLoadTemplate(t)}
                  className="flex-1 py-1.5 bg-[#8B1A1A] hover:bg-[#6d1414] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Use Template
                </button>
                <button
                  onClick={() => setEditTmpl(t)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${t.name}"?`)) deleteTmplMutation.mutate(t._id);
                  }}
                  className="px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Template Form ─────────────────────────────────────────────────────────────
function TemplateForm({ initialData, onSuccess, onCancel }) {
  const [form,    setForm]    = useState({
    name:        initialData?.name        || '',
    description: initialData?.description || '',
    subject:     initialData?.subject     || '',
    message:     initialData?.message     || '',
    category:    initialData?.category    || 'other',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim() || !form.message.trim()) return alert('Name and message are required');
    setSaving(true);
    try {
      if (initialData?._id) {
        await communicationService.updateTemplate(initialData._id, form);
      } else {
        await communicationService.createTemplate(form);
      }
      onSuccess();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'text', rows = 0) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      {rows > 0 ? (
        <textarea
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={rows}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] resize-none"
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
        />
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border-2 border-[#8B1A1A]/20">
      <h3 className="font-bold text-slate-900 dark:text-white mb-4">
        {initialData ? 'Edit Template' : 'Create Template'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('Template Name *', 'name')}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
          >
            {TEMPLATE_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">{field('Description', 'description')}</div>
        <div className="md:col-span-2">{field('Email Subject (optional)', 'subject')}</div>
        <div className="md:col-span-2">{field('Message *', 'message', 'text', 5)}</div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#6d1414] disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin inline mr-1.5" /> : null}
          {initialData ? 'Save Changes' : 'Create Template'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────
function StatsTab({ stats }) {
  const statCards = [
    { label: 'Total Sent',       value: stats.totalSent     || 0, sub: 'campaigns',     color: 'bg-green-500'  },
    { label: 'Emails Delivered', value: stats.emailDelivered|| 0, sub: 'individual',    color: 'bg-blue-500'   },
    { label: 'SMS Delivered',    value: stats.smsDelivered  || 0, sub: 'messages',      color: 'bg-teal-500'   },
    { label: 'Email Failures',   value: stats.emailFailed   || 0, sub: 'bounced',       color: 'bg-red-500'    },
    { label: 'SMS Failures',     value: stats.smsFailed     || 0, sub: 'undelivered',   color: 'bg-orange-500' },
    { label: 'Scheduled',        value: stats.totalScheduled|| 0, sub: 'pending',       color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 flex items-start gap-4">
            <div className={`w-2.5 h-full min-h-[40px] rounded-full ${color} flex-shrink-0`} />
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                {value.toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
        {!stats.recentActivity?.length ? (
          <p className="text-slate-400 text-sm py-4 text-center">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {stats.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{a.subject || 'SMS Broadcast'}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-xs text-slate-500">{channels(a.channels)}</p>
                    <p className="text-xs text-slate-500">{a.totalRecipients?.toLocaleString()} recipients</p>
                    {a.emailSuccessCount > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400">✉ {a.emailSuccessCount}</p>
                    )}
                    {a.smsSuccessCount > 0 && (
                      <p className="text-xs text-teal-600 dark:text-teal-400">💬 {a.smsSuccessCount}</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_STYLES[a.status] || ''}`}>
                    {a.status}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{fmtDate(a.sentAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}