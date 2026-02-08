'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Users, Clock, Mail, Phone, Plus, CheckCircle2, Calendar, ChevronRight } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ApplicationForm from '@/components/volunteer/ApplicationForm';
import { volunteerService } from '@/services/api/volunteerService';
import { serviceAreasData } from '@/data/serviceAreas';

export default function ServiceAreaDetailPage() {
  const params = useParams();
  const slug = params.slug;
  
  // Find service area by slug
  const data = serviceAreasData.find(area => area.slug === slug);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  // If service area not found
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 pt-20">
        <div className="text-center max-w-md">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-blue-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Service Area Not Found</h1>
            <p className="text-gray-500 mb-8 text-lg">We couldn't locate the service area you're looking for.</p>
            <Link 
                href="/service-areas" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
                <ArrowLeft className="mr-2 h-5 w-5" /> Back to Service Areas
            </Link>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    setIsModalOpen(true);
    setSubmitMessage({ type: '', text: '' });
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const response = await volunteerService.apply(formData);
      
      if (response.success) {
        setSubmitMessage({
          type: 'success',
          text: 'Application submitted successfully! We will review your application and get back to you soon.'
        });
        
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitMessage({ type: '', text: '' });
        }, 2000);
      }
    } catch (error) {
      console.error('Application error:', error);
      setSubmitMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit application. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setSubmitMessage({ type: '', text: '' });
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-12 md:pb-24 pt-16 md:pt-20">
      
      {/* Hero Banner Section */}
      <div className="relative h-[280px] sm:h-[350px] md:h-[500px] w-full bg-slate-900">
        <Image 
          src={data.imageUrl} 
          alt={data.name}
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/30" />
        
        {/* Navigation Breadcrumb */}
        <div className="absolute top-3 sm:top-4 md:top-8 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <Link 
                href="/service-areas" 
                className="inline-flex items-center gap-1.5 sm:gap-2 text-white/90 hover:text-white bg-black/30 hover:bg-black/40 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full text-xs sm:text-sm font-medium transition-all"
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> 
              <span className="hidden xs:inline">Back to Service Areas</span>
              <span className="xs:hidden">Back</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 -mt-20 sm:-mt-24 md:-mt-32 lg:-mt-48 relative z-20">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800">
                <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        {data.name}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        {data.description}
                    </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 pt-4 sm:pt-6 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3 md:p-4 rounded-xl md:rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                        <div className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-lg md:rounded-xl shadow-sm shrink-0">
                            <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Team Size</p>
                            <p className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white">{data.teamCount}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3 md:p-4 rounded-xl md:rounded-2xl bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50">
                        <div className="bg-purple-600 text-white p-1.5 sm:p-2 rounded-lg md:rounded-xl shadow-sm shrink-0">
                            <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Commitment</p>
                            <p className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white">{data.timeCommitment}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3 md:p-4 rounded-xl md:rounded-2xl bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
                        <div className="bg-amber-600 text-white p-1.5 sm:p-2 rounded-lg md:rounded-xl shadow-sm shrink-0">
                            <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Next Event</p>
                            <p className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">{data.nextEvent}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 sm:mt-8 md:mt-12 pt-6 sm:pt-8 md:pt-10 border-t border-gray-100 dark:border-slate-800">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 md:mb-6">What You'll Do</h2>
                    <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                        <ul className="space-y-2.5 sm:space-y-3 md:space-y-4">
                        {data.responsibilities.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 sm:gap-3">
                            <div className="mt-0.5 sm:mt-1 shrink-0">
                                <CheckCircle2 size={16} className="text-green-500 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">{item}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-6 sm:mt-8 md:mt-12 pt-6 sm:pt-8 md:pt-10 border-t border-gray-100 dark:border-slate-800">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 md:mb-6">Weekly Schedule</h2>
                    <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                        {data.schedule.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3 md:p-4 rounded-xl md:rounded-2xl bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm md:text-base">
                            <Clock size={16} className="text-blue-500 shrink-0 sm:w-[18px] sm:h-[18px]" />
                            <span className="leading-tight">{item}</span>
                        </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gallery Section */}
            {data.galleryImages && data.galleryImages.length > 0 && (
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white px-1 sm:px-2">Team in Action</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                  {data.galleryImages.map((image, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl aspect-square shadow-sm">
                      <Image
                        src={image}
                        alt={`${data.name} team`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {data.testimonials && data.testimonials.length > 0 && (
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white px-1 sm:px-2">What Members Say</h2>
                <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  {data.testimonials.map((testimonial, idx) => (
                    testimonial?.quote ? (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative">
                        <p className="text-slate-600 dark:text-slate-300 italic mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base relative z-10 leading-relaxed">"{testimonial.quote}"</p>
                        <div className="flex items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-50 dark:border-slate-800">
                          <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xs sm:text-sm shrink-0">
                            {testimonial.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">{testimonial.name}</p>
                            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 mt-4 sm:mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
              
              {/* Main CTA Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 shadow-lg shadow-blue-900/5 border border-blue-50 dark:border-slate-800">
                <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2">Interested in serving?</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Join the {data.name} team and make an impact.</p>
                </div>

                <div className="space-y-2.5 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                        <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Team Lead</p>
                      <p className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm md:text-base truncate">{data.teamLead}</p>
                    </div>
                  </div>

                  <a href={`mailto:${data.email}`} className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 group transition-colors">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 flex items-center justify-center text-blue-600 transition-colors shrink-0">
                        <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Email</p>
                      <p className="font-medium text-slate-900 dark:text-white truncate text-xs sm:text-sm md:text-base">{data.email}</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-gray-400 group-hover:text-blue-500 shrink-0 sm:w-4 sm:h-4" />
                  </a>
                </div>

                <button 
                  onClick={handleApply}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-3 md:py-4 rounded-xl text-sm sm:text-base shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                  <span>Apply Now</span>
                </button>
              </div>

              {/* Secondary Info Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                    <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2">Need more info?</h3>
                    <p className="text-slate-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                        Unsure if this is the right fit? Contact the team lead directly.
                    </p>
                    <a href={`mailto:${data.email}`} className="text-blue-300 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-1 transition-colors">
                        Send a message <ArrowLeft className="rotate-180 sm:w-[14px] sm:h-[14px]" size={12} />
                    </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Apply for ${data.name}`}
        size="lg"
      >
        {submitMessage.text && (
          <div
            className={`mb-4 p-3 sm:p-4 rounded-xl flex items-start gap-2.5 sm:gap-3 ${
              submitMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {submitMessage.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 sm:w-5 sm:h-5" /> : null}
            <p className="text-xs sm:text-sm">{submitMessage.text}</p>
          </div>
        )}
        
        {!submitMessage.text && (
          <ApplicationForm
            ministry={data.name}
            onSubmit={handleSubmit}
            onClose={handleCloseModal}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
}