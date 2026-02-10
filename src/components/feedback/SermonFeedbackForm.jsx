'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Calendar, Send, Info } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAnonymous && user) {
      setFormData(prev => ({
        ...prev,
        name: user?.name || '',
        email: user?.email || ''
      }));
    } else if (isAnonymous) {
      setFormData(prev => ({
        ...prev,
        name: '', email: '', phone: '', allowFollowUp: false
      }));
    }
  }, [isAnonymous, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) setErrors(prev => ({ ...prev, rating: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isAnonymous && formData.allowFollowUp && !formData.email) {
      newErrors.email = 'Email is required for follow-up';
    }
    if (!formData.sermonTitle.trim()) newErrors.sermonTitle = 'Please specify which sermon';
    if (!formData.sermonDate) newErrors.sermonDate = 'Please select the date';
    if (formData.rating === 0) newErrors.rating = 'Please provide a rating';
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
        submissionData.name = formData.name;
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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border border-slate-100">
      <div className="bg-[#8B1A1A] dark:bg-red-800 p-8 md:p-12 text-white relative">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 transition-all"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              Sermon <br/>Feedback.
            </h2>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-4 max-w-sm leading-relaxed">
              Help us understand how God's Word is impacting your life.
            </p>
          </div>
          {isAnonymous && (
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-[9px] font-black uppercase tracking-widest">
              Anonymous Mode
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-12 space-y-10 bg-[#FCFDFD]">
        {!isAnonymous && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-slate-200"></span>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Your Identity</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Optional"
                disabled={isSubmitting}
                className="bg-white border-slate-100"
              />
              <Input
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Optional"
                disabled={isSubmitting}
                className="bg-white border-slate-100"
              />
            </div>
            <Input
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              error={errors.email}
              disabled={isSubmitting}
              className="bg-white border-slate-100"
            />
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-slate-200"></span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">The Message</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                name="sermonTitle"
                label="Sermon Title"
                value={formData.sermonTitle}
                onChange={handleChange}
                placeholder="Which sermon spoke to you?"
                required
                error={errors.sermonTitle}
                disabled={isSubmitting}
                className="bg-white border-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 ml-1">
                Date Attended <span className="text-[#8B1A1A]">*</span>
              </label>
              <input
                type="date"
                name="sermonDate"
                value={formData.sermonDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:ring-2 focus:ring-[#8B1A1A]/10 transition-all outline-none"
              />
              {errors.sermonDate && <p className="text-[#8B1A1A] text-[10px] font-bold mt-1 ml-1">{errors.sermonDate}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-slate-200"></span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Your Experience</h3>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 text-center">
            <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">
              How would you rate this message?
            </label>
            <div className="flex justify-center scale-110">
              <StarRating
                rating={formData.rating}
                onRatingChange={handleRatingChange}
                size={32}
              />
            </div>
            {errors.rating && <p className="text-[#8B1A1A] text-[10px] font-bold mt-4">{errors.rating}</p>}
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 ml-1">
                What resonated most? <span className="text-[#8B1A1A]">*</span>
              </label>
              <textarea
                name="resonatedMost"
                value={formData.resonatedMost}
                onChange={handleChange}
                rows="4"
                placeholder="Share what spoke to your heart..."
                disabled={isSubmitting}
                className="w-full px-6 py-4 rounded-[24px] border border-slate-100 bg-white text-sm font-bold focus:ring-2 focus:ring-[#8B1A1A]/10 transition-all outline-none resize-none"
              />
              <div className="flex justify-between mt-2 px-1">
                 <p className="text-[10px] font-bold text-slate-400 uppercase">{formData.resonatedMost.length} / 20 Min Char</p>
                 {errors.resonatedMost && <p className="text-[#8B1A1A] text-[10px] font-bold">{errors.resonatedMost}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 ml-1">Application Steps</label>
                <textarea
                  name="application"
                  value={formData.application}
                  onChange={handleChange}
                  rows="3"
                  placeholder="How will you apply this? (optional)"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 rounded-[24px] border border-slate-100 bg-white text-sm font-bold focus:ring-2 focus:ring-[#8B1A1A]/10 transition-all outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 ml-1">Any Questions?</label>
                <textarea
                  name="questions"
                  value={formData.questions}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Clarification needed? (optional)"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 rounded-[24px] border border-slate-100 bg-white text-sm font-bold focus:ring-2 focus:ring-[#8B1A1A]/10 transition-all outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[32px] text-white">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] mb-6 text-center opacity-80">
              Would you recommend this sermon?
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, wouldRecommend: true }));
                  if (errors.wouldRecommend) setErrors(prev => ({ ...prev, wouldRecommend: '' }));
                }}
                disabled={isSubmitting}
                className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  formData.wouldRecommend === true ? 'bg-[#8B1A1A] text-white shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20'
                } disabled:opacity-50`}
              >
                Yes, Definitely!
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, wouldRecommend: false }));
                  if (errors.wouldRecommend) setErrors(prev => ({ ...prev, wouldRecommend: '' }));
                }}
                disabled={isSubmitting}
                className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  formData.wouldRecommend === false ? 'bg-[#8B1A1A] text-white shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20'
                } disabled:opacity-50`}
              >
                Not Really
              </button>
            </div>
            {errors.wouldRecommend && <p className="text-red-400 text-[10px] font-bold mt-4 text-center uppercase tracking-widest">{errors.wouldRecommend}</p>}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 space-y-8">
          {!isAnonymous && (
            <label className="flex items-center gap-4 cursor-pointer group bg-slate-50 p-4 rounded-2xl transition-all hover:bg-slate-100">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="allowFollowUp"
                  checked={formData.allowFollowUp}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="peer h-6 w-6 opacity-0 absolute cursor-pointer"
                />
                <div className="h-6 w-6 border-2 border-slate-300 rounded-lg bg-white peer-checked:bg-[#8B1A1A] peer-checked:border-[#8B1A1A] transition-all flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-all"></div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                Request follow-up from the pastor
              </span>
            </label>
          )}

          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
               <Info size={16} /> {errors.submit}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all order-2 md:order-1 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#8B1A1A] shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50 order-1 md:order-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin" size={18} /> Submitting...
                </>
              ) : (
                <>
                  <Send size={18} /> Submit Feedback
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SermonFeedbackForm;