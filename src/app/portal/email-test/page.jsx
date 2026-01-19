'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function EmailTestPage() {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);
  const [emailResult, setEmailResult] = useState(null);

  const testConnection = async () => {
    try {
      setLoading(true);
      setConnectionResult(null);

      console.log('[EMAIL-TEST] Testing connection...');
      const response = await api.get('/email/test-connection');

      console.log('[EMAIL-TEST] Response:', response.data);
      setConnectionResult(response.data);

    } catch (error) {
      console.error('[EMAIL-TEST] Error:', error);
      setConnectionResult({
        success: false,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!recipientEmail) {
      alert('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      setEmailResult(null);

      console.log('[EMAIL-TEST] Sending test email to:', recipientEmail);
      const response = await api.post('/email/send-test', {
        recipientEmail
      });

      console.log('[EMAIL-TEST] Response:', response.data);
      setEmailResult(response.data);

    } catch (error) {
      console.error('[EMAIL-TEST] Error:', error);
      setEmailResult({
        success: false,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">📧 Email Settings Test</h1>

        {/* Step 1: Configure Settings */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold">Step 1: Configure Email Settings</h2>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-2">
            <p className="font-semibold">Go to Settings → Email and configure:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>SMTP Host:</strong> smtp.gmail.com (for Gmail)</li>
              <li><strong>SMTP Port:</strong> 587</li>
              <li><strong>SMTP Username:</strong> your-email@gmail.com</li>
              <li><strong>SMTP Password:</strong> app-specific password</li>
              <li><strong>From Email:</strong> your-email@gmail.com</li>
              <li><strong>From Name:</strong> House of Transformation</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            💡 For Gmail: Use an App Password (not your regular password). 
            Enable 2FA and generate an app password.
          </p>
        </div>

        {/* Step 2: Test Connection */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold">Step 2: Test SMTP Connection</h2>
          <p className="text-gray-600">
            Click below to verify your SMTP settings are correct:
          </p>
          <button
            onClick={testConnection}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Testing...' : '🔗 Test Connection'}
          </button>

          {connectionResult && (
            <div className={`p-4 rounded ${connectionResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-bold ${connectionResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {connectionResult.success ? '✅ Success' : '❌ Failed'}
              </p>
              <p className={connectionResult.success ? 'text-green-700' : 'text-red-700'}>
                {connectionResult.message}
              </p>
              {connectionResult.details?.error && (
                <p className="text-sm mt-2 font-mono bg-white p-2 rounded">
                  {connectionResult.details.error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Send Test Email */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold">Step 3: Send Test Email</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={sendTestEmail}
              disabled={loading || !recipientEmail}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Sending...' : '✉️ Send Test Email'}
            </button>
          </div>

          {emailResult && (
            <div className={`p-4 rounded ${emailResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-bold ${emailResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {emailResult.success ? '✅ Success' : '❌ Failed'}
              </p>
              <p className={emailResult.success ? 'text-green-700' : 'text-red-700'}>
                {emailResult.message}
              </p>
              {emailResult.details?.messageId && (
                <p className="text-sm mt-2 text-green-700">
                  Message ID: {emailResult.details.messageId}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Expected Results */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-bold">Expected Results</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ <strong>Connection Test Pass:</strong> SMTP is configured and reachable</li>
            <li>✅ <strong>Test Email Arrives:</strong> Check your inbox (may be in spam)</li>
            <li>✅ <strong>Email Source:</strong> From: House of Transformation &lt;your-email@gmail.com&gt;</li>
            <li>✅ <strong>Email Content:</strong> Contains test message and timestamp</li>
          </ul>
        </div>

        {/* Troubleshooting */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-bold">Troubleshooting</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Connection Failed:</strong> Check SMTP host, port, username, and password</li>
            <li><strong>Gmail:</strong> Use App Password, not regular password (enable 2FA first)</li>
            <li><strong>Email not arriving:</strong> Check spam folder, or try different SMTP provider</li>
            <li><strong>Port 587 vs 465:</strong> 587 = TLS, 465 = SSL (Gmail uses 587)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}