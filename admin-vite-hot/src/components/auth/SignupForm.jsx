import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuthContext } from '../../context/AuthContext';

const SignupForm = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '' 
  });
  const [errors, setErrors] = useState({}); // Field-specific errors
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuthContext();

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
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!validateName(formData.name)) {
      newErrors.name = 'Name must be 2-100 characters, letters only';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Valid email required';
    }

    // Validate password
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

    // Client-side validation first
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[SIGNUP] Attempting signup for:', formData.email);

      const result = await signup(formData);

      if (result.success) {
        console.log('[SIGNUP] Success! User:', result.user.email);
        onSuccess();
      } else {
        console.error('[SIGNUP] Failed:', result.error);
        
        // Handle backend validation errors
        if (result.validationErrors && Array.isArray(result.validationErrors)) {
          const fieldErrors = {};
          result.validationErrors.forEach(err => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          // Generic error
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

      {/* General Error */}
      {generalError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle size={18} />
          {generalError}
        </div>
      )}

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
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Letters, spaces, hyphens, and apostrophes only
          </p>
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
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
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
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}

          {/* Password Requirements */}
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

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-blue-900 font-semibold hover:underline"
          disabled={isSubmitting}
        >
          Sign In
        </button>
      </p>
    </div>
  );
};

export default SignupForm;