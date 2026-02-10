// src/utils/analytics.js

// Track page views
export const pageview = (url) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({ action, category, label, value }) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Example usage:
// event({
//   action: 'donation_completed',
//   category: 'Donations',
//   label: 'M-Pesa Payment',
//   value: 1000
// });