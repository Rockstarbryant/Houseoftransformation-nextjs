'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Loader2,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Heart,
  Lightbulb,
  Users,
  ChevronRight,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';

import AnonymousToggle from '@/components/feedback/AnonymousToggle';
import SermonFeedbackForm from '@/components/feedback/SermonFeedbackForm';
import ServiceFeedbackForm from '@/components/feedback/ServiceFeedbackForm';
import TestimonyForm from '@/components/feedback/TestimonyForm';
import SuggestionForm from '@/components/feedback/SuggestionForm';
import PrayerRequestForm from '@/components/feedback/PrayerRequestForm';
import GeneralFeedbackForm from '@/components/feedback/GeneralFeedbackForm';
import TestimoniesWall from '@/components/feedback/TestimoniesWall';
import { useAuth } from '@/context/AuthContext';

/* ─── Toast rendered at the page level via portal ─────────────────────────── */
const SuccessToast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const toast = (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="relative flex items-start gap-3 bg-white dark:bg-slate-800 border border-green-200 dark:border-green-700 rounded-2xl px-5 py-4 overflow-hidden">
        {/* green left accent bar */}
        <div className="absolute left-0 top-0 h-full w-1 bg-green-500" />
        <CheckCircle2 size={20} className="text-green-500 mt-0.5 shrink-0 ml-2" />
        <div className="flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-green-700 dark:text-green-400 mb-0.5">
            Submitted Successfully!
          </p>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0">
          <X size={14} />
        </button>
        {/* auto-dismiss progress bar */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-green-500"
          style={{ animation: 'toastShrink 5s linear forwards' }}
        />
      </div>
      <style>{`
        @keyframes toastShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );

  // Use portal so it sits above everything including layout wrappers
  if (typeof document !== 'undefined') {
    return createPortal(toast, document.body);
  }
  return toast;
};

/* ─── Main Page ────────────────────────────────────────────────────────────── */
const FeedbackPage = () => {
  const { user, isLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAnonymous, setIsAnonymous]           = useState(false);
  const [toast, setToast]                       = useState(null); // { message }

  const categories = [
    {
      id: 'sermon',
      title: 'Sermon Feedback',
      description: 'Reflections on the word shared today.',
      icon: <BookOpen className="text-blue-600" size={28} />,
      borderColor: 'border-slate-200 dark:border-slate-700',
      accent: 'text-blue-700 dark:text-blue-400'
    },
    {
      id: 'service',
      title: 'Service Experience',
      description: 'Your atmosphere and worship experience.',
      icon: <Sparkles className="text-purple-600" size={28} />,
      borderColor: 'border-slate-200 dark:border-slate-700',
      accent: 'text-purple-700 dark:text-purple-400'
    },
    {
      id: 'testimony',
      title: 'Share Testimony',
      description: "Witnessing God's movement in your life.",
      icon: <Users className="text-amber-600" size={28} />,
      borderColor: 'border-slate-200 dark:border-slate-700',
      accent: 'text-amber-700 dark:text-amber-400'
    },
    {
      id: 'suggestion',
      title: 'Suggestions',
      description: 'Ideas to help our community grow.',
      icon: <Lightbulb className="text-emerald-600" size={28} />,
      borderColor: 'border-slate-200 dark:border-slate-700',
      accent: 'text-emerald-700 dark:text-emerald-400'
    },
    {
      id: 'prayer',
      title: 'Prayer Request',
      description: 'Submit needs for our intercessory team.',
      icon: <Heart className="text-red-600" size={28} />,
      borderColor: 'border-slate-200 dark:border-slate-700',
      accent: 'text-red-700 dark:text-red-400'
    },
    {
      id: 'general',
      title: 'General Voice',
      description: 'Any other comments or concerns.',
      icon: <Info className="text-slate-600" size={28} />,
      borderColor: 'border-slate-200 dark:border-slate-700',
      accent: 'text-slate-700 dark:text-slate-400'
    }
  ];

  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  /* Called by child forms on success — show toast THEN go back */
  const handleSuccess = (message) => {
    setToast({ message });
    // Navigate back after a short delay so toast is visible
    setTimeout(() => {
      setSelectedCategory(null);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <Loader2 className="animate-spin text-[#8B1A1A]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-slate-900">

      {/* ── Global toast ── */}
      {toast && (
        <SuccessToast
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {!selectedCategory ? (
        /* ── Categories grid ── */
        <div className="py-24 px-6 animate-in fade-in duration-700">
          <div className="max-w-7xl mx-auto">
            <header className="text-center mb-8">
              <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                We Value Your <span className="text-[#8B1A1A] dark:text-red-500">Voice.</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                Your feedback is the catalyst for our transformation. Share your heart or testify of God&apos;s goodness.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`relative p-8 rounded-[1rem] border-2 transition-colors duration-200 text-left flex flex-col items-start bg-white dark:bg-stone-950 ${cat.borderColor}`}
                >
                  <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    {cat.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${cat.accent}`}>{cat.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">{cat.description}</p>
                  <div className={`mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-widest ${cat.accent}`}>
                    Get Started <ChevronRight size={14} />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-24 border-t border-slate-100 dark:border-slate-800 pt-16">
              <TestimoniesWall />
            </div>
          </div>
        </div>

      ) : (
        /* ── Form view ── */
        <div className="w-full min-h-screen flex flex-col bg-[#FDFCFB] dark:bg-slate-900 animate-in slide-in-from-bottom-8 duration-500">

          <div className="px-6 md:px-0 pt-6 md:pt-0">
            <div className="max-w-3xl mx-auto">
              <button
                onClick={handleBackClick}
                className="flex items-center gap-2 text-slate-400 dark:text-slate-400 transition-colors mb-8 font-bold uppercase text-xs tracking-widest"
              >
                <ArrowLeft size={18} /> Change Type
              </button>
            </div>
          </div>

          <div className="px-6 md:px-0 mb-10 flex justify-center">
            <div className="w-full max-w-3xl">
              <AnonymousToggle isAnonymous={isAnonymous} onToggle={setIsAnonymous} user={user} />
            </div>
          </div>

          {/* ── Form container — no white bg / shadow in dark mode ── */}
          <div className="flex-1 w-full px-0 md:px-6 pb-12">
            <div className="max-w-3xl mx-auto">

              {selectedCategory === 'sermon' && (
                <SermonFeedbackForm
                  isAnonymous={isAnonymous}
                  user={user}
                  onSuccess={() => handleSuccess("Your sermon feedback has been submitted. Thank you for sharing how God's Word is impacting your life!")}
                  onBack={handleBackClick}
                />
              )}

              {selectedCategory === 'service' && (
                <ServiceFeedbackForm
                  isAnonymous={isAnonymous}
                  user={user}
                  onSuccess={() => handleSuccess('Your service feedback has been received. Thank you for helping us improve!')}
                  onBack={handleBackClick}
                />
              )}

              {selectedCategory === 'testimony' && (
                <TestimonyForm
                  isAnonymous={isAnonymous}
                  user={user}
                  onSuccess={() => handleSuccess('Your testimony has been shared. May it inspire others!')}
                  onBack={handleBackClick}
                />
              )}

              {selectedCategory === 'suggestion' && (
                <SuggestionForm
                  isAnonymous={isAnonymous}
                  user={user}
                  onSuccess={() => handleSuccess('Your suggestion has been submitted. We appreciate your input!')}
                  onBack={handleBackClick}
                />
              )}

              {selectedCategory === 'prayer' && (
                <PrayerRequestForm
                  isAnonymous={isAnonymous}
                  user={user}
                  onSuccess={() => handleSuccess('Your prayer request has been received. Our team will be praying for you!')}
                  onBack={handleBackClick}
                />
              )}

              {selectedCategory === 'general' && (
                <GeneralFeedbackForm
                  isAnonymous={isAnonymous}
                  user={user}
                  onSuccess={() => handleSuccess('Your feedback has been submitted. Thank you for your voice!')}
                  onBack={handleBackClick}
                />
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;