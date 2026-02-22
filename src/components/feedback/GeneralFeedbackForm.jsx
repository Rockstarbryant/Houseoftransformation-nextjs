'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Send, Info } from 'lucide-react';
import { feedbackService } from '@/services/api/feedbackService';

export const GeneralFeedbackForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    feedbackType: '',
    subject: '',
    message: '',
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

  const validateForm = () => {
    const newErrors = {};
    if (!isAnonymous && formData.allowFollowUp && !formData.email)
      newErrors.email = 'Email is required for response';
    if (!formData.feedbackType) newErrors.feedbackType = 'Please select feedback type';
    if (!formData.subject.trim()) newErrors.subject = 'Please provide a subject';
    if (!formData.message.trim()) {
      newErrors.message = 'Please write your message';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Please provide at least 20 characters';
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
        category: 'general',
        isAnonymous,
        allowFollowUp: formData.allowFollowUp && !isAnonymous,
        feedbackData: {
          feedbackType: formData.feedbackType,
          subject: formData.subject,
          message: formData.message
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
      setErrors({ submit: error.response?.data?.message || 'Failed to submit feedback' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = ['Compliment', 'Question', 'Concern', 'General Comment'];

  /* ── Shared class strings ── */
  const inputCls =
    'w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all';
  const labelCls =
    'block text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-2';
  const sectionLabelCls =
    'text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-400';
  const dividerCls = 'h-px w-8 bg-slate-200 dark:bg-slate-600';
  const errorCls   = 'text-[#8B1A1A] dark:text-red-400 text-[9px] font-bold uppercase mt-1';

  return (
    <div className="bg-white dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="bg-slate-900 dark:bg-slate-950 p-6 md:p-12 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
          General <br />Feedback.
        </h2>
      </div>

      {/* ── Form body ── */}
      <form onSubmit={handleSubmit} className="p-4 md:p-12 space-y-10 bg-white dark:bg-slate-800">

        {/* PERSONAL INFO */}
        {!isAnonymous && (
          <div className="space-y-6 pb-6 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3">
              <span className={dividerCls} />
              <h3 className={sectionLabelCls}>Your Details</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Name</label>
                <input name="name" value={formData.name} onChange={handleChange}
                  placeholder="Optional" disabled={isSubmitting} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange}
                  placeholder="Required for response" disabled={isSubmitting} className={inputCls} />
                {errors.email && <p className={errorCls}>{errors.email}</p>}
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="Optional" disabled={isSubmitting} className={inputCls} />
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK TYPE */}
        <div className="space-y-4">
          <label className={labelCls}>Feedback Type <span className="text-[#8B1A1A] dark:text-red-400">*</span></label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {feedbackTypes.map(type => (
              <button
                key={type} type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, feedbackType: type }));
                  if (errors.feedbackType) setErrors(prev => ({ ...prev, feedbackType: '' }));
                }}
                disabled={isSubmitting}
                className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 transition-colors ${
                  formData.feedbackType === type
                    ? 'bg-slate-900 dark:bg-slate-950 border-slate-900 dark:border-slate-950 text-white'
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-400'
                } disabled:opacity-50`}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.feedbackType && <p className={errorCls}>{errors.feedbackType}</p>}
        </div>

        {/* SUBJECT */}
        <div>
          <label className={labelCls}>Subject <span className="text-[#8B1A1A] dark:text-red-400">*</span></label>
          <input name="subject" value={formData.subject} onChange={handleChange}
            placeholder="What's this about?" disabled={isSubmitting} maxLength={150}
            className={inputCls} />
          {errors.subject && <p className={errorCls}>{errors.subject}</p>}
        </div>

        {/* MESSAGE */}
        <div>
          <label className={labelCls}>Message <span className="text-[#8B1A1A] dark:text-red-400">*</span></label>
          <textarea name="message" value={formData.message} onChange={handleChange}
            rows="6" disabled={isSubmitting} placeholder="Share your thoughts..."
            className="w-full px-6 py-5 rounded-[30px] border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all resize-none"
          />
          <div className="flex justify-between mt-1">
            {errors.message && <p className={errorCls}>{errors.message}</p>}
            <p className="text-[9px] text-slate-300 dark:text-slate-500 font-bold uppercase ml-auto">
              {formData.message.length} characters (min 20)
            </p>
          </div>
        </div>

        {/* FOLLOW-UP TOGGLE */}
        {!isAnonymous && (
          <label className={`flex items-center gap-4 p-6 rounded-[28px] border-2 transition-colors cursor-pointer ${
            formData.allowFollowUp
              ? 'border-slate-900 dark:border-slate-400 bg-slate-50 dark:bg-slate-700'
              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'
          }`}>
            <input type="checkbox" name="allowFollowUp" checked={formData.allowFollowUp}
              onChange={handleChange} disabled={isSubmitting} className="w-5 h-5 accent-slate-900" />
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest block text-slate-900 dark:text-slate-100">
                I would like a response
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-400 uppercase font-bold">
                We will reach out via email
              </span>
            </div>
          </label>
        )}

        {errors.submit && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-2 text-[#8B1A1A] dark:text-red-400 text-[10px] font-black uppercase">
            <Info size={14} /> {errors.submit}
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button type="button" onClick={onBack} disabled={isSubmitting}
            className="flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700 transition-colors disabled:opacity-50 order-2 md:order-1"
          >
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}
            className="flex-[2] py-4 bg-[#8B1A1A] text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-colors active:scale-95 disabled:opacity-50 order-1 md:order-2"
          >
            {isSubmitting
              ? <><Loader className="animate-spin" size={20} /> Submitting...</>
              : <><Send size={18} /> Submit Feedback</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralFeedbackForm;