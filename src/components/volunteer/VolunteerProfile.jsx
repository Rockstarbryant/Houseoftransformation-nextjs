'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Clock, XCircle, AlertCircle, Users, Heart,
  RefreshCw, ExternalLink, CalendarDays, Phone, Edit3,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { volunteerService } from '@/services/api/volunteerService';

const BRAND_RED = '#8B1A1A';
const BRAND_GOLD = '#d4a017';

const STATUS_CONFIG = {
  approved: {
    icon: CheckCircle,
    label: 'Approved',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    accentColor: '#059669',
    borderClass: 'border-l-emerald-500',
    bgClass: 'bg-emerald-50/60 dark:bg-emerald-950/20',
  },
  rejected: {
    icon: XCircle,
    label: 'Not Selected',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    accentColor: '#64748b',
    borderClass: 'border-l-slate-400',
    bgClass: 'bg-slate-50/60 dark:bg-slate-900/40',
  },
  interviewing: {
    icon: Users,
    label: 'Interview Stage',
    badgeClass: 'bg-sky-100 text-sky-700 border-sky-200',
    accentColor: '#0284c7',
    borderClass: 'border-l-sky-500',
    bgClass: 'bg-sky-50/60 dark:bg-sky-950/20',
  },
  pending: {
    icon: Clock,
    label: 'Under Review',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    accentColor: '#d97706',
    borderClass: 'border-l-amber-400',
    bgClass: 'bg-amber-50/60 dark:bg-amber-950/20',
  },
};

const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

const VolunteerProfile = ({ userId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [userId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await volunteerService.getMyApplications();
      if (response.success) {
        setApplications(response.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load application status');
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center">
        <div
          className="w-10 h-10 rounded-full border-4 border-slate-100 dark:border-slate-700 border-t-current animate-spin mx-auto mb-4"
          style={{ borderTopColor: BRAND_RED }}
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading your applications…
        </p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
        </div>
        <Button
          size="sm"
          onClick={fetchApplications}
          className="text-white"
          style={{ backgroundColor: BRAND_RED }}
        >
          <RefreshCw size={14} className="mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  /* ── Empty ── */
  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
          style={{ backgroundColor: `${BRAND_RED}10` }}
        >
          <Heart size={28} style={{ color: BRAND_RED }} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          No Applications Yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
          You haven't submitted any volunteer applications yet. Browse available roles and find where you belong.
        </p>
        <Button
          onClick={() => (window.location.href = '/volunteer')}
          className="text-white font-semibold"
          style={{ backgroundColor: BRAND_RED }}
        >
          View Volunteer Opportunities
          <ExternalLink size={14} className="ml-2" />
        </Button>
      </div>
    );
  }

  /* ── Applications List ── */
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Your Applications
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {applications.length} application{applications.length !== 1 ? 's' : ''} on record
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchApplications}
          className="gap-1.5 text-xs"
        >
          <RefreshCw size={13} />
          Refresh
        </Button>
      </div>

      {/* Cards */}
      {applications.map((app) => {
        const cfg = getStatusConfig(app.status);
        const StatusIcon = cfg.icon;

        return (
          <div
            key={app._id}
            className={`rounded-2xl border border-l-4 overflow-hidden transition-all ${cfg.bgClass} ${cfg.borderClass}`}
            style={{ borderColor: 'transparent', borderLeftColor: cfg.accentColor, borderWidth: '1px', borderLeftWidth: '4px' }}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-4 p-5 pb-4">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${cfg.accentColor}18` }}
                >
                  <StatusIcon size={18} style={{ color: cfg.accentColor }} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {app.ministry}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${cfg.badgeClass}`}
                  >
                    {cfg.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                <CalendarDays size={12} />
                <span>{formatDate(app.appliedAt)}</span>
              </div>
            </div>

            <Separator className="mx-5 w-auto" />

            {/* Meta details */}
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {app.availability && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Availability
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                    {app.availability}
                  </p>
                </div>
              )}
              {app.phone && (
                <div className="flex items-start gap-1.5">
                  <Phone size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                      Phone
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                      {app.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status-specific message */}
            {app.status === 'approved' && (
              <div className="mx-5 mb-5 p-4 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-1.5">
                  🎉 Congratulations! You've been approved.
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 mb-3">
                  A team member will contact you within 3–5 business days to discuss orientation and next steps.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-800 dark:text-emerald-400">
                  <div>
                    <span className="font-semibold block mb-0.5">Reach us at:</span>
                    info@houseoftransformation.or.ke
                  </div>
                  <div>
                    <span className="font-semibold block mb-0.5">Office hours:</span>
                    Mon–Fri, 9:00 AM – 5:00 PM
                  </div>
                </div>
              </div>
            )}

            {app.status === 'rejected' && (
              <div className="mx-5 mb-5 p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-1">
                  Thank You for Your Interest
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  We're unable to move forward at this time, but we encourage you to reapply in the future.
                  Questions? Email{' '}
                  <a
                    href="mailto:info@houseoftransformation.or.ke"
                    className="font-semibold underline"
                  >
                    info@houseoftransformation.or.ke
                  </a>
                  .
                </p>
              </div>
            )}

            {app.status === 'interviewing' && (
              <div className="mx-5 mb-5 p-4 rounded-xl bg-sky-100/80 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800">
                <p className="text-sm font-bold text-sky-900 dark:text-sky-300 mb-1">
                  📞 Interview in Progress
                </p>
                <p className="text-xs text-sky-800 dark:text-sky-400">
                  Your application is advancing. Our team will contact you shortly to schedule a conversation.
                  Please ensure your contact details are up to date.
                </p>
              </div>
            )}

            {app.status === 'pending' && (
              <div className="mx-5 mb-5 p-4 rounded-xl bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-1">
                  ⏳ Application Under Review
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-400">
                  Thank you for submitting! We're reviewing your application and will follow up within 1–2 weeks.
                </p>
              </div>
            )}

            {/* Editable notice */}
            {app.isEditable && (
              <div className="mx-5 mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                <Edit3 size={13} className="text-violet-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-violet-800 dark:text-violet-300">
                    Edit Window Open
                  </p>
                  <p className="text-[11px] text-violet-700 dark:text-violet-400">
                    You can still edit your application within the 3-hour window.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Multiple applications note */}
      {applications.length > 1 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <AlertCircle size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Note:</strong> Only one active application is permitted at a time.
          </p>
        </div>
      )}
    </div>
  );
};

export default VolunteerProfile;