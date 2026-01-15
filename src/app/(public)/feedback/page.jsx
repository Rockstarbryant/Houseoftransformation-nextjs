'use client';

import React, { useState } from 'react';
import { 
  Loader2, 
  ArrowLeft, 
  BookOpen, 
  Sparkles, 
  Heart, 
  Lightbulb, 
  Users,
  ChevronRight,
  Info
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

const FeedbackPage = () => {
  const { user, isLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const categories = [
    {
      id: 'sermon',
      title: 'Sermon Feedback',
      description: 'Reflections on the word shared today.',
      icon: <BookOpen className="text-blue-600" size={28} />,
      bgColor: 'bg-blue-50/50',
      borderColor: 'border-blue-100',
      hoverBorder: 'hover:border-blue-400',
      accent: 'text-blue-700'
    },
    {
      id: 'service',
      title: 'Service Experience',
      description: 'Your atmosphere and worship experience.',
      icon: <Sparkles className="text-purple-600" size={28} />,
      bgColor: 'bg-purple-50/50',
      borderColor: 'border-purple-100',
      hoverBorder: 'hover:border-purple-400',
      accent: 'text-purple-700'
    },
    {
      id: 'testimony',
      title: 'Share Testimony',
      description: 'Witnessing God\'s movement in your life.',
      icon: <Users className="text-amber-600" size={28} />,
      bgColor: 'bg-amber-50/50',
      borderColor: 'border-amber-100',
      hoverBorder: 'hover:border-amber-400',
      accent: 'text-amber-700'
    },
    {
      id: 'suggestion',
      title: 'Suggestions',
      description: 'Ideas to help our community grow.',
      icon: <Lightbulb className="text-emerald-600" size={28} />,
      bgColor: 'bg-emerald-50/50',
      borderColor: 'border-emerald-100',
      hoverBorder: 'hover:border-emerald-400',
      accent: 'text-emerald-700'
    },
    {
      id: 'prayer',
      title: 'Prayer Request',
      description: 'Submit needs for our intercessory team.',
      icon: <Heart className="text-red-600" size={28} />,
      bgColor: 'bg-red-50/50',
      borderColor: 'border-red-100',
      hoverBorder: 'hover:border-red-400',
      accent: 'text-red-700'
    },
    {
      id: 'general',
      title: 'General Voice',
      description: 'Any other comments or concerns.',
      icon: <Info className="text-slate-600" size={28} />,
      bgColor: 'bg-slate-50/50',
      borderColor: 'border-slate-200',
      hoverBorder: 'hover:border-slate-400',
      accent: 'text-slate-700'
    }
  ];

  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#8B1A1A]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {!selectedCategory ? (
        // Categories Grid View
        <div className="py-24 px-6 animate-in fade-in duration-700">
          <div className="max-w-7xl mx-auto">
            <header className="text-center mb-8">
              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
                We Value Your <span className="text-[#8B1A1A]">Voice.</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                Your feedback is the catalyst for our transformation. Share your heart or testify of God&apos;s goodness.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`group relative p-10 rounded-[2.5rem] border-2 transition-all duration-300 text-left flex flex-col items-start shadow-sm hover:shadow-xl hover:-translate-y-1 ${cat.bgColor} ${cat.borderColor} ${cat.hoverBorder}`}
                >
                  <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 ${cat.accent}`}>{cat.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-8">{cat.description}</p>
                  
                  <div className={`mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-widest ${cat.accent}`}>
                    Get Started <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-24 border-t border-slate-100 pt-16">
              <TestimoniesWall />
            </div>
          </div>
        </div>
      ) : (
        // Form View - Full width on mobile
        <div className="w-full min-h-screen flex flex-col bg-[#FDFCFB] animate-in slide-in-from-bottom-8 duration-500">
          
          {/* Back Button */}
          <div className="px-6 md:px-0 pt-6 md:pt-0">
            <div className="max-w-3xl mx-auto">
              <button 
                onClick={handleBackClick}
                className="flex items-center gap-2 text-slate-400 hover:text-[#8B1A1A] transition-colors mb-8 font-bold uppercase text-xs tracking-widest"
              >
                <ArrowLeft size={18} /> Change Type
              </button>
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="px-6 md:px-0 mb-10 flex justify-center">
            <div className="w-full max-w-3xl">
              <AnonymousToggle isAnonymous={isAnonymous} onToggle={setIsAnonymous} user={user} />
            </div>
          </div>

          {/* Forms - Full width on mobile, constrained on desktop */}
          <div className="flex-1 w-full px-0 md:px-6 pb-12">
            <div className="max-w-3xl mx-auto md:bg-white md:rounded-[3rem] md:p-12 md:shadow-2xl md:shadow-slate-200 md:border md:border-slate-50">
              
              {selectedCategory === 'sermon' && (
                <SermonFeedbackForm isAnonymous={isAnonymous} user={user} onSuccess={() => handleBackClick()} onBack={handleBackClick} />
              )}
              
              {selectedCategory === 'service' && (
                <ServiceFeedbackForm isAnonymous={isAnonymous} user={user} onSuccess={() => handleBackClick()} onBack={handleBackClick} />
              )}
              
              {selectedCategory === 'testimony' && (
                <TestimonyForm isAnonymous={isAnonymous} user={user} onSuccess={() => handleBackClick()} onBack={handleBackClick} />
              )}
              
              {selectedCategory === 'suggestion' && (
                <SuggestionForm isAnonymous={isAnonymous} user={user} onSuccess={() => handleBackClick()} onBack={handleBackClick} />
              )}
              
              {selectedCategory === 'prayer' && (
                <PrayerRequestForm isAnonymous={isAnonymous} user={user} onSuccess={() => handleBackClick()} onBack={handleBackClick} />
              )}
              
              {selectedCategory === 'general' && (
                <GeneralFeedbackForm isAnonymous={isAnonymous} user={user} onSuccess={() => handleBackClick()} onBack={handleBackClick} />
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;