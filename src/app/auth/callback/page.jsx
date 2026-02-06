'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the redirect destination or default to portal
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/portal';
        sessionStorage.removeItem('redirectAfterLogin');

        // The AuthContext will handle the session via onAuthStateChange
        // Just redirect to the intended page
        setTimeout(() => {
          router.push(redirectTo);
        }, 1000); // Small delay to ensure session is processed
      } catch (error) {
        console.error('[AUTH-CALLBACK] Error:', error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Completing sign in...</h2>
        <p className="text-gray-500 mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  );
}