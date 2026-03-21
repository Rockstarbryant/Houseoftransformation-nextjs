/**
 * sentry.server.config.js
 *
 * Sentry initialisation for the Next.js Node.js server runtime.
 * Handles SSR errors, API Route errors, and Server Action errors.
 * Place at the ROOT of your Next.js project.
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || 'development',

  debug: false,

  integrations: [
    // Auto-traces fetch/HTTP calls made during SSR
    Sentry.captureConsoleIntegration({ levels: ['error'] }),
  ],

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  enabled: process.env.NODE_ENV !== 'development',
});