'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Info, Send, UserCheck, Star } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import StarRating from './StarRating';
import { feedbackService } from '@/services/api/feedbackService';

const ServiceFeedbackForm = ({ isAnonymous, user, onSuccess, onBack }) => {
  // --- LOGIC PRESERVED 100% ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isFirstTimeVisitor: false,
    ratings: {
      overall: 0,
      worship: 0,
      hospitality: 0,
      facility: 0,
      parking: 0,
      childrensMinistry: 0,
      soundQuality: 0
    },
    whatWentWell: '',
    improvements: '',
    additionalComments: '',
    wouldReturn: '',
    allowFollowUp: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAnonymous && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
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

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [category]: rating }
    }));
    if (errors[`rating_${category}`]) {
      setErrors(prev => ({ ...prev, [`rating_${category}`]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isAnonymous && formData.allowFollowUp && !formData.email) {
      newErrors.email = 'Email is required for follow-up';
    }
    if (formData.ratings.overall === 0) {
      newErrors.rating_overall = 'Overall rating is required';
    }
    if (!formData.wouldReturn) {
      newErrors.wouldReturn = 'Please select an option';
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
        category: 'service',
        isAnonymous,
        isFirstTimeVisitor: formData.isFirstTimeVisitor,
        allowFollowUp: formData.allowFollowUp && !isAnonymous,
        feedbackData: {
          ratings: formData.ratings,
          whatWentWell: formData.whatWentWell,
          improvements: formData.improvements,
          wouldReturn: formData.wouldReturn
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

  const ratingCategories = [
    { key: 'overall', label: 'Overall Experience', required: true },
    { key: 'worship', label: 'Worship Music' },
    { key: 'hospitality', label: 'Hospitality' },
    { key: 'facility', label: 'Cleanliness' },
    { key: 'parking', label: 'Parking' },
    { key: 'childrensMinistry', label: "Children's Ministry" },
    { key: 'soundQuality', label: 'Sound/AV Quality' }
  ];

  return (
    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border border-slate-100">
      
      {/* Editorial Header */}
      <div className="bg-[#8B1A1A] p-8 md:p-12 text-white relative">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 transition-all"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
          Service <br/>Experience.
        </h2>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-4 max-w-sm">
          Your feedback helps us create a better atmosphere for worship.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12 bg-[#FCFDFD]">
        
        {/* Visitor Status Card */}
        <div className="relative group">
          <input
            type="checkbox"
            name="isFirstTimeVisitor"
            id="firstTime"
            checked={formData.isFirstTimeVisitor}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          />
          <div className={`p-6 rounded-[32px] border-2 transition-all flex items-center gap-4 ${
            formData.isFirstTimeVisitor 
              ? 'bg-[#8B1A1A] border-[#8B1A1A] text-white' 
              : 'bg-slate-50 border-slate-100 text-slate-600'
          }`}>
            <UserCheck size={24} className={formData.isFirstTimeVisitor ? 'text-white' : 'text-[#8B1A1A]'} />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest">I'm a first-time visitor</p>
              <p className={`text-[10px] font-bold mt-1 ${formData.isFirstTimeVisitor ? 'text-white/80' : 'text-slate-400'}`}>
                We'd love to hear your fresh perspective!
              </p>
            </div>
          </div>
        </div>

        {/* Identity Section */}
        {!isAnonymous && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-slate-200"></span>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Personal Details</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Optional" className="bg-white" />
              <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Optional" className="bg-white" />
            </div>
            <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="email@example.com" className="bg-white" />
          </div>
        )}

        {/* Detailed Ratings Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-slate-200"></span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Service Ratings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratingCategories.map((cat) => (
              <div key={cat.key} className={`p-6 rounded-[24px] border border-slate-100 bg-white transition-all ${formData.ratings[cat.key] > 0 ? 'ring-1 ring-emerald-500/20' : ''}`}>
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">
                  {cat.label} {cat.required && <span className="text-[#8B1A1A]">*</span>}
                </label>
                <StarRating
                  rating={formData.ratings[cat.key]}
                  onRatingChange={(rating) => handleRatingChange(cat.key, rating)}
                  size={24}
                />
                {errors[`rating_${cat.key}`] && <p className="text-[#8B1A1A] text-[9px] font-bold mt-2 uppercase">{errors[`rating_${cat.key}`]}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Written Feedback */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-slate-200"></span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Written Feedback</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 ml-1">What did we do well?</label>
              <textarea
                name="whatWentWell"
                value={formData.whatWentWell}
                onChange={handleChange}
                rows="3"
                placeholder="Tell us what you loved..."
                className="w-full px-6 py-4 rounded-[24px] border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/10 transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 ml-1">Room for improvement?</label>
              <textarea
                name="improvements"
                value={formData.improvements}
                onChange={handleChange}
                rows="3"
                placeholder="How can we make your next visit better?"
                className="w-full px-6 py-4 rounded-[24px] border border-slate-100 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#8B1A1A]/10 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Return Recommendation */}
        <div className="bg-slate-900 p-8 rounded-[32px] text-white">
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] mb-6 text-center opacity-80">
            Would you return or recommend our church? <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {['Yes', 'Maybe', 'No'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, wouldReturn: option }));
                  if (errors.wouldReturn) setErrors(prev => ({ ...prev, wouldReturn: '' }));
                }}
                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  formData.wouldReturn === option 
                    ? (option === 'Yes' ? 'bg-emerald-600 shadow-lg' : option === 'Maybe' ? 'bg-amber-600 shadow-lg' : 'bg-red-600 shadow-lg')
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.wouldReturn && <p className="text-red-400 text-[10px] font-bold mt-4 text-center uppercase">{errors.wouldReturn}</p>}
        </div>

        {/* Preferences & Actions */}
        <div className="pt-8 border-t border-slate-100 space-y-8">
          {!isAnonymous && (
            <label className="flex items-center gap-4 cursor-pointer group bg-slate-50 p-4 rounded-2xl">
              <input
                type="checkbox"
                name="allowFollowUp"
                checked={formData.allowFollowUp}
                onChange={handleChange}
                className="w-5 h-5 accent-[#8B1A1A]"
              />
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Request team follow-up</span>
            </label>
          )}

          {errors.submit && (
            <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-2xl flex items-center gap-2">
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
              {isSubmitting ? <Loader className="animate-spin" size={18} /> : <><Send size={18} /> Submit Feedback</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ServiceFeedbackForm;