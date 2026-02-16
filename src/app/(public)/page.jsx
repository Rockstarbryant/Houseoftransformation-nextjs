// /app/(public)/page.jsx - Server Component
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Pin, Calendar, Heart } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import QuickInfoBar from '@/components/home/QuickInfoBar';
import AboutSection from '@/components/about/AboutSection';
import LiveStreamSection from '@/components/home/LiveStreamSection';
import EventCarousel from '@/components/events/EventCarousel';
import ServiceAreaCard from '@/components/serviceAreas/ServiceAreaCard';
import DonationSection from '@/components/donations/DonationSection';
import SermonCard from '@/components/sermons/SermonCard';
import SermonCardText from '@/components/sermons/SermonCardText';
import Button from '@/components/common/Button';

import { serviceAreasData } from '@/data/serviceAreas';
import { getFeaturedSermon, detectSermonType } from '@/lib/sermons';
//export const revalidate = 3600; // revalidate every 3600 seconds (1 hour)
// Server Component - runs on server, fetches data
//export const dynamic = 'force-dynamic';



export const metadata = {
  title: 'Busia House of Transformation | Best Church in Busia, Kenya | House of Transformation in Busia, Kenya',
  description: 'Join House of Transformation (H.O.T) in Busia County. Experience powerful apostolic teachings, divine worship, and a community dedicated to spiritual growth and impact.',
  keywords: ['Church in Busia', 'House of Transformation Busia', 'Busia House of Transformation', 'Christian Ministry Kenya', 'Apostolic teachings Busia', 'Praise and Worship Busia', 'The Breeze Hotel Church Busia'],
  openGraph: {
    title: 'Busia House of Transformation - Transforming Lives',
    description: 'Touching and transforming lives through the anointed gospel of Jesus Christ.',
    images: ['https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767444965/WhatsApp_Image_2026-01-03_at_15.54.45_mpogon.jpg'],
  },
};

export default async function HomePage() {
  // Fetch sermon data on the server
  const featuredSermon = await getFeaturedSermon();
  const sermonType = detectSermonType(featuredSermon);

  return (
    <>
      <Script
        id="church-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Church",
            "name": "Busia House of Transformation",
            "alternateName": "House of Transformation Ministry Busia",
            "url": "https://houseoftransformation-nextjs.vercel.app",
            "logo": "https://res.cloudinary.com/dcu8uuzrs/image/upload/v1768913903/church-gallery/tql6mjtmman1gxlzl91e.jpg",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Main Street Next to Breeze Hotel",
              "addressLocality": "Busia - Kisumu RD",
              "addressRegion": "Busia County",
              "addressCountry": "KE"
            },
            "openingHours": "Sun 09:00-12:00",
            "description": "Transforming lives through the annointed gospel of Jesus Christ in Busia, Kenya."
          })
        }}
      />
      
      <div className="home-page ...">
        <HeroSection />
      <LiveStreamSection />
      <QuickInfoBar />

       <AboutSection preview />

      {/* Featured Sermon Section */}
      <section className="py-20 md:py-32 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(139,26,26,0.02)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(139,26,26,0.1)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <div className="text-center mb-12 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-900 dark:bg-red-900 rounded-full mb-6">
              <Pin size={14} className="text-white fill-red" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-100 dark:text-slate-100">
                {featuredSermon?.pinned ? 'Featured Sermon' : 'The Most Recent sermon'}
              </span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-6">
              Sermon <span className="text-[#8B1A1A]">Teachings</span>
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
        <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900 relative transition-colors overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-10 md:mb-16">
              <div className="text-center md:text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-900 dark:bg-red-900 rounded-full mb-4">
                  <Calendar size={14} className="text-white dark:text-red-400" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-100 dark:text-slate-100">Get Involved</span>
                </div>
                {/* Adjusted text size for mobile: text-3xl instead of 4xl */}
                <h2 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                  Upcoming <span className="text-[#8B1A1A]">Events</span>
                </h2>
              </div>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium md:max-w-xs text-center md:text-center leading-relaxed">
                Join our vibrant community for special gatherings, workshops, and worship experiences.
              </p>
            </div>
            
            {/* Carousel Container */}
            <div className="relative">
              <EventCarousel limit={5} showViewAll autoPlayInterval={5000} />
            </div>
          </div>
        </section>

      {/* Service Areas */}
      <section className="py-20 md:py-32 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-900 dark:bg-red-900 rounded-full mb-6">
              <Heart size={14} className="text-white dark:text-red-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-100 dark:text-slate-100">The Power of Service</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-8">
              Make Your <span className="text-[#8B1A1A]">Impact</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
              You weren&apos;t just meant to attend; you were meant to belong. Find your team and start your journey of impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceAreasData.slice(0, 3).map((area) => (
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
      <DonationSection />
    </div>
    </>
  );
}