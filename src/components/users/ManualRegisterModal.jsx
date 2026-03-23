'use client';

/**
 * ManualRegisterModal
 *
 * A self-contained 2-step registration wizard used by admins to add a person
 * to the platform and create their church membership record in one flow.
 *
 * Props:
 *   isOpen   {boolean}  — controls visibility
 *   roles    {Array}    — list of Role objects { _id, name }
 *   onClose  {Function} — called when the modal is dismissed without registering
 *   onSuccess{Function} — called after successful registration; triggers page refresh
 *   onToast  {Function} — (message, isError?) parent toast handler
 */

import { useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, CheckCircle, Loader2,
  Eye, EyeOff, Copy, Plus, Trash2
} from 'lucide-react';
import { manualRegisterUser } from '@/services/api/userService';
import { submitMembershipApplication, updateMemberStatus } from '@/services/api/membershipService';

const RED  = '#8B1A1A';
const GOLD = '#d4a017';

const inputCls = 'w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed';
const labelCls = 'block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5';

const EMPTY_ACCOUNT = { name:'', email:'', phone:'', location:'', gender:'', roleId:'' };
const EMPTY_MEMBER  = {
  residentialAddress:'', postalAddress:'', dateOfBirth:'', maritalStatus:'',
  memberSince:'', holySpiritBaptism:'', waterBaptism:'', waterBaptismDate:'',
  desiresRebaptism:'', departmentInterest:'', believesInJesus:'',
  idPassportNumber:'', signatureName:'', signatureDate:'',
  membershipStatus:'approved',
};

export default function ManualRegisterModal({ isOpen, roles = [], onClose, onSuccess, onToast }) {
  const [step,            setStep]           = useState(1);
  const [accountData,     setAccountData]    = useState(EMPTY_ACCOUNT);
  const [memberData,      setMemberData]     = useState(EMPTY_MEMBER);
  const [children,        setChildren]       = useState([]);
  const [loading,         setLoading]        = useState(false);
  const [genPassword,     setGenPassword]    = useState('');
  const [showPassword,    setShowPassword]   = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setA = (field, value) => setAccountData(d => ({ ...d, [field]: value }));
  const setM = (field, value) => setMemberData(d  => ({ ...d, [field]: value }));

  const resetAll = () => {
    setStep(1);
    setAccountData(EMPTY_ACCOUNT);
    setMemberData(EMPTY_MEMBER);
    setChildren([]);
    setGenPassword('');
    setShowPassword(false);
  };

  const handleClose = () => { resetAll(); onClose(); };

  // ── Children helpers ───────────────────────────────────────────────────────
  const addChild    = () => setChildren(c => [...c, { name:'', dateOfBirth:'', isMember:false }]);
  const removeChild = (i) => setChildren(c => c.filter((_, idx) => idx !== i));
  const setChild    = (i, field, value) => setChildren(c => {
    const u = [...c]; u[i] = { ...u[i], [field]: value }; return u;
  });

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!accountData.name.trim() || !accountData.email.trim()) {
      onToast('Name and email are required', true); return;
    }
    try {
      setLoading(true);

      // 1. Create platform account
      const res = await manualRegisterUser(accountData);
      if (!res.success) throw new Error(res.message || 'Registration failed');
      setGenPassword(res.temporaryPassword);
      onToast('User registered successfully');

      // 2. Create membership application
      try {
        const today = new Date().toISOString().split('T')[0];
        const payload = {
          fullName:           accountData.name,
          email:              accountData.email,
          phone:              accountData.phone,
          gender:             accountData.gender,
          residentialAddress: memberData.residentialAddress,
          postalAddress:      memberData.postalAddress,
          dateOfBirth:        memberData.dateOfBirth || null,
          maritalStatus:      memberData.maritalStatus,
          children,
          memberSince:        memberData.memberSince,
          holySpiritBaptism:  memberData.holySpiritBaptism,
          waterBaptism:       memberData.waterBaptism === 'yes',
          waterBaptismDate:   memberData.waterBaptism === 'yes' ? (memberData.waterBaptismDate || null) : null,
          desiresRebaptism:   memberData.desiresRebaptism === 'yes',
          departmentInterest: memberData.departmentInterest,
          believesInJesus:    memberData.believesInJesus === 'yes',
          idPassportNumber:   memberData.idPassportNumber,
          signatureName:      memberData.signatureName || accountData.name,
          signatureDate:      memberData.signatureDate || today,
        };
        const memRes = await submitMembershipApplication(payload);
        if (memRes.data?.id && memberData.membershipStatus !== 'pending') {
          await updateMemberStatus(memRes.data.id, memberData.membershipStatus);
        }
      } catch (memErr) {
        console.warn('[ManualReg] Membership creation failed:', memErr?.response?.data?.message || memErr.message);
      }

      onSuccess(); // trigger parent refresh
    } catch (e) {
      onToast(e?.response?.data?.message || 'Registration failed', true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => { if (!genPassword) handleClose(); }}
    >
      <div
        className="w-full sm:max-w-2xl bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gold bar */}
        <div className="h-1.5 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${RED}, ${GOLD})` }} />

        {/* Header */}
        <div className="shrink-0 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Manual Registration</h3>
              {!genPassword && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {step === 1 ? 'Step 1 of 2 — Account Details' : 'Step 2 of 2 — Membership Details'}
                </p>
              )}
            </div>
            {!genPassword && (
              <button
                onClick={handleClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {/* Progress bar */}
          {!genPassword && (
            <div className="flex gap-2">
              {[1, 2].map(s => (
                <div
                  key={s}
                  className="flex-1 h-1.5 rounded-full transition-all duration-300"
                  style={{ background: s <= step ? RED : '#e2e8f0' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── SUCCESS ── */}
          {genPassword ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle size={28} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="text-base font-black text-slate-900 dark:text-white">Registration Complete!</p>
                <p className="text-xs text-slate-500 text-center">
                  Account and membership record created for <strong>{accountData.name}</strong>.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">Temporary Password</p>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={genPassword}
                    readOnly
                    className="flex-1 text-sm font-mono bg-transparent outline-none text-slate-800 dark:text-slate-200"
                  />
                  <button onClick={() => setShowPassword(p => !p)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(genPassword); onToast('Password copied!'); }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-semibold">
                  ⚠ Won't be shown again — share securely.
                </p>
              </div>

              <button
                onClick={() => { resetAll(); onClose(); }}
                className="w-full py-3 rounded-2xl text-white text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${RED}, #a52020)` }}
              >
                Done
              </button>
            </div>

          ) : step === 1 ? (

            /* ── STEP 1: ACCOUNT DETAILS ── */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input className={inputCls} placeholder="Full name" value={accountData.name}
                    onChange={e => setA('name', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input type="email" className={inputCls} placeholder="email@example.com" value={accountData.email}
                    onChange={e => setA('email', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input className={inputCls} placeholder="+254 700 000 000" value={accountData.phone}
                    onChange={e => setA('phone', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input className={inputCls} placeholder="Town / Estate" value={accountData.location}
                    onChange={e => setA('location', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <select className={inputCls} value={accountData.gender} onChange={e => setA('gender', e.target.value)}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Platform Role</label>
                  <select className={inputCls} value={accountData.roleId} onChange={e => setA('roleId', e.target.value)}>
                    <option value="">Default (Member)</option>
                    {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

          ) : (

            /* ── STEP 2: MEMBERSHIP DETAILS ── */
            <div className="space-y-4">

              {/* Status */}
              <div>
                <label className={labelCls}>Application Status</label>
                <select className={inputCls} value={memberData.membershipStatus}
                  onChange={e => setM('membershipStatus', e.target.value)}>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">Admin registrations default to Approved.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="date" className={inputCls} value={memberData.dateOfBirth}
                    onChange={e => setM('dateOfBirth', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Marital Status</label>
                  <select className={inputCls} value={memberData.maritalStatus}
                    onChange={e => setM('maritalStatus', e.target.value)}>
                    <option value="">Select</option>
                    {['single','married','divorced','widowed','separated'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Residential Address</label>
                <textarea className={inputCls + ' resize-none'} rows={2} placeholder="Street, Estate, Town"
                  value={memberData.residentialAddress} onChange={e => setM('residentialAddress', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Postal Address & Code</label>
                <input className={inputCls} placeholder="P.O. Box 1234 - 00100 Nairobi"
                  value={memberData.postalAddress} onChange={e => setM('postalAddress', e.target.value)} />
              </div>

              {/* Children */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls + ' mb-0'}>Particulars of Children</label>
                  <button
                    type="button"
                    onClick={addChild}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: RED, background: `${RED}10` }}
                  >
                    <Plus size={12} /> Add Child
                  </button>
                </div>
                {children.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    No children added
                  </p>
                ) : (
                  <div className="space-y-2">
                    {children.map((child, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <input
                          className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                          placeholder="Child's name"
                          value={child.name}
                          onChange={e => setChild(idx, 'name', e.target.value)}
                        />
                        <input
                          type="date"
                          className="text-xs px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                          value={child.dateOfBirth}
                          onChange={e => setChild(idx, 'dateOfBirth', e.target.value)}
                        />
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={child.isMember}
                            className="w-3.5 h-3.5 accent-[#8B1A1A]"
                            onChange={e => setChild(idx, 'isMember', e.target.checked)}
                          />
                          Member
                        </label>
                        <button
                          type="button"
                          onClick={() => removeChild(idx)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>Member Since</label>
                <input className={inputCls} placeholder="e.g. 2017" value={memberData.memberSince}
                  onChange={e => setM('memberSince', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Holy Spirit Baptism (since you believed)</label>
                <textarea className={inputCls + ' resize-none'} rows={2}
                  value={memberData.holySpiritBaptism} onChange={e => setM('holySpiritBaptism', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Water Baptism</label>
                  <select className={inputCls} value={memberData.waterBaptism}
                    onChange={e => setM('waterBaptism', e.target.value)}>
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                {memberData.waterBaptism === 'yes' && (
                  <div>
                    <label className={labelCls}>Baptism Date</label>
                    <input type="date" className={inputCls} value={memberData.waterBaptismDate}
                      onChange={e => setM('waterBaptismDate', e.target.value)} />
                  </div>
                )}
                <div>
                  <label className={labelCls}>Desires Re-baptism</label>
                  <select className={inputCls} value={memberData.desiresRebaptism}
                    onChange={e => setM('desiresRebaptism', e.target.value)}>
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Department Interest</label>
                  <input className={inputCls} placeholder="e.g. Ushering, Worship…" value={memberData.departmentInterest}
                    onChange={e => setM('departmentInterest', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Believes in Jesus?</label>
                  <select className={inputCls} value={memberData.believesInJesus}
                    onChange={e => setM('believesInJesus', e.target.value)}>
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>ID / Passport No.</label>
                  <input className={inputCls} value={memberData.idPassportNumber}
                    onChange={e => setM('idPassportNumber', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Name & Surname (as on ID)</label>
                  <input
                    className={inputCls}
                    style={{ fontFamily: 'cursive' }}
                    placeholder={accountData.name}
                    value={memberData.signatureName}
                    onChange={e => setM('signatureName', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Signature Date</label>
                  <input type="date" className={inputCls} value={memberData.signatureDate}
                    onChange={e => setM('signatureDate', e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {!genPassword && (
          <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50">
            {step === 1 ? (
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft size={15} /> Back
              </button>
            )}

            {step === 1 ? (
              <button
                onClick={() => {
                  if (!accountData.name.trim() || !accountData.email.trim()) {
                    onToast('Name and email are required', true); return;
                  }
                  setStep(2);
                }}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${RED}, #a52020)` }}
              >
                Next — Membership <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${RED}, #a52020)` }}
              >
                {loading
                  ? <><Loader2 size={14} className="animate-spin" /> Registering…</>
                  : <><CheckCircle size={14} /> Register Member</>
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}