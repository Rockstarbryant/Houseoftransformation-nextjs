'use client';

/**
 * ResetPasswordForm.jsx
 *
 * How Supabase password reset works with your stack:
 * 1. User clicks the reset link in their email.
 * 2. Supabase redirects to: /reset-password#access_token=xxx&type=recovery
 * 3. This component reads the token from the URL hash, establishes a Supabase
 *    session, then calls supabase.auth.updateUser({ password }) directly.
 * 4. No backend endpoint needed — Supabase owns the token validation.
 */

import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../common/Button';
import { createClient } from '@supabase/supabase-js';

// Public (anon) Supabase client — safe to use on the frontend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ResetPasswordForm = () => {
  const router = useRouter();

  const [formData, setFormData]               = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm,  setShowConfirm]        = useState(false);
  const [error,        setError]              = useState('');
  const [success,      setSuccess]            = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [sessionReady, setSessionReady]       = useState(false);
  const [sessionError, setSessionError]       = useState('');

  /**
   * On mount, Supabase will fire an AUTH_CHANGE event of type PASSWORD_RECOVERY
   * when it detects the #access_token in the URL hash.
   * We wait for that before allowing the user to submit.
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Fallback: if the hash is present but the event fires before we subscribe
    const hash = window.location.hash;
    if (hash.includes('access_token') && hash.includes('type=recovery')) {
      setSessionReady(true);
    }

    // Check if there's no recovery token at all (user navigated here directly)
    if (!hash.includes('access_token')) {
      setSessionError('No reset token found. Please request a new password reset link.');
    }

    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = (pwd) => {
    return {
      isValid:      /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[@$!%*?&]/.test(pwd) && pwd.length >= 8,
      hasLength:    pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber:    /\d/.test(pwd),
      hasSpecial:   /[@$!%*?&]/.test(pwd),
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!validatePassword(formData.password).isValid) {
      setError('Password does not meet requirements');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update password directly through Supabase — the recovery session
      // established from the URL hash authorises this call.
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (updateError) {
        setError(updateError.message || 'Failed to reset password. The link may have expired.');
      } else {
        setSuccess(true);
        // Sign out so the user logs in fresh with the new password
        await supabase.auth.signOut();
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pwdVal = validatePassword(formData.password);
  const requirements = [
    { met: pwdVal.hasLength,    label: '8+ characters' },
    { met: pwdVal.hasUppercase, label: 'Uppercase letter' },
    { met: pwdVal.hasLowercase, label: 'Lowercase letter' },
    { met: pwdVal.hasNumber,    label: 'Number' },
    { met: pwdVal.hasSpecial,   label: 'Special character (@$!%*?&)' },
  ];

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen pt-28 pb-12 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Password Reset!</h2>
              <p className="text-gray-600">
                Your password has been updated. Redirecting you to login…
              </p>
            </div>
            <Link href="/login">
              <Button variant="primary" fullWidth>Go to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── No token / bad link screen ─────────────────────────────────────────────
  if (sessionError) {
    return (
      <div className="min-h-screen pt-28 pb-12 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600">{sessionError}</p>
            </div>
            <Link href="/forgot-password">
              <Button variant="primary" fullWidth>Request New Reset Link</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-28 pb-12 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Create New Password</h1>
            <p className="text-gray-600">Enter your new password below.</p>
          </div>

          {!sessionReady && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">Validating your reset link…</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  required
                  disabled={isSubmitting || !sessionReady}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent disabled:bg-gray-100"
                  autoFocus
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900">
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>

              {formData.password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Password should include:</p>
                  <div className="space-y-1">
                    {requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {req.met
                          ? <CheckCircle size={14} className="text-green-600"/>
                          : <div className="w-3 h-3 border-2 border-gray-300 rounded-full"/>
                        }
                        <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-600'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  disabled={isSubmitting || !sessionReady}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent disabled:bg-gray-100"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900">
                  {showConfirm ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className={`text-xs mt-2 ${
                  formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formData.password === formData.confirmPassword
                    ? '✓ Passwords match'
                    : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" fullWidth
              disabled={isSubmitting || !sessionReady}>
              {isSubmitting ? 'Resetting Password…' : 'Reset Password'}
            </Button>
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong className="text-blue-900">Security:</strong> Use a unique password
              you don't use on other accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;