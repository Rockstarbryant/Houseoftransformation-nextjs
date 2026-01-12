'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, MessageSquare, Send, Mail, User, Phone } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { feedbackService } from '@/services/api/feedbackService';

export const GeneralFeedbackForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  // --- CORE LOGIC PRESERVED ---
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', feedbackType: '',
    subject: '', message: '', allowFollowUp: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAnonymous && user) {
      setFormData(prev => ({ ...prev, name: user.name || '', email: user.email || '' }));
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
    if (!isAnonymous && formData.allowFollowUp && !formData.email) {
      newErrors.email = 'Email is required for response';
    }
    if (!formData.feedbackType) newErrors.feedbackType = 'Select a feedback type';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Minimum 20 characters required';
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

  const feedbackTypes = ['Compliment', 'Question', 'Concern', 'General Comment'];

  return (
    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-slate-100">
      
      {/* Bold Header Section */}
      <div className="bg-[#1A1A1A] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12">
            <MessageSquare size={260} fill="currentColor" />
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 transition-all relative z-10"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight relative z-10">
          General <br/>Feedback.
        </h2>
        <p className="text-[#8B1A1A] text-[10px] font-black uppercase tracking-[0.3em] mt-6 relative z-10">
          Your voice shapes our community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10 bg-[#FCFDFD]">
        
        {/* Type Selection */}
        <div className="space-y-4">
          <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">What kind of feedback? *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {feedbackTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData(p => ({ ...p, feedbackType: type }))}
                className={`py-4 px-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
                  formData.feedbackType === type 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.feedbackType && <p className="text-[#8B1A1A] text-[9px] font-bold uppercase mt-1">{errors.feedbackType}</p>}
        </div>

        {/* User Info (Conditional) */}
        {!isAnonymous && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={12}/> Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Optional" className="w-full bg-transparent border-b-2 border-slate-100 py-2 text-sm font-bold outline-none focus:border-slate-900 transition-colors" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail size={12}/> Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Required for reply" className={`w-full bg-transparent border-b-2 py-2 text-sm font-bold outline-none transition-colors ${errors.email ? 'border-[#8B1A1A]' : 'border-slate-100 focus:border-slate-900'}`} />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone size={12}/> Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Optional" className="w-full bg-transparent border-b-2 border-slate-100 py-2 text-sm font-bold outline-none focus:border-slate-900 transition-colors" />
            </div>
          </div>
        )}

        {/* Subject & Message */}
        <div className="space-y-6">
          <Input 
            label="Subject Line" 
            name="subject" 
            value={formData.subject} 
            onChange={handleChange} 
            error={errors.subject} 
            placeholder="What is this about?" 
            className="bg-white"
          />

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Your Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="6"
              placeholder="Tell us more..."
              className="w-full px-6 py-5 rounded-[30px] border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 transition-all resize-none shadow-sm"
            />
            <div className="flex justify-between px-2">
                {errors.message && <p className="text-[#8B1A1A] text-[9px] font-bold uppercase">{errors.message}</p>}
                <p className="text-[9px] text-slate-300 font-bold ml-auto uppercase">{formData.message.length} characters</p>
            </div>
          </div>
        </div>

        {/* Interaction Preference */}
        {!isAnonymous && (
          <label className={`flex items-center gap-4 p-6 rounded-[28px] border-2 transition-all cursor-pointer group ${formData.allowFollowUp ? 'border-[#8B1A1A] bg-[#8B1A1A]/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
            <div className="relative">
                <input type="checkbox" name="allowFollowUp" checked={formData.allowFollowUp} onChange={handleChange} className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-100 rounded-full peer peer-checked:bg-[#8B1A1A] transition-all"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:left-6"></div>
            </div>
            <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">I would like a response</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter mt-0.5">We'll reach out to your provided email</span>
            </div>
          </label>
        )}

        {/* Footer Actions */}
        <div className="pt-8 space-y-6">
          {errors.submit && <div className="p-4 bg-red-50 text-[#8B1A1A] text-[10px] font-black uppercase rounded-2xl text-center">{errors.submit}</div>}
          
          <div className="flex flex-col md:flex-row gap-4">
            <button type="button" onClick={onBack} className="flex-1 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#8B1A1A] transition-all shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? <Loader className="animate-spin" size={18} /> : <><Send size={18} /> Send Feedback</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GeneralFeedbackForm;