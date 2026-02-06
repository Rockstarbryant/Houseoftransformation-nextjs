'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { Heart, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-red-100 rounded-full mb-4"></div>
            <div className="h-4 w-24 bg-stone-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-60" />

      <div className="w-full max-w-md px-6 relative z-10">
        {/* Branding/Welcome Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-3xl shadow-xl shadow-stone-200/50 mb-6 text-red-600">
            <Heart size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Home</h1>
          <p className="text-slate-500 mt-2">Sign in to access your transformation portal</p>
        </div>

        {/* The Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-stone-200/60 border border-white p-8 md:p-10">
          <LoginForm 
            onSwitchToSignup={() => router.push('/signup')}
          />
        </div>

        {/* Footer Security Note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck size={16} />
          <span className="text-xs font-medium uppercase tracking-widest">Secure Member Access</span>
        </div>
      </div>
    </div>
  );
}

/*
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
         onSwitchToSignup={() => router.push('/signup')}
        />
      </div>
    </div>
  );
}  */