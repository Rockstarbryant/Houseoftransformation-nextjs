import React, { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuthContext } from '../../context/AuthContext';

const LoginForm = ({ onSuccess, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle rate limiting (429 status)
      if (error.response?.status === 429) {
        setIsRateLimited(true);
        setError('Too many login attempts. Please try again in 15 minutes.');
      } else if (error.response?.status === 400) {
        // Handle validation errors
        const data = error.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(e => e.message).join(', ');
          setError(errorMessages);
        } else {
          setError(data.message || 'Login failed');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Welcome Back Please Signin</h2>

      {error && (
        <div className={`${isRateLimited ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'} p-3 rounded-lg mb-4 flex items-center gap-2`}>
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

        {/* Forgot Password Link - Professional placement */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-900 hover:text-blue-700 font-semibold hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isRateLimited || isSubmitting}
        >
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
};

export default LoginForm;