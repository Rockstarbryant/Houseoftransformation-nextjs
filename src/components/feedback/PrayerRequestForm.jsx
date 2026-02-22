'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Heart, Send, Bell, ShieldCheck, Clock, Info } from 'lucide-react';
import { feedbackService } from '@/services/api/feedbackService';

export const PrayerRequestForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', prayerCategory: '',
    request: '', urgency: 'Regular', shareOnPrayerList: false,
    prayerNeeded: false, preferredContact: '', bestTimeToContact: ''
  });

  const [errors, setErrors]             = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAnonymous && user) {
      setFormData(prev => ({ ...prev, name: user?.name || '', email: user?.email || '' }));
    } else if (isAnonymous) {
      setFormData(prev => ({
        ...prev, name: '', email: '', phone: '', shareOnPrayerList: false, prayerNeeded: false
      }));
    }
  }, [isAnonymous, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isAnonymous && formData.prayerNeeded && !formData.email && !formData.phone) {
      newErrors.contact = 'Contact info required for follow-up prayer';
    }
    if (!formData.prayerCategory) newErrors.prayerCategory = 'Select a category';
    if (!formData.request.trim()) {
      newErrors.request = 'Prayer request is required';
    } else if (formData.request.trim().length < 20) {
      newErrors.request = 'Minimum 20 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const submissionData = {
        category: 'prayer',
        isAnonymous,
        shareOnPrayerList: formData.shareOnPrayerList && !isAnonymous,
        feedbackData: {
          prayerCategory: formData.prayerCategory,
          request: formData.request,
          urgency: formData.urgency,
          prayerNeeded: formData.prayerNeeded && !isAnonymous,
          preferredContact: formData.preferredContact,
          bestTimeToContact: formData.bestTimeToContact
        }
      };
      if (!isAnonymous) {
        submissionData.name        = formData.name;
        submissionData.email       = formData.email;
        submissionData.phone       = formData.phone;
        submissionData.allowFollowUp = formData.prayerNeeded;
      }
      const response = await feedbackService.submitFeedback(submissionData);
      if (response.success) onSuccess(response);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to submit' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const prayerCategories = [
    'Personal Health', 'Family', 'Financial', 'Career/Work',
    'Relationships', 'Spiritual Growth', 'Other'
  ];

  /* ── Shared class strings ── */
  const inputCls =
    'w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all';
  const labelCls =
    'block text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest ml-1 mb-2';
  const sectionLabelCls =
    'text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-400';
  const dividerCls = 'h-px w-8 bg-slate-200 dark:bg-slate-600';
  const errorCls   = 'text-[#8B1A1A] dark:text-red-400 text-[9px] font-bold uppercase mt-1';

  return (
    <div className="bg-white dark:bg-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 border border-slate-200 dark:border-slate-700">

      {/* ── Header ── */}
      <div className="bg-[#8B1A1A] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] opacity-10 rotate-12 pointer-events-none">
          <Heart size={280} fill="currentColor" />
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
          Standing <br />In Prayer.
        </h2>
        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-6 flex items-center gap-2">
          <ShieldCheck size={14} className="text-white" /> Your burdens are our burdens
        </p>
      </div>

      {/* ── Form body ── */}
      <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-12 bg-white dark:bg-slate-800">

        {/* URGENCY TOGGLE */}
        <div>
          <label className={labelCls}>Urgency Level</label>
          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-700 rounded-[24px] gap-1 mt-2">
            {[
              { id: 'Regular', label: 'Regular Prayer', icon: '🙏' },
              { id: 'Urgent',  label: 'Urgent Request',  icon: '🚨' }
            ].map((u) => (
              <button
                key={u.id} type="button"
                onClick={() => setFormData(p => ({ ...p, urgency: u.id }))}
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-colors ${
                  formData.urgency === u.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500'
                } disabled:opacity-50`}
              >
                <span>{u.icon}</span> {u.label}
              </button>
            ))}
          </div>
        </div>

        {/* THE REQUEST */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className={dividerCls} />
            <h3 className={sectionLabelCls}>The Request</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Category <span className="text-[#8B1A1A] dark:text-red-400">*</span></label>
              <select name="prayerCategory" value={formData.prayerCategory} onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 appearance-none transition-all"
              >
                <option value="">Select Category</option>
                {prayerCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.prayerCategory && <p className={errorCls}>{errors.prayerCategory}</p>}
            </div>
            {!isAnonymous && (
              <div>
                <label className={labelCls}>Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="+254..." disabled={isSubmitting} className={inputCls} />
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>Tell us how we can pray <span className="text-[#8B1A1A] dark:text-red-400">*</span></label>
            <textarea
              name="request" value={formData.request} onChange={handleChange}
              rows="5" disabled={isSubmitting} placeholder="What's on your heart?"
              className="w-full px-6 py-5 rounded-[30px] border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all resize-none"
            />
            <div className="flex justify-between px-2 mt-1">
              {errors.request && <p className={errorCls}>{errors.request}</p>}
              <p className="text-[9px] text-slate-300 dark:text-slate-500 font-bold ml-auto">
                {formData.request.length} / 20 MIN
              </p>
            </div>
          </div>
        </div>

        {/* SUPPORT PREFERENCES */}
        {!isAnonymous && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className={dividerCls} />
              <h3 className={sectionLabelCls}>Support Preferences</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Church Prayer List */}
              <label className={`flex flex-col p-6 rounded-[28px] border-2 transition-colors cursor-pointer ${
                formData.shareOnPrayerList
                  ? 'border-[#8B1A1A] bg-[#8B1A1A]/5 dark:bg-[#8B1A1A]/10'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'
              }`}>
                <input type="checkbox" name="shareOnPrayerList" checked={formData.shareOnPrayerList}
                  onChange={handleChange} disabled={isSubmitting} className="sr-only" />
                <Bell className={formData.shareOnPrayerList ? 'text-[#8B1A1A]' : 'text-slate-300 dark:text-slate-500'} size={24} />
                <span className="text-[11px] font-black uppercase tracking-widest mt-4 text-slate-900 dark:text-slate-100">
                  Church Prayer List
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium mt-1 uppercase tracking-tighter">
                  Share with the congregation
                </span>
              </label>

              {/* Pray With Me */}
              <label className={`flex flex-col p-6 rounded-[28px] border-2 transition-colors cursor-pointer ${
                formData.prayerNeeded
                  ? 'border-[#8B1A1A] bg-[#8B1A1A]/5 dark:bg-[#8B1A1A]/10'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'
              }`}>
                <input type="checkbox" name="prayerNeeded" checked={formData.prayerNeeded}
                  onChange={handleChange} disabled={isSubmitting} className="sr-only" />
                <Heart className={formData.prayerNeeded ? 'text-[#8B1A1A]' : 'text-slate-300 dark:text-slate-500'} size={24} />
                <span className="text-[11px] font-black uppercase tracking-widest mt-4 text-slate-900 dark:text-slate-100">
                  Pray With Me
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium mt-1 uppercase tracking-tighter">
                  Request a personal follow-up
                </span>
              </label>
            </div>

            {/* Follow-up detail fields */}
            {formData.prayerNeeded && (
              <div className="grid md:grid-cols-2 gap-6 p-8 bg-slate-50 dark:bg-slate-700 rounded-[32px] border border-slate-200 dark:border-slate-600 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                    Contact via
                  </label>
                  <select name="preferredContact" value={formData.preferredContact}
                    onChange={handleChange} disabled={isSubmitting}
                    className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-500 py-2 text-sm font-bold outline-none focus:border-[#8B1A1A] text-slate-900 dark:text-white transition-colors"
                  >
                    <option value="">Select Method</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="In-person">In-person</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Clock size={12} /> Best Time
                  </label>
                  <input name="bestTimeToContact" value={formData.bestTimeToContact}
                    onChange={handleChange} disabled={isSubmitting}
                    placeholder="e.g. Weekday evenings"
                    className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-500 py-2 text-sm font-bold outline-none focus:border-[#8B1A1A] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-600 space-y-6">
          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-2 text-[#8B1A1A] dark:text-red-400 text-[10px] font-black uppercase">
              <Info size={14} /> {errors.submit}
            </div>
          )}
          {errors.contact && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl text-[#8B1A1A] dark:text-red-400 text-[10px] font-black uppercase text-center">
              {errors.contact}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4">
            <button type="button" onClick={onBack} disabled={isSubmitting}
              className="flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700 transition-colors disabled:opacity-50 order-2 md:order-1"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-[2] py-4 bg-[#8B1A1A] text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-colors active:scale-95 disabled:opacity-50 order-1 md:order-2"
            >
              {isSubmitting
                ? <><Loader className="animate-spin" size={18} /> Submitting...</>
                : <><Send size={18} /> Submit Request</>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PrayerRequestForm;