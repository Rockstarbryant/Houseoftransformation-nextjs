'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <SignupForm
            onSuccess={() => router.push('/login')}
            onSwitchToLogin={() => router.push('/login')}
          />
        </div>

        {/* Legal links below the card */}
        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/terms" className="hover:text-gray-600 underline underline-offset-2 transition-colors">
            Terms &amp; Conditions
          </Link>
          {' · '}
          <Link href="/privacy" className="hover:text-gray-600 underline underline-offset-2 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}