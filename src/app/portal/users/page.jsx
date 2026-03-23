'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Users, UserPlus, Edit, Trash2, Shield, Search, Download, Mail, Phone, MapPin,
  Calendar, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Ban, User, Copy, Eye, EyeOff, X,
  UserCheck, Clock, Printer, Loader2, RefreshCw, Baby, Church,
  Droplets, Heart, Fingerprint, PenLine, ChevronDown, Plus
} from 'lucide-react';
import {
  getAllUsers, updateUser, updateUserRole, deleteUser, banUser,
  getUserStats, exportUsersToCSV, downloadCSV
} from '@/services/api/userService';
import { getAllMembers, updateMember, updateMemberStatus, deleteMember } from '@/services/api/membershipService';
import { getAllRoles } from '@/services/api/roleService';
import Loader from '@/components/common/Loader';
import ManualRegisterModal from '@/components/users/ManualRegisterModal';

// ── Brand ──────────────────────────────────────────────────────────────────────
const RED  = '#8B1A1A';
const GOLD = '#d4a017';

// ── Type badge config ─────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  approved: { label: 'Member',   bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-300',  dot: 'bg-green-500' },
  pending:  { label: 'Pending',  bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700 dark:text-amber-300',  dot: 'bg-amber-500' },
  rejected: { label: 'Rejected', bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-600 dark:text-red-400',      dot: 'bg-red-500'   },
  guest:    { label: 'Guest',    bg: 'bg-slate-100 dark:bg-slate-700',     text: 'text-slate-600 dark:text-slate-300',  dot: 'bg-slate-400' },
};

const TypeBadge = ({ type }) => {
  const c = TYPE_CONFIG[type] || TYPE_CONFIG.guest;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

// ── Determine user "type" from merged membership data ─────────────────────────
const getUserType = (membership) => {
  if (!membership) return 'guest';
  return membership.status; // 'approved' | 'pending' | 'rejected'
};

// ── Print helper — opens a clean print window ─────────────────────────────────
const handlePrint = (user, membership) => {
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  const field = (label, value) =>
    `<div class="field"><span class="label">${label}</span><span class="value">${value || '—'}</span></div>`;

  const childRows = (membership?.children || []).map(c =>
    `<tr><td>${c.name || '—'}</td><td>${fmt(c.dateOfBirth)}</td><td>${c.isMember ? 'Member' : 'Non-Member'}</td></tr>`
  ).join('') || '<tr><td colspan="3" style="color:#999;font-style:italic">None listed</td></tr>';

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>H.O.T. Church — ${user.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', serif; color: #1a1a1a; padding: 32px; max-width: 780px; margin: auto; }
    h1 { text-align: center; font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; text-decoration: underline; margin-bottom: 6px; }
    .subtitle { text-align: center; font-size: 11px; color: #555; margin-bottom: 20px; }
    .preamble { font-size: 11px; line-height: 1.6; margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; background: #fafafa; }
    .preamble strong { font-style: italic; }
    .section { margin-bottom: 18px; }
    .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 10px; color: ${RED}; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
    .field { display: flex; flex-direction: column; gap: 2px; }
    .label { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #666; }
    .value { font-size: 12px; border-bottom: 1px dotted #999; padding-bottom: 2px; min-height: 18px; }
    .full-width { grid-column: 1 / -1; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px; }
    th { background: #f0f0f0; padding: 5px 8px; text-align: left; font-size: 10px; font-weight: bold; border: 1px solid #ccc; }
    td { padding: 5px 8px; border: 1px solid #ddd; }
    .faith-box { border: 2px solid #8B1A1A; padding: 10px; font-size: 11px; line-height: 1.6; margin-bottom: 10px; background: #fff8f0; }
    .sig-row { display: flex; gap: 32px; margin-top: 24px; }
    .sig-line { flex: 1; border-bottom: 1px solid #333; margin-top: 20px; }
    .sig-label { font-size: 10px; color: #666; margin-top: 3px; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; ${
      membership?.status === 'approved' ? 'background:#d1fae5;color:#065f46' :
      membership?.status === 'pending'  ? 'background:#fef3c7;color:#92400e' :
                                          'background:#f1f5f9;color:#475569'
    }; }
    .header-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header-meta">
    <span></span>
    <span class="status-badge">${membership ? membership.status : 'Guest'}</span>
  </div>
  <h1>House of Transformation Church</h1>
  <div class="subtitle">Busia County, Kenya &nbsp;·&nbsp; Membership Record</div>

  <div class="preamble">
    As the church grows in the present day <strong>twenty-first (21st) century</strong>, it becomes very necessary to know the
    <strong>bona-fide members</strong> of our church. It is therefore, vitally important for you and the church, that we have honest
    and timely information regarding our faithful saints. <em>"And let ours also learn to maintain good works for necessary uses,
    that they be not unfruitful." Titus 3:14.</em>
  </div>

  <!-- Account Section -->
  <div class="section">
    <div class="section-title">Account Information</div>
    <div class="grid">
      ${field('Full Name', user.name)}
      ${field('Email Address', user.email)}
      ${field('Phone Number', user.phone)}
      ${field('Gender', user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : null)}
      ${field('Location', user.location)}
      ${field('Role', user.role?.name)}
      ${field('Account Created', fmt(user.createdAt))}
      ${field('Account Status', user.isActive ? 'Active' : 'Inactive')}
    </div>
  </div>

  ${membership ? `
  <!-- Personal Details -->
  <div class="section">
    <div class="section-title">Personal Details</div>
    <div class="grid">
      ${field('Residential Address (Where You Live)', membership.residentialAddress)}
      ${field('Postal Address &amp; Code', membership.postalAddress)}
      ${field('Date of Birth', fmt(membership.dateOfBirth))}
      ${field('Marital Status', membership.maritalStatus ? membership.maritalStatus.charAt(0).toUpperCase() + membership.maritalStatus.slice(1) : null)}
    </div>
  </div>

  <!-- Children -->
  <div class="section">
    <div class="section-title">Particulars of Children</div>
    <table>
      <thead><tr><th>Name</th><th>Date of Birth</th><th>Member / Non-Member</th></tr></thead>
      <tbody>${childRows}</tbody>
    </table>
  </div>

  <!-- Church History -->
  <div class="section">
    <div class="section-title">Church History &amp; Ministry</div>
    <div class="grid">
      ${field('Member Since', membership.memberSince)}
      ${field('Water Baptism', membership.waterBaptism ? `Yes${membership.waterBaptismDate ? ' — ' + fmt(membership.waterBaptismDate) : ''}` : 'No')}
      ${field('Desires Re-baptism', membership.desiresRebaptism ? 'Yes' : 'No')}
      ${field('Department Interest', membership.departmentInterest)}
      <div class="field full-width">
        <span class="label">Holy Spirit Baptism (Since You Believed)</span>
        <span class="value">${membership.holySpiritBaptism || '—'}</span>
      </div>
    </div>
  </div>

  <!-- Faith Declaration -->
  <div class="section">
    <div class="section-title">Faith Declaration</div>
    <div class="faith-box">
      Do you believe that Jesus is the Son of God and that He came, was born of a virgin, died on the cross,
      was buried and on the third day He rose again, ascended, and was received in Heaven and is sat at the
      right hand of God?<br><br>
      <strong>Answer: ${membership.believesInJesus === true ? 'YES — I believe.' : membership.believesInJesus === false ? 'No' : '—'}</strong>
    </div>
    <div class="grid">
      ${field('Name &amp; Surname', membership.signatureName || membership.fullName)}
      ${field('Identity Card / Passport No.', membership.idPassportNumber)}
    </div>
  </div>

  <!-- Signature -->
  <div class="sig-row">
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Signature: ${membership.signatureName || '_______________'}</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Date: ${fmt(membership.signatureDate) || fmt(membership.submittedAt)}</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Reviewed by: ${membership.reviewedBy?.name || '_______________'}</div>
    </div>
  </div>
  ` : `
  <div class="section">
    <div class="section-title">Membership Application</div>
    <p style="font-size:12px;color:#888;font-style:italic;padding:16px 0;">
      This user has not submitted a membership application — they are currently registered as a guest.
    </p>
  </div>
  `}

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  w.document.write(html);
  w.document.close();
};

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',      label: 'All'      },
  { key: 'approved', label: 'Members'  },
  { key: 'pending',  label: 'Pending'  },
  { key: 'guest',    label: 'Guests'   },
  { key: 'rejected', label: 'Rejected' },
];

// ── Section heading for modals ────────────────────────────────────────────────
const ModalSection = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 mt-6 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
    <Icon size={14} style={{ color: RED }} />
    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</span>
  </div>
);

const inputCls = 'w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed';
const labelCls = 'block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5';

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function UsersPage() {
  const { user: currentUser, checkAuth } = useAuth();
  const { canManageUsers, canManageMembers, isAdmin } = usePermissions();

  // ── Core state ────────────────────────────────────────────────────────────
  const [users,        setUsers]        = useState([]);
  const [membershipMap,setMembershipMap]= useState({}); // email → membership doc
  const [roles,        setRoles]        = useState([]);
  const [stats,        setStats]        = useState({ total: 0, active: 0, inactive: 0, banned: 0, byRole: {} });
  const [memberStats,  setMemberStats]  = useState({ approved: 0, pending: 0, guest: 0 });

  const [loading,       setLoading]      = useState(true);
  const [actionLoading, setActionLoading]= useState(false);
  const [error,         setError]        = useState(null);
  const [success,       setSuccess]      = useState(null);

  // ── Pagination ────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalUsers,  setTotalUsers]  = useState(0);
  const LIMIT = 50;

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search,        setSearch]       = useState('');
  const [debouncedSearch,setDebouncedSearch]=useState('');
  const [roleFilter,    setRoleFilter]   = useState('all');
  const [typeTab,       setTypeTab]      = useState('all'); // 'all'|'approved'|'pending'|'guest'|'rejected'

  // ── Modals ────────────────────────────────────────────────────────────────
  const [viewTarget,    setViewTarget]   = useState(null);
  const [editTarget,    setEditTarget]   = useState(null);
  const [editTab,       setEditTab]      = useState('profile'); // 'profile' | 'membership'
  const [roleTarget,    setRoleTarget]   = useState(null);
  const [banTarget,     setBanTarget]    = useState(null);
  const [deleteTarget,  setDeleteTarget] = useState(null);
  const [showRegModal,  setShowRegModal] = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({ name:'', phone:'', location:'', bio:'', gender:'' });
  const [memberForm,  setMemberForm]  = useState({
    phone:'', residentialAddress:'', postalAddress:'', dateOfBirth:'',
    maritalStatus:'', gender:'', memberSince:'', holySpiritBaptism:'',
    waterBaptism:'', waterBaptismDate:'', desiresRebaptism:'', departmentInterest:'',
    believesInJesus:'', idPassportNumber:'', signatureName:'', signatureDate:'',
    membershipStatus:''
  });
  const [memberChildren, setMemberChildren] = useState([]); // children rows for edit modal
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [banReason,      setBanReason]      = useState('');
  // ── ManualRegisterModal state lives inside the component itself ───────────
  //const [showRegModal,   setShowRegModal]   = useState(false);

  // ── Debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setCurrentPage(1); }, 450);
    return () => clearTimeout(t);
  }, [search]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, membersRes, statsRes] = await Promise.all([
        getAllUsers(currentPage, LIMIT, {
          search: debouncedSearch || undefined,
          role:   roleFilter !== 'all' ? roleFilter : undefined,
        }),
        getAllMembers({ limit: 500 }), // build full lookup map
        getUserStats(),
      ]);

      if (usersRes.success) {
        setUsers(usersRes.users || []);
        setTotalPages(usersRes.pages || 1);
        setTotalUsers(usersRes.total || 0);
      }

      if (membersRes.success) {
        const map = {};
        let approved = 0, pending = 0;
        (membersRes.data || []).forEach(m => {
          map[m.email] = m;
          if (m.status === 'approved') approved++;
          if (m.status === 'pending')  pending++;
        });
        setMembershipMap(map);
        const total = usersRes.total || 0;
        setMemberStats({ approved, pending, guest: Math.max(0, total - approved - pending) });
      }

      if (statsRes.success) setStats(statsRes.stats);

    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, roleFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => { getAllRoles().then(r => r.success && setRoles(r.roles || [])).catch(() => {}); }, []);

  // ── Filter users by type tab ──────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    if (typeTab === 'all') return true;
    const m = membershipMap[u.email?.toLowerCase()];
    const type = getUserType(m);
    return type === typeTab;
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toast = (msg, isErr = false) => {
    isErr ? setError(msg) : setSuccess(msg);
    if (!isErr) setTimeout(() => setSuccess(null), 3000);
  };

  const openEdit = (user) => {
    const m = membershipMap[user.email?.toLowerCase()];
    setEditTarget({ user, membership: m || null });
    setEditTab('profile');
    setProfileForm({ name: user.name||'', phone: user.phone||'', location: user.location||'', bio: user.bio||'', gender: user.gender||'' });
    if (m) {
      setMemberForm({
        phone:              m.phone || user.phone || '',
        residentialAddress: m.residentialAddress || '',
        postalAddress:      m.postalAddress || '',
        dateOfBirth:        m.dateOfBirth ? m.dateOfBirth.split('T')[0] : '',
        maritalStatus:      m.maritalStatus || '',
        gender:             m.gender || user.gender || '',
        memberSince:        m.memberSince || '',
        holySpiritBaptism:  m.holySpiritBaptism || '',
        waterBaptism:       m.waterBaptism ? 'yes' : 'no',
        waterBaptismDate:   m.waterBaptismDate ? m.waterBaptismDate.split('T')[0] : '',
        desiresRebaptism:   m.desiresRebaptism ? 'yes' : 'no',
        departmentInterest: m.departmentInterest || '',
        believesInJesus:    m.believesInJesus === true ? 'yes' : m.believesInJesus === false ? 'no' : '',
        idPassportNumber:   m.idPassportNumber || '',
        signatureName:      m.signatureName || '',
        signatureDate:      m.signatureDate ? m.signatureDate.split('T')[0] : '',
        membershipStatus:   m.status || 'pending',
      });
      setMemberChildren(
        Array.isArray(m.children)
          ? m.children.map(c => ({
              name:        c.name        || '',
              dateOfBirth: c.dateOfBirth ? c.dateOfBirth.split('T')[0] : '',
              isMember:    !!c.isMember,
            }))
          : []
      );
    } else {
      setMemberChildren([]);
    }
  };

  const openView = (user) => {
    const m = membershipMap[user.email?.toLowerCase()];
    setViewTarget({ user, membership: m || null });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!editTarget) return;
    try {
      setActionLoading(true);
      await updateUser(editTarget.user._id, profileForm);
      toast('Profile updated');
      setEditTarget(null);
      fetchAll();
      checkAuth();
    } catch (e) { toast(e?.response?.data?.message || 'Update failed', true); }
    finally { setActionLoading(false); }
  };

  const handleSaveMembership = async () => {
    if (!editTarget?.membership) return;
    try {
      setActionLoading(true);
      const payload = {
        ...memberForm,
        children:        memberChildren,
        waterBaptism:    memberForm.waterBaptism    === 'yes',
        desiresRebaptism:memberForm.desiresRebaptism=== 'yes',
        believesInJesus: memberForm.believesInJesus === 'yes',
      };
      await updateMember(editTarget.membership._id, payload);
      if (memberForm.membershipStatus && memberForm.membershipStatus !== editTarget.membership.status) {
        await updateMemberStatus(editTarget.membership._id, memberForm.membershipStatus);
      }
      toast('Membership updated');
      setEditTarget(null);
      fetchAll();
    } catch (e) { toast(e?.response?.data?.message || 'Update failed', true); }
    finally { setActionLoading(false); }
  };

  const handleUpdateRole = async () => {
    if (!roleTarget || !selectedRoleId) return;
    try {
      setActionLoading(true);
      await updateUserRole(roleTarget._id, selectedRoleId);
      toast('Role updated');
      setRoleTarget(null);
      fetchAll();
    } catch (e) { toast(e?.response?.data?.message || 'Failed', true); }
    finally { setActionLoading(false); }
  };

  const handleBan = async () => {
    if (!banTarget || !banReason.trim()) return;
    try {
      setActionLoading(true);
      await banUser(banTarget._id, banReason);
      toast(`${banTarget.name} banned`);
      setBanTarget(null); setBanReason('');
      fetchAll();
    } catch (e) { toast(e?.response?.data?.message || 'Failed', true); }
    finally { setActionLoading(false); }
  };

  // ── Quick approve / reject directly from the table row ───────────────────
  const handleQuickApprove = async (membership) => {
    try {
      setActionLoading(true);
      await updateMemberStatus(membership._id, 'approved');
      toast(`Application approved`);
      fetchAll();
    } catch (e) { toast(e?.response?.data?.message || 'Failed', true); }
    finally { setActionLoading(false); }
  };

  const handleQuickReject = async (membership) => {
    try {
      setActionLoading(true);
      await updateMemberStatus(membership._id, 'rejected');
      toast('Application rejected');
      fetchAll();
    } catch (e) { toast(e?.response?.data?.message || 'Failed', true); }
    finally { setActionLoading(false); }
  };

  // ── Unified delete: removes membership application + user account ─────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      // Delete membership application first (if one exists), then user account
      const m = membershipMap[deleteTarget.email?.toLowerCase()];
      if (m?._id) {
        try { await deleteMember(m._id); } catch { /* ignore if already gone */ }
      }
      await deleteUser(deleteTarget._id);
      toast('User and membership record deleted');
      setDeleteTarget(null);
      fetchAll();
    } catch (e) { toast(e?.response?.data?.message || 'Failed', true); }
    finally { setActionLoading(false); }
  };


  const handleExport = () => { const c = exportUsersToCSV(users); if (c) downloadCSV(c); };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!canManageUsers()) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">You don't have permission to manage users</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">People</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Unified view of users and church membership
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchAll} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all"
            style={{ background: `linear-gradient(135deg, ${RED}, #a52020)` }}
          >
            <UserPlus size={16} /> Add User
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-sm font-bold hover:bg-slate-900 transition-colors">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* ── Alerts ── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-700 dark:text-red-300">
            <AlertCircle size={16} className="shrink-0" /> <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)}><X size={16} /></button>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-sm text-green-700 dark:text-green-300">
            <CheckCircle size={16} className="shrink-0" /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Users',       value: stats.total,          color: '#64748b', icon: Users         },
          { label: 'Approved Members',  value: memberStats.approved, color: '#16a34a', icon: UserCheck     },
          { label: 'Pending Review',    value: memberStats.pending,  color: '#d97706', icon: Clock         },
          { label: 'Guests',            value: memberStats.guest,    color: '#94a3b8', icon: User          },
          { label: 'Banned',            value: stats.banned || 0,    color: '#dc2626', icon: Ban           },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{value ?? '—'}</p>
              <p className="text-xs text-slate-400 font-medium leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all"
              placeholder="Search name, email, phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]"
          >
            <option value="all">All Roles</option>
            {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
        </div>

        {/* Type tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTypeTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                typeTab === t.key
                  ? 'border-[#8B1A1A] bg-[#8B1A1A] text-white'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-slate-400" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-3">
            <Users size={36} className="text-slate-300 dark:text-slate-600" />
            <p className="text-slate-400 text-sm font-medium">No users found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700">
                    {['Person', 'Type', 'Role', 'Contact', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {filteredUsers.map(u => {
                    const m    = membershipMap[u.email?.toLowerCase()];
                    const type = getUserType(m);
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0" style={{ background: RED }}>
                              {u.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><TypeBadge type={type} /></td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
                            {u.role?.name || 'member'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                          {u.phone && <div className="flex items-center gap-1.5"><Phone size={11} />{u.phone}</div>}
                          {u.location && <div className="flex items-center gap-1.5"><MapPin size={11} />{u.location}</div>}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">

                            {/* ── Pending-only: quick approve / reject ── */}
                            {type === 'pending' && m && (
                              <>
                                <button
                                  onClick={() => handleQuickApprove(m)}
                                  disabled={actionLoading}
                                  title="Approve application"
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => handleQuickReject(m)}
                                  disabled={actionLoading}
                                  title="Reject application"
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
                                >
                                  <XCircle size={13} /> Reject
                                </button>
                                {/* Visual divider */}
                                <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                              </>
                            )}

                            {/* ── Standard actions ── */}
                            {[
                              { icon: Eye,     color: 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700',         title: 'View details', action: () => openView(u)  },
                              { icon: Edit,    color: 'text-blue-600   hover:bg-blue-50   dark:hover:bg-blue-900/20',                           title: 'Edit',         action: () => openEdit(u)  },
                              { icon: Printer, color: 'text-slate-500  hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700',        title: 'Print record', action: () => handlePrint(u, m) },
                              { icon: Shield,  color: 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',                        title: 'Change role',  action: () => { setRoleTarget(u); setSelectedRoleId(u.role?._id||''); } },
                              { icon: Ban,     color: 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20',                        title: 'Ban user',     action: () => setBanTarget(u)  },
                              { icon: Trash2,  color: 'text-red-500    hover:bg-red-50    dark:hover:bg-red-900/20',                           title: 'Delete user',  action: () => setDeleteTarget(u) },
                            ].map(({ icon: Icon, color, title, action }) => (
                              <button key={title} onClick={action} title={title}
                                className={`p-2 rounded-lg transition-colors ${color}`}>
                                <Icon size={16} />
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map(u => {
                const m    = membershipMap[u.email?.toLowerCase()];
                const type = getUserType(m);
                return (
                  <div key={u._id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black shrink-0" style={{ background: RED }}>
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                          <TypeBadge type={type} />
                        </div>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        {u.phone && <p className="text-xs text-slate-400 mt-0.5">{u.phone}</p>}
                      </div>
                    </div>
                    {/* Pending: approve / reject row */}
                    {type === 'pending' && m && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => handleQuickApprove(m)}
                          disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800 hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleQuickReject(m)}
                          disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}

                    {/* Standard action row */}
                    <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      {[
                        { icon: Eye,     label: 'View',   color: 'text-slate-600',  action: () => openView(u) },
                        { icon: Edit,    label: 'Edit',   color: 'text-blue-600',   action: () => openEdit(u) },
                        { icon: Printer, label: 'Print',  color: 'text-slate-600',  action: () => handlePrint(u, membershipMap[u.email?.toLowerCase()]) },
                        { icon: Trash2,  label: 'Delete', color: 'text-red-500',    action: () => setDeleteTarget(u) },
                      ].map(({ icon: Icon, label, color, action }) => (
                        <button key={label} onClick={action}
                          className={`flex flex-col items-center gap-1 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${color}`}>
                          <Icon size={18} />
                          <span className="text-xs font-semibold">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500">
                  Showing {filteredUsers.length} of {totalUsers} users
                </p>
                <div className="flex items-center gap-1.5">
                  {[
                    { icon: ChevronsLeft,  action: () => setCurrentPage(1),            disabled: currentPage === 1 },
                    { icon: ChevronLeft,   action: () => setCurrentPage(p => p-1),     disabled: currentPage === 1 },
                    null,
                    { icon: ChevronRight,  action: () => setCurrentPage(p => p+1),     disabled: currentPage === totalPages },
                    { icon: ChevronsRight, action: () => setCurrentPage(totalPages),   disabled: currentPage === totalPages },
                  ].map((btn, i) => btn === null ? (
                    <span key="pg" className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {currentPage} / {totalPages}
                    </span>
                  ) : (
                    <button key={i} onClick={btn.action} disabled={btn.disabled}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <btn.icon size={15} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          VIEW MODAL  —  redesigned: spacious, card-based, sticky close btn
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewTarget && (() => {
          const vUser = viewTarget.user;
          const vMem  = viewTarget.membership;
          const vType = getUserType(vMem);
          const fmt   = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day:'numeric', month:'long', year:'numeric' }) : null;

          /* ── Reusable field tile ── */
          const Tile = ({ label, value, full = false, mono = false }) => (
            <div className={`bg-slate-50 dark:bg-slate-800/60 rounded-2xl px-5 py-4 ${full ? 'col-span-2' : ''}`}>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                {label}
              </p>
              <p className={`text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed ${mono ? 'font-mono' : 'capitalize'}`}>
                {value || <span className="text-slate-400 dark:text-slate-600 font-normal italic">Not provided</span>}
              </p>
            </div>
          );

          /* ── Section header ── */
          const SHead = ({ icon: Icon, title, color = RED }) => (
            <div className="flex items-center gap-3 px-1 mt-8 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                {title}
              </h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
          );

          return (
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/65 backdrop-blur-sm"
              onClick={() => setViewTarget(null)}
            >
              <motion.div
                initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:60 }}
                transition={{ type:'spring', damping:30, stiffness:340 }}
                className="relative w-full sm:max-w-2xl bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
                style={{ maxHeight: '92dvh' }}
                onClick={e => e.stopPropagation()}
              >
                {/* ── Gradient accent bar ── */}
                <div className="h-1.5 w-full shrink-0"
                  style={{ background: `linear-gradient(90deg, ${RED}, ${GOLD})` }} />

                {/* ── Sticky header — always visible on mobile ── */}
                <div className="shrink-0 px-5 sm:px-7 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">

                  {/* Top row: avatar + name + CLOSE */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0 shadow-md"
                      style={{ background: `linear-gradient(135deg, ${RED}, #a52020)` }}>
                      {vUser.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    {/* Name / email */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
                        {vUser.name}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {vUser.email}
                      </p>
                    </div>

                    {/* Close button — large, always visible */}
                    <button
                      onClick={() => setViewTarget(null)}
                      className="shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-all active:scale-95"
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Badge row */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <TypeBadge type={vType} />
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                      {vUser.role?.name || 'member'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      Joined {new Date(vUser.createdAt).toLocaleDateString('en-KE', { month:'short', year:'numeric' })}
                    </span>

                    {/* Print — pushed to the right */}
                    <button
                      onClick={() => handlePrint(vUser, vMem)}
                      className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Printer size={13} /> Print Record
                    </button>
                  </div>
                </div>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto px-5 sm:px-7 pb-8">

                  {/* ─── ACCOUNT INFO ────────────────────────────────── */}
                  <SHead icon={User} title="Account Information" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Tile label="Full Name"     value={vUser.name} />
                    <Tile label="Email Address" value={vUser.email} mono />
                    <Tile label="Phone Number"  value={vUser.phone} />
                    <Tile label="Gender"        value={vUser.gender} />
                    <Tile label="Location"      value={vUser.location} />
                    <Tile label="Auth Provider" value={vUser.authProvider} />
                  </div>

                  {vMem ? (
                    <>
                      {/* ─── PERSONAL INFORMATION ────────────────────── */}
                      <SHead icon={User} title="Personal Information" color="#16a34a" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Tile label="Full Name"           value={vMem.fullName || vUser.name} />
                        <Tile label="Email"               value={vMem.email || vUser.email} mono />
                        <Tile label="Phone"               value={vMem.phone || vUser.phone} />
                        <Tile label="Gender"              value={vMem.gender || vUser.gender} />
                        <Tile label="Date of Birth"       value={fmt(vMem.dateOfBirth)} />
                        <Tile label="Marital Status"      value={vMem.maritalStatus} />
                        <Tile label="Residential Address" value={vMem.residentialAddress} />
                        <Tile label="Postal Address & Code" value={vMem.postalAddress} />
                      </div>

                      {/* ─── CHILDREN ────────────────────────────────── */}
                      {Array.isArray(vMem.children) && vMem.children.length > 0 && (
                        <>
                          <SHead icon={Baby} title="Particulars of Children" color="#0891b2" />
                          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                                  <th className="text-left px-4 py-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                  <th className="text-left px-4 py-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date of Birth</th>
                                  <th className="text-left px-4 py-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {vMem.children.map((c, i) => (
                                  <tr key={i}>
                                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{c.name || '—'}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fmt(c.dateOfBirth) || '—'}</td>
                                    <td className="px-4 py-3">
                                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                        c.isMember
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                      }`}>
                                        {c.isMember ? 'Member' : 'Non-Member'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}

                      {/* ─── CHURCH HISTORY ──────────────────────────── */}
                      <SHead icon={Church} title="Church History" color="#7c3aed" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Tile label="Member Since"        value={vMem.memberSince} />
                        <Tile label="Holy Spirit Baptism" value={vMem.holySpiritBaptism} />
                        <Tile label="Water Baptism"       value={vMem.waterBaptism ? `Yes${vMem.waterBaptismDate ? ' — ' + fmt(vMem.waterBaptismDate) : ''}` : 'No'} />
                        <Tile label="Desires Re-baptism"  value={vMem.desiresRebaptism ? 'Yes' : 'No'} />
                        <Tile label="Department Interest" value={vMem.departmentInterest} />
                      </div>

                      {/* ─── FAITH & IDENTITY ────────────────────────── */}
                      <SHead icon={Heart} title="Faith & Identity" color="#d97706" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <Tile label="Believes in Jesus" value={
                          vMem.believesInJesus === true ? 'Yes' :
                          vMem.believesInJesus === false ? 'No' : null
                        } />
                        <Tile label="ID / Passport No."  value={vMem.idPassportNumber} mono />
                        <Tile label="Name & Surname (as on ID)" value={vMem.signatureName || vMem.fullName} />
                        <Tile label="Signature Date"     value={fmt(vMem.signatureDate)} />
                      </div>
                      {/* Faith answer chip */}
                      {vMem.believesInJesus !== null && vMem.believesInJesus !== undefined && vMem.believesInJesus !== '' && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm mb-2 ${
                          vMem.believesInJesus === true
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          {vMem.believesInJesus === true
                            ? <><CheckCircle size={15} /> Yes, I believe</>
                            : <><XCircle size={15} /> No</>}
                        </div>
                      )}

                      {/* ─── APPLICATION DETAILS ─────────────────────── */}
                      <SHead icon={Calendar} title="Application Details" color="#64748b" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Tile label="Submitted"          value={fmt(vMem.submittedAt)} />
                        <Tile label="Status"             value={vMem.status} />
                        {vMem.reviewedAt && <Tile label="Reviewed"       value={fmt(vMem.reviewedAt)} />}
                        {vMem.reviewedBy?.name && <Tile label="Reviewed By"    value={vMem.reviewedBy.name} />}
                        {vMem.reviewNotes && <Tile label="Review Notes" value={vMem.reviewNotes} full />}
                      </div>
                    </>
                  ) : (
                    <div className="mt-6 flex flex-col items-center gap-3 py-10 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <User size={24} className="text-slate-400 dark:text-slate-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No Membership Application</p>
                        <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                          This person is registered as a guest
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bottom close button */}
                  <button
                    onClick={() => setViewTarget(null)}
                    className="w-full mt-8 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          EDIT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {editTarget && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditTarget(null)}>
            <motion.div
              initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95 }} transition={{ type:'spring', damping:28, stiffness:320 }}
              className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}>

              <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${RED}, ${GOLD})` }} />

              {/* Header + tabs */}
              <div className="px-6 pt-5 pb-0 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Edit — {editTarget.user.name}</h2>
                    <p className="text-xs text-slate-400">{editTarget.user.email}</p>
                  </div>
                  <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X size={17} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1">
                  {[
                    { key: 'profile',    label: 'Profile'    },
                    { key: 'membership', label: 'Membership', disabled: !editTarget.membership },
                  ].map(t => (
                    <button
                      key={t.key}
                      disabled={t.disabled}
                      onClick={() => setEditTab(t.key)}
                      className={`px-4 py-2 text-sm font-bold rounded-t-xl border-b-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        editTab === t.key
                          ? 'border-[#8B1A1A] text-[#8B1A1A]'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {t.label}
                      {t.key === 'membership' && !editTarget.membership && (
                        <span className="ml-1.5 text-xs">(none)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto px-6 py-5">

                {/* ── Profile tab ── */}
                {editTab === 'profile' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Full Name *</label>
                        <input className={inputCls} value={profileForm.name} onChange={e => setProfileForm(f=>({...f,name:e.target.value}))} />
                      </div>
                      <div>
                        <label className={labelCls}>Email (read-only)</label>
                        <input className={inputCls} value={editTarget.user.email} disabled />
                      </div>
                      <div>
                        <label className={labelCls}>Phone</label>
                        <input className={inputCls} value={profileForm.phone} onChange={e => setProfileForm(f=>({...f,phone:e.target.value}))} />
                      </div>
                      <div>
                        <label className={labelCls}>Location</label>
                        <input className={inputCls} value={profileForm.location} onChange={e => setProfileForm(f=>({...f,location:e.target.value}))} />
                      </div>
                      <div>
                        <label className={labelCls}>Gender</label>
                        <select className={inputCls} value={profileForm.gender} onChange={e => setProfileForm(f=>({...f,gender:e.target.value}))}>
                          <option value="">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Bio</label>
                      <textarea className={inputCls + ' resize-none'} rows={3} value={profileForm.bio} onChange={e => setProfileForm(f=>({...f,bio:e.target.value}))} />
                    </div>
                  </div>
                )}

                {/* ── Membership tab ── */}
                {editTab === 'membership' && editTarget.membership && (
                  <div className="space-y-4">
                    {/* Status */}
                    <div>
                      <label className={labelCls}>Application Status</label>
                      <select className={inputCls} value={memberForm.membershipStatus}
                        onChange={e => setMemberForm(f=>({...f, membershipStatus:e.target.value}))}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Phone</label>
                        <input className={inputCls} value={memberForm.phone} onChange={e => setMemberForm(f=>({...f,phone:e.target.value}))} />
                      </div>
                      <div>
                        <label className={labelCls}>Date of Birth</label>
                        <input type="date" className={inputCls} value={memberForm.dateOfBirth} onChange={e => setMemberForm(f=>({...f,dateOfBirth:e.target.value}))} />
                      </div>
                      <div>
                        <label className={labelCls}>Marital Status</label>
                        <select className={inputCls} value={memberForm.maritalStatus} onChange={e => setMemberForm(f=>({...f,maritalStatus:e.target.value}))}>
                          <option value="">Select</option>
                          {['single','married','divorced','widowed','separated'].map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Gender</label>
                        <select className={inputCls} value={memberForm.gender} onChange={e => setMemberForm(f=>({...f,gender:e.target.value}))}>
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Residential Address</label>
                      <textarea className={inputCls + ' resize-none'} rows={2} value={memberForm.residentialAddress}
                        onChange={e => setMemberForm(f=>({...f,residentialAddress:e.target.value}))} />
                    </div>
                    <div>
                      <label className={labelCls}>Postal Address &amp; Code</label>
                      <input className={inputCls} value={memberForm.postalAddress} onChange={e => setMemberForm(f=>({...f,postalAddress:e.target.value}))} />
                    </div>
                    <div>
                      <label className={labelCls}>Member Since</label>
                      <input className={inputCls} value={memberForm.memberSince} placeholder="e.g. 2019" onChange={e => setMemberForm(f=>({...f,memberSince:e.target.value}))} />
                    </div>
                    <div>
                      <label className={labelCls}>Holy Spirit Baptism Answer</label>
                      <textarea className={inputCls + ' resize-none'} rows={2} value={memberForm.holySpiritBaptism}
                        onChange={e => setMemberForm(f=>({...f,holySpiritBaptism:e.target.value}))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Water Baptism</label>
                        <select className={inputCls} value={memberForm.waterBaptism} onChange={e => setMemberForm(f=>({...f,waterBaptism:e.target.value}))}>
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      {memberForm.waterBaptism === 'yes' && (
                        <div>
                          <label className={labelCls}>Baptism Date</label>
                          <input type="date" className={inputCls} value={memberForm.waterBaptismDate} onChange={e => setMemberForm(f=>({...f,waterBaptismDate:e.target.value}))} />
                        </div>
                      )}
                      <div>
                        <label className={labelCls}>Desires Re-baptism</label>
                        <select className={inputCls} value={memberForm.desiresRebaptism} onChange={e => setMemberForm(f=>({...f,desiresRebaptism:e.target.value}))}>
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Department Interest</label>
                        <input className={inputCls} value={memberForm.departmentInterest} onChange={e => setMemberForm(f=>({...f,departmentInterest:e.target.value}))} />
                      </div>
                      <div>
                        <label className={labelCls}>Believes in Jesus?</label>
                        <select className={inputCls} value={memberForm.believesInJesus} onChange={e => setMemberForm(f=>({...f,believesInJesus:e.target.value}))}>
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>ID / Passport Number</label>
                        <input className={inputCls} value={memberForm.idPassportNumber} onChange={e => setMemberForm(f=>({...f,idPassportNumber:e.target.value}))} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Signature Name (as on ID)</label>
                      <input className={inputCls} style={{ fontFamily:'cursive' }} value={memberForm.signatureName}
                        onChange={e => setMemberForm(f=>({...f,signatureName:e.target.value}))} />
                    </div>
                    <div>
                      <label className={labelCls}>Signature Date</label>
                      <input type="date" className={inputCls} value={memberForm.signatureDate}
                        onChange={e => setMemberForm(f=>({...f,signatureDate:e.target.value}))} />
                    </div>

                    {/* ── Children ── */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={labelCls + ' mb-0'}>Particulars of Children</label>
                        <button
                          type="button"
                          onClick={() => setMemberChildren(c => [...c, { name:'', dateOfBirth:'', isMember:false }])}
                          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          style={{ color: RED, background: `${RED}10` }}
                        >
                          <Plus size={12} /> Add Child
                        </button>
                      </div>

                      {memberChildren.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          No children added
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {memberChildren.map((child, idx) => (
                            <div key={idx} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                              <input
                                className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/40"
                                placeholder="Child's name"
                                value={child.name}
                                onChange={e => {
                                  const u = [...memberChildren];
                                  u[idx] = { ...u[idx], name: e.target.value };
                                  setMemberChildren(u);
                                }}
                              />
                              <input
                                type="date"
                                className="text-xs px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/40"
                                value={child.dateOfBirth}
                                onChange={e => {
                                  const u = [...memberChildren];
                                  u[idx] = { ...u[idx], dateOfBirth: e.target.value };
                                  setMemberChildren(u);
                                }}
                              />
                              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer whitespace-nowrap select-none">
                                <input
                                  type="checkbox"
                                  checked={child.isMember}
                                  onChange={e => {
                                    const u = [...memberChildren];
                                    u[idx] = { ...u[idx], isMember: e.target.checked };
                                    setMemberChildren(u);
                                  }}
                                  className="w-3.5 h-3.5 accent-[#8B1A1A]"
                                />
                                Member
                              </label>
                              <button
                                type="button"
                                onClick={() => setMemberChildren(c => c.filter((_, i) => i !== idx))}
                                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button onClick={() => setEditTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={editTab === 'profile' ? handleSaveProfile : handleSaveMembership}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${RED}, #a52020)` }}>
                  {actionLoading ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ ROLE MODAL ════════════════════════════════════════════════════════ */}
      {roleTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setRoleTarget(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">Change Role</h3>
            <p className="text-xs text-slate-400 mb-4">For <strong>{roleTarget.name}</strong></p>
            <select className={inputCls + ' mb-4'} value={selectedRoleId} onChange={e => setSelectedRoleId(e.target.value)}>
              <option value="">Select role</option>
              {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setRoleTarget(null)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold">Cancel</button>
              <button onClick={handleUpdateRole} disabled={actionLoading || !selectedRoleId}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${RED}, #a52020)` }}>
                {actionLoading ? 'Updating…' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ BAN MODAL ════════════════════════════════════════════════════════ */}
      {banTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setBanTarget(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-black text-red-600 mb-1">Ban User</h3>
            <p className="text-xs text-slate-400 mb-4">This will permanently block <strong>{banTarget.name}</strong> from re-registering.</p>
            <textarea className={inputCls + ' resize-none mb-4'} rows={3} placeholder="Ban reason (min 5 chars)…"
              value={banReason} onChange={e => setBanReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => { setBanTarget(null); setBanReason(''); }} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 text-sm font-bold">Cancel</button>
              <button onClick={handleBan} disabled={actionLoading || banReason.trim().length < 5}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60">
                {actionLoading ? 'Banning…' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE MODAL ═════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white text-center mb-2">Delete Person?</h3>
            <p className="text-xs text-slate-500 text-center mb-6">
              This will permanently delete <strong>{deleteTarget.name}</strong>'s user account
              {membershipMap[deleteTarget.email?.toLowerCase()] ? ' and their membership application' : ''} from the system.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold">Cancel</button>
              <button onClick={handleDelete} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {actionLoading ? <><Loader2 size={13} className="animate-spin" /> Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MANUAL REGISTER MODAL ════════════════════════════════════════════ */}
      <ManualRegisterModal
        isOpen={showRegModal}
        roles={roles}
        onClose={() => setShowRegModal(false)}
        onSuccess={() => { setShowRegModal(false); fetchAll(); }}
        onToast={toast}
      />
    </div>
  );
}