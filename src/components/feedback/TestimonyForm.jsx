// ===== TestimonyForm.jsx - FIXED =====
'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Info, Send, Heart, Eye, EyeOff, UserCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { feedbackService } from '@/services/api/feedbackService';

export const TestimonyForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    testimonyType: '',
    title: '',
    story: '',
    testimonyDate: '',
    sharingPreference: 'private',
    shareInService: false,
    allowContact: false
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
        name: '', email: '', phone: '', sharingPreference: 'private', allowContact: false
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.testimonyType) newErrors.testimonyType = 'Select a type';
    if (!formData.title.trim()) newErrors.title = 'Title required';
    if (!formData.story.trim()) {
      newErrors.story = 'Share your story';
    } else if (formData.story.trim().length < 50) {
      newErrors.story = 'Minimum 50 characters required';
    }
    if (!formData.testimonyDate) newErrors.testimonyDate = 'Date required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const submissionData = {
        category: 'testimony',
        isAnonymous,
        isPublic: formData.sharingPreference === 'public' || formData.sharingPreference === 'public_anonymous',
        feedbackData: {
          testimonyType: formData.testimonyType,
          title: formData.title,
          story: formData.story,
          testimonyDate: formData.testimonyDate,
          shareInService: formData.shareInService
        }
      };
      if (!isAnonymous && formData.sharingPreference === 'public') {
        submissionData.name = formData.name;
        submissionData.email = formData.email;
        submissionData.phone = formData.phone;
        submissionData.allowFollowUp = formData.allowContact;
      }
      const response = await feedbackService.submitFeedback(submissionData);
      if (response.success) onSuccess(response);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to submit' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const testimonyTypes = [
    'Prayer Answered', 'Healing/Miracle', 'Life Transformation',
    'Salvation Story', 'Financial Breakthrough', 'Relationship Restoration', 'Other'
  ];

  return (
    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border border-slate-100">
      <div className="bg-[#8B1A1A] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-10">
            <Heart size={200} />
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 transition-all"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
          Share Your <br/>Testimony.
        </h2>
        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-4 max-w-xs">
          Your story could be the miracle someone else is praying for.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10 bg-[#FCFDFD]">
        {!isAnonymous && formData.sharingPreference === 'public' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#8B1A1A]"></span>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Public Identity</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Display Name" name="name" value={formData.name} onChange={handleChange} placeholder="How should we address you?" disabled={isSubmitting} className="bg-white" />
              <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+254..." disabled={isSubmitting} className="bg-white" />
            </div>
            <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" disabled={isSubmitting} className="bg-white" />
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#8B1A1A]"></span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">The Details</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Type of Testimony *</label>
              <select
                name="testimonyType"
                value={formData.testimonyType}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/10 appearance-none"
              >
                <option value="">Select Category</option>
                {testimonyTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.testimonyType && <p className="text-[#8B1A1A] text-[9px] font-bold uppercase mt-1">{errors.testimonyType}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Occurrence Date *</label>
              <input
                type="date"
                name="testimonyDate"
                max={new Date().toISOString().split('T')[0]}
                value={formData.testimonyDate}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/10"
              />
              {errors.testimonyDate && <p className="text-[#8B1A1A] text-[9px] font-bold uppercase mt-1">{errors.testimonyDate}</p>}
            </div>
          </div>

          <Input label="Testimony Title" name="title" value={formData.title} onChange={handleChange} error={errors.title} placeholder="A short, powerful title (e.g. 'God Restored My Health')" disabled={isSubmitting} className="bg-white" />

          <div className="space-y-2">
            <div className="flex justify-between items-end mb-1">
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Your Story *</label>
              <span className={`text-[9px] font-black uppercase ${formData.story.length < 50 ? 'text-slate-400' : 'text-emerald-600'}`}>
                {formData.story.length} Characters
              </span>
            </div>
            <textarea
              name="story"
              value={formData.story}
              onChange={handleChange}
              rows="6"
              disabled={isSubmitting}
              placeholder="Tell us everything... how did God move? How were you changed?"
              className="w-full px-6 py-4 rounded-[32px] border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/10 transition-all resize-none"
            />
            {errors.story && <p className="text-[#8B1A1A] text-[9px] font-bold uppercase mt-1">{errors.story}</p>}
          </div>
        </div>

        <div className="space-y-6 pt-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#8B1A1A]"></span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sharing Preferences</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'public', label: 'Publicly', sub: 'With your name', icon: <Eye size={18}/>, disabled: isAnonymous },
              { id: 'public_anonymous', label: 'Anonymously', sub: 'Hidden name', icon: <EyeOff size={18}/>, disabled: false },
              { id: 'private', label: 'Privately', sub: 'Leadership only', icon: <UserCircle size={18}/>, disabled: false }
            ].map((pref) => (
              <button
                key={pref.id}
                type="button"
                disabled={pref.disabled}
                onClick={() => handleChange({ target: { name: 'sharingPreference', value: pref.id }})}
                className={`p-6 rounded-[28px] border-2 text-left transition-all relative ${
                  formData.sharingPreference === pref.id 
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xl' 
                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 grayscale opacity-60'
                } ${pref.disabled ? 'hidden' : ''}`}
              >
                <div className={`mb-4 ${formData.sharingPreference === pref.id ? 'text-[#8B1A1A]' : 'text-slate-300'}`}>
                    {pref.icon}
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest">{pref.label}</p>
                <p className={`text-[9px] font-bold mt-1 uppercase ${formData.sharingPreference === pref.id ? 'text-white/50' : 'text-slate-400'}`}>
                    {pref.sub}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-[32px] space-y-4">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" name="shareInService" checked={formData.shareInService} onChange={handleChange} disabled={isSubmitting} className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#8B1A1A] transition-all"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:left-6"></div>
              </div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Willing to share during service</span>
            </label>

            {!isAnonymous && formData.sharingPreference !== 'private' && (
              <label className="flex items-center gap-4 cursor-pointer group pt-2 border-t border-slate-200">
                <div className="relative">
                  <input type="checkbox" name="allowContact" checked={formData.allowContact} onChange={handleChange} disabled={isSubmitting} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#8B1A1A] transition-all"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:left-6"></div>
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Contact me for more details</span>
              </label>
            )}
        </div>

        <div className="pt-6 space-y-6">
          {errors.submit && (
            <div className="p-4 bg-red-50 text-[#8B1A1A] text-[10px] font-black uppercase rounded-2xl flex items-center gap-2">
              <Info size={14} /> {errors.submit}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <button type="button" onClick={onBack} disabled={isSubmitting} className="flex-1 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-50">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#8B1A1A] transition-all shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? <Loader className="animate-spin" size={18} /> : <><Send size={18} /> Share Testimony</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TestimonyForm;