'use client';

import React, { useState, useEffect } from 'react';
import { Loader, Clock, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { volunteerService } from '@/services/api/volunteerService';

// eslint-disable-next-line no-unused-vars

const BRAND_RED = '#8B1A1A';

// eslint-disable-next-line no-unused-vars
const ApplicationForm = ({ ministry, onSubmit, onClose, isSubmitting, onApplicationExists }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ministry: ministry || '',
    availability: '',
    motivation: '',
    previousExperience: '',
    skills: '',
  });

  const [errors, setErrors] = useState({});
  const [editingApplicationId, setEditingApplicationId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [editTimeRemaining, setEditTimeRemaining] = useState(null);

  // Auto-fill user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
      }));
    }
    if (ministry) {
      setFormData((prev) => ({ ...prev, ministry }));
    }
  }, [user, ministry]);

  // Check for existing applications
  useEffect(() => {
    if (user) {
      const checkExistingApplication = async () => {
        try {
          const response = await volunteerService.checkExistingApplication();
          if (response.hasApplication) {
            setEditingApplicationId(response.application.id);
            if (response.application.isEditable) {
              const appliedAt = new Date(response.application.appliedAt);
              const editableUntil = new Date(appliedAt.getTime() + 3 * 60 * 60 * 1000);
              const now = new Date();
              const timeRemaining = Math.max(0, editableUntil - now);
              setEditTimeRemaining(timeRemaining);
            }
            if (onApplicationExists) {
              onApplicationExists(response.application);
            }
          }
        } catch (error) {
          console.error('Error checking existing application:', error);
        }
      };
      checkExistingApplication();
    }
  }, [user, onApplicationExists]);

  // Unauthenticated state
  if (!user) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Sign In Required
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
          Please sign in or create an account to apply for volunteer positions.
        </p>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.ministry) newErrors.ministry = 'Please select a ministry';
    if (!formData.availability.trim()) newErrors.availability = 'Please specify your availability';
    if (!formData.motivation.trim()) {
      newErrors.motivation = 'Please tell us why you want to serve';
    } else if (formData.motivation.trim().length < 20) {
      newErrors.motivation = 'Please provide at least 20 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (editingApplicationId) {
        await onSubmit(formData, editingApplicationId, true);
      } else {
        await onSubmit(formData);
      }
    }
  };

  const ministries = [
    'Worship Team',
    "Children's Ministry",
    'Ushering Team',
    'Technical Team',
    'Community Outreach',
  ];

  const formatTimeRemaining = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Edit mode notice */}
      {editingApplicationId && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
          <Clock size={16} className="text-sky-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-sky-800 dark:text-sky-300 mb-0.5">
              Editing Your Application
            </p>
            <p className="text-sky-700 dark:text-sky-400 text-xs">
              You can edit once within 3 hours of submission.
              {editTimeRemaining != null && (
                <span className="font-semibold ml-1">
                  Time remaining: {formatTimeRemaining(editTimeRemaining)}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Section: Personal Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Personal Information
          </p>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              disabled={isSubmitting}
              className={errors.fullName ? 'border-red-400 focus-visible:ring-red-400' : ''}
            />
            {errors.fullName && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254 700 000 000"
              disabled={isSubmitting}
              className={errors.phone ? 'border-red-400 focus-visible:ring-red-400' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            disabled={true} // Email locked
            className="bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-70"
          />
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Info size={11} />
            <span>Email is linked to your account and cannot be changed</span>
          </div>
          {errors.email && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Section: Ministry */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Ministry Interest
          </p>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Ministry <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.ministry}
            onValueChange={(value) => handleSelectChange('ministry', value)}
            disabled={isSubmitting || (!!editingApplicationId && !!ministry)}
          >
            <SelectTrigger className={errors.ministry ? 'border-red-400 focus:ring-red-400' : ''}>
              <SelectValue placeholder="Select a ministry" />
            </SelectTrigger>
            <SelectContent>
              {ministries.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.ministry && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.ministry}</p>
          )}
        </div>
      </div>

      {/* Section: Availability & Motivation */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Availability &amp; Motivation
          </p>
          <Separator className="flex-1" />
        </div>

        {/* Availability */}
        <div className="space-y-1.5">
          <Label htmlFor="availability" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Availability <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            rows={3}
            placeholder="e.g., Sundays 8am–1pm, Wednesdays 6pm–9pm"
            disabled={isSubmitting}
            className={`resize-none ${errors.availability ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
          />
          {errors.availability && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.availability}</p>
          )}
        </div>

        {/* Motivation */}
        <div className="space-y-1.5">
          <Label htmlFor="motivation" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Why do you want to serve? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="motivation"
            name="motivation"
            value={formData.motivation}
            onChange={handleChange}
            rows={4}
            placeholder="Share your heart for serving in this ministry…"
            disabled={isSubmitting}
            className={`resize-none ${errors.motivation ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
          />
          <div className="flex items-center justify-between">
            {errors.motivation ? (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.motivation}</p>
            ) : (
              <span />
            )}
            <span
              className={`text-xs font-medium tabular-nums ${
                formData.motivation.length < 20
                  ? 'text-slate-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formData.motivation.length} / 20 min
            </span>
          </div>
        </div>
      </div>

      {/* Section: Additional (optional) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Additional Info
          </p>
          <Separator className="flex-1" />
          <span className="text-xs text-slate-400 whitespace-nowrap">Optional</span>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="previousExperience" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Previous Experience
          </Label>
          <Textarea
            id="previousExperience"
            name="previousExperience"
            value={formData.previousExperience}
            onChange={handleChange}
            rows={3}
            placeholder="Any previous volunteer or ministry experience…"
            disabled={isSubmitting}
            className="resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="skills" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Skills
          </Label>
          <Textarea
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            rows={3}
            placeholder="e.g., Music, sound engineering, teaching, communication…"
            disabled={isSubmitting}
            className="resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 text-white font-semibold"
          style={{ backgroundColor: BRAND_RED }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader className="animate-spin" size={16} />
              {editingApplicationId ? 'Updating…' : 'Submitting…'}
            </span>
          ) : editingApplicationId ? (
            'Update Application'
          ) : (
            'Submit Application'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ApplicationForm;