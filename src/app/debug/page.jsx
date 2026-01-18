// app/debug/page.jsx - TEMPORARY DEBUG PAGE
'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [allCookies, setAllCookies] = useState({});
  const [allStorage, setAllStorage] = useState({});
  const [maintenanceStatus, setMaintenanceStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get cookies
    const cookies = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name) cookies[name] = decodeURIComponent(value || '');
    });
    setAllCookies(cookies);
    console.log('[DEBUG] Cookies:', cookies);

    // Get localStorage
    const storage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      storage[key] = localStorage.getItem(key)?.substring(0, 100) || '';
    }
    setAllStorage(storage);
    console.log('[DEBUG] localStorage:', storage);

    // Check role from cookie
    const userRoleCookie = cookies['user_role'];
    const authToken = cookies['auth_token'];
    
    console.log('[DEBUG] user_role cookie:', userRoleCookie);
    console.log('[DEBUG] auth_token cookie:', authToken ? 'EXISTS' : 'MISSING');

    setLoading(false);

    // Check maintenance status
    fetchMaintenanceStatus();
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/public');
      const data = await response.json();
      setMaintenanceStatus(data.settings.maintenanceMode);
      console.log('[DEBUG] Maintenance status:', data.settings.maintenanceMode);
    } catch (error) {
      console.error('[DEBUG] Error fetching maintenance status:', error);
    }
  };

  const testRedirect = () => {
    alert('Attempting to navigate to /portal/events...\nCheck if middleware redirects you to /maintenance');
    window.location.href = '/portal/events';
  };

  const clearAllData = () => {
    if (confirm('Clear all cookies and localStorage?')) {
      // Clear cookies
      document.cookie.split(';').forEach(c => {
        const name = c.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      });

      // Clear localStorage
      window.localStorage.clear();

      alert('All data cleared. Refreshing page...');
      location.reload();
    }
  };

  const setRoleCookie = (role) => {
    document.cookie = `user_role=${role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    alert(`Role cookie set to: ${role}\nRefreshing...`);
    location.reload();
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const hasUserRole = !!allCookies['user_role'];
  const hasAuthToken = !!allCookies['auth_token'];
  const isAdmin = allCookies['user_role'] === 'admin';

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">🔧 Debug Panel</h1>

        {/* Status Indicator */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded text-white font-bold ${hasAuthToken ? 'bg-green-600' : 'bg-red-600'}`}>
            Auth Token: {hasAuthToken ? '✅' : '❌'}
          </div>
          <div className={`p-4 rounded text-white font-bold ${hasUserRole ? 'bg-green-600' : 'bg-red-600'}`}>
            User Role: {hasUserRole ? '✅' : '❌'}
          </div>
          <div className={`p-4 rounded text-white font-bold ${isAdmin ? 'bg-blue-600' : 'bg-gray-600'}`}>
            Is Admin: {isAdmin ? '✅' : '❌'}
          </div>
        </div>

        {/* Maintenance Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Maintenance Status</h2>
          {maintenanceStatus ? (
            <div className={`p-4 rounded ${maintenanceStatus.enabled ? 'bg-red-50 border-2 border-red-500' : 'bg-green-50 border-2 border-green-500'}`}>
              <p className="font-bold text-lg">
                {maintenanceStatus.enabled ? '🚨 MAINTENANCE ACTIVE' : '✅ MAINTENANCE DISABLED'}
              </p>
              <p className="mt-2"><strong>Message:</strong> {maintenanceStatus.message}</p>
              <p><strong>Estimated Time:</strong> {maintenanceStatus.estimatedTime}</p>
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </div>

        {/* Cookies Display */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">🍪 Cookies</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm space-y-2 max-h-48 overflow-auto">
            {Object.keys(allCookies).length > 0 ? (
              Object.entries(allCookies).map(([key, value]) => (
                <div key={key} className="break-all">
                  <span className="text-cyan-400">{key}:</span>{' '}
                  <span className="text-yellow-400">{value.substring(0, 80)}{value.length > 80 ? '...' : ''}</span>
                </div>
              ))
            ) : (
              <p className="text-red-400">❌ No cookies found</p>
            )}
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
            <strong>Expected:</strong>
            <ul className="list-disc list-inside mt-1">
              <li><code>auth_token</code> - JWT token</li>
              <li><code>user_role</code> - Your role (admin, secretary, etc)</li>
            </ul>
          </div>
        </div>

        {/* localStorage Display */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">💾 localStorage</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm space-y-2 max-h-48 overflow-auto">
            {Object.keys(allStorage).length > 0 ? (
              Object.entries(allStorage).map(([key, value]) => (
                <div key={key} className="break-all">
                  <span className="text-cyan-400">{key}:</span>{' '}
                  <span className="text-yellow-400">{value.substring(0, 80)}...</span>
                </div>
              ))
            ) : (
              <p className="text-red-400">No localStorage items</p>
            )}
          </div>
        </div>

        {/* User Role Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">👤 Current User Info</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-100 rounded">
              <strong>User Role Cookie:</strong>{' '}
              <code className="text-blue-600">{allCookies['user_role'] || 'NOT SET'}</code>
            </div>
            <div className="p-3 bg-gray-100 rounded">
              <strong>Auth Token:</strong>{' '}
              {allCookies['auth_token'] ? (
                <code className="text-green-600">EXISTS ✅</code>
              ) : (
                <code className="text-red-600">MISSING ❌</code>
              )}
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-xl font-bold mb-4">🧪 Quick Actions</h2>
          
          <button
            onClick={fetchMaintenanceStatus}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            🔄 Refresh Maintenance Status
          </button>

          <button
            onClick={testRedirect}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            🚀 Test Redirect (→ /portal/events)
          </button>

          <div className="border-t pt-3">
            <p className="text-sm font-semibold mb-2">Manually Set Role Cookie:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRoleCookie('admin')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Set Admin
              </button>
              <button
                onClick={() => setRoleCookie('secretary')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
              >
                Set Secretary
              </button>
            </div>
          </div>

          <button
            onClick={clearAllData}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-3"
          >
            🗑️ Clear All Data
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-bold">📋 Testing Instructions</h2>
          
          <div className="space-y-2 text-sm">
            <h3 className="font-bold">1️⃣ Check Cookies First</h3>
            <p className="ml-4">Make sure you see both <code className="bg-gray-200 px-2 py-1">auth_token</code> and <code className="bg-gray-200 px-2 py-1">user_role</code> cookies above.</p>

            <h3 className="font-bold mt-3">2️⃣ Test Admin Access</h3>
            <p className="ml-4">If you're logged in as admin, click "Test Redirect" - you should stay on /portal/events</p>

            <h3 className="font-bold mt-3">3️⃣ Test Non-Admin Redirect</h3>
            <p className="ml-4">If maintenance is enabled and you're NOT admin, click "Test Redirect" - you should go to /maintenance</p>

            <h3 className="font-bold mt-3">4️⃣ Enable Maintenance Mode</h3>
            <p className="ml-4">Go to /portal/settings → Maintenance tab → Enable toggle → Save</p>

            <h3 className="font-bold mt-3">5️⃣ Test in Incognito Window</h3>
            <p className="ml-4">Open incognito → login as non-admin → try accessing /portal/events → should see /maintenance page</p>
          </div>
        </div>
      </div>
    </div>
  );
}