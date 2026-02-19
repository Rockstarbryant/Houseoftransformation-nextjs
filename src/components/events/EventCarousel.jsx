'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import EventCard from './EventCard';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { getEvents } from '@/services/api/eventService';

const SWIPE_THRESHOLD = 60; // px needed to trigger a slide change

const EventCarousel = ({ limit, showViewAll = false }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [limit]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
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
    setCurrentIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = events.length - 1;
      if (next >= events.length) next = 0;
      return next;
    });
  };

  // Direction-aware slide variants
  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1,
    },
    exit: (dir) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      zIndex: 0,
    }),
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
    <div className="w-full max-w-full overflow-hidden relative pb-12">

      {/* ── Swipeable Slide Container ── */}
      <div className="relative w-full min-h-[480px] sm:min-h-[450px] md:min-h-[420px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 220, damping: 28 },
              opacity: { duration: 0.25 },
            }}
            // ── Drag / swipe ──
            // Disable drag when the user is interacting with form/description inside the card
            drag={isUserInteracting ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_THRESHOLD) paginate(1);
              else if (info.offset.x > SWIPE_THRESHOLD) paginate(-1);
            }}
            style={{ cursor: isUserInteracting ? 'default' : 'grab' }}
            whileDrag={{ cursor: 'grabbing', scale: 0.98 }}
            className="absolute w-full px-2 sm:px-8 md:px-0 max-w-full sm:max-w-lg md:max-w-2xl select-none"
          >
            <div className="min-h-[480px] sm:min-h-[450px] md:min-h-[420px]">
              <EventCard
                event={events[currentIndex]}
                onInteractionStart={() => setIsUserInteracting(true)}
                onInteractionEnd={() => setIsUserInteracting(false)}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Indicators ── */}
      <div className="flex flex-col items-center gap-4 mt-0">

        {/* Swipe hint */}
        {events.length > 1 && (
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 select-none">
            ← swipe to browse →
          </p>
        )}

        {/* Spring-animated dots — still clickable for accessibility */}
        <div className="flex items-center gap-2">
          {events.map((_, index) => (
            <motion.button
              key={index}
              layout
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              animate={{
                width: index === currentIndex ? 32 : 8,
                backgroundColor: index === currentIndex ? '#dc2626' : '#94a3b8',
                opacity: index === currentIndex ? 1 : 0.45,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="h-1.5 rounded-full"
              style={{ minWidth: 8 }}
            />
          ))}
        </div>

        {/* Animated counter flip */}
        <div className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={`current-${currentIndex}`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="inline-block"
            >
              {currentIndex + 1}
            </motion.span>
          </AnimatePresence>
          <span>/</span>
          <span>{events.length}</span>
        </div>
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