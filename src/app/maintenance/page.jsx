// app/maintenance/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { getPublicSettings } from '@/services/api/settingsService';

export default function MaintenancePage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    // Poll every 30 seconds to check if maintenance is over
    const interval = setInterval(fetchSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getPublicSettings();
      setSettings(data.settings);

      // If maintenance is disabled, redirect to home
      if (data.settings.maintenanceMode && !data.settings.maintenanceMode.enabled) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('[Maintenance Page] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    setLoading(true);
    fetchSettings();
  };

  const maintenanceMode = settings?.maintenanceMode || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full"></div>
              <div className="relative bg-orange-100 dark:bg-orange-950/50 p-6 rounded-full border-2 border-orange-500">
                <AlertTriangle className="w-12 h-12 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">
              Site Maintenance
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              We'll be back online shortly
            </p>
          </div>

          {/* Message */}
          {maintenanceMode.message && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-left">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {maintenanceMode.message}
              </p>
            </div>
          )}

          {/* Estimated Time */}
          {maintenanceMode.estimatedTime && (
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200 font-semibold">
                ⏱️ Estimated time: <span className="font-black">{maintenanceMode.estimatedTime}</span>
              </p>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Checking...
              </>
            ) : (
              <>
                <RefreshCw size={20} />
                Check Again
              </>
            )}
          </button>

          {/* Auto Refresh Info */}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This page will automatically refresh every 30 seconds
          </p>

          {/* Branding */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {settings?.siteName || 'House of Transformation'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}