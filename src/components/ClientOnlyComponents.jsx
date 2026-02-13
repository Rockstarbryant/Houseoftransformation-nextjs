'use client';

import dynamic from 'next/dynamic';

// ✅ SOLUTION: Move all dynamic imports with ssr:false into a Client Component
const FloatingThemeToggle = dynamic(() => import('@/components/common/FloatingThemeToggle'), { ssr: false });
const ServiceWorkerRegister = dynamic(() => import('@/components/ServiceWorkerRegister'), { ssr: false });
const UpdateNotification = dynamic(() => import('@/components/common/UpdateNotification'), { ssr: false });
const GlobalPiP = dynamic(() => import('@/components/GlobalPiP'), { ssr: false });
const Analytics = dynamic(() => import('@vercel/analytics/react').then(mod => mod.Analytics), { ssr: false });
const SpeedInsights = dynamic(() => import('@vercel/speed-insights/next').then(mod => mod.SpeedInsights), { ssr: false });

export default function ClientOnlyComponents() {
  return (
    <>
      <GlobalPiP />
      <FloatingThemeToggle />
      <ServiceWorkerRegister />
      <UpdateNotification />
      <Analytics />
      <SpeedInsights />
    </>
  );
}