/**
 * sentry.client.config.js
 *
 * Sentry initialisation for the browser (client-side).
 * Place this file at the ROOT of your Next.js project
 * (same level as next.config.js).
 *
 * Captures:
 *   - Unhandled JS exceptions
 *   - Unhandled Promise rejections
 *   - React component render errors (via ErrorBoundary)
 *   - Browser performance traces (LCP, FID, CLS)
 *   - Console.error breadcrumbs
 *   - Network request breadcrumbs (XHR / Fetch)
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || 'development',

  // Suppress the DSN and init details being printed to the terminal
  debug: false,

  integrations: [
    // Captures browser performance metrics (Web Vitals)
    Sentry.browserTracingIntegration(),

    // Replays a compressed video of the user's session at the moment of an error.
    // Free tier: 500 replays/month — use sparingly (errors only, not all sessions).
    Sentry.replayIntegration({
      // Only record the page when an error actually occurs
      maskAllText: false,     // allow text to help you debug
      blockAllMedia: true,    // don't record video/images
    }),
  ],

  // Sample 100% of transactions in dev, 5% in production
  // (church traffic is low enough that 5% still gives good data)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Only record a session replay when an error occurs (not all sessions)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Don't send errors to Sentry in local development (avoids polluting your dashboard)
  enabled: process.env.NODE_ENV !== 'development',

  // Scrub Supabase tokens from breadcrumbs / request data
  beforeBreadcrumb(breadcrumb) {
    if (
      breadcrumb.category === 'fetch' ||
      breadcrumb.category === 'xhr'
    ) {
      // Strip Authorization headers from breadcrumbs
      if (breadcrumb.data?.headers?.Authorization) {
        breadcrumb.data.headers.Authorization = '[Filtered]';
      }
    }
    return breadcrumb;
  },

  beforeSend(event) {
    // Strip localStorage tokens from extra data
    if (event.extra) {
      const tokenKeys = ['supabase_access_token', 'supabase_refresh_token', 'auth_token'];
      tokenKeys.forEach((key) => {
        if (event.extra[key]) event.extra[key] = '[Filtered]';
      });
    }
    return event;
  },
});