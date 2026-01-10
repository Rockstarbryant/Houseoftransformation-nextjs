import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../common/Button';
import api from '../../services/api/authService';

const VerifyEmailForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      
      if (error.response?.status === 400) {
        setStatus('error');
        setMessage(error.response.data.message || 'Invalid or expired verification link');
      } else {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
          {/* Loading State */}
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Loader size={32} className="text-blue-600 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Verifying Email</h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Email Verified!</h2>
                <p className="text-gray-600">
                  {message}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  <strong>✓ Your email has been verified.</strong> You can now log in to your account.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">Redirecting to login...</p>
                <Link to="/login" className="block">
                  <Button variant="primary" fullWidth>
                    Go to Login Now
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Verification Failed</h2>
                <p className="text-gray-600">
                  {message}
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-700 font-semibold">What you can do:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Check that you're using the correct link</li>
                  <li>✓ Links expire after 24 hours</li>
                  <li>✓ Request a new verification email</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link to="/login" className="block">
                  <Button variant="primary" fullWidth>
                    Back to Login
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    navigate('/');
                  }}
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