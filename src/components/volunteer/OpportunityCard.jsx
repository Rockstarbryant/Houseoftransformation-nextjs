'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Award, AlertCircle, CheckCircle, Clock, Users, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ApplicationForm from './ApplicationForm';
import { useAuth } from '@/context/AuthContext';
import { volunteerService } from '@/services/api/volunteerService';

const CHURCH_EMAIL = 'info@houseoftransformation.or.ke';
const BRAND_RED = '#8B1A1A';

/* ─────────────────────────────────────────────────────────────
   Custom portal modal — bypasses Radix / shadcn Dialog entirely
   so the site header's stacking context cannot interfere.
───────────────────────────────────────────────────────────── */
const ModalPortal = ({ open, onClose, children }) => {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2147483646,          // max int - 1; nothing beats this
          backgroundColor: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
        aria-hidden="true"
      />

      {/* ── Panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          zIndex: 2147483647,          // absolute max
          // Desktop: centred
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(680px, 96vw)',
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        }}
        // Stop backdrop click from propagating through the panel
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      {/* Mobile override — stick to bottom like a sheet */}
      <style>{`
        @media (max-width: 639px) {
          [data-volunteer-modal] {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            transform: none !important;
            width: 100% !important;
            max-width: 100% !important;
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            max-height: 92dvh !important;
          }
        }
      `}</style>
    </>,
    document.body
  );
};

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
const OpportunityCard = ({ opportunity, onApplicationSuccess }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [existingApplicationData, setExistingApplicationData] = useState(null);
  const [showChangeRoleOption, setShowChangeRoleOption] = useState(false);

  const title = opportunity.title || opportunity.role;

  /* ── Handlers ── */
  const handleApply = () => {
    setIsModalOpen(true);
    setSubmitMessage({ type: '', text: '' });
    setExistingApplicationData(null);
    setShowChangeRoleOption(false);
  };

  const handleCloseModal = useCallback(() => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSubmitMessage({ type: '', text: '' });
    setExistingApplicationData(null);
    setShowChangeRoleOption(false);
  }, [isSubmitting]);

  const handleApplicationExists = (application) => {
    setExistingApplicationData(application);
    if (application.isEditable) {
      setShowChangeRoleOption(true);
      setSubmitMessage({
        type: 'warning',
        text: `You have an active application for ${application.ministry}. Would you like to update it for this role instead?`,
      });
    } else {
      setSubmitMessage({
        type: 'info',
        text: `Your application for ${application.ministry} is already under review. For changes, contact us at ${CHURCH_EMAIL}`,
      });
    }
  };

  const handleChangeRole = () => {
    setShowChangeRoleOption(false);
    setSubmitMessage({ type: '', text: '' });
  };

  const handleSubmit = async (formData, applicationId, isEdit) => {
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });
    try {
      if (isEdit && applicationId) {
        await volunteerService.editApplication(applicationId, formData);
        setSubmitMessage({
          type: 'success',
          text: 'Application updated! Our team will review your changes and be in touch soon.',
        });
      } else {
        await volunteerService.apply(formData);
        setSubmitMessage({
          type: 'success',
          text: "Application received! We'll review it and contact you within 1–2 weeks.",
        });
      }
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitMessage({ type: '', text: '' });
        setExistingApplicationData(null);
        setShowChangeRoleOption(false);
        if (onApplicationSuccess) onApplicationSuccess();
      }, 2800);
    } catch (error) {
      console.error('Application error:', error);
      const errorMessage = error.response?.data?.message;
      const errorCode = error.response?.data?.code;

      if (errorCode === 'DUPLICATE_APPLICATION') {
        const existingApp = error.response?.data?.existingApplication;
        setExistingApplicationData(existingApp);
        if (existingApp?.isEditable) {
          setShowChangeRoleOption(true);
          setSubmitMessage({
            type: 'warning',
            text: `You already have an active application for ${existingApp.ministry}. Would you like to update it?`,
          });
        } else {
          setSubmitMessage({
            type: 'info',
            text: `Your application for ${existingApp.ministry} is under review. Contact ${CHURCH_EMAIL} for changes.`,
          });
        }
      } else if (errorCode === 'IP_RESTRICTION') {
        setSubmitMessage({
          type: 'error',
          text: 'An application from your network has already been submitted. Please contact us if you believe this is an error.',
        });
      } else {
        setSubmitMessage({
          type: 'error',
          text: errorMessage || 'Failed to submit application. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Card ── */
  return (
    <>
      <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: BRAND_RED }} />

        <div className="flex flex-col flex-1 p-6 gap-4">
          <Badge variant="secondary" className="w-fit text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
            {opportunity.category || 'Ministry'}
          </Badge>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#8B1A1A] dark:group-hover:text-red-400 transition-colors">
              {title}
            </h3>
            {opportunity.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {opportunity.description}
              </p>
            )}
          </div>

          {opportunity.requirements && (
            <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Award size={13} className="flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{opportunity.requirements}</span>
            </div>
          )}

          <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-50 dark:border-slate-800">
            {opportunity.timeCommitment && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                <Clock size={13} />{opportunity.timeCommitment}
              </div>
            )}
            {opportunity.teamCount && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                <Users size={13} />{opportunity.teamCount}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <Button
            onClick={handleApply}
            className="w-full text-white font-semibold group/btn"
            style={{ backgroundColor: BRAND_RED }}
          >
            Apply Now
            <ArrowRight size={15} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>

      {/* ── Portal Modal ── */}
      <ModalPortal open={isModalOpen} onClose={handleCloseModal}>
        <div
          data-volunteer-modal
          className="flex flex-col bg-white dark:bg-slate-900"
          style={{ maxHeight: '90dvh' }}
        >
          {/* Mobile drag pill */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Header — fixed, never scrolls */}
          <div
            className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0"
            style={{ backgroundColor: `${BRAND_RED}08` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${BRAND_RED}18` }}
              >
                <Award size={15} style={{ color: BRAND_RED }} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                  Apply — {title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fill in the form below to apply for this ministry role.
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            <div className="px-6 pt-4 space-y-3">

              {/* Success */}
              {submitMessage.type === 'success' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200">
                  <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">{submitMessage.text}</p>
                </div>
              )}

              {/* Warning — change role prompt */}
              {submitMessage.type === 'warning' && showChangeRoleOption && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-300">{submitMessage.text}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 text-white"
                      style={{ backgroundColor: BRAND_RED }}
                      onClick={handleChangeRole}
                      disabled={isSubmitting}
                    >
                      Yes, Update My Application
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={handleCloseModal}
                      disabled={isSubmitting}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {/* Info */}
              {submitMessage.type === 'info' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200">
                  <AlertCircle size={18} className="text-sky-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-sky-800 dark:text-sky-300">{submitMessage.text}</p>
                </div>
              )}

              {/* Error */}
              {submitMessage.type === 'error' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-300">{submitMessage.text}</p>
                </div>
              )}
            </div>

            {/* Form — hidden once a message has been set */}
            {!submitMessage.text && (
              <div className="px-6 py-4 pb-10">
                <ApplicationForm
                  ministry={title}
                  onSubmit={handleSubmit}
                  onClose={handleCloseModal}
                  isSubmitting={isSubmitting}
                  onApplicationExists={handleApplicationExists}
                />
              </div>
            )}
          </div>
        </div>
      </ModalPortal>
    </>
  );
};

export default OpportunityCard;