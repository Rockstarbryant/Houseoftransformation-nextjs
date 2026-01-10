'use client';

import React, { useEffect, useState } from 'react';
import { Pin, ArrowRight } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import QuickInfoBar from '@/components/home/QuickInfoBar';
import AboutSection from '@/components/about/AboutSection';
import LiveStreamSection from '@/components/home/LiveStreamSection';
import EventList from '@/components/events/EventList';
import ServiceAreaCard from '@/components/serviceAreas/ServiceAreaCard';
import { serviceAreasData } from '@/data/serviceAreas';
import DonationSection from '@/components/donations/DonationSection';
import SermonCard from '@/components/sermons/SermonCard';
import SermonCardText from '@/components/sermons/SermonCardText';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';
import { sermonService } from '@/services/api/sermonService';
import Link from 'next/link';

export default function HomePage() {
  const [featuredSermon, setFeaturedSermon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      setLoading(true);
      const data = await sermonService.getSermons({ limit: 100 });
      const allSermons = data.sermons || [];
      
      const pinnedSermon = allSermons.find(s => s.pinned);
      
      if (pinnedSermon) {
        setFeaturedSermon(pinnedSermon);
      } else {
        const recentSermon = allSermons
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        setFeaturedSermon(recentSermon);
      }
    } catch (error) {
      console.error('Error fetching sermons:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectSermonType = (sermon) => {
    if (sermon.videoUrl) return 'video';
    if (sermon.thumbnail) return 'photo';
    return 'text';
  };

  return (
    <div className="home-page bg-white-200">
      <HeroSection />
      <LiveStreamSection />
      <QuickInfoBar />

      <section className="py-2 md:py-3">
        <div className="max-w-full mx-auto px-4 md:px-6">
          <AboutSection preview />
        </div>
      </section>

      {/* Latest Sermon Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-full mx-auto px-4 md:px-6">
          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <Pin size={28} className="text-blue-600" />
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                {featuredSermon?.pinned ? 'Featured Sermon' : 'Latest Sermon'}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {featuredSermon?.pinned ? 'Featured' : 'Latest'} <span className="text-blue-600">Sermon</span>
            </h2>
            <p className="text-xl text-slate-600">
              {featuredSermon?.pinned 
                ? 'Our pastor\'s most important message for you' 
                : 'Grow in faith with our most recent teachings and messages'}
            </p>
          </div>

          {loading ? (
            <Loader />
          ) : !featuredSermon ? (
            <div className="text-center py-16">
              <p className="text-slate-600 text-lg">No sermons available yet</p>
            </div>
          ) : (
            <div>
              <div className="mb-12">
                {detectSermonType(featuredSermon) === 'text' ? (
                  <SermonCardText sermon={featuredSermon} />
                ) : (
                  <SermonCard sermon={featuredSermon} />
                )}
              </div>

              <div className="text-center">
                <Link href="/sermons">
                  <Button variant="primary" size="lg">
                    Browse All Sermons <ArrowRight size={20} />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-full mx-auto px-4 md:px-6">
          <div className="mb-12 md:mb-16">
            <span className="inline-block px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-bold mb-4 uppercase tracking-widest">
              What's Happening
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Upcoming <span className="text-blue-600">Events</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl">
              Join us for special gatherings and connect with our community
            </p>
          </div>
          <EventList limit={3} showViewAll />
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-full mx-auto px-4 md:px-6">
          <div className="mb-12 md:mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold mb-4 uppercase tracking-widest">
              Get Connected
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Service <span className="text-blue-600">Areas & Teams</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl">
              Find your place to serve, grow, and make an impact in our community
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {serviceAreasData.slice(0, 6).map((area) => (
              <ServiceAreaCard 
                key={area.name}
                name={area.name}
                description={area.description}
                imageUrl={area.imageUrl}
                teamCount={area.teamCount}
                timeCommitment={area.timeCommitment}
              />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/service-areas">
              <Button variant="primary" size="lg">
                Explore All Service Areas <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <DonationSection />
    </div>
  );
}