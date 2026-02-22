'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Lightbulb, Info, Send, CheckCircle2 } from 'lucide-react';
import { feedbackService } from '@/services/api/feedbackService';

export const SuggestionForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', suggestionType: '',
    suggestionTitle: '', description: '', importance: '',
    benefit: '', priority: 'Medium', willingToHelp: false, allowFollowUp: false
  });

  const [errors, setErrors]             = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAnonymous && user) {
      setFormData(prev => ({ ...prev, name: user?.name || '', email: user?.email || '' }));
    } else if (isAnonymous) {
      setFormData(prev => ({
        ...prev, name: '', email: '', phone: '', allowFollowUp: false, willingToHelp: false
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
    if (!isAnonymous && (formData.allowFollowUp || formData.willingToHelp) && !formData.email) {
      newErrors.email = 'Email is required for follow-up or volunteering';
    }
    if (!formData.suggestionType) newErrors.suggestionType = 'Select category';
    if (!formData.suggestionTitle.trim()) newErrors.suggestionTitle = 'Title required';
    if (!formData.description.trim()) {
      newErrors.description = 'Description required';
    } else if (formData.description.trim().length < 30) {
      newErrors.description = 'Minimum 30 characters required';
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
        category: 'suggestion',
        isAnonymous,
        allowFollowUp: formData.allowFollowUp && !isAnonymous,
        feedbackData: {
          suggestionType: formData.suggestionType,
          suggestionTitle: formData.suggestionTitle,
          description: formData.description,
          importance: formData.importance,
          benefit: formData.benefit,
          priority: formData.priority,
          willingToHelp: formData.willingToHelp && !isAnonymous
        }
      };
      if (!isAnonymous) {
        submissionData.name  = formData.name;
        submissionData.email = formData.email;
        submissionData.phone = formData.phone;
      }
      const response = await feedbackService.submitFeedback(submissionData);
      if (response.success) onSuccess(response);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to submit' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestionTypes = [
    'Ministry/Program Idea', 'Event Suggestion', 'Facility Improvement',
    'Community Outreach', 'Technology/Website', 'Other'
  ];

  /* ── Shared class strings ── */
  const inputCls =
    'w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all';
  const textareaCls =
    'w-full px-6 py-4 rounded-[6px] border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all resize-none';
  const labelCls =
    'block text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest ml-1 mb-2';
  const sectionLabelCls =
    'text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-400';
  const dividerCls = 'h-px w-8 bg-slate-200 dark:bg-slate-600';
  const errorCls   = 'text-[#8B1A1A] dark:text-red-400 text-[9px] font-bold uppercase mt-1';

  return (
    <div className="bg-white dark:bg-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-slate-200 dark:border-slate-700">

      {/* ── Header ── */}
      <div className="bg-slate-900 dark:bg-slate-950 p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12 pointer-events-none">
          <Lightbulb size={240} />
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
          Ideas &amp; <br />Innovation.
        </h2>
        <p className="text-[#8B1A1A] dark:text-red-400 text-[10px] font-black uppercase tracking-[0.2em] mt-4">
          Help us build the future of our ministry
        </p>
      </div>

      {/* ── Form body ── */}
      <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-10 bg-white dark:bg-slate-800">

        {/* CONTRIBUTOR */}
        {!isAnonymous && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className={dividerCls} />
              <h3 className={sectionLabelCls}>Contributor</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name</label>
                <input name="name" value={formData.name} onChange={handleChange}
                  placeholder="Optional" disabled={isSubmitting} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="+254..." disabled={isSubmitting} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange}
                placeholder="Required for follow-up" disabled={isSubmitting} className={inputCls} />
              {errors.email && <p className={errorCls}>{errors.email}</p>}
            </div>
          </div>
        )}

        {/* THE SUGGESTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className={dividerCls} />
            <h3 className={sectionLabelCls}>The Suggestion</h3>
          </div>

          <div>
            <label className={labelCls}>Suggestion Category <span className="text-[#8B1A1A] dark:text-red-400">*</span></label>
            <select name="suggestionType" value={formData.suggestionType} onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 appearance-none transition-all"
            >
              <option value="">Choose a Category</option>
              {suggestionTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.suggestionType && <p className={errorCls}>{errors.suggestionType}</p>}
          </div>

          <div>
            <label className={labelCls}>Brief Title <span className="text-[#8B1A1A] dark:text-red-400">*</span></label>
            <input name="suggestionTitle" value={formData.suggestionTitle} onChange={handleChange}
              placeholder="e.g., Youth Mentorship Program" disabled={isSubmitting} className={inputCls} />
            {errors.suggestionTitle && <p className={errorCls}>{errors.suggestionTitle}</p>}
          </div>

          <div>
            <label className={labelCls}>Detailed Description <span className="text-[#8B1A1A] dark:text-red-400">*</span></label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              rows="4" disabled={isSubmitting} placeholder="What is your idea? How does it work?"
              className={textareaCls} />
            {errors.description && <p className={errorCls}>{errors.description}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Importance</label>
              <textarea name="importance" value={formData.importance} onChange={handleChange}
                rows="2" disabled={isSubmitting} placeholder="Why should we do this?"
                className={textareaCls} />
            </div>
            <div>
              <label className={labelCls}>Impact</label>
              <textarea name="benefit" value={formData.benefit} onChange={handleChange}
                rows="2" disabled={isSubmitting} placeholder="How will it benefit us?"
                className={textareaCls} />
            </div>
          </div>
        </div>

        {/* EXECUTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className={dividerCls} />
            <h3 className={sectionLabelCls}>Execution</h3>
          </div>

          <div>
            <label className={labelCls}>Priority Level</label>
            <div className="flex gap-2 mt-2">
              {['Low', 'Medium', 'High'].map(p => (
                <button
                  key={p} type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                  disabled={isSubmitting}
                  className={`flex-1 py-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    formData.priority === p
                      ? 'bg-slate-900 dark:bg-slate-950 border-slate-900 dark:border-slate-950 text-white'
                      : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-400'
                  } disabled:opacity-50`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {!isAnonymous && (
            <div className="grid gap-3">
              {[
                { id: 'willingToHelp', label: "I'm willing to help implement this", icon: <CheckCircle2 size={16} /> },
                { id: 'allowFollowUp', label: "I'd like feedback on this idea",     icon: <Info size={16} /> }
              ].map(item => (
                <label key={item.id}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <input type="checkbox" name={item.id} checked={formData[item.id]}
                      onChange={handleChange} disabled={isSubmitting} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-200 dark:bg-slate-600 rounded-full peer-checked:bg-[#8B1A1A] transition-colors" />
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:translate-x-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 dark:text-slate-500">{item.icon}</span>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-200 uppercase tracking-widest">
                      {item.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-6 space-y-6 border-t border-slate-200 dark:border-slate-600">
          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-2 text-[#8B1A1A] dark:text-red-400 text-[10px] font-black uppercase">
              <Info size={14} /> {errors.submit}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-3">
            <button type="button" onClick={onBack} disabled={isSubmitting}
              className="flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700 transition-colors disabled:opacity-50 order-2 md:order-1"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-[2] py-4 bg-[#8B1A1A] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-colors active:scale-95 disabled:opacity-50 order-1 md:order-2"
            >
              {isSubmitting
                ? <><Loader className="animate-spin" size={18} /> Submitting...</>
                : <><Send size={18} /> Submit Idea</>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SuggestionForm;