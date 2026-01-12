'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Lightbulb, Info, Send, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { feedbackService } from '@/services/api/feedbackService';

export const SuggestionForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  // --- CORE LOGIC PRESERVED ---
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', suggestionType: '',
    suggestionTitle: '', description: '', importance: '',
    benefit: '', priority: 'Medium', willingToHelp: false, allowFollowUp: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAnonymous && user) {
      setFormData(prev => ({ ...prev, name: user.name || '', email: user.email || '' }));
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

  const suggestionTypes = [
    'Ministry/Program Idea', 'Event Suggestion', 'Facility Improvement',
    'Community Outreach', 'Technology/Website', 'Other'
  ];

  return (
    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-slate-100">
      
      {/* High-Impact Header */}
      <div className="bg-[#1A1A1A] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12">
            <Lightbulb size={240} />
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 transition-all"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
          Ideas & <br/>Innovation.
        </h2>
        <p className="text-[#8B1A1A] text-[10px] font-black uppercase tracking-[0.2em] mt-4">
          Help us build the future of our ministry
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10 bg-[#FCFDFD]">
        
        {/* Step 1: Contributor Info */}
        {!isAnonymous && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#8B1A1A]"></span>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Contributor</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Name" name="name" value={formData.name} onChange={handleChange} placeholder="Optional" className="bg-white" />
              <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+254..." className="bg-white" />
            </div>
            <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="Required for follow-up" className="bg-white" />
          </div>
        )}

        {/* Step 2: The Idea */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#8B1A1A]"></span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">The Suggestion</h3>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Suggestion Category *</label>
            <select
              name="suggestionType"
              value={formData.suggestionType}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/10 appearance-none"
            >
              <option value="">Choose a Category</option>
              {suggestionTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.suggestionType && <p className="text-[#8B1A1A] text-[9px] font-bold uppercase mt-1">{errors.suggestionType}</p>}
          </div>

          <Input label="Brief Title" name="suggestionTitle" value={formData.suggestionTitle} onChange={handleChange} error={errors.suggestionTitle} placeholder="e.g., Youth Mentorship Program" className="bg-white" />

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Detailed Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="What is your idea? How does it work?"
              className="w-full px-6 py-4 rounded-[24px] border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/10 transition-all resize-none"
            />
            {errors.description && <p className="text-[#8B1A1A] text-[9px] font-bold uppercase mt-1">{errors.description}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Importance</label>
              <textarea name="importance" value={formData.importance} onChange={handleChange} rows="2" placeholder="Why should we do this?" className="w-full px-6 py-4 rounded-[20px] border border-slate-100 bg-white text-sm font-bold outline-none resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Impact</label>
              <textarea name="benefit" value={formData.benefit} onChange={handleChange} rows="2" placeholder="How will it benefit us?" className="w-full px-6 py-4 rounded-[20px] border border-slate-100 bg-white text-sm font-bold outline-none resize-none" />
            </div>
          </div>
        </div>

        {/* Step 3: Priority & Engagement */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#8B1A1A]"></span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Execution</h3>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Priority Level</label>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                  className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                    formData.priority === p 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-105' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {!isAnonymous && (
            <div className="grid gap-3 pt-4">
              {[
                { id: 'willingToHelp', label: "I'm willing to help implement this", icon: <CheckCircle2 size={16}/> },
                { id: 'allowFollowUp', label: "I'd like feedback on this idea", icon: <Info size={16}/> }
              ].map(item => (
                <label key={item.id} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 cursor-pointer group transition-all">
                  <div className="relative">
                    <input type="checkbox" name={item.id} checked={formData[item.id]} onChange={handleChange} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-100 rounded-full peer peer-checked:bg-[#8B1A1A] transition-all"></div>
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:left-6"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 group-hover:text-[#8B1A1A] transition-colors">{item.icon}</span>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Final Actions */}
        <div className="pt-8 space-y-6">
          {errors.submit && (
            <div className="p-4 bg-red-50 text-[#8B1A1A] text-[10px] font-black uppercase rounded-2xl flex items-center gap-2">
              <Info size={14} /> {errors.submit}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <button type="button" onClick={onBack} className="flex-1 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#8B1A1A] transition-all shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? <Loader className="animate-spin" size={18} /> : <><Send size={18} /> Submit Idea</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SuggestionForm;