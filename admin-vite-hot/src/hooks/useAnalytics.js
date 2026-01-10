import { useEffect } from 'react';

export const useAnalytics = (pageName) => {
  useEffect(() => {
    // Track page view
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: window.location.pathname,
        page_title: pageName
      });
    }
  }, [pageName]);

  const trackEvent = (eventName, params = {}) => {
    if (window.gtag) {
      window.gtag('event', eventName, params);
    }
  };

  return { trackEvent };
};