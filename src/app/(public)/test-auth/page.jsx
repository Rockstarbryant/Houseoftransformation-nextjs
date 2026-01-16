'use client';

import { useRouter } from 'next/navigation';
import { testAuthBypass } from '@/lib/testAuthBypass';

/**
 * Localhost Testing Page
 * Only visible on localhost - allows testing portal without real auth
 * DELETE THIS PAGE BEFORE PRODUCTION
 * 
 * Access at: http://localhost:3000/test-auth
 */
export default function TestAuthPage() {
  const router = useRouter();

  // Hide if not localhost
  if (!testAuthBypass.isLocalhost()) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h1 className="text-xl font-bold text-red-900 mb-2">Not Available</h1>
          <p className="text-red-800">This page is only available on localhost.</p>
        </div>
      </div>
    );
  }

  const handleSetAuth = (role) => {
    console.log(`[TEST-AUTH] Setting mock ${role} auth...`);
    testAuthBypass.setMockAuth(role);
    console.log(`[TEST-AUTH] Mock ${role} auth set. Redirecting to /portal in 1s...`);
    
    // Wait for state to be saved
    setTimeout(() => {
      window.location.href = '/portal';
    }, 1000);
  };

  const handleClearAuth = () => {
    testAuthBypass.clearMockAuth();
    console.log('✅ Mock auth cleared.');
    router.refresh();
  };

  const isMockAuthActive = testAuthBypass.isUsingMockAuth();
  const currentUser = isMockAuthActive ? testAuthBypass.getMockUserFromStorage() : null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-6 rounded-lg mb-8">
          <h1 className="text-2xl font-black text-yellow-900 dark:text-yellow-200 mb-2">
            🧪 Localhost Test Auth
          </h1>
          <p className="text-yellow-800 dark:text-yellow-300 text-sm">
            ⚠️ This page is for LOCAL TESTING ONLY. Delete before production!
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Current Status
          </h2>

          {isMockAuthActive ? (
            <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-green-900 dark:text-green-200">
                  Mock Auth Active
                </span>
              </div>
              <div className="space-y-2 text-sm text-green-800 dark:text-green-300">
                <p>
                  <span className="font-semibold">User:</span> {currentUser?.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {currentUser?.email}
                </p>
                <p>
                  <span className="font-semibold">Role:</span>{' '}
                  <span className="uppercase font-bold text-[#8B1A1A]">
                    {currentUser?.role?.name}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Permissions:</span>{' '}
                  {currentUser?.role?.permissions?.length || 0}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-900 dark:text-blue-200">
                No mock auth active. Select a role below to start testing.
              </p>
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Test as Different Roles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Admin */}
            <button
              onClick={() => handleSetAuth('admin')}
              className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-2 border-red-300 dark:border-red-700 rounded-lg hover:shadow-lg transition-all"
            >
              <h3 className="font-black text-red-900 dark:text-red-200 mb-2">
                👑 Admin
              </h3>
              <p className="text-xs text-red-800 dark:text-red-300 mb-4">
                All 13 permissions
              </p>
              <div className="text-xs text-red-700 dark:text-red-400 font-mono mb-4">
                manage:* + view:*
              </div>
              <span className="inline-block px-3 py-1 bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-200 rounded text-xs font-bold">
                All Access
              </span>
            </button>

            {/* Pastor */}
            <button
              onClick={() => handleSetAuth('pastor')}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-300 dark:border-blue-700 rounded-lg hover:shadow-lg transition-all"
            >
              <h3 className="font-black text-blue-900 dark:text-blue-200 mb-2">
                🙏 Pastor
              </h3>
              <p className="text-xs text-blue-800 dark:text-blue-300 mb-4">
                Limited permissions
              </p>
              <div className="text-xs text-blue-700 dark:text-blue-400 font-mono mb-4">
                events, sermons, analytics
              </div>
              <span className="inline-block px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200 rounded text-xs font-bold">
                3 Permissions
              </span>
            </button>

            {/* Member */}
            <button
              onClick={() => handleSetAuth('member')}
              className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:shadow-lg transition-all"
            >
              <h3 className="font-black text-slate-900 dark:text-slate-200 mb-2">
                👤 Member
              </h3>
              <p className="text-xs text-slate-800 dark:text-slate-300 mb-4">
                Default role
              </p>
              <div className="text-xs text-slate-700 dark:text-slate-400 font-mono mb-4">
                No special access
              </div>
              <span className="inline-block px-3 py-1 bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-slate-200 rounded text-xs font-bold">
                No Permissions
              </span>
            </button>
          </div>
        </div>

        {/* Clear & Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Actions
          </h2>

          <div className="space-y-4">
            {isMockAuthActive && (
              <>
                <button
                  onClick={() => router.push('/portal')}
                  className="w-full px-6 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors"
                >
                  Go to Portal →
                </button>

                <button
                  onClick={handleClearAuth}
                  className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Clear Mock Auth
                </button>
              </>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 font-mono">
                💡 Tip: Open DevTools Console to see auth logs
              </p>
            </div>
          </div>
        </div>

        {/* Footer Warning */}
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>
            🗑️ Delete this page before deploying to production
          </p>
          <p className="font-mono">rm src/app/(public)/test-auth/page.jsx</p>
        </div>
      </div>
    </div>
  );
}