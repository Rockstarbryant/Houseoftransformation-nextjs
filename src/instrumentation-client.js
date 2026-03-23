import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || "development",

  // ── CRITICAL: disabled in development ────────────────────────────────────
  // tracesSampleRate: 1 in dev causes Sentry to intercept every single fetch
  // including Next.js internal fetches, producing 46-52s compile times and
  // the "Unexpected root span type AppRender.fetch" warning.
  enabled: process.env.NODE_ENV === "production",

  debug: false,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: true,
    }),
  ],

  // 5% of transactions in production — enough for a church platform
  // 0 in dev because enabled: false above means nothing is sent anyway
  tracesSampleRate: 0.05,

  // Only record replays when an error occurs, never for normal sessions
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Don't automatically send IPs, emails, usernames — attach them manually
  // via Sentry.setUser() in your auth flow (already done in supabaseAuth.js)
  sendDefaultPii: false,

  // Scrub auth tokens before they leave the browser
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === "fetch" || breadcrumb.category === "xhr") {
      if (breadcrumb.data?.headers?.Authorization) {
        breadcrumb.data.headers.Authorization = "[Filtered]";
      }
    }
    return breadcrumb;
  },

  beforeSend(event) {
    if (event.extra) {
      const tokenKeys = ["supabase_access_token", "supabase_refresh_token", "auth_token"];
      tokenKeys.forEach((key) => {
        if (event.extra[key]) event.extra[key] = "[Filtered]";
      });
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;