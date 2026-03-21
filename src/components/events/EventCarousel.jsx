'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EventCard from './EventCard';
import Loader from '../common/Loader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getEvents } from '@/services/api/eventService';
import { useEffect } from 'react';

const SWIPE_THRESHOLD = 60;

/**
 * EventCarousel — key architectural decisions:
 *
 * 1. NO fixed min-h on the slide container.
 *    The card's natural height drives the container height.
 *
 * 2. The motion.div uses position:relative (not absolute), so
 *    the parent doesn't need an explicit height.
 *
 * 3. overflow-hidden is scoped to a narrow clip-mask wrapper
 *    so slides clip horizontally but the card's full height is always visible.
 *
 * 4. AnimatePresence mode="wait" — exit completes before enter starts,
 *    preventing two cards stacking and doubling the height.
 */

const EventCarousel = ({ limit, showViewAll = false }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents({ limit });
      const list = data.events || data.data || data;
      setEvents(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const paginate = (newDir) => {
    setDirection(newDir);
    setCurrentIndex((prev) => {
      const next = prev + newDir;
      if (next < 0) return events.length - 1;
      if (next >= events.length) return 0;
      return next;
    });
  };

  /* Slide animation — only translate on x-axis, no y movement */
  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
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
    <div className="w-full max-w-2xl mx-auto">

      {/* ── Main layout: [←]  [slide]  [→] ── */}
      <div className="flex items-center gap-3 sm:gap-4 w-full">

        {/* Prev arrow */}
        {events.length > 1 && (
          <button
            onClick={() => paginate(-1)}
            className={cn(
              'flex-shrink-0 hidden sm:flex items-center justify-center',
              'w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700',
              'bg-white dark:bg-slate-900 shadow-md',
              'hover:bg-[#8B1A1A] hover:border-[#8B1A1A] hover:text-white',
              'text-slate-600 dark:text-slate-300 transition-all duration-200'
            )}
            aria-label="Previous event"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/*
          ── Slide window ──
          overflow-hidden clips the horizontal enter/exit animation.
          It does NOT set a fixed height — the card determines height.
          The motion.div is in normal flow (not absolute), so the
          wrapper naturally wraps around whichever card is mounted.
        */}
        <div className="flex-1 overflow-hidden rounded-2xl">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 260, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              /* Drag/swipe — disabled while user interacts with form or description */
              drag={isUserInteracting ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_THRESHOLD) paginate(1);
                else if (info.offset.x > SWIPE_THRESHOLD) paginate(-1);
              }}
              style={{ cursor: isUserInteracting ? 'default' : 'grab' }}
              whileDrag={{ cursor: 'grabbing' }}
              className="w-full select-none"
            >
              <EventCard
                event={events[currentIndex]}
                onInteractionStart={() => setIsUserInteracting(true)}
                onInteractionEnd={() => setIsUserInteracting(false)}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next arrow */}
        {events.length > 1 && (
          <button
            onClick={() => paginate(1)}
            className={cn(
              'flex-shrink-0 hidden sm:flex items-center justify-center',
              'w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700',
              'bg-white dark:bg-slate-900 shadow-md',
              'hover:bg-[#8B1A1A] hover:border-[#8B1A1A] hover:text-white',
              'text-slate-600 dark:text-slate-300 transition-all duration-200'
            )}
            aria-label="Next event"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* ── Bottom controls ── */}
      <div className="flex flex-col items-center gap-3 mt-5">

        {/* Mobile swipe hint */}
        {events.length > 1 && (
          <p className="sm:hidden text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 select-none">
            ← swipe to browse →
          </p>
        )}

        {/* Dot indicators */}
        {events.length > 1 && (
          <div className="flex items-center gap-2">
            {events.map((_, i) => (
              <motion.button
                key={i}
                layout
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                }}
                animate={{
                  width: i === currentIndex ? 28 : 8,
                  backgroundColor: i === currentIndex ? '#8B1A1A' : '#94a3b8',
                  opacity: i === currentIndex ? 1 : 0.4,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="h-1.5 rounded-full"
                style={{ minWidth: 8 }}
                aria-label={`Event ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        <div className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentIndex}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="inline-block tabular-nums"
            >
              {currentIndex + 1}
            </motion.span>
          </AnimatePresence>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span>{events.length}</span>
        </div>
      </div>

      {/* View All */}
      {showViewAll && (
        <div className="flex justify-center mt-10">
          <Link href="/events">
            <Button
              variant="outline"
              className="font-black uppercase tracking-widest text-[11px] px-8 py-5 rounded-full border-2 border-slate-900 dark:border-slate-100 hover:bg-[#8B1A1A] hover:border-[#8B1A1A] hover:text-white dark:text-white transition-all duration-300"
            >
              View All Events
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default EventCarousel;