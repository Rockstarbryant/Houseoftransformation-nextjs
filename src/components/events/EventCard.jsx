'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Clock, MapPin, Calendar, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Loader, CalendarDays, X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const EventCard = ({ event, onInteractionStart, onInteractionEnd }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [visitorDetails, setVisitorDetails] = useState({
    name: '',
    email: '',
    phone: '',
    attendanceTime: event.time || ''
  });
  const [visitorError, setVisitorError] = useState(null);

  /* ── Helpers ── */
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      year: date.getFullYear(),
      full: date.toLocaleDateString('default', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    };
  };

  const dateInfo = formatDate(event.date);
  const needsTruncation = event.description && event.description.length > 140;
  const displayDescription = isDescriptionExpanded || !needsTruncation
    ? event.description
    : event.description?.substring(0, 140) + '...';

  /* ── Auth registration ── */
  const handleRegister = async () => {
    try {
      setRegistering(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setRegistering(false);
        setShowDialog(true);
        onInteractionStart?.();
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${event._id}/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data.success) setRegistered(true);
      else setError(data.message || 'Registration failed');
    } catch {
      setError('Failed to register. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  /* ── Visitor registration ── */
  const handleVisitorRegistration = async (e) => {
    e.preventDefault();
    try {
      setRegistering(true);
      setVisitorError(null);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${event._id}/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorDetails: { ...visitorDetails, isVisitor: true },
          }),
        }
      );
      const data = await res.json();

      if (data.success) {
        setRegistered(true);
        setShowDialog(false);
        onInteractionEnd?.();
        setTimeout(() => {
          setRegistered(false);
          setVisitorDetails({ name: '', email: '', phone: '', attendanceTime: event.time || '' });
        }, 3000);
      } else {
        setVisitorError(data.message || 'Registration failed');
      }
    } catch {
      setVisitorError('Failed to register. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setVisitorError(null);
    onInteractionEnd?.();
  };

  /* ══════════════════════════════════════════════
      RENDER — horizontal split card
      Mobile: image top / content bottom (stacked)
      Desktop: image left (40%) / content right (60%)
  ══════════════════════════════════════════════ */
  return (
    <>
      <div className="group w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col md:flex-row">

        {/* ── LEFT: Image panel ── */}
        <div className="relative w-full md:w-2/5 flex-shrink-0 bg-gradient-to-br from-[#8B1A1A] to-red-950">
          {/* Fixed aspect on mobile, full-height on desktop */}
          <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-full min-h-[200px]">
            {event.image ? (
              <Image
                src={event.image}
                alt={event.title}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <CalendarDays className="text-white/20" size={64} strokeWidth={1} />
              </div>
            )}

            {/* Gradient — bottom fade on mobile, right fade on desktop */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

            {/* Status badge — top right */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                Upcoming
              </Badge>
            </div>

            {/* Date badge — bottom left */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl px-3 py-2 shadow-lg text-center min-w-[48px]">
                <p className="text-[9px] font-black text-[#8B1A1A] uppercase tracking-widest leading-none">
                  {dateInfo.month}
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight tabular-nums">
                  {dateInfo.day}
                </p>
                <p className="text-[8px] font-bold text-slate-400 leading-none">
                  {dateInfo.year}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Content panel ── */}
        <div className="flex flex-col gap-4 p-5 md:p-6 flex-1">

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
            {event.title}
          </h3>

          {/* Meta row */}
          <div className="flex flex-wrap gap-2">
            {event.time && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-1 uppercase tracking-wide">
                <Clock size={11} className="text-[#8B1A1A]" />
                {event.time}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-1 uppercase tracking-wide">
                <MapPin size={11} className="text-[#8B1A1A]" />
                {event.location}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Description */}
          {event.description && (
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {displayDescription}
              </p>
              {needsTruncation && (
                <button
                  onClick={() => {
                    setIsDescriptionExpanded(!isDescriptionExpanded);
                    isDescriptionExpanded ? onInteractionEnd?.() : onInteractionStart?.();
                  }}
                  className="mt-1.5 inline-flex items-center gap-1 text-[#8B1A1A] hover:text-red-700 font-bold text-[10px] uppercase tracking-widest transition-colors"
                >
                  {isDescriptionExpanded
                    ? <><ChevronUp size={11} /> Less</>
                    : <><ChevronDown size={11} /> Read more</>}
                </button>
              )}
            </div>
          )}

          {/* Full date */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <Calendar size={11} />
            <span>{dateInfo.full}</span>
          </div>

          {/* ── CTA — always visible, pushed to bottom on desktop ── */}
          <div className="mt-auto pt-2 flex flex-col gap-2">
            {registered ? (
              <div className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-widest">
                <CheckCircle size={14} />
                You&apos;re Registered!
              </div>
            ) : (
              <Button
                onClick={handleRegister}
                disabled={registering}
                className={cn(
                  'w-full font-black uppercase tracking-widest text-xs py-5 rounded-xl',
                  'bg-slate-900 dark:bg-slate-100',
                  'hover:bg-[#8B1A1A] dark:hover:bg-[#8B1A1A]',
                  'text-white dark:text-slate-900 dark:hover:text-white',
                  'transition-all duration-300 active:scale-[0.98]'
                )}
              >
                {registering
                  ? <><Loader className="animate-spin mr-2" size={13} /> Processing...</>
                  : 'Confirm Attendance'}
              </Button>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={13} />
                <p className="text-red-800 dark:text-red-200 text-xs font-semibold">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          VISITOR DIALOG — portal-rendered, zero layout impact
      ══════════════════════════════════════════════ */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-0 overflow-hidden gap-0">

          {/* Mini banner */}
          <div className="relative h-24 bg-gradient-to-br from-[#8B1A1A] to-red-950 overflow-hidden flex-shrink-0">
            {event.image && (
              <Image src={event.image} alt={event.title} fill className="object-cover opacity-40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-5 right-10">
              <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] mb-0.5">Register for</p>
              <h3 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">{event.title}</h3>
            </div>
            <button
              onClick={closeDialog}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          <div className="p-5">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                Visitor Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Fill in your details to confirm attendance.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleVisitorRegistration} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Name <span className="text-[#8B1A1A]">*</span>
                </Label>
                <Input required value={visitorDetails.name} onChange={(e) => setVisitorDetails({ ...visitorDetails, name: e.target.value })}
                  placeholder="John Doe" className="h-10 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-[#8B1A1A]" />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Email <span className="text-[#8B1A1A]">*</span>
                </Label>
                <Input type="email" required value={visitorDetails.email} onChange={(e) => setVisitorDetails({ ...visitorDetails, email: e.target.value })}
                  placeholder="john@example.com" className="h-10 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-[#8B1A1A]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Phone</Label>
                  <Input type="tel" value={visitorDetails.phone} onChange={(e) => setVisitorDetails({ ...visitorDetails, phone: e.target.value })}
                    placeholder="+254 700 000 000" className="h-10 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-[#8B1A1A]" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Time <span className="text-[#8B1A1A]">*</span>
                  </Label>
                  <Input type="time" required value={visitorDetails.attendanceTime} onChange={(e) => setVisitorDetails({ ...visitorDetails, attendanceTime: e.target.value })}
                    className="h-10 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-[#8B1A1A]" />
                </div>
              </div>

              {visitorError && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={13} />
                  <p className="text-red-800 dark:text-red-200 text-xs font-semibold">{visitorError}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={registering}
                  className={cn('flex-1 font-black uppercase tracking-widest text-[10px] h-10 rounded-xl',
                    'bg-slate-900 dark:bg-white hover:bg-[#8B1A1A] dark:hover:bg-[#8B1A1A]',
                    'text-white dark:text-slate-900 dark:hover:text-white transition-all')}>
                  {registering ? <><Loader className="animate-spin mr-1.5" size={12} /> Registering...</> : 'Confirm Attendance'}
                </Button>
                <Button type="button" variant="outline" onClick={closeDialog}
                  className="px-4 h-10 text-[10px] font-black uppercase tracking-widest rounded-xl border-slate-200 dark:border-slate-700">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventCard;