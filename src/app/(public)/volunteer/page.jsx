'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus, CheckCircle, Clock, ShieldCheck, Users, Heart, Zap,
  AlertCircle, Flame, ArrowRight
} from 'lucide-react';
import OpportunityCard from '@/components/volunteer/OpportunityCard';
import { useAuth } from '@/context/AuthContext';
import { volunteerService } from '@/services/api/volunteerService';
import { volunteerData } from '@/data/volunteers';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const BRAND_RED = '#8B1A1A';
const BRAND_GOLD = '#d4a017';

const VolunteerPage = () => {
  const { user } = useAuth();
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkApplicationStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkApplicationStatus = async () => {
    try {
      setLoading(true);
      const response = await volunteerService.checkExistingApplication();
      if (response.hasApplication) {
        setExistingApplication(response.application);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: {
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
        icon: <Clock size={16} />,
        label: 'Under Review',
      },
      interviewing: {
        bg: 'bg-sky-50 border-sky-200',
        text: 'text-sky-700',
        badge: 'bg-sky-100 text-sky-700',
        icon: <AlertCircle size={16} />,
        label: 'Interview Stage',
      },
      approved: {
        bg: 'bg-emerald-50 border-emerald-200',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-700',
        icon: <CheckCircle size={16} />,
        label: 'Approved',
      },
      rejected: {
        bg: 'bg-slate-50 border-slate-200',
        text: 'text-slate-600',
        badge: 'bg-slate-100 text-slate-600',
        icon: <AlertCircle size={16} />,
        label: 'Closed',
      },
    };
    return config[status] || config.pending;
  };

  const processSteps = [
    { n: '01', title: 'Apply', desc: 'Submit your ministry interest and background.', icon: UserPlus },
    { n: '02', title: 'Review', desc: 'Leadership carefully vets your application.', icon: ShieldCheck },
    { n: '03', title: 'Connect', desc: 'A brief meeting to align on vision & fit.', icon: Users },
    { n: '04', title: 'Serve', desc: 'Welcome aboard — your journey begins!', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-slate-950 font-sans antialiased transition-colors">

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: BRAND_RED, minHeight: '480px' }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 80% 40%, ${BRAND_GOLD}44, transparent)`,
          }}
        />
        {/* Fine dot texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-40">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
              <Flame size={13} style={{ color: BRAND_GOLD }} />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
                Volunteer Portal
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
              Called to{' '}
              <span style={{ color: BRAND_GOLD }}>Serve</span>.
            </h1>
            <p className="text-lg text-white/70 max-w-lg leading-relaxed">
              Your gifts are needed. Find your place in our community and make
              a lasting difference in Busia and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FLOATING OVERVIEW PANEL ─────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 mb-16">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Why We Serve */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl shadow-black/8 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${BRAND_RED}15` }}
              >
                <Heart size={18} style={{ color: BRAND_RED }} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Why We Serve</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Our Busia Main Campus is a beacon of hope and community. Volunteering isn't just
              about what you do — it's about who you become in the process. Step into purpose
              and join hundreds already serving their calling.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Users size={14} />, label: 'Vibrant Community' },
                { icon: <Zap size={14} />, label: 'Impactful Service' },
                { icon: <Heart size={14} />, label: 'Personal Growth' },
              ].map((tag) => (
                <div
                  key={tag.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                  {tag.icon}
                  {tag.label}
                </div>
              ))}
            </div>
          </div>

          {/* Status / Auth Panel */}
          <div className="lg:col-span-1">
            {loading ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl shadow-black/8 border border-gray-100 dark:border-slate-800 h-full flex flex-col items-center justify-center gap-4">
                <div
                  className="w-10 h-10 rounded-full border-4 border-slate-100 dark:border-slate-700 border-t-current animate-spin"
                  style={{ borderTopColor: BRAND_RED }}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">Checking status…</p>
              </div>
            ) : user && existingApplication ? (
              /* Logged in & applied */
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl shadow-black/8 border border-gray-100 dark:border-slate-800 h-full flex flex-col">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Your Application
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {existingApplication.ministry}
                </h3>

                {(() => {
                  const cfg = getStatusConfig(existingApplication.status);
                  return (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-5 ${cfg.bg}`}>
                      <span className={cfg.text}>{cfg.icon}</span>
                      <span className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</span>
                    </div>
                  );
                })()}

                <p className="text-sm text-slate-500 dark:text-slate-400 flex-grow mb-6">
                  Our leadership team is reviewing your application. You'll be notified of updates.
                </p>

                <Button
                  onClick={() => (window.location.href = '/profile/' + user._id)}
                  className="w-full text-white font-semibold"
                  style={{ backgroundColor: BRAND_RED }}
                >
                  Track Progress
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            ) : !user ? (
              /* Not logged in */
              <div
                className="rounded-2xl p-8 shadow-xl h-full flex flex-col justify-center relative overflow-hidden"
                style={{ backgroundColor: BRAND_RED }}
              >
                <div
                  className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full opacity-20"
                  style={{ backgroundColor: BRAND_GOLD, filter: 'blur(40px)' }}
                />
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white mb-3">Join the Family</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-8">
                    Sign in to apply for ministry roles and track your volunteer journey.
                  </p>
                  <Link
                    href="/login"
                    className="block w-full text-center py-3 px-6 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: BRAND_GOLD, color: '#1a0a00' }}
                  >
                    Sign In / Register
                  </Link>
                </div>
              </div>
            ) : (
              /* Logged in, no application */
              <div
                className="rounded-2xl p-8 shadow-xl h-full flex flex-col justify-center text-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${BRAND_RED}f0, #5a1010)` }}
              >
                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND_GOLD}30` }}
                  >
                    <Heart size={22} style={{ color: BRAND_GOLD }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to Serve?</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Browse the available roles below and submit your application today.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
            How It Works
          </h2>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {processSteps.map((step, i) => (
            <div
              key={step.n}
              className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              {/* Large number watermark */}
              <span
                className="absolute top-4 right-5 text-7xl font-black opacity-[0.04] dark:opacity-[0.06] select-none pointer-events-none transition-opacity group-hover:opacity-[0.07]"
                style={{ color: BRAND_RED }}
              >
                {step.n}
              </span>

              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${BRAND_RED}12` }}
              >
                <step.icon size={20} style={{ color: BRAND_RED }} />
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                {step.title}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>

              {/* Connector arrow (hidden on last) */}
              {i < processSteps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-center shadow-sm">
                    <ArrowRight size={11} className="text-slate-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── OPPORTUNITIES GRID ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Ministry Roles
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Find the team where your gifts belong.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="flex-shrink-0 mt-1 text-xs font-semibold px-3 py-1"
          >
            {volunteerData.length} Openings
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {volunteerData.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onApplicationSuccess={checkApplicationStatus}
            />
          ))}
        </div>
      </section>

    </div>
  );
};

export default VolunteerPage;