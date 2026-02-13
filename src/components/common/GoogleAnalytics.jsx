// /components/common/GoogleAnalytics.jsx
'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }) {
  // ⚡ CRITICAL: Delay analytics loading until page is interactive
  useEffect(() => {
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      loadAnalytics();
    } else {
      window.addEventListener('load', loadAnalytics);
      return () => window.removeEventListener('load', loadAnalytics);
    }
  }, []);

  const loadAnalytics = () => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
    });
  };

  return (
    <>
      {/* ⚡ Load GA script AFTER page is interactive */}
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
    </>
  );
}
/*
'use client';

import Script from 'next/script';

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
} */