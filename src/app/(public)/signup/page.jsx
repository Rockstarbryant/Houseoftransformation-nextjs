'use client';

import { useRouter } from 'next/navigation';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <SignupForm 
          onSuccess={() => router.push('/login')}
          onSwitchToLogin={() => router.push('/login')}
        />
      </div>
    </div>
  );
}