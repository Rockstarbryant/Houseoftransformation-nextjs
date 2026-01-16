// app/portal/page.jsx - Server Component
import PortalDashboardClient from '@/components/portal/PortalDashboardClient';

/**
 * Portal Dashboard - Server Component
 * Can fetch data server-side here if needed
 */
export default async function PortalPage() {
  // Optional: Fetch server-side data here
  // const userData = await fetchUserData();
  
  return <PortalDashboardClient />;
}