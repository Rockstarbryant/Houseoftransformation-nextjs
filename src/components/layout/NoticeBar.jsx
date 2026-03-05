'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { getActiveNotice } from '@/services/api/noticeService';

const DISMISS_KEY = 'dismissed_notice_';

export default function NoticeBar() {
  const [notice, setNotice]       = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted]     = useState(false);
  const barRef                    = useRef(null);

  useEffect(() => {
    setMounted(true);
    getActiveNotice().then(data => { if (data) setNotice(data); });
  }, []);

  useEffect(() => {
    if (!notice?._id || typeof window === 'undefined') return;
    if (sessionStorage.getItem(DISMISS_KEY + notice._id) === 'true') {
      setDismissed(true);
    }
  }, [notice?._id]);

  // ✅ Measure bar height → expose as --notice-height CSS variable
  // Header reads this to offset its own top position
  useEffect(() => {
    const el = barRef.current;
    if (!el || !notice || dismissed) {
      document.documentElement.style.removeProperty('--notice-height');
      return;
    }
    const update = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--notice-height', `${h}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty('--notice-height');
    };
  }, [notice, dismissed]);

  const handleDismiss = () => {
    if (notice?._id) sessionStorage.setItem(DISMISS_KEY + notice._id, 'true');
    setDismissed(true);
    document.documentElement.style.removeProperty('--notice-height');
  };

  if (!mounted || !notice || dismissed) return null;

  const { message, style, backgroundColor, textColor, dismissible, linkUrl, linkLabel } = notice;
  const isMarquee = style === 'marquee';

  return (
    <div
      ref={barRef}
      role="banner"
      aria-label="Site notice"
      style={{ backgroundColor: backgroundColor || '#8B1A1A', color: textColor || '#FFFFFF' }}
      className="fixed top-0 left-0 right-0 z-[51] w-full min-h-[38px] flex items-center text-[11px] font-bold tracking-wide shadow-sm"
    >
      {isMarquee ? (
        <>
          <div className="flex-1 overflow-hidden">
            <div
              className="whitespace-nowrap inline-block"
              style={{ animation: `noticeMarquee ${Math.max(8, message.length * 0.18)}s linear infinite` }}
            >
              <span className="px-8">{message}</span>
              <span className="px-8" aria-hidden="true">{message}</span>
              <span className="px-8" aria-hidden="true">{message}</span>
            </div>
          </div>
          <style>{`
            @keyframes noticeMarquee {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-33.333%); }
            }
          `}</style>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center gap-3 px-4 py-2.5 text-center">
          <span className="leading-snug">{message}</span>
          {linkUrl && (
            <a
              href={linkUrl}
              target={linkUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              style={{ color: textColor }}
              className="inline-flex items-center gap-1 underline underline-offset-2 opacity-90 hover:opacity-100 transition-opacity font-black text-[10px] uppercase tracking-widest"
            >
              {linkLabel || 'Learn More'}
              {linkUrl.startsWith('http') && <ExternalLink size={10} />}
            </a>
          )}
        </div>
      )}

      {dismissible && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss notice"
          style={{ color: textColor }}
          className="flex-shrink-0 mr-3 opacity-70 hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}