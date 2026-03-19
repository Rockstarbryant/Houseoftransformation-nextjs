// src/app/(public)/donate/page.jsx
// ✅ SERVER COMPONENT - Fetches campaigns + payment settings on the server

import { getActiveCampaigns } from '@/lib/donation';
import { getPublicPaymentSettings } from '@/lib/settings';
import DonatePageClient from '@/components/donations/DonatePageClient';

export const metadata = {
  title: 'Donate - House of Transformation',
  description: "Give generously to support the mission of House of Transformation. Your donations help transform lives and advance God's kingdom through biblical stewardship.",
  keywords: 'donate, giving, tithe, offering, campaigns, House of Transformation, church giving',
  openGraph: {
    title: 'Donate - House of Transformation',
    description: 'Support our mission through biblical giving and stewardship',
    type: 'website',
  },
};

export default async function DonatePage() {
  console.log('[DONATE-PAGE] Server-side rendering donate page...');

  // Fetch in parallel — both are server-side with ISR caching
  const [campaignsResult, paymentResult] = await Promise.all([
    getActiveCampaigns(),
    getPublicPaymentSettings(),
  ]);

  if (!campaignsResult.success) {
    console.error('[DONATE-PAGE] Failed to fetch campaigns:', campaignsResult.error);
  } else {
    console.log('[DONATE-PAGE] Fetched', campaignsResult.campaigns?.length ?? 0, 'campaigns');
  }

  if (!paymentResult.success) {
    console.error('[DONATE-PAGE] Failed to fetch payment settings:', paymentResult.error);
  }

  return (
    <DonatePageClient
      initialCampaigns={campaignsResult.campaigns || []}
      paymentSettings={paymentResult.paymentSettings}
    />
  );
}