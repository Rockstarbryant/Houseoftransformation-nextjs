'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function LoginForm({ onSwitchToSignup }) {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/portal';
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectTo);
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Sign In
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
/*
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function LoginForm({ onSuccess, onSwitchToSignup }) {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log('[LOGIN] Attempting login for:', formData.email);

      const result = await login(formData.email, formData.password);

      if (result.success) {
  console.log('[LOGIN] Success! User:', result.user?.email);
  
  // Get stored redirect path or default to portal
  const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/portal';
  sessionStorage.removeItem('redirectAfterLogin');
  
  router.push(redirectTo);


      } else {
        console.error('[LOGIN] Failed:', result.error);
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('[LOGIN] Error:', error);

      if (error.response?.status === 429) {
        setIsRateLimited(true);
        setError('Too many login attempts. Please try again in 15 minutes.');
      } else if (error.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else {
        setError(error.message || 'An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Welcome Back Please Login</h2>

      {error && (
        <div
          className={`${
            isRateLimited ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
          } p-3 rounded-lg mb-4 flex items-center gap-2`}
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isRateLimited || isSubmitting}
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          icon={Lock}
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isRateLimited || isSubmitting}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-900 hover:text-blue-700 font-semibold hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" variant="primary" fullWidth disabled={isRateLimited || isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToSignup}
          className="text-blue-900 font-semibold hover:underline"
          disabled={isSubmitting}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}  */