'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, CheckCircle2, XCircle, Clock, Eye, Trash2,
  ChevronLeft, ChevronRight, X, AlertCircle, Loader2, UserCheck,
  Baby, Church, Heart, Calendar, Check, RefreshCw,
  ChevronUp, ChevronDown, SlidersHorizontal,
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

// ── Filter defaults ────────────────────────────────────────────────────────────
const FILTER_DEFAULTS = {
  gender:           [],          // [] = any; ['male'] = only male; etc.
  maritalStatus:    [],
  department:       [],
  waterBaptism:     'any',       // 'any' | 'yes' | 'no'
  spiritBaptism:    'any',
  desiresRebaptism: 'any',
  believesInJesus:  'any',
  hasChildren:      'any',
  ageMin:           '',
  ageMax:           '',
  memberSinceMin:   '',
  memberSinceMax:   '',
  submittedFrom:    '',
  submittedTo:      '',
};

const isDefaultFilters = (f) =>
  f.gender.length === 0 &&
  f.maritalStatus.length === 0 &&
  f.department.length === 0 &&
  f.waterBaptism     === 'any' &&
  f.spiritBaptism    === 'any' &&
  f.desiresRebaptism === 'any' &&
  f.believesInJesus  === 'any' &&
  f.hasChildren      === 'any' &&
  f.ageMin           === ''    &&
  f.ageMax           === ''    &&
  f.memberSinceMin   === ''    &&
  f.memberSinceMax   === ''    &&
  f.submittedFrom    === ''    &&
  f.submittedTo      === '';

const countActiveFilters = (f) => {
  let n = 0;
  if (f.gender.length)        n++;
  if (f.maritalStatus.length) n++;
  if (f.department.length)    n++;
  if (f.waterBaptism     !== 'any') n++;
  if (f.spiritBaptism    !== 'any') n++;
  if (f.desiresRebaptism !== 'any') n++;
  if (f.believesInJesus  !== 'any') n++;
  if (f.hasChildren      !== 'any') n++;
  if (f.ageMin || f.ageMax)          n++;
  if (f.memberSinceMin || f.memberSinceMax) n++;
  if (f.submittedFrom || f.submittedTo)     n++;
  return n;
};

// ── Sort labels ────────────────────────────────────────────────────────────────
const SORT_LABELS = {
  fullName:           'Name',
  status:             'Status',
  gender:             'Gender',
  dateOfBirth:        'Age / DOB',
  residentialAddress: 'Location',
  departmentInterest: 'Department',
  memberSince:        'Member Since',
  waterBaptism:       'Water Baptism',
  holySpiritBaptism:  'Spirit Baptism',
  submittedAt:        'Submitted Date',
  reviewedAt:         'Reviewed Date',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const getAge = (dob) => {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
};

const boolVal = (v) => v === true || v === 'Yes' || v === 'yes';
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

// ── Status Badge ───────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:  { label: 'Pending',  classes: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock        },
  approved: { label: 'Approved', classes: 'bg-green-50 text-green-700 border-green-200', Icon: CheckCircle2 },
  rejected: { label: 'Rejected', classes: 'bg-red-50   text-red-700   border-red-200',   Icon: XCircle      },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.classes}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 leading-none">{value ?? '—'}</p>
      <p className="text-xs text-slate-500 font-semibold mt-1">{label}</p>
    </div>
  </div>
);

// ── Sortable Column Header ─────────────────────────────────────────────────────
const SortTh = ({ label, field, sortField, sortDir, onSort, className = '' }) => {
  const active = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`px-4 py-3.5 text-left text-[11px] font-black uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-colors group ${
        active
          ? 'text-[#8B1A1A] bg-red-50/70'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <span className={`transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
          {active && sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </span>
      </div>
    </th>
  );
};

// ── Boolean Pill ───────────────────────────────────────────────────────────────
const BoolPill = ({ value }) => {
  const yes = boolVal(value);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
      yes ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'
    }`}>
      {yes ? <Check size={10} /> : <X size={10} />}
      {yes ? 'Yes' : 'No'}
    </span>
  );
};

// ── Filter sub-components ──────────────────────────────────────────────────────

const PillGroup = ({ label, options, selected, onChange }) => {
  const toggle = (v) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-all ${
                active
                  ? 'border-[#8B1A1A] bg-[#8B1A1A] text-white'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TriToggle = ({ label, value, onChange }) => (
  <div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
    <div className="flex rounded-lg border border-slate-200 overflow-hidden w-fit">
      {['any', 'yes', 'no'].map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 text-xs font-bold capitalize transition-all ${
            value === opt
              ? 'bg-[#8B1A1A] text-white'
              : 'text-slate-500 hover:bg-slate-50 bg-white'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const RangeInput = ({ label, minVal, maxVal, onMinChange, onMaxChange, minAttr, maxAttr }) => (
  <div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
    <div className="flex items-center gap-2">
      <input
        type="number"
        placeholder="Min"
        value={minVal}
        min={minAttr}
        max={maxAttr}
        onChange={(e) => onMinChange(e.target.value)}
        className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all"
      />
      <span className="text-slate-300 text-xs font-bold">–</span>
      <input
        type="number"
        placeholder="Max"
        value={maxVal}
        min={minAttr}
        max={maxAttr}
        onChange={(e) => onMaxChange(e.target.value)}
        className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all"
      />
    </div>
  </div>
);

const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8B1A1A]/8 border border-[#8B1A1A]/20 text-[#8B1A1A] text-xs font-bold">
    {label}
    <button onClick={onRemove} className="hover:text-[#8B1A1A]/60 transition-colors">
      <X size={10} />
    </button>
  </span>
);

// ── Advanced Filter Panel ──────────────────────────────────────────────────────
function AdvancedFilters({ filters, onChange, onClear, deptOptions }) {
  const set = (key) => (val) => onChange({ ...filters, [key]: val });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mt-1">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <SlidersHorizontal size={13} style={{ color: RED }} />
            Advanced Filters
          </span>
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-[#8B1A1A] font-semibold underline underline-offset-2 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-5">

          {/* Demographics */}
          <PillGroup
            label="Gender"
            options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]}
            selected={filters.gender}
            onChange={set('gender')}
          />

          <PillGroup
            label="Marital Status"
            options={[
              { value: 'single',   label: 'Single'   },
              { value: 'married',  label: 'Married'  },
              { value: 'divorced', label: 'Divorced' },
              { value: 'widowed',  label: 'Widowed'  },
            ]}
            selected={filters.maritalStatus}
            onChange={set('maritalStatus')}
          />

          <RangeInput
            label="Age Range"
            minVal={filters.ageMin}
            maxVal={filters.ageMax}
            onMinChange={set('ageMin')}
            onMaxChange={set('ageMax')}
            minAttr={0}
            maxAttr={120}
          />

          <TriToggle label="Has Children"      value={filters.hasChildren}  onChange={set('hasChildren')}  />

          {/* Department — dynamic from data */}
          {deptOptions.length > 0 && (
            <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2">
              <PillGroup
                label="Department"
                options={deptOptions.map((d) => ({ value: d, label: d }))}
                selected={filters.department}
                onChange={set('department')}
              />
            </div>
          )}

          <RangeInput
            label="Member Since (Year)"
            minVal={filters.memberSinceMin}
            maxVal={filters.memberSinceMax}
            onMinChange={set('memberSinceMin')}
            onMaxChange={set('memberSinceMax')}
            minAttr={1900}
            maxAttr={new Date().getFullYear()}
          />

          {/* Baptism & Faith */}
          <TriToggle label="Water Baptism"      value={filters.waterBaptism}     onChange={set('waterBaptism')}     />
          <TriToggle label="Spirit Baptism"     value={filters.spiritBaptism}    onChange={set('spiritBaptism')}    />
          <TriToggle label="Desires Re-baptism" value={filters.desiresRebaptism} onChange={set('desiresRebaptism')} />
          <TriToggle label="Believes in Jesus"  value={filters.believesInJesus}  onChange={set('believesInJesus')}  />

          {/* Submission date range */}
          <div className="sm:col-span-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Submission Date Range</p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-semibold">From</span>
                <input
                  type="date"
                  value={filters.submittedFrom}
                  onChange={(e) => set('submittedFrom')(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all"
                />
              </div>
              <span className="text-slate-300 text-xs font-bold mt-4">–</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-semibold">To</span>
                <input
                  type="date"
                  value={filters.submittedTo}
                  onChange={(e) => set('submittedTo')(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

// ── Active filter chips strip ──────────────────────────────────────────────────
function ActiveChips({ filters, onChange }) {
  const chips = [];
  const set = (key) => (val) => onChange({ ...filters, [key]: val });

  filters.gender.forEach((g) =>
    chips.push({ label: capitalize(g), onRemove: () => set('gender')(filters.gender.filter((x) => x !== g)) }));
  filters.maritalStatus.forEach((s) =>
    chips.push({ label: capitalize(s), onRemove: () => set('maritalStatus')(filters.maritalStatus.filter((x) => x !== s)) }));
  filters.department.forEach((d) =>
    chips.push({ label: d, onRemove: () => set('department')(filters.department.filter((x) => x !== d)) }));
  if (filters.waterBaptism     !== 'any') chips.push({ label: `Water Baptism: ${filters.waterBaptism}`,       onRemove: () => set('waterBaptism')('any')      });
  if (filters.spiritBaptism    !== 'any') chips.push({ label: `Spirit Baptism: ${filters.spiritBaptism}`,     onRemove: () => set('spiritBaptism')('any')      });
  if (filters.desiresRebaptism !== 'any') chips.push({ label: `Re-baptism: ${filters.desiresRebaptism}`,      onRemove: () => set('desiresRebaptism')('any')   });
  if (filters.believesInJesus  !== 'any') chips.push({ label: `Believes in Jesus: ${filters.believesInJesus}`, onRemove: () => set('believesInJesus')('any')   });
  if (filters.hasChildren      !== 'any') chips.push({ label: `Has Children: ${filters.hasChildren}`,         onRemove: () => set('hasChildren')('any')        });
  if (filters.ageMin || filters.ageMax)
    chips.push({ label: `Age: ${filters.ageMin || '?'}–${filters.ageMax || '?'}`, onRemove: () => onChange({ ...filters, ageMin: '', ageMax: '' }) });
  if (filters.memberSinceMin || filters.memberSinceMax)
    chips.push({ label: `Since: ${filters.memberSinceMin || '?'}–${filters.memberSinceMax || '?'}`, onRemove: () => onChange({ ...filters, memberSinceMin: '', memberSinceMax: '' }) });
  if (filters.submittedFrom || filters.submittedTo)
    chips.push({ label: `Submitted: ${filters.submittedFrom || '?'} → ${filters.submittedTo || '?'}`, onRemove: () => onChange({ ...filters, submittedFrom: '', submittedTo: '' }) });

  if (!chips.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 items-center"
    >
      <span className="text-xs text-slate-400 font-semibold shrink-0">Active:</span>
      {chips.map((chip, i) => (
        <FilterChip key={i} label={chip.label} onRemove={chip.onRemove} />
      ))}
    </motion.div>
  );
}

// ── Slide-Over Side Panel ──────────────────────────────────────────────────────
const PanelSection = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-slate-100 overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
      <Icon size={13} style={{ color: RED }} />
      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{title}</span>
    </div>
    <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>
  </div>
);

const PanelRow = ({ label, value, full }) => (
  <div className={full ? 'col-span-2' : ''}>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm text-slate-800 font-medium leading-snug">
      {value || <span className="text-slate-300 italic text-xs">Not provided</span>}
    </p>
  </div>
);

function SlideOver({ member, onClose, onApprove, onReject, isActing }) {
  const [notes, setNotes] = useState('');
  if (!member) return null;
  const age = getAge(member.dateOfBirth);

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[9000] bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.aside
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="fixed top-0 right-0 z-[9001] h-full w-full max-w-[480px] bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${RED}, ${GOLD})` }} />
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full text-white font-black text-lg flex items-center justify-center shrink-0" style={{ background: RED }}>
              {member.fullName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">{member.fullName}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{member.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={member.status} />
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 border-b border-slate-100 shrink-0">
          {[
            { label: 'Age',    value: age ? `${age} yrs` : '—' },
            { label: 'Gender', value: capitalize(member.gender) },
            { label: 'Dept.',  value: member.departmentInterest || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="py-3 px-4 text-center border-r border-slate-100 last:border-r-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
              <p className="text-sm font-black text-slate-800 mt-0.5 truncate">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <PanelSection title="Personal Information" icon={UserCheck}>
            <PanelRow label="Phone"             value={member.phone} />
            <PanelRow label="Date of Birth"     value={fmt(member.dateOfBirth)} />
            <PanelRow label="Marital Status"    value={capitalize(member.maritalStatus)} />
            <PanelRow label="Residential"       value={member.residentialAddress} />
            <PanelRow label="Postal"            value={member.postalAddress} />
            <PanelRow label="ID / Passport"     value={member.idPassportNumber} />
          </PanelSection>
          {member.children?.length > 0 && (
            <PanelSection title={`Children (${member.children.length})`} icon={Baby}>
              <div className="col-span-2 space-y-2">
                {member.children.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 text-sm">
                    <span className="font-semibold text-slate-800">{c.name || `Child ${i + 1}`}</span>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{fmt(c.dateOfBirth)}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold ${c.isMember ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {c.isMember ? 'Member' : 'Non-member'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </PanelSection>
          )}
          <PanelSection title="Church History" icon={Church}>
            <PanelRow label="Member Since"        value={member.memberSince} />
            <PanelRow label="Holy Spirit Baptism" value={member.holySpiritBaptism} />
            <PanelRow
              label="Water Baptism"
              value={member.waterBaptism
                ? `Yes${member.waterBaptismDate ? ` — ${fmt(member.waterBaptismDate)}` : ''}`
                : 'No'}
            />
            <PanelRow label="Desires Re-baptism"  value={member.desiresRebaptism ? 'Yes' : 'No'} />
            <PanelRow label="Department Interest"  value={member.departmentInterest} />
          </PanelSection>
          <PanelSection title="Faith & Identity" icon={Heart}>
            <PanelRow
              label="Believes in Jesus"
              value={member.believesInJesus === true ? 'Yes' : member.believesInJesus === false ? 'No' : '—'}
            />
            <PanelRow label="Signature Name" value={member.signatureName} />
            <PanelRow label="Signature Date" value={fmt(member.signatureDate)} />
          </PanelSection>
          <PanelSection title="Application Details" icon={Calendar}>
            <PanelRow label="Submitted"   value={fmt(member.submittedAt)} />
            {member.reviewedAt  && <PanelRow label="Reviewed"    value={fmt(member.reviewedAt)} />}
            {member.reviewedBy  && <PanelRow label="Reviewed By" value={member.reviewedBy?.name || '—'} />}
            {member.reviewNotes && <PanelRow label="Review Notes" value={member.reviewNotes} full />}
          </PanelSection>
          {member.status === 'pending' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Review Notes (optional)
              </label>
              <textarea
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] resize-none transition-all"
                rows={2}
                placeholder="Add a note for this decision…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}
        </div>
        {member.status === 'pending' && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0 flex gap-3">
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
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
            >
              {isActing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve
            </button>
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}

// ── Delete Confirm ─────────────────────────────────────────────────────────────
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
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <h3 className="text-base font-black text-slate-900 text-center">Delete Record?</h3>
          <p className="text-sm text-slate-500 text-center mt-2 leading-relaxed">
            This will permanently delete{' '}
            <strong className="text-slate-700">{member.fullName}</strong>'s application. This cannot be undone.
          </p>
          <div className="flex gap-3 mt-5">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isDeleting && <Loader2 size={13} className="animate-spin" />} Delete
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
  const { canManageMembers } = usePermissions();

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
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState('');
  const [status,      setStatus]      = useState('');
  const [viewing,     setViewing]     = useState(null);
  const [deleting,    setDeleting]    = useState(null);
  const [sortField,   setSortField]   = useState('submittedAt');
  const [sortDir,     setSortDir]     = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters,     setFilters]     = useState(FILTER_DEFAULTS);

  const hasAdvanced = !isDefaultFilters(filters);
  const activeCount = countActiveFilters(filters);

  // ── Queries ────────────────────────────────────────────────────────────────
  // When advanced filters are active, pull all records so we can filter client-side
  const listQ = useQuery({
    queryKey:  ['members', page, search, status, hasAdvanced],
    queryFn:   () => getAllMembers({
      page:   hasAdvanced ? 1 : page,
      limit:  hasAdvanced ? 1000 : 15,
      search: search || undefined,
      status: status || undefined,
    }),
    staleTime: 20_000,
    keepPreviousData: true,
  });

  const statsQ = useQuery({
    queryKey:  ['membership-stats'],
    queryFn:   getMemberStats,
    staleTime: 30_000,
    select:    (d) => d.data,
  });

  const allMembers = listQ.data?.data       || [];
  const pagination = listQ.data?.pagination || {};

  // ── Dynamic department options from current dataset ────────────────────────
  const deptOptions = useMemo(() => {
    const seen = new Set();
    allMembers.forEach((m) => { if (m.departmentInterest?.trim()) seen.add(m.departmentInterest.trim()); });
    return Array.from(seen).sort();
  }, [allMembers]);

  // ── Client-side advanced filtering ────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!hasAdvanced) return allMembers;
    return allMembers.filter((m) => {
      const f = filters;
      if (f.gender.length        && !f.gender.includes(m.gender?.toLowerCase()))           return false;
      if (f.maritalStatus.length && !f.maritalStatus.includes(m.maritalStatus?.toLowerCase())) return false;
      if (f.department.length    && !f.department.includes(m.departmentInterest?.trim()))   return false;
      if (f.waterBaptism !== 'any') {
        const is = !!m.waterBaptism;
        if (f.waterBaptism === 'yes' && !is) return false;
        if (f.waterBaptism === 'no'  &&  is) return false;
      }
      if (f.spiritBaptism !== 'any') {
        const is = boolVal(m.holySpiritBaptism);
        if (f.spiritBaptism === 'yes' && !is) return false;
        if (f.spiritBaptism === 'no'  &&  is) return false;
      }
      if (f.desiresRebaptism !== 'any') {
        const is = !!m.desiresRebaptism;
        if (f.desiresRebaptism === 'yes' && !is) return false;
        if (f.desiresRebaptism === 'no'  &&  is) return false;
      }
      if (f.believesInJesus !== 'any') {
        const is = m.believesInJesus === true;
        if (f.believesInJesus === 'yes' && !is) return false;
        if (f.believesInJesus === 'no'  &&  is) return false;
      }
      if (f.hasChildren !== 'any') {
        const has = (m.children?.length || 0) > 0;
        if (f.hasChildren === 'yes' && !has) return false;
        if (f.hasChildren === 'no'  &&  has) return false;
      }
      if (f.ageMin || f.ageMax) {
        const age = getAge(m.dateOfBirth);
        if (age === null)                           return false;
        if (f.ageMin && age < parseInt(f.ageMin))   return false;
        if (f.ageMax && age > parseInt(f.ageMax))   return false;
      }
      if (f.memberSinceMin || f.memberSinceMax) {
        const yr = parseInt(m.memberSince);
        if (!yr)                                                  return false;
        if (f.memberSinceMin && yr < parseInt(f.memberSinceMin)) return false;
        if (f.memberSinceMax && yr > parseInt(f.memberSinceMax)) return false;
      }
      if (f.submittedFrom || f.submittedTo) {
        const d = m.submittedAt ? new Date(m.submittedAt) : null;
        if (!d)                                                              return false;
        if (f.submittedFrom && d < new Date(f.submittedFrom))               return false;
        if (f.submittedTo   && d > new Date(f.submittedTo + 'T23:59:59'))   return false;
      }
      return true;
    });
  }, [allMembers, filters, hasAdvanced]);

  // ── Client-side sort ───────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!filtered.length) return filtered;
    return [...filtered].sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];
      if (['submittedAt', 'reviewedAt', 'dateOfBirth', 'signatureDate'].includes(sortField)) {
        av = av ? new Date(av).getTime() : 0;
        bv = bv ? new Date(bv).getTime() : 0;
      } else if (sortField === 'waterBaptism') {
        av = av ? 1 : 0; bv = bv ? 1 : 0;
      } else if (sortField === 'holySpiritBaptism') {
        av = boolVal(av) ? 1 : 0; bv = boolVal(bv) ? 1 : 0;
      } else {
        av = (av ?? '').toString().toLowerCase();
        bv = (bv ?? '').toString().toLowerCase();
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  // ── Pagination (unified for both modes) ───────────────────────────────────
  const PAGE_SIZE     = 15;
  const displayedRows = hasAdvanced ? sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : sorted;
  const totalFiltered = hasAdvanced ? sorted.length : (pagination.total  || 0);
  const totalPages    = hasAdvanced ? Math.ceil(sorted.length / PAGE_SIZE) : (pagination.pages || 1);

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

  const handleSort = (field) => {
    setSortDir((prev) => sortField === field ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortField(field);
    setPage(1);
  };

  const handleSearchChange  = (e) => { setSearch(e.target.value); setPage(1); };
  const handleStatusChange  = (s) => { setStatus(s);              setPage(1); };
  const handleFiltersChange = useCallback((f) => { setFilters(f); setPage(1); }, []);
  const handleClearFilters  = useCallback(() => { setFilters(FILTER_DEFAULTS); setPage(1); }, []);

  const sortProps = { sortField, sortDir, onSort: handleSort };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1600px] mx-auto">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Church Membership</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review and manage membership applications</p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['members'] })}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      {statsQ.data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Applications" value={statsQ.data.total}    icon={Users}        color="#64748b" />
          <StatCard label="Pending Review"      value={statsQ.data.pending}  icon={Clock}        color="#d97706" />
          <StatCard label="Approved Members"    value={statsQ.data.approved} icon={CheckCircle2} color="#16a34a" />
          <StatCard label="Rejected"            value={statsQ.data.rejected} icon={XCircle}      color="#dc2626" />
        </div>
      )}

      {/* Search + Status + Filters button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
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

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
              showFilters || hasAdvanced
                ? 'border-[#8B1A1A] bg-[#8B1A1A]/5 text-[#8B1A1A]'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center"
                style={{ background: RED }}
              >
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <AdvancedFilters
            filters={filters}
            onChange={handleFiltersChange}
            onClear={handleClearFilters}
            deptOptions={deptOptions}
          />
        )}
      </AnimatePresence>

      {/* Active filter chips */}
      <ActiveChips filters={filters} onChange={handleFiltersChange} />

      {/* Sort indicator + result count */}
      <div className="flex items-center gap-2 flex-wrap min-h-5">
        {sortField && (
          <>
            <span className="text-xs text-slate-400">Sorted by</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8B1A1A] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
              {SORT_LABELS[sortField] || sortField}
              {sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </span>
            <button
              onClick={() => { setSortField('submittedAt'); setSortDir('desc'); }}
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
            >
              reset
            </button>
          </>
        )}
        {hasAdvanced && !listQ.isLoading && (
          <span className="ml-auto text-xs text-slate-400">
            <strong className="text-slate-600">{totalFiltered}</strong> result{totalFiltered !== 1 ? 's' : ''} match filters
          </span>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {listQ.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={26} className="animate-spin text-slate-300" />
          </div>
        ) : listQ.isError ? (
          <div className="flex flex-col items-center py-24 gap-3">
            <AlertCircle size={26} className="text-red-300" />
            <p className="text-slate-400 text-sm">Failed to load membership records.</p>
          </div>
        ) : displayedRows.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-3">
            <UserCheck size={36} className="text-slate-200" />
            <p className="text-slate-400 text-sm font-medium">
              {hasAdvanced ? 'No records match the current filters.' : 'No applications found.'}
            </p>
            {hasAdvanced && (
              <button onClick={handleClearFilters} className="text-xs text-[#8B1A1A] font-bold underline underline-offset-2">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '1200px' }}>
                <thead>
                  <tr className="border-b border-slate-100">
                    <SortTh label="Name"           field="fullName"           {...sortProps} className="sticky left-0 z-20 bg-slate-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] min-w-[180px]" />
                    <SortTh label="Status"         field="status"             {...sortProps} className="bg-slate-50 min-w-[115px]" />
                    <SortTh label="Gender"         field="gender"             {...sortProps} className="bg-slate-50 min-w-[90px]"  />
                    <SortTh label="Age"            field="dateOfBirth"        {...sortProps} className="bg-slate-50 min-w-[72px]"  />
                    <SortTh label="Location"       field="residentialAddress" {...sortProps} className="bg-slate-50 min-w-[160px]" />
                    <SortTh label="Department"     field="departmentInterest" {...sortProps} className="bg-slate-50 min-w-[130px]" />
                    <SortTh label="Member Since"   field="memberSince"        {...sortProps} className="bg-slate-50 min-w-[115px]" />
                    <SortTh label="Water Baptism"  field="waterBaptism"       {...sortProps} className="bg-slate-50 min-w-[125px]" />
                    <SortTh label="Spirit Baptism" field="holySpiritBaptism"  {...sortProps} className="bg-slate-50 min-w-[125px]" />
                    <SortTh label="Submitted"      field="submittedAt"        {...sortProps} className="bg-slate-50 min-w-[115px]" />
                    <SortTh label="Reviewed"       field="reviewedAt"         {...sortProps} className="bg-slate-50 min-w-[115px]" />
                    <th className="px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 sticky right-0 z-20 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.06)] min-w-[100px] text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayedRows.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Sticky Name */}
                      <td className="px-4 py-3.5 sticky left-0 z-10 bg-white group-hover:bg-slate-50/60 transition-colors shadow-[2px_0_4px_-2px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full text-white font-black text-xs flex items-center justify-center shrink-0" style={{ background: RED }}>
                            {m.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 whitespace-nowrap leading-tight">{m.fullName}</p>
                            <p className="text-[11px] text-slate-400 leading-tight">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={m.status} /></td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 capitalize">
                        {m.gender || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">
                        {getAge(m.dateOfBirth)
                          ? <span className="font-semibold">{getAge(m.dateOfBirth)}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 max-w-[160px]">
                        <span className="block truncate" title={m.residentialAddress}>
                          {m.residentialAddress || <span className="text-slate-300">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {m.departmentInterest
                          ? <span className="inline-flex px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-xs font-bold whitespace-nowrap">{m.departmentInterest}</span>
                          : <span className="text-slate-300 text-sm">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 font-medium">
                        {m.memberSince || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5"><BoolPill value={m.waterBaptism} /></td>
                      <td className="px-4 py-3.5"><BoolPill value={m.holySpiritBaptism} /></td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{fmt(m.submittedAt)}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{fmt(m.reviewedAt)}</td>
                      {/* Sticky Actions */}
                      <td className="px-4 py-3.5 sticky right-0 z-10 bg-white group-hover:bg-slate-50/60 transition-colors shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => setViewing(m)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#8B1A1A] hover:bg-red-50 transition-colors" title="View details">
                            <Eye size={15} />
                          </button>
                          {m.status === 'pending' && (
                            <>
                              <button onClick={() => handleApprove(m._id, '')} className="p-1.5 rounded-lg text-green-500 hover:text-green-700 hover:bg-green-50 transition-colors" title="Quick approve">
                                <Check size={15} />
                              </button>
                              <button onClick={() => handleReject(m._id, '')} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Quick reject">
                                <X size={15} />
                              </button>
                            </>
                          )}
                          <button onClick={() => setDeleting(m)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete record">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalFiltered)} of {totalFiltered}
                  {hasAdvanced && <span className="ml-1 text-[#8B1A1A] font-semibold">(filtered)</span>}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-sm font-bold text-slate-700 px-1">{page} / {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Slide-Over */}
      {viewing && (
        <SlideOver
          member={viewing}
          onClose={() => setViewing(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          isActing={statusMut.isPending}
        />
      )}

      {/* Delete Confirm */}
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