'use client';

import React, { useState } from 'react';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Input from '../common/Input';
import Button from '../common/Button';
import authService from '@/services/api/authService';

const ForgotPasswordForm = () => {
  const [email, setEmail]           = useState('');
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep a copy of the submitted email so we can show it in the success screen
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.post('/auth/forgot-password', { email });
      // Always show success — backend never reveals if account exists or is OAuth-only
      setSubmittedEmail(email);
      setSuccess(true);
      setEmail('');
    } catch {
      // Even on network errors, show success — security best practice
      setSubmittedEmail(email);
      setSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-28 pb-12 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600">
                If a password-based account exists for{' '}
                <strong className="text-blue-900">{submittedEmail}</strong>, we've sent
                a reset link to that address.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-1">
              <p className="text-sm font-semibold text-blue-900">Didn't receive it?</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Check your spam or junk folder</li>
                <li>✓ Make sure you entered the correct email</li>
                <li>✓ The link expires in 1 hour</li>
                <li>✓ If you signed up with Google, use "Continue with Google" instead</li>
              </ul>
            </div>

            <Link href="/login">
              <Button variant="primary" fullWidth>
                Back to Login
              </Button>
            </Link>

            <button
              onClick={() => { setSuccess(false); setSubmittedEmail(''); }}
              className="text-sm text-blue-900 hover:text-blue-700 font-semibold hover:underline"
            >
              Try another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md mx-auto">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Login
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Hint about Google accounts */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Using Google?</strong> If you signed up with Google, go back and use
              "Continue with Google" — password reset is only for email/password accounts.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              placeholder="Enter your email address"
              icon={Mail}
              value={email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              autoFocus
            />

            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong className="text-blue-900">Security Tip:</strong> We will never ask
              for your password via email. Always reset it through this secure page.
            </p>
          </div>

          <p className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="text-blue-900 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;