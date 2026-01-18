'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loader from './Loader';

/**
 * ProtectedRouteWrapper - Wraps protected pages
 * Checks auth ONLY on pages that need it
 * Does NOT check auth on public pages
 */
export default function ProtectedRouteWrapper({ children }) {
  const { user, checkAuth, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setIsChecking(true);
        const hasUser = await checkAuth();
        
        if (!hasUser) {
          router.push('/login?redirect=' + window.location.pathname);
        }
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, []);

  // Show loader while checking auth
  if (isChecking || authLoading) {
    return <Loader fullScreen text="Verifying access..." />;
  }

  // Show content only if user exists
  if (!user) {
    return null;
  }

  return children;
}