/**
 * sentry.edge.config.js
 *
 * Sentry initialisation for the Next.js Edge Runtime.
 * Handles errors in Next.js Middleware (middleware.js).
 * Place at the ROOT of your Next.js project.
 *
 * Note: Edge runtime has no Node.js APIs, so integrations are minimal.
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || 'development',

  debug: false,

  // Minimal sample rate for edge (very fast, low overhead)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  enabled: process.env.NODE_ENV !== 'development',
});