'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

//export const dynamic = 'force-dynamic';
export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B1A1A]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <LoginForm 
        onSuccess={() => {
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/portal';
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectTo);
       }}
      onSwitchToSignup={() => router.push('/signup')}
      />
      </div>
    </div>
  );
}