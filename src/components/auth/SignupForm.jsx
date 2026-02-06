'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function SignupForm({ onSuccess, onSwitchToLogin }) {
  const router = useRouter();
  const { signup, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Password strength validation
  const validatePassword = (pwd) => {
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[@$!%*?&]/.test(pwd);
    const hasLength = pwd.length >= 8;

    return {
      isValid: hasUppercase && hasLowercase && hasNumber && hasSpecial && hasLength,
      hasLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial
    };
  };

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Name validation
  const validateName = (name) => {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) return false;
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) return false;
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!validateName(formData.name)) {
      newErrors.name = 'Name must be 2-100 characters, letters only';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Valid email required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const pwdValidation = validatePassword(formData.password);
      if (!pwdValidation.isValid) {
        newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[SIGNUP] Attempting signup for:', formData.email);

      const result = await signup(formData);

      if (result.success) {
        console.log('[SIGNUP] Success! User:', result.user?.email);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/login');
        }
      } else {
        console.error('[SIGNUP] Failed:', result.error);

        if (result.validationErrors && Array.isArray(result.validationErrors)) {
          const fieldErrors = {};
          result.validationErrors.forEach((err) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          setGeneralError(result.error || 'Signup failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('[SIGNUP] Error:', error);

      if (error.message?.includes('already exists')) {
        setGeneralError('Email already registered. Please login instead.');
      } else if (error.message?.includes('rate limit')) {
        setGeneralError('Too many signup attempts. Please try again later.');
      } else {
        setGeneralError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGeneralError('');
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        setGeneralError(result.error || 'Google sign-in failed. Please try again.');
        setIsGoogleLoading(false);
      }
      // If successful, user will be redirected to Google
    } catch (error) {
      setGeneralError('An unexpected error occurred.');
      setIsGoogleLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);
  const passwordRequirements = [
    { met: passwordValidation.hasLength, label: '8+ characters' },
    { met: passwordValidation.hasUppercase, label: 'Uppercase letter' },
    { met: passwordValidation.hasLowercase, label: 'Lowercase letter' },
    { met: passwordValidation.hasNumber, label: 'Number' },
    { met: passwordValidation.hasSpecial, label: 'Special character (@$!%*?&)' }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Join Our Community</h2>

      {generalError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle size={18} />
          {generalError}
        </div>
      )}

      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isSubmitting}
        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg border-2 border-gray-200 hover:border-gray-300 disabled:opacity-70 disabled:cursor-not-allowed mb-6"
      >
        {isGoogleLoading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <Input
            name="name"
            placeholder="Full Name"
            icon={User}
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting || isGoogleLoading}
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          <p className="text-xs text-gray-500 mt-1">Letters, spaces, hyphens, and apostrophes only</p>
        </div>

        {/* Email Field */}
        <div>
          <Input
            name="email"
            type="email"
            placeholder="Email"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting || isGoogleLoading}
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <Input
            name="password"
            type="password"
            placeholder="Password"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isSubmitting || isGoogleLoading}
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}

          {formData.password && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-2">Password should include:</p>
              <div className="space-y-1">
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {req.met ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    )}
                    <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-600'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button type="submit" variant="primary" fullWidth disabled={isSubmitting || isGoogleLoading}>
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-blue-900 font-semibold hover:underline"
          disabled={isSubmitting || isGoogleLoading}
        >
          Sign In
        </button>
      </p>
    </div>
  );
}