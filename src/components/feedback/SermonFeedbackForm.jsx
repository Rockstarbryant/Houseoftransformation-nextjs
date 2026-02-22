'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Send, Info } from 'lucide-react';
import StarRating from './StarRating';
import { feedbackService } from '@/services/api/feedbackService';

const SermonFeedbackForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    sermonTitle: '',
    sermonDate: '',
    rating: 0,
    resonatedMost: '',
    application: '',
    questions: '',
    wouldRecommend: null,
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

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) setErrors(prev => ({ ...prev, rating: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isAnonymous && formData.allowFollowUp && !formData.email)
      newErrors.email = 'Email is required for follow-up';
    if (!formData.sermonTitle.trim()) newErrors.sermonTitle = 'Please specify which sermon';
    if (!formData.sermonDate)         newErrors.sermonDate  = 'Please select the date';
    if (formData.rating === 0)        newErrors.rating      = 'Please provide a rating';
    if (!formData.resonatedMost.trim()) {
      newErrors.resonatedMost = 'Please share what resonated';
    } else if (formData.resonatedMost.trim().length < 20) {
      newErrors.resonatedMost = 'Please provide at least 20 characters';
    }
    if (formData.wouldRecommend === null) newErrors.wouldRecommend = 'Please answer this';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const submissionData = {
        category: 'sermon',
        isAnonymous,
        allowFollowUp: formData.allowFollowUp && !isAnonymous,
        feedbackData: {
          sermonTitle: formData.sermonTitle,
          sermonDate: formData.sermonDate,
          rating: formData.rating,
          resonatedMost: formData.resonatedMost,
          application: formData.application,
          questions: formData.questions,
          wouldRecommend: formData.wouldRecommend
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

  /* ── Shared class strings ── */
  const inputCls =
    'w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-bold focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all outline-none';
  const textareaCls =
    'w-full px-6 py-4 rounded-[6px] border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-bold focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all outline-none resize-none';
  const labelCls =
    'block text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-2 ml-1';
  const sectionLabelCls =
    'text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-400';
  const dividerCls  = 'h-px w-8 bg-slate-200 dark:bg-slate-600';
  const errorCls    = 'text-[#8B1A1A] dark:text-red-400 text-[10px] font-bold mt-1 ml-1';

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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              Sermon <br />Feedback.
            </h2>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-4 max-w-sm leading-relaxed">
              Help us understand how God's Word is impacting your life.
            </p>
          </div>
          {isAnonymous && (
            <div className="bg-white/10 px-4 py-2 rounded-full border border-white/20 text-[9px] font-black uppercase tracking-widest">
              Anonymous Mode
            </div>
          )}
        </div>
      </div>

      {/* ── Form body ── */}
      <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-10 bg-white dark:bg-slate-800">

        {/* YOUR IDENTITY */}
        {!isAnonymous && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className={dividerCls} />
              <h3 className={sectionLabelCls}>Your Identity</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange}
                  placeholder="Optional" disabled={isSubmitting} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
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

        {/* THE MESSAGE */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className={dividerCls} />
            <h3 className={sectionLabelCls}>The Message</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>
                Sermon Title <span className="text-[#8B1A1A] dark:text-red-400">*</span>
              </label>
              <input name="sermonTitle" value={formData.sermonTitle} onChange={handleChange}
                placeholder="Which sermon spoke to you?" disabled={isSubmitting} className={inputCls} />
              {errors.sermonTitle && <p className={errorCls}>{errors.sermonTitle}</p>}
            </div>
            <div>
              <label className={labelCls}>
                Date Attended <span className="text-[#8B1A1A] dark:text-red-400">*</span>
              </label>
              <input
                type="date" name="sermonDate" value={formData.sermonDate} onChange={handleChange}
                max={new Date().toISOString().split('T')[0]} required disabled={isSubmitting}
                className={`${inputCls} [color-scheme:light] dark:[color-scheme:dark]`}
              />
              {errors.sermonDate && <p className={errorCls}>{errors.sermonDate}</p>}
            </div>
          </div>
        </div>

        {/* YOUR EXPERIENCE */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className={dividerCls} />
            <h3 className={sectionLabelCls}>Your Experience</h3>
          </div>

          {/* Star rating */}
          <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-[32px] border border-slate-200 dark:border-slate-600 text-center">
            <label className="block text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-4">
              How would you rate this message?
            </label>
            <div className="flex justify-center scale-110">
              <StarRating rating={formData.rating} onRatingChange={handleRatingChange} size={32} />
            </div>
            {errors.rating && <p className="text-[#8B1A1A] dark:text-red-400 text-[10px] font-bold mt-4">{errors.rating}</p>}
          </div>

          {/* Textareas */}
          <div className="space-y-6">
            <div>
              <label className={labelCls}>
                What resonated most? <span className="text-[#8B1A1A] dark:text-red-400">*</span>
              </label>
              <textarea name="resonatedMost" value={formData.resonatedMost} onChange={handleChange}
                rows="4" placeholder="Share what spoke to your heart..." disabled={isSubmitting}
                className={textareaCls} />
              <div className="flex justify-between mt-2 px-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase">
                  {formData.resonatedMost.length} / 20 Min Char
                </p>
                {errors.resonatedMost && <p className="text-[#8B1A1A] dark:text-red-400 text-[10px] font-bold">{errors.resonatedMost}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Application Steps</label>
                <textarea name="application" value={formData.application} onChange={handleChange}
                  rows="3" placeholder="How will you apply this? (optional)" disabled={isSubmitting}
                  className={textareaCls} />
              </div>
              <div>
                <label className={labelCls}>Any Questions?</label>
                <textarea name="questions" value={formData.questions} onChange={handleChange}
                  rows="3" placeholder="Clarification needed? (optional)" disabled={isSubmitting}
                  className={textareaCls} />
              </div>
            </div>
          </div>

          {/* Would recommend */}
          <div className="bg-slate-900 dark:bg-slate-900 p-8 rounded-[32px] text-white border border-slate-800">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] mb-6 text-center text-white/80">
              Would you recommend this sermon?
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              {[
                { value: true,  label: 'Yes, Definitely!' },
                { value: false, label: 'Not Really' }
              ].map(({ value, label }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, wouldRecommend: value }));
                    if (errors.wouldRecommend) setErrors(prev => ({ ...prev, wouldRecommend: '' }));
                  }}
                  disabled={isSubmitting}
                  className={`flex-1 py-4 px-6 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-colors ${
                    formData.wouldRecommend === value
                      ? 'bg-[#8B1A1A] border-[#8B1A1A] text-white'
                      : 'bg-transparent border-white/20 text-white/60'
                  } disabled:opacity-50`}
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.wouldRecommend && (
              <p className="text-red-400 text-[10px] font-bold mt-4 text-center uppercase tracking-widest">
                {errors.wouldRecommend}
              </p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-600 space-y-8">
          {!isAnonymous && (
            <label className="flex items-center gap-4 cursor-pointer bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl border border-slate-200 dark:border-slate-600">
              <div className="relative flex items-center">
                <input type="checkbox" name="allowFollowUp" checked={formData.allowFollowUp}
                  onChange={handleChange} disabled={isSubmitting}
                  className="peer h-6 w-6 opacity-0 absolute cursor-pointer" />
                <div className="h-6 w-6 border-2 border-slate-300 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-600 peer-checked:bg-[#8B1A1A] peer-checked:border-[#8B1A1A] transition-colors flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-all" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-tight">
                Request follow-up from the pastor
              </span>
            </label>
          )}

          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold">
              <Info size={16} /> {errors.submit}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="button" onClick={onBack} disabled={isSubmitting}
              className="flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700 transition-colors order-2 md:order-1 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex-[2] py-4 bg-[#8B1A1A] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-colors active:scale-95 disabled:opacity-50 order-1 md:order-2"
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

export default SermonFeedbackForm;