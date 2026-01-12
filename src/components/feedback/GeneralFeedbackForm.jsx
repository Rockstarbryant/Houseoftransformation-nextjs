'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Send, Mail, User, Phone, MessageSquare } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // STABILIZED LOGIC: Safe check using optional chaining
    if (!isAnonymous && user) {
      setFormData(prev => ({
        ...prev,
        name: user?.name || '',
        email: user?.email || ''
      }));
    } else if (isAnonymous) {
      setFormData(prev => ({
        ...prev,
        name: '',
        email: '',
        phone: '',
        allowFollowUp: false
      }));
    }
  }, [isAnonymous, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isAnonymous && formData.allowFollowUp && !formData.email) {
      newErrors.email = 'Email is required for response';
    }

    if (!formData.feedbackType) {
      newErrors.feedbackType = 'Please select feedback type';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please provide a subject';
    }

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
        submissionData.name = formData.name;
        submissionData.email = formData.email;
        submissionData.phone = formData.phone;
      }

      const response = await feedbackService.submitFeedback(submissionData);

      if (response.success) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to submit feedback' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = ['Compliment', 'Question', 'Concern', 'General Comment'];

  return (
    <div className="w-full bg-white md:rounded-[40px] md:shadow-2xl overflow-hidden border-b md:border-2 border-slate-100 animate-in fade-in duration-500">
      {/* Dark Header */}
      <div className="bg-[#1A1A1A] p-6 md:p-12 text-white relative">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 transition-all"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
          General <br/>Feedback.
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-12 space-y-10 bg-[#FCFDFD]">
        {/* Personal Info */}
        {!isAnonymous && (
          <div className="grid md:grid-cols-3 gap-6 pb-6 border-b border-slate-100">
            <Input name="name" label="Name" value={formData.name} onChange={handleChange} placeholder="Optional" disabled={isSubmitting} />
            <Input name="email" type="email" label="Email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="Required for response" disabled={isSubmitting} />
            <Input name="phone" label="Phone" value={formData.phone} onChange={handleChange} placeholder="Optional" disabled={isSubmitting} />
          </div>
        )}

        {/* Feedback Type Grid */}
        <div className="space-y-4">
          <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Feedback Type *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {feedbackTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, feedbackType: type }));
                  if (errors.feedbackType) setErrors(prev => ({ ...prev, feedbackType: '' }));
                }}
                className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${
                  formData.feedbackType === type ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.feedbackType && <p className="text-[#8B1A1A] text-[9px] font-bold uppercase">{errors.feedbackType}</p>}
        </div>

        <Input name="subject" label="Subject" value={formData.subject} onChange={handleChange} error={errors.subject} required maxLength={150} />

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="6"
            className="w-full px-6 py-5 rounded-[30px] border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 transition-all resize-none shadow-sm"
          />
          <div className="flex justify-between">
            {errors.message && <p className="text-[#8B1A1A] text-[9px] font-bold uppercase">{errors.message}</p>}
            <p className="text-[9px] text-slate-300 font-bold uppercase ml-auto">{formData.message.length} characters (min 20)</p>
          </div>
        </div>

        {/* Follow-up Toggle */}
        {!isAnonymous && (
          <label className={`flex items-center gap-4 p-6 rounded-[28px] border-2 transition-all cursor-pointer ${formData.allowFollowUp ? 'border-slate-900 bg-slate-50' : 'border-slate-100'}`}>
            <input type="checkbox" name="allowFollowUp" checked={formData.allowFollowUp} onChange={handleChange} className="w-5 h-5 accent-slate-900" />
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest block">I would like a response</span>
              <span className="text-[9px] text-slate-400 uppercase font-bold">We will reach out via email</span>
            </div>
          </label>
        )}

        {errors.submit && <div className="p-4 bg-red-50 text-[#8B1A1A] text-[10px] font-black uppercase rounded-2xl text-center">{errors.submit}</div>}

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button type="button" onClick={onBack} className="flex-1 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-[2] py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#8B1A1A] transition-all shadow-xl disabled:opacity-50">
            {isSubmitting ? <Loader className="animate-spin" size={20} /> : <><Send size={18} /> Submit Feedback</>}
          </button>
        </div>
      </form>
    </div>
  );
};