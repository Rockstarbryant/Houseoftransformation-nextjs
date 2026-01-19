// /app/(public)/page.jsx - Server Component
import Link from 'next/link';
import { ArrowRight, Pin, Calendar, Heart } from 'lucide-react';

import HeroSection from '@/components/home/HeroSection';
import QuickInfoBar from '@/components/home/QuickInfoBar';
import AboutSection from '@/components/about/AboutSection';
import LiveStreamSection from '@/components/home/LiveStreamSection';
import EventList from '@/components/events/EventList';
import ServiceAreaCard from '@/components/serviceAreas/ServiceAreaCard';
import DonationSection from '@/components/donations/DonationSection';
import SermonCard from '@/components/sermons/SermonCard';
import SermonCardText from '@/components/sermons/SermonCardText';
import Button from '@/components/common/Button';

import { serviceAreasData } from '@/data/serviceAreas';
import { getFeaturedSermon, detectSermonType } from '@/lib/sermons';
//export const revalidate = 3600; // revalidate every 3600 seconds (1 hour)
// Server Component - runs on server, fetches data
export const dynamic = 'force-dynamic';
export default async function HomePage() {
  // Fetch sermon data on the server
  const featuredSermon = await getFeaturedSermon();
  const sermonType = detectSermonType(featuredSermon);

  return (
    <div className="home-page bg-white dark:bg-slate-950 selection:bg-red-100 dark:selection:bg-red-900 transition-colors">
      {/* All sections remain exactly the same - just removed client-side fetching */}
      
      <HeroSection />
      <LiveStreamSection />
      <QuickInfoBar />

      {/* About Section */}
      <section className="py-12 md:py-20 border-b border-slate-50 dark:border-slate-300">
        <div className="max-w-full mx-auto px-4 md:px-8">
          <AboutSection preview />
        </div>
      </section>

      {/* Featured Sermon Section */}
      <section className="py-20 md:py-32 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(139,26,26,0.02)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(139,26,26,0.1)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <div className="text-center mb-12 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#8B1A1A]/5 dark:bg-[#8B1A1A]/20 rounded-full mb-6">
              <Pin size={14} className="text-[#8B1A1A] fill-[#8B1A1A]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#8B1A1A] dark:text-red-400">
                {featuredSermon?.pinned ? 'Featured Wisdom' : 'The Most Recent Message'}
              </span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-6">
              Divine <span className="text-[#8B1A1A]">Teachings</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              {featuredSermon?.pinned 
                ? "Our pastor's most essential message curated specifically for your spiritual growth today." 
                : "Deepen your walk with God through our most recent apostolic teachings and powerful messages."}
            </p>
          </div>

          {!featuredSermon ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-sm">Waiting for the Word...</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="mb-12 transform hover:scale-[1.01] transition-transform duration-500">
                {sermonType === 'text' ? (
                  <SermonCardText sermon={featuredSermon} />
                ) : (
                  <SermonCard sermon={featuredSermon} />
                )}
              </div>

              <div className="flex justify-center">
                <Link href="/sermons">
                  <Button variant="primary" size="lg" className="group bg-slate-900 dark:bg-slate-800 text-white hover:bg-[#8B1A1A] dark:hover:bg-[#8B1A1A] px-10 py-5 rounded-full flex items-center gap-3 transition-all shadow-2xl dark:shadow-slate-900">
                    <span className="font-black uppercase text-xs tracking-[0.2em]">Enter Sermon Archive</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-800 relative transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 mb-12 md:mb-16">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100/50 dark:bg-orange-900/30 rounded-full mb-4">
                <Calendar size={14} className="text-orange-700 dark:text-orange-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-700 dark:text-orange-400">Get Involved</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                Upcoming <span className="text-[#8B1A1A]">Events</span>
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium md:max-w-xs text-center md:text-right leading-relaxed">
              Join our vibrant community for special gatherings, workshops, and worship experiences.
            </p>
          </div>
          
          <div className="rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-slate-900">
            <EventList limit={1} showViewAll />
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20 md:py-32 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-6">
              <Heart size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">The Power of Service</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-8">
              Make Your <span className="text-[#8B1A1A]">Impact</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
              You weren't just meant to attend; you were meant to belong. Find your team and start your journey of impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceAreasData.slice(0, 6).map((area) => (
              <div key={area.name} className="hover:-translate-y-2 transition-transform duration-500">
                <ServiceAreaCard {...area} />
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/service-areas">
              <button className="inline-flex items-center gap-3 text-slate-900 dark:text-white font-black uppercase text-xs tracking-[0.3em] group hover:text-[#8B1A1A] dark:hover:text-red-400 transition-colors">
                View All Departments <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <div className="px-4 md:px-8 pb-12">
        <div className="max-w-7xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl dark:shadow-slate-900">
          <DonationSection />
        </div>
      </div>
    </div>
  );
}