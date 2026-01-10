import React, { useState } from 'react';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../common/Button';
import api from '../../services/api/authService';

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const pwdValidation = validatePassword(formData.password);
    if (!pwdValidation.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (response.data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response?.status === 400) {
        setError(error.response.data.message || 'Invalid or expired reset link');
      } else {
        setError('An error occurred. Please try again.');
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

  if (success) {
    return (
      <div className="min-h-screen pt-28 pb-12 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Password Reset</h2>
              <p className="text-gray-600">
                Your password has been successfully reset. You can now login with your new password.
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ Redirecting to login...</p>
              <p>Or</p>
            </div>

            <Link to="/login" className="block">
              <Button variant="primary" fullWidth>
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Create New Password</h1>
            <p className="text-gray-600">
              Enter your new password below. Make sure it's strong and unique.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent disabled:bg-gray-100"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Password should include:</p>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {req.met ? (
                          <CheckCircle size={14} className="text-green-600" />
                        ) : (
                          <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Match Check */}
              {formData.confirmPassword && (
                <p className={`text-xs mt-2 ${
                  formData.password === formData.confirmPassword
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formData.password === formData.confirmPassword
                    ? '✓ Passwords match'
                    : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong className="text-blue-900">Security:</strong> Use a unique password that you don't use on other accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;