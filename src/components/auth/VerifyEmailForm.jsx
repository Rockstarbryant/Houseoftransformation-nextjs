'use client';

/**
 * VerifyEmailForm.jsx
 *
 * How Supabase email verification works with your stack:
 * 1. User clicks the verification link in their email.
 * 2. Supabase redirects to: /verify-email#access_token=xxx&type=signup
 * 3. This component detects that hash, calls supabase.auth.getSession()
 *    which exchanges the token and confirms the email automatically.
 * 4. No backend endpoint needed for the actual verification.
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../common/Button';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const VerifyEmailForm = () => {
  const router = useRouter();
  const [status,  setStatus]  = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      const hash = window.location.hash;

      // No token in URL — user navigated here directly without a link
      if (!hash.includes('access_token')) {
        setStatus('error');
        setMessage('No verification token found. Please use the link from your email.');
        return;
      }

      // Supabase processes the hash automatically when getSession() is called.
      // If the hash contains a valid signup token, it confirms the email.
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[VerifyEmail] Session error:', error.message);
        setStatus('error');
        setMessage(error.message || 'Verification failed. The link may have expired.');
        return;
      }

      if (data.session) {
        // Email confirmed — sign them out so they log in properly
        await supabase.auth.signOut();
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setStatus('error');
        setMessage('Verification link is invalid or has expired. Please request a new one.');
      }
    } catch (err) {
      console.error('[VerifyEmail] Unexpected error:', err);
      setStatus('error');
      setMessage('An unexpected error occurred during verification.');
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">

          {/* Loading */}
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Loader size={32} className="text-blue-600 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Verifying Email</h2>
                <p className="text-gray-600">Please wait while we confirm your email address…</p>
              </div>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Email Verified!</h2>
                <p className="text-gray-600">{message}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  ✓ You can now log in to your account.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Redirecting to login…</p>
                <Link href="/login">
                  <Button variant="primary" fullWidth>Go to Login Now</Button>
                </Link>
              </div>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Verification Failed</h2>
                <p className="text-gray-600">{message}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left space-y-1">
                <p className="text-sm font-semibold text-gray-700">What you can do:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Make sure you're using the most recent verification email</li>
                  <li>✓ Links expire after 24 hours — request a new one if needed</li>
                  <li>✓ Don't click the link more than once</li>
                </ul>
              </div>
              <div className="space-y-3">
                <Link href="/login">
                  <Button variant="primary" fullWidth>Back to Login</Button>
                </Link>
                <button
                  onClick={() => router.push('/')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-blue-900 text-blue-900 font-semibold hover:bg-blue-50 transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmailForm;