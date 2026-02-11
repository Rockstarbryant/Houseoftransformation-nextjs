// src/app/(public)/donate/page.jsx
// ✅ SERVER COMPONENT - Fetches data on the server with 10-minute cache

import { getActiveCampaigns } from '@/lib/donation';
import DonatePageClient from '@/components/donations/DonatePageClient';
import { Metadata } from 'next';

// ✅ Metadata for SEO
export const metadata = {
  title: 'Donate - House of Transformation',
  description: 'Give generously to support the mission of House of Transformation. Your donations help transform lives and advance God\'s kingdom through biblical stewardship.',
  keywords: 'donate, giving, tithe, offering, campaigns, House of Transformation, church giving',
  openGraph: {
    title: 'Donate - House of Transformation',
    description: 'Support our mission through biblical giving and stewardship',
    type: 'website',
  }
};

// ✅ Server Component - Fetches data with ISR
export default async function DonatePage() {
  console.log('[DONATE-PAGE] Server-side rendering donate page...');
  
  // ✅ Fetch active campaigns on the server with 10-minute revalidation
  const { campaigns, success, error } = await getActiveCampaigns();
  
  if (!success) {
    console.error('[DONATE-PAGE] Failed to fetch campaigns:', error);
  } else {
    console.log('[DONATE-PAGE] Successfully fetched', campaigns?.length || 0, 'campaigns');
  }

  // ✅ Pass the data to the client component
  return <DonatePageClient initialCampaigns={campaigns || []} />;
}