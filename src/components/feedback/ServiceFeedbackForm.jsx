'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Info, Send, UserCheck } from 'lucide-react';
import StarRating from './StarRating';
import { feedbackService } from '@/services/api/feedbackService';

const ServiceFeedbackForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isFirstTimeVisitor: false,
    ratings: {
      overall: 0,
      worship: 0,
      hospitality: 0,
      facility: 0,
      parking: 0,
      childrensMinistry: 0,
      soundQuality: 0
    },
    whatWentWell: '',
    improvements: '',
    additionalComments: '',
    wouldReturn: '',
    allowFollowUp: false
  });

  const [errors, setErrors]             = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAnonymous && user) {
      setFormData(prev => ({ ...prev, name: user?.name || '', email: user?.email || '' }));
    } else if (isAnonymous) {
      setFormData(prev => ({ ...prev, name: '', email: '', phone: '', allowFollowUp: false }));
    }
  }, [isAnonymous, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({ ...prev, ratings: { ...prev.ratings, [category]: rating } }));
    if (errors[`rating_${category}`]) setErrors(prev => ({ ...prev, [`rating_${category}`]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isAnonymous && formData.allowFollowUp && !formData.email)
      newErrors.email = 'Email is required for follow-up';
    if (formData.ratings.overall === 0)
      newErrors.rating_overall = 'Overall rating is required';
    if (!formData.wouldReturn)
      newErrors.wouldReturn = 'Please select an option';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const submissionData = {
        category: 'service',
        isAnonymous,
        isFirstTimeVisitor: formData.isFirstTimeVisitor,
        allowFollowUp: formData.allowFollowUp && !isAnonymous,
        feedbackData: {
          ratings: formData.ratings,
          whatWentWell: formData.whatWentWell,
          improvements: formData.improvements,
          wouldReturn: formData.wouldReturn
        }
      };
      if (!isAnonymous) {
        submissionData.name  = formData.name;
        submissionData.email = formData.email;
        submissionData.phone = formData.phone;
      }
      const response = await feedbackService.submitFeedback(submissionData);
      if (response.success) {
        // onSuccess triggers toast + delayed redirect in page.jsx
        onSuccess(response);
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to submit' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingCategories = [
    { key: 'overall',          label: 'Overall Experience',  required: true },
    { key: 'worship',          label: 'Worship Music' },
    { key: 'hospitality',      label: 'Hospitality' },
    { key: 'facility',         label: 'Cleanliness' },
    { key: 'parking',          label: 'Parking' },
    { key: 'childrensMinistry',label: "Children's Ministry" },
    { key: 'soundQuality',     label: 'Sound / AV Quality' }
  ];

  /* ── Shared class strings ── */
  const inputCls =
    'w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-bold focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all outline-none';
  const textareaCls =
    'w-full px-6 py-4 rounded-[6px] border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-bold focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all outline-none resize-none';
  const labelCls =
    'block text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-2 ml-1';
  const sectionLabelCls =
    'text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-400';
  const dividerCls = 'h-px w-8 bg-slate-200 dark:bg-slate-600';
  const errorCls   = 'text-[#8B1A1A] dark:text-red-400 text-[10px] font-bold mt-1 ml-1';

  return (
    <div className="bg-white dark:bg-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border border-slate-200 dark:border-slate-700">

      {/* ── Header ── */}
      <div className="bg-[#8B1A1A] p-8 md:p-12 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
          Service <br />Experience.
        </h2>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-4 max-w-sm">
          Your feedback helps us create a better atmosphere for worship.
        </p>
      </div>

      {/* ── Form body ── */}
      <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-12 bg-white dark:bg-slate-800">

        {/* First-time visitor toggle */}
        <div className="relative">
          <input
            type="checkbox" name="isFirstTimeVisitor" id="firstTime"
            checked={formData.isFirstTimeVisitor} onChange={handleChange}
            disabled={isSubmitting}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          />
          <div className={`p-6 rounded-[32px] border-2 transition-colors flex items-center gap-4 ${
            formData.isFirstTimeVisitor
              ? 'bg-[#8B1A1A] border-[#8B1A1A] text-white'
              : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
          }`}>
            <UserCheck size={24} className={formData.isFirstTimeVisitor ? 'text-white' : 'text-[#8B1A1A] dark:text-red-400'} />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest">I'm a first-time visitor</p>
              <p className={`text-[10px] font-bold mt-1 ${formData.isFirstTimeVisitor ? 'text-white/80' : 'text-slate-400 dark:text-slate-400'}`}>
                We'd love to hear your fresh perspective!
              </p>
            </div>
          </div>
        </div>

        {/* PERSONAL DETAILS */}
        {!isAnonymous && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className={dividerCls} />
              <h3 className={sectionLabelCls}>Personal Details</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange}
                  placeholder="Optional" disabled={isSubmitting} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="Optional" disabled={isSubmitting} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange}
                placeholder="email@example.com" disabled={isSubmitting} className={inputCls} />
              {errors.email && <p className={errorCls}>{errors.email}</p>}
            </div>
          </div>
        )}

        {/* SERVICE RATINGS */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className={dividerCls} />
            <h3 className={sectionLabelCls}>Service Ratings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratingCategories.map((cat) => (
              <div
                key={cat.key}
                className={`p-6 rounded-[24px] border bg-white dark:bg-slate-700 transition-colors ${
                  formData.ratings[cat.key] > 0
                    ? 'border-emerald-400 dark:border-emerald-600'
                    : 'border-slate-200 dark:border-slate-600'
                }`}
              >
                <label className={labelCls}>
                  {cat.label} {cat.required && <span className="text-[#8B1A1A] dark:text-red-400">*</span>}
                </label>
                <StarRating
                  rating={formData.ratings[cat.key]}
                  onRatingChange={(rating) => handleRatingChange(cat.key, rating)}
                  size={24}
                />
                {errors[`rating_${cat.key}`] && (
                  <p className="text-[#8B1A1A] dark:text-red-400 text-[9px] font-bold mt-2 uppercase">
                    {errors[`rating_${cat.key}`]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* WRITTEN FEEDBACK */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className={dividerCls} />
            <h3 className={sectionLabelCls}>Written Feedback</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>What did we do well?</label>
              <textarea name="whatWentWell" value={formData.whatWentWell} onChange={handleChange}
                rows="3" disabled={isSubmitting} placeholder="Tell us what you loved..."
                className={textareaCls} />
            </div>
            <div>
              <label className={labelCls}>Room for improvement?</label>
              <textarea name="improvements" value={formData.improvements} onChange={handleChange}
                rows="3" disabled={isSubmitting} placeholder="How can we make your next visit better?"
                className={textareaCls} />
            </div>
          </div>
        </div>

        {/* WOULD RETURN */}
        <div className="bg-slate-900 dark:bg-slate-900 p-8 rounded-[32px] text-white border border-slate-800">
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] mb-6 text-center text-white/80">
            Would you return or recommend our church? <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Yes',   active: 'bg-emerald-700 border-emerald-700' },
              { label: 'Maybe', active: 'bg-amber-700 border-amber-700' },
              { label: 'No',    active: 'bg-red-700 border-red-700' }
            ].map(({ label, active }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, wouldReturn: label }));
                  if (errors.wouldReturn) setErrors(prev => ({ ...prev, wouldReturn: '' }));
                }}
                disabled={isSubmitting}
                className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-colors ${
                  formData.wouldReturn === label
                    ? `${active} text-white`
                    : 'bg-transparent border-white/20 text-white/60'
                } disabled:opacity-50`}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.wouldReturn && (
            <p className="text-red-400 text-[10px] font-bold mt-4 text-center uppercase">{errors.wouldReturn}</p>
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-600 space-y-8">
          {!isAnonymous && (
            <label className="flex items-center gap-4 cursor-pointer bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl border border-slate-200 dark:border-slate-600">
              <input type="checkbox" name="allowFollowUp" checked={formData.allowFollowUp}
                onChange={handleChange} disabled={isSubmitting}
                className="w-5 h-5 accent-[#8B1A1A]" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-tight">
                Request team follow-up
              </span>
            </label>
          )}

          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-2 text-red-600 dark:text-red-400 text-[10px] font-black uppercase">
              <Info size={14} /> {errors.submit}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="button" onClick={onBack} disabled={isSubmitting}
              className="flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex-[2] py-4 bg-[#8B1A1A] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-colors active:scale-95 disabled:opacity-50"
            >
              {isSubmitting
                ? <><Loader className="animate-spin" size={18} /> Submitting...</>
                : <><Send size={18} /> Submit Feedback</>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ServiceFeedbackForm;