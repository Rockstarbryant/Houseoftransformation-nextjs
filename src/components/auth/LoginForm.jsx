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
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/portal/dashboard');
        }
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
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Welcome Back Please Signin</h2>

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
}