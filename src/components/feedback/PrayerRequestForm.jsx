// ===== PrayerRequestForm.jsx - FIXED =====
'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Heart, Send, Bell, ShieldCheck, Clock } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { feedbackService } from '@/services/api/feedbackService';

export const PrayerRequestForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', prayerCategory: '',
    request: '', urgency: 'Regular', shareOnPrayerList: false,
    prayerNeeded: false, preferredContact: '', bestTimeToContact: ''
  });

  const [errors, setErrors] = useState({});
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
        submissionData.name = formData.name;
        submissionData.email = formData.email;
        submissionData.phone = formData.phone;
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

  return (
    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 border border-slate-100">
      <div className="bg-[#8B1A1A] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] opacity-10 rotate-12">
            <Heart size={280} fill="currentColor" />
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 transition-all"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
          Standing <br/>In Prayer.
        </h2>
        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-6 flex items-center gap-2">
          <ShieldCheck size={14} className="text-white" /> Your burdens are our burdens
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12 bg-[#FCFDFD]">
        <div className="space-y-4">
          <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Urgency Level</label>
          <div className="flex p-1.5 bg-slate-100 rounded-[24px] gap-1">
            {[
              { id: 'Regular', label: 'Regular Prayer', icon: '🙏' },
              { id: 'Urgent', label: 'Urgent Request', icon: '🚨' }
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setFormData(p => ({ ...p, urgency: u.id }))}
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                  formData.urgency === u.id 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
                } disabled:opacity-50`}
              >
                <span>{u.icon}</span> {u.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#8B1A1A]"></span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">The Request</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Category *</label>
                <select
                name="prayerCategory"
                value={formData.prayerCategory}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/10 appearance-none"
                >
                <option value="">Select Category</option>
                {prayerCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.prayerCategory && <p className="text-[#8B1A1A] text-[9px] font-bold uppercase mt-1">{errors.prayerCategory}</p>}
            </div>
            {!isAnonymous && <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="+254..." disabled={isSubmitting} className="bg-white" />}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Tell us how we can pray *</label>
            <textarea
              name="request"
              value={formData.request}
              onChange={handleChange}
              rows="5"
              disabled={isSubmitting}
              placeholder="What's on your heart?"
              className="w-full px-6 py-5 rounded-[30px] border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1A1A]/5 transition-all resize-none shadow-sm"
            />
            <div className="flex justify-between px-2">
                {errors.request && <p className="text-[#8B1A1A] text-[9px] font-bold uppercase">{errors.request}</p>}
                <p className="text-[9px] text-slate-300 font-bold ml-auto">{formData.request.length} / 20 MIN</p>
            </div>
          </div>
        </div>

        {!isAnonymous && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#8B1A1A]"></span>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Support Preferences</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
                <label className={`flex flex-col p-6 rounded-[28px] border-2 transition-all cursor-pointer ${formData.shareOnPrayerList ? 'border-[#8B1A1A] bg-[#8B1A1A]/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <input type="checkbox" name="shareOnPrayerList" checked={formData.shareOnPrayerList} onChange={handleChange} disabled={isSubmitting} className="sr-only" />
                    <Bell className={formData.shareOnPrayerList ? 'text-[#8B1A1A]' : 'text-slate-300'} size={24} />
                    <span className="text-[11px] font-black uppercase tracking-widest mt-4">Church Prayer List</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">Share with the congregation</span>
                </label>

                <label className={`flex flex-col p-6 rounded-[28px] border-2 transition-all cursor-pointer ${formData.prayerNeeded ? 'border-[#8B1A1A] bg-[#8B1A1A]/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <input type="checkbox" name="prayerNeeded" checked={formData.prayerNeeded} onChange={handleChange} disabled={isSubmitting} className="sr-only" />
                    <Heart className={formData.prayerNeeded ? 'text-[#8B1A1A]' : 'text-slate-300'} size={24} />
                    <span className="text-[11px] font-black uppercase tracking-widest mt-4">Pray With Me</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">Request a personal follow-up</span>
                </label>
            </div>

            {formData.prayerNeeded && (
              <div className="grid md:grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[32px] animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact via</label>
                  <select name="preferredContact" value={formData.preferredContact} onChange={handleChange} disabled={isSubmitting} className="w-full bg-transparent border-b-2 border-slate-200 py-2 text-sm font-bold outline-none focus:border-[#8B1A1A]">
                    <option value="">Select Method</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="In-person">In-person</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Best Time</label>
                  <input name="bestTimeToContact" value={formData.bestTimeToContact} onChange={handleChange} disabled={isSubmitting} placeholder="e.g. Weekday evenings" className="w-full bg-transparent border-b-2 border-slate-200 py-2 text-sm font-bold outline-none focus:border-[#8B1A1A]" />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-8 border-t border-slate-100">
          {errors.submit && <div className="mb-6 p-4 bg-red-50 text-[#8B1A1A] text-[10px] font-black uppercase rounded-2xl text-center">{errors.submit}</div>}
          {errors.contact && <div className="mb-6 p-4 bg-red-50 text-[#8B1A1A] text-[10px] font-black uppercase rounded-2xl text-center">{errors.contact}</div>}
          
          <div className="flex flex-col md:flex-row gap-4">
            <button type="button" onClick={onBack} disabled={isSubmitting} className="flex-1 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-50 order-2 md:order-1">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#8B1A1A] transition-all shadow-xl disabled:opacity-50 order-1 md:order-2"
            >
              {isSubmitting ? <Loader className="animate-spin" size={18} /> : <><Send size={18} /> Submit Request</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PrayerRequestForm;