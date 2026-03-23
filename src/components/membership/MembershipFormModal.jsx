'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, CheckCircle2, Cross,
  User, Phone, MapPin, Mail, Calendar, Users, Church,
  Droplets, Heart, Fingerprint, PenLine, Plus, Trash2,
  Loader2, AlertCircle
} from 'lucide-react';
import { submitMembershipApplication } from '@/services/api/membershipService';

// ── Brand colors ──────────────────────────────────────────────────────────────
const RED  = '#8B1A1A';
const GOLD = '#d4a017';

// ── Animation variants ────────────────────────────────────────────────────────
const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 28, stiffness: 320 } },
  exit:    { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

const stepVariants = {
  enter:   (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center:  { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.2 } }),
};

// ── Helper components ─────────────────────────────────────────────────────────

const Field = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

const inputClass =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all';

const selectClass = inputClass + ' appearance-none cursor-pointer';

const RadioGroup = ({ name, options, value, onChange }) => (
  <div className="flex gap-3">
    {options.map((opt) => (
      <label
        key={opt.value}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all select-none ${
          value === opt.value
            ? 'border-[#8B1A1A] bg-[#8B1A1A]/5 text-[#8B1A1A]'
            : 'border-slate-200 text-slate-500 hover:border-slate-300'
        }`}
      >
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            value === opt.value ? 'border-[#8B1A1A]' : 'border-slate-300'
          }`}
        >
          {value === opt.value && (
            <div className="w-2 h-2 rounded-full bg-[#8B1A1A]" />
          )}
        </div>
        {opt.label}
      </label>
    ))}
  </div>
);

// ── STEP DEFINITIONS ──────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'Personal Details',    icon: User },
  { id: 2, title: 'Family & Ministry',   icon: Users },
  { id: 3, title: 'Faith & Identity',    icon: Heart },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function MembershipFormModal({
  isOpen,
  userEmail    = '',
  userName     = '',
  userPhone    = '',   // ← pre-fills from account if already set
  userGender   = '',   // ← pre-fills from account if already set
  userLocation = '',   // ← pre-fills from account if already set
  onComplete,
}) {
  const [phase, setPhase]           = useState('prompt'); // 'prompt' | 'form' | 'success'
  const [step, setStep]             = useState(1);
  const [direction, setDirection]   = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState('');

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    // Step 1
    fullName:           userName     || '',
    email:              userEmail    || '',
    phone:              userPhone    || '',
    residentialAddress: userLocation || '',
    postalAddress:      '',
    dateOfBirth:        '',
    maritalStatus:      '',
    gender:             userGender   || '',
    // Step 2
    children:           [],
    memberSince:        '',
    holySpiritBaptism:  '',
    waterBaptism:       '',    // 'yes' | 'no'
    waterBaptismDate:   '',
    desiresRebaptism:   '',    // 'yes' | 'no'
    departmentInterest: '',
    // Step 3
    believesInJesus:    '',    // 'yes' | 'no'
    idPassportNumber:   '',
    signatureName:      '',
    signatureDate:      today,
  });

  const [errors, setErrors] = useState({});

  // Sync all pre-fillable fields whenever the parent passes updated props
  // (e.g. the modal is opened from the profile page after the user saved their profile)
  useEffect(() => {
    setForm((f) => ({
      ...f,
      fullName:           f.fullName           || userName,
      email:              f.email              || userEmail,
      phone:              f.phone              || userPhone,
      residentialAddress: f.residentialAddress || userLocation,
      gender:             f.gender             || userGender,
    }));
  }, [userName, userEmail, userPhone, userGender, userLocation]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  // ── Children table helpers ────────────────────────────────────────────────

  const addChild = () =>
    setForm((f) => ({
      ...f,
      children: [...f.children, { name: '', dateOfBirth: '', isMember: false }],
    }));

  const removeChild = (idx) =>
    setForm((f) => ({ ...f, children: f.children.filter((_, i) => i !== idx) }));

  const setChild = (idx, field, value) =>
    setForm((f) => {
      const updated = [...f.children];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...f, children: updated };
    });

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = 'Full name is required';
      if (!form.email.trim())    e.email    = 'Email is required';
    }
    if (step === 3) {
      if (!form.believesInJesus) e.believesInJesus = 'Please answer this question';
      if (!form.signatureName.trim()) e.signatureName = 'Signature name is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const goNext = () => {
    if (!validate()) return;
    if (step < 3) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  // ── Submission ────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        ...form,
        waterBaptism:    form.waterBaptism    === 'yes',
        desiresRebaptism:form.desiresRebaptism=== 'yes',
        believesInJesus: form.believesInJesus === 'yes',
      };
      await submitMembershipApplication(payload);
      setPhase('success');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Submission failed. Please try again.';
      // If already submitted — still show success
      if (err?.response?.status === 409) {
        setPhase('success');
      } else {
        setSubmitError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          key="modal"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* ── Gold accent bar ── */}
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${RED}, ${GOLD})` }} />

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">

            {/* ════════════════════════════════════════════════
                PROMPT PHASE
            ════════════════════════════════════════════════ */}
            {phase === 'prompt' && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center p-8 gap-5"
              >
                {/* Cross emblem */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${RED}, #a52020)` }}
                >
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <rect x="15" y="2" width="8" height="34" rx="3" fill="white" />
                    <rect x="2" y="13" width="34" height="8" rx="3" fill="white" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    Welcome to H.O.T. Church!
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-400 uppercase tracking-widest">
                    House of Transformation
                  </p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
                  Would you like to officially register as a <strong>church member</strong>?
                  Membership connects you deeper to our family, ensures you receive
                  timely service, and helps us serve you better.
                </p>

                {/* Benefits */}
                <div className="w-full bg-slate-50 rounded-2xl p-4 space-y-2 text-left">
                  {[
                    'Officially part of the Body of Christ at H.O.T.',
                    'Receive member-specific communications',
                    'Serve in your chosen department',
                    'Access to member-only events and ministry',
                  ].map((b) => (
                    <div key={b} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} style={{ color: GOLD, marginTop: 2, flexShrink: 0 }} />
                      <span className="text-xs text-slate-600">{b}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="w-full flex flex-col gap-3 pt-1">
                  <button
                    onClick={() => setPhase('form')}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all active:scale-[0.98]"
                    style={{ background: `linear-gradient(135deg, ${RED}, #a52020)` }}
                  >
                    Yes, Register as a Member
                  </button>
                  <button
                    onClick={onComplete}
                    className="w-full py-3 rounded-2xl text-slate-500 font-semibold text-sm hover:text-slate-700 transition-colors"
                  >
                    Continue as Guest
                  </button>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════
                FORM PHASE
            ════════════════════════════════════════════════ */}
            {phase === 'form' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {STEPS[step - 1].title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Step {step} of 3</p>
                  </div>

                  {/* Progress dots */}
                  <div className="flex items-center gap-1.5">
                    {STEPS.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width:      s.id === step ? 20 : 8,
                          height:     8,
                          background: s.id <= step ? RED : '#e2e8f0',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Step content */}
                <div className="px-6 py-5 overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="flex flex-col gap-4"
                    >
                      {/* ── STEP 1: Personal Information ── */}
                      {step === 1 && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Full Name" required>
                              <input
                                className={inputClass}
                                placeholder="Your full name"
                                value={form.fullName}
                                onChange={(e) => set('fullName', e.target.value)}
                              />
                              {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                            </Field>

                            <Field label="Email Address" required>
                              <input
                                className={inputClass + ' bg-slate-50'}
                                type="email"
                                placeholder="your@email.com"
                                value={form.email}
                                onChange={(e) => set('email', e.target.value)}
                                readOnly={!!userEmail}
                              />
                              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                            </Field>
                          </div>

                          <Field label="Telephone Contact">
                            <input
                              className={inputClass}
                              placeholder="+254 700 000 000"
                              value={form.phone}
                              onChange={(e) => set('phone', e.target.value)}
                            />
                          </Field>

                          <Field label="Residential Address (Where You Live)">
                            <textarea
                              className={inputClass + ' resize-none'}
                              rows={2}
                              placeholder="Street, Estate, Town"
                              value={form.residentialAddress}
                              onChange={(e) => set('residentialAddress', e.target.value)}
                            />
                          </Field>

                          <Field label="Postal Address & Code">
                            <input
                              className={inputClass}
                              placeholder="P.O. Box 1234 - 00100 Nairobi"
                              value={form.postalAddress}
                              onChange={(e) => set('postalAddress', e.target.value)}
                            />
                          </Field>

                          <Field label="Date of Birth">
                            <input
                              type="date"
                              className={inputClass}
                              max={today}
                              value={form.dateOfBirth}
                              onChange={(e) => set('dateOfBirth', e.target.value)}
                            />
                          </Field>

                          <Field label="Marital Status">
                            <select
                              className={selectClass}
                              value={form.maritalStatus}
                              onChange={(e) => set('maritalStatus', e.target.value)}
                            >
                              <option value="">Select status</option>
                              {['Single', 'Married', 'Divorced', 'Widowed', 'Separated'].map((s) => (
                                <option key={s} value={s.toLowerCase()}>{s}</option>
                              ))}
                            </select>
                          </Field>

                          <Field label="Gender">
                            <RadioGroup
                              name="gender"
                              options={[
                                { value: 'male',   label: 'Male' },
                                { value: 'female', label: 'Female' },
                              ]}
                              value={form.gender}
                              onChange={(v) => set('gender', v)}
                            />
                          </Field>
                        </>
                      )}

                      {/* ── STEP 2: Family & Ministry ── */}
                      {step === 2 && (
                        <>
                          {/* Children table */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Particulars of Children
                              </label>
                              <button
                                type="button"
                                onClick={addChild}
                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                style={{ color: RED, background: `${RED}10` }}
                              >
                                <Plus size={12} /> Add Child
                              </button>
                            </div>

                            {form.children.length === 0 ? (
                              <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                                No children added
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {form.children.map((child, idx) => (
                                  <div
                                    key={idx}
                                    className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center p-3 bg-slate-50 rounded-xl"
                                  >
                                    <input
                                      className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/40 focus:border-[#8B1A1A]"
                                      placeholder="Child's name"
                                      value={child.name}
                                      onChange={(e) => setChild(idx, 'name', e.target.value)}
                                    />
                                    <input
                                      type="date"
                                      className="text-xs px-2 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/40 focus:border-[#8B1A1A]"
                                      value={child.dateOfBirth}
                                      max={today}
                                      onChange={(e) => setChild(idx, 'dateOfBirth', e.target.value)}
                                    />
                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer whitespace-nowrap select-none">
                                      <input
                                        type="checkbox"
                                        checked={child.isMember}
                                        onChange={(e) => setChild(idx, 'isMember', e.target.checked)}
                                        className="w-3.5 h-3.5 accent-[#8B1A1A]"
                                      />
                                      Member
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => removeChild(idx)}
                                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <Field label="Member Since?" hint="Year or approximate date you first attended">
                            <input
                              className={inputClass}
                              placeholder="e.g. 2019 or January 2021"
                              value={form.memberSince}
                              onChange={(e) => set('memberSince', e.target.value)}
                            />
                          </Field>

                          <Field label="Have you received the Baptism of the Holy Spirit since you believed?">
                            <textarea
                              className={inputClass + ' resize-none'}
                              rows={2}
                              placeholder="Your answer..."
                              value={form.holySpiritBaptism}
                              onChange={(e) => set('holySpiritBaptism', e.target.value)}
                            />
                          </Field>

                          <Field label="Have you been baptized in water?">
                            <RadioGroup
                              name="waterBaptism"
                              options={[
                                { value: 'yes', label: 'Yes' },
                                { value: 'no',  label: 'No'  },
                              ]}
                              value={form.waterBaptism}
                              onChange={(v) => set('waterBaptism', v)}
                            />
                            {form.waterBaptism === 'yes' && (
                              <div className="mt-2">
                                <input
                                  type="date"
                                  className={inputClass}
                                  max={today}
                                  value={form.waterBaptismDate}
                                  onChange={(e) => set('waterBaptismDate', e.target.value)}
                                  placeholder="Date of baptism"
                                />
                              </div>
                            )}
                          </Field>

                          <Field label="Do you desire to be re-baptized?">
                            <RadioGroup
                              name="desiresRebaptism"
                              options={[
                                { value: 'yes', label: 'Yes' },
                                { value: 'no',  label: 'No'  },
                              ]}
                              value={form.desiresRebaptism}
                              onChange={(v) => set('desiresRebaptism', v)}
                            />
                          </Field>

                          <Field
                            label="Would you love to serve in any department?"
                            hint="e.g. Ushering, Worship Team, Children's Ministry, Technical"
                          >
                            <input
                              className={inputClass}
                              placeholder="Specify department(s)"
                              value={form.departmentInterest}
                              onChange={(e) => set('departmentInterest', e.target.value)}
                            />
                          </Field>
                        </>
                      )}

                      {/* ── STEP 3: Faith & Identity ── */}
                      {step === 3 && (
                        <>
                          {/* Faith declaration */}
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                              Faith Declaration
                            </p>
                            <p className="text-sm text-amber-900 leading-relaxed">
                              Do you believe that Jesus is the Son of God and that He came, was born of a
                              virgin, died on the cross, was buried and on the third day He rose again,
                              ascended, and was received in Heaven and is sat at the right hand of God?
                            </p>
                            <div className="mt-3">
                              <RadioGroup
                                name="believesInJesus"
                                options={[
                                  { value: 'yes', label: 'Yes, I believe' },
                                  { value: 'no',  label: 'No'             },
                                ]}
                                value={form.believesInJesus}
                                onChange={(v) => set('believesInJesus', v)}
                              />
                              {errors.believesInJesus && (
                                <p className="text-red-500 text-xs mt-1">{errors.believesInJesus}</p>
                              )}
                            </div>
                          </div>

                          <Field label="Name & Surname (as on ID)">
                            <input
                              className={inputClass}
                              placeholder="Full legal name"
                              value={form.fullName}
                              onChange={(e) => set('fullName', e.target.value)}
                            />
                          </Field>

                          <Field label="Identity Card No. / Passport No.">
                            <input
                              className={inputClass}
                              placeholder="ID or Passport number"
                              value={form.idPassportNumber}
                              onChange={(e) => set('idPassportNumber', e.target.value)}
                            />
                          </Field>

                          {/* Signature block */}
                          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 space-y-3">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                              <PenLine size={13} /> Signature
                            </p>
                            <Field label="Type your full name as your signature" required>
                              <input
                                className={inputClass}
                                placeholder="Your full name"
                                value={form.signatureName}
                                onChange={(e) => set('signatureName', e.target.value)}
                                style={{ fontFamily: 'cursive', fontSize: '1rem' }}
                              />
                              {errors.signatureName && (
                                <p className="text-red-500 text-xs">{errors.signatureName}</p>
                              )}
                            </Field>
                            <Field label="Date">
                              <input
                                type="date"
                                className={inputClass}
                                value={form.signatureDate}
                                onChange={(e) => set('signatureDate', e.target.value)}
                              />
                            </Field>
                          </div>

                          {submitError && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                              <AlertCircle size={15} /> {submitError}
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
                  {step > 1 ? (
                    <button
                      onClick={goBack}
                      className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                  ) : (
                    <button
                      onClick={() => setPhase('prompt')}
                      className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    onClick={goNext}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-70"
                    style={{ background: `linear-gradient(135deg, ${RED}, #a52020)` }}
                  >
                    {isSubmitting ? (
                      <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                    ) : step === 3 ? (
                      <><CheckCircle2 size={15} /> Submit Application</>
                    ) : (
                      <>Next <ChevronRight size={15} /></>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* ════════════════════════════════════════════════
                SUCCESS PHASE
            ════════════════════════════════════════════════ */}
            {phase === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, transition: { type: 'spring', damping: 20 } }}
                className="flex flex-col items-center text-center p-10 gap-5"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
                >
                  <CheckCircle2 size={40} color="white" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900">Application Submitted!</h2>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs">
                    Thank you, <strong>{form.fullName || 'friend'}</strong>. Our team will
                    review your membership application and get back to you shortly.
                  </p>
                </div>

                <div className="w-full bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs text-slate-500">
                    Meanwhile, please check your email to verify your account and complete sign-in.
                  </p>
                </div>

                <button
                  onClick={onComplete}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${RED}, #a52020)` }}
                >
                  Continue to Login
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}