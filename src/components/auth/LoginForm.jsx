'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, MailCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import authService from '@/services/api/authService';

export default function LoginForm({ onSwitchToSignup }) {
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth();
  const [formData, setFormData]         = useState({ email: '', password: '' });
  const [error, setError]               = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Email-not-verified state
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [resendLoading,    setResendLoading]    = useState(false);
  const [resendSuccess,    setResendSuccess]    = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
    if (showVerifyBanner) setShowVerifyBanner(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowVerifyBanner(false);
    setResendSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/portal';
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectTo);
      } else {
        // Check for the specific unverified-email code from the backend
        if (
          result.code === 'EMAIL_NOT_VERIFIED' ||
          result.error?.toLowerCase().includes('email not confirmed') ||
          result.error?.toLowerCase().includes('not verified')
        ) {
          setShowVerifyBanner(true);
        } else {
          setError(result.error || 'Invalid credentials. Please try again.');
        }
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await authService.post('/auth/resend-verification', { email: formData.email });
      setResendSuccess(true);
    } catch {
      // fail silently — user can try again
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setShowVerifyBanner(false);
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        setError(result.error || 'Google sign-in failed. Please try again.');
        setIsGoogleLoading(false);
      }
    } catch {
      setError('An unexpected error occurred.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Generic error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Email-not-verified banner */}
      {showVerifyBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-start gap-3">
            <MailCheck size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Email not verified</p>
              <p className="text-sm text-amber-800 mt-0.5">
                Please verify your email before logging in. Check your inbox for the
                verification link we sent when you signed up.
              </p>
            </div>
          </div>

          {resendSuccess ? (
            <p className="text-sm text-green-700 font-semibold pl-8">
              ✓ Verification email resent! Check your inbox.
            </p>
          ) : (
            <button
              onClick={handleResendVerification}
              disabled={resendLoading || !formData.email}
              className="text-sm font-bold text-amber-900 hover:underline underline-offset-2 pl-8 disabled:opacity-50"
            >
              {resendLoading ? 'Sending…' : 'Resend verification email →'}
            </button>
          )}
        </div>
      )}

      {/* Google Sign-In — with Recommended badge */}
      <div className="relative">
        {/* Recommended badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-green-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full tracking-wide uppercase shadow-sm">
            Recommended
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isSubmitting}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg border-2 border-green-400 hover:border-green-500 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"/>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="group">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
              Email Address
            </label>
            <Input
              name="email"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-stone-50 border-transparent focus:bg-white focus:ring-red-600/10 transition-all rounded-2xl py-4"
              disabled={isSubmitting || isGoogleLoading}
            />
          </div>

          <div className="group">
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-stone-50 border-transparent focus:bg-white focus:ring-red-600/10 transition-all rounded-2xl py-4"
              disabled={isSubmitting || isGoogleLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="w-full bg-slate-900 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Sign In
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
            </>
          )}
        </button>
      </form>

      <div className="pt-4 text-center">
        <p className="text-sm text-slate-500">
          New to the family?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-red-600 font-bold hover:underline underline-offset-4 decoration-2"
            disabled={isSubmitting || isGoogleLoading}
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}