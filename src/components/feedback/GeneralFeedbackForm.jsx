'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Send, Mail, User, Phone, MessageSquare } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { feedbackService } from '@/services/api/feedbackService';

export const GeneralFeedbackForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', feedbackType: '',
    subject: '', message: '', allowFollowUp: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // STABILIZED LOGIC: Safe check for user object
    if (!isAnonymous && user && typeof user === 'object') {
      setFormData(prev => ({ 
        ...prev, 
        name: user?.name ?? '', 
        email: user?.email ?? '' 
      }));
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
    if (!formData.feedbackType) newErrors.feedbackType = 'Select a type';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (formData.message.trim().length < 20) newErrors.message = 'Minimum 20 characters';
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

  return (
    // FULL-WIDTH MOBILE WRAPPER
    <div className="w-full bg-white md:rounded-[40px] md:shadow-2xl overflow-hidden border-b md:border-2 border-slate-100">
      <div className="bg-[#1A1A1A] p-6 md:p-12 text-white relative">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-[10px] font-black uppercase tracking-widest mb-6">
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter">General Feedback.</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-12 space-y-8 bg-[#FCFDFD]">
        {/* Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['Compliment', 'Question', 'Concern', 'Comment'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData(p => ({ ...p, feedbackType: type }))}
              className={`py-3 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${
                formData.feedbackType === type ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Info Fields */}
        {!isAnonymous && (
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Name" name="name" value={formData.name} onChange={handleChange} />
            <Input label="Email" name="email" value={formData.email} onChange={handleChange} error={errors.email} />
          </div>
        )}

        <Input label="Subject" name="subject" value={formData.subject} onChange={handleChange} error={errors.subject} />

        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your message..."
          className="w-full p-4 rounded-2xl border border-slate-100 min-h-[150px] text-sm font-bold focus:ring-2 focus:ring-slate-900"
        />

        <Button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">
          {isSubmitting ? <Loader className="animate-spin" /> : 'Send Feedback'}
        </Button>
      </form>
    </div>
  );
};