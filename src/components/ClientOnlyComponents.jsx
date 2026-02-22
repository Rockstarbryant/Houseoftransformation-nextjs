'use client';

import dynamic from 'next/dynamic';

// ⚡ ALL components loaded with ssr:false AND lazy (no preload).
// This keeps them completely out of the critical path on mobile.

const FloatingThemeToggle = dynamic(
  () => import('@/components/common/FloatingThemeToggle'),
  { ssr: false }
);

const ServiceWorkerRegister = dynamic(
  () => import('@/components/ServiceWorkerRegister'),
  { ssr: false }
);

const UpdateNotification = dynamic(
  () => import('@/components/common/UpdateNotification'),
  { ssr: false }
);

const GlobalPiP = dynamic(
  () => import('@/components/GlobalPiP'),
  { ssr: false }
);

// ⚡ Analytics & SpeedInsights — fully deferred, never blocks paint
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(mod => mod.Analytics),
  { ssr: false }
);

const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then(mod => mod.SpeedInsights),
  { ssr: false }
);

// ⚡ GoogleAnalytics moved HERE from layout.jsx so it's never server-rendered.
// This prevents the GTM script tag from appearing in the initial HTML and
// blocking the mobile parser. It will only load after hydration is complete.
const GoogleAnalytics = dynamic(
  () => import('@/components/common/GoogleAnalytics'),
  { ssr: false }
);

export default function ClientOnlyComponents() {
  return (
    <>
      <GlobalPiP />
      <FloatingThemeToggle />
      <ServiceWorkerRegister />
      <UpdateNotification />
      {/* ⚡ GA now deferred — loads after hydration, never blocks LCP/FCP */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
      )}
      <Analytics />
      <SpeedInsights />
    </>
  );
}