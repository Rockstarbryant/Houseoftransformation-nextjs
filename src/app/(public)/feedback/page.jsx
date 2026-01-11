'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
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
import { useAuthContext } from '@/context/AuthContext';

const FeedbackPage = () => {
  const { user, isLoading, error: authError } = useAuthContext();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Updated categories with specific background and border colors for each card
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
      description: 'Witnessing God’s movement in your life.',
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
    },
  ];

  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#8B1A1A]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        
        {!selectedCategory ? (
          <div className="animate-in fade-in duration-700">
            <header className="text-center mb-8">
              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
                We Value Your <span className="text-[#8B1A1A]">Voice.</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                Your feedback is the catalyst for our transformation. Share your heart or testify of God’s goodness.
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
        ) : (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-[#8B1A1A] transition-colors mb-8 font-bold uppercase text-xs tracking-widest"
            >
              <ArrowLeft size={18} /> Change Type
            </button>
            
            <div className="mb-10 flex justify-center">
              <AnonymousToggle isAnonymous={isAnonymous} onToggle={setIsAnonymous} />
            </div>

            <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-50">
               {/* Logic for rendering forms remains the same */}
               {selectedCategory === 'sermon' && <SermonFeedbackForm isAnonymous={isAnonymous} onBack={() => setSelectedCategory(null)} />}
               {selectedCategory === 'service' && <ServiceFeedbackForm isAnonymous={isAnonymous} onBack={() => setSelectedCategory(null)} />}
               {selectedCategory === 'testimony' && <TestimonyForm isAnonymous={isAnonymous} onBack={() => setSelectedCategory(null)} />}
               {selectedCategory === 'suggestion' && <SuggestionForm isAnonymous={isAnonymous} onBack={() => setSelectedCategory(null)} />}
               {selectedCategory === 'prayer' && <PrayerRequestForm isAnonymous={isAnonymous} onBack={() => setSelectedCategory(null)} />}
               {selectedCategory === 'general' && <GeneralFeedbackForm isAnonymous={isAnonymous} onBack={() => setSelectedCategory(null)} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;