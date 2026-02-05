'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import EventCard from './EventCard';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getEvents } from '@/services/api/eventService';

const EventCarousel = ({ limit, showViewAll = false, autoPlayInterval = 5000 }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const autoPlayRef = useRef(null);

  // Detect mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [limit]);

  useEffect(() => {
    if (events.length <= 1 || !isAutoPlaying) return;
    autoPlayRef.current = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);
    return () => clearInterval(autoPlayRef.current);
  }, [events.length, isAutoPlaying, currentIndex]);

  const fetchEvents = async () => {
    try {
      setLoading(false);
      const data = await getEvents({ limit });
      const eventsList = data.events || data.data || data;
      setEvents(Array.isArray(eventsList) ? eventsList : []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = events.length - 1;
      if (nextIndex >= events.length) nextIndex = 0;
      return nextIndex;
    });
  };

  // Desktop animation variants (slide effect)
  const desktopVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // Mobile animation variants (fade effect)
  const mobileVariants = {
    enter: {
      opacity: 0,
      scale: 0.95,
    },
    center: {
      zIndex: 1,
      opacity: 1,
      scale: 1,
    },
    exit: {
      zIndex: 0,
      opacity: 0,
      scale: 0.95,
    },
  };

  if (loading) return (
    <div className="flex flex-col items-center py-20">
      <Loader />
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
        Synchronizing Schedule
      </p>
    </div>
  );

  if (events.length === 0) return null;

  return (
    <div 
      className="w-full max-w-full overflow-hidden relative pb-12" 
      onMouseEnter={() => setIsAutoPlaying(false)} 
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Main Slide Container - Fixed Height for consistency */}
      <div className="relative w-full min-h-[480px] sm:min-h-[450px] md:min-h-[420px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={isMobile ? mobileVariants : desktopVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={
              isMobile 
                ? { duration: 0.4, ease: "easeInOut" }
                : {
                    x: { type: "spring", stiffness: 200, damping: 25 },
                    opacity: { duration: 0.3 }
                  }
            }
            className="absolute w-full px-2 sm:px-0 max-w-full sm:max-w-lg md:max-w-2xl"
          >
            {/* Fixed Height Container */}
            <div className="min-h-[480px] sm:min-h-[450px] md:min-h-[420px]">
              <EventCard event={events[currentIndex]} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Desktop Arrows */}
        <div className="hidden md:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              paginate(-1);
            }}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-full shadow-2xl hover:bg-red-600 transition-all z-20"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              paginate(1);
            }}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-full shadow-2xl hover:bg-red-600 transition-all z-20"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Controls & Indicators */}
      <div className="flex flex-col items-center gap-6 mt-4">
        <div className="flex md:hidden gap-8">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              paginate(-1);
            }} 
            className="p-3 bg-slate-800 rounded-full text-white hover:bg-red-600 transition-colors"
          >
            <ChevronLeft size={20}/>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              paginate(1);
            }} 
            className="p-3 bg-slate-800 rounded-full text-white hover:bg-red-600 transition-colors"
          >
            <ChevronRight size={20}/>
          </button>
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                index === currentIndex ? 'w-8 bg-red-600' : 'w-2 bg-slate-400'
              }`}
            />
          ))}
        </div>
        
        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          {currentIndex + 1} / {events.length}
        </p>
      </div>

      {showViewAll && (
        <div className="flex justify-center mt-10">
          <Link href="/events">
            <Button variant="primary">View All Events</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default EventCarousel;