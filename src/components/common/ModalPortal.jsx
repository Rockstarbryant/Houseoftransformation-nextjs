'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * ModalPortal
 * -----------
 * Renders its children into document.body via React.createPortal.
 * This places the modal completely outside the component tree, making
 * z-index wars, stacking contexts, and fixed-header interference impossible.
 *
 * Props:
 *   isOpen        boolean   — controls visibility
 *   onClose       () => void — called on backdrop click, Escape key, or X button
 *   title         string    — accessible dialog title (required for aria)
 *   description   string?   — accessible dialog description (optional)
 *   children      ReactNode — modal body content
 *   size          'sm' | 'md' | 'lg' | 'xl'  — max-width preset (default 'md')
 *   hideClose     boolean?  — suppress the X button (default false)
 *   bottomSheet   boolean?  — force bottom-sheet on all viewports (default false)
 *                            By default: bottom-sheet on mobile, centered on ≥640px
 */

const SIZE_MAP = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

export const ModalPortal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  hideClose = false,
  bottomSheet = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  // Mount guard — createPortal needs the DOM to exist (SSR safety)
  useEffect(() => { setMounted(true); }, []);

  // Drive the CSS transition: isOpen → schedule visible on next tick
  useEffect(() => {
    if (isOpen) {
      // Tiny delay so the element is in the DOM before we add the visible class
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Don't render anything until mounted (SSR) or after close transition finishes
  if (!mounted) return null;
  if (!isOpen && !visible) return null;   // fully hidden after transition

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const sizeClass = SIZE_MAP[size] ?? SIZE_MAP.md;

  const modal = (
    <>
      {/*
        ─── Backdrop ───────────────────────────────────────────────────────────
        Fixed, full-screen, outside every stacking context.
        z-index 99998 + 99999 for content — nothing in the app reaches this.
      */}
      <div
        ref={overlayRef}
        onClick={handleBackdropClick}
        aria-hidden="true"
        style={{ zIndex: 99998 }}
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-[2px]
          transition-opacity duration-200
          ${visible ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/*
        ─── Modal container ────────────────────────────────────────────────────
        Two layouts controlled by Tailwind breakpoint:
          • < sm  →  bottom-sheet (slides up from bottom)
          • ≥ sm  →  centered modal (scales in)
        `bottomSheet` prop overrides to always bottom-sheet.
      */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        style={{ zIndex: 99999 }}
        className={[
          // Base
          'fixed flex flex-col bg-white dark:bg-slate-900 shadow-2xl overflow-hidden',
          'outline-none focus:outline-none',
          'transition-all duration-300 ease-out',

          // ── Mobile: bottom-sheet ────────────────────────────────────────
          !bottomSheet && 'max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto',
          !bottomSheet && 'max-sm:rounded-t-2xl max-sm:rounded-b-none',
          !bottomSheet && 'max-sm:max-h-[92dvh] max-sm:w-full max-sm:max-w-none',
          !bottomSheet && (visible ? 'max-sm:translate-y-0 max-sm:opacity-100' : 'max-sm:translate-y-full max-sm:opacity-0'),

          // ── Desktop: centered modal ─────────────────────────────────────
          !bottomSheet && 'sm:top-1/2 sm:left-1/2 sm:rounded-2xl sm:w-full',
          !bottomSheet && sizeClass,
          !bottomSheet && 'sm:max-h-[90vh]',
          !bottomSheet && (visible
            ? 'sm:-translate-x-1/2 sm:-translate-y-1/2 sm:scale-100 sm:opacity-100'
            : 'sm:-translate-x-1/2 sm:-translate-y-[60%] sm:scale-95 sm:opacity-0'
          ),

          // ── Force bottom-sheet on all viewports ─────────────────────────
          bottomSheet && 'inset-x-0 bottom-0 top-auto',
          bottomSheet && 'rounded-t-2xl rounded-b-none',
          bottomSheet && 'max-h-[92dvh] w-full max-w-none',
          bottomSheet && (visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'),
        ].filter(Boolean).join(' ')}
      >
        {/* Drag handle — mobile only */}
        {!bottomSheet && (
          <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        )}
        {bottomSheet && (
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="text-base font-bold text-slate-900 dark:text-white leading-snug"
            >
              {title}
            </h2>
            {description && (
              <p
                id="modal-description"
                className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
              >
                {description}
              </p>
            )}
          </div>
          {!hideClose && (
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
};

/**
 * ModalPortalFooter
 * -----------------
 * Sticky footer pinned to bottom of the modal, sits outside the scroll area.
 * Usage: render as a sibling after your scrollable content inside <ModalPortal>.
 *
 * NOTE: Because ModalPortal uses flex-col on its container, placing this
 * component as the last child of ModalPortal will pin it below the scroll area.
 */
export const ModalPortalFooter = ({ children, className = '' }) => (
  <div
    className={`
      flex-shrink-0 px-6 py-4
      border-t border-gray-100 dark:border-slate-800
      bg-white dark:bg-slate-900
      ${className}
    `}
  >
    {children}
  </div>
);

export default ModalPortal;