// app/portal/layout.jsx
import PortalLayoutClient from '@/components/layout/PortalLayoutClient';

/**
 * Portal Layout - Server Component
 * Auth check handled client-side in PortalLayoutClient
 */
export default async function PortalLayout({ children }) {
  return <PortalLayoutClient>{children}</PortalLayoutClient>;
}