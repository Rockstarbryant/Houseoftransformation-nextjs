'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              setShowUpdate(true);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    setIsUpdating(true);
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    
    // Auto-update after 10 seconds if user dismisses
    setTimeout(() => {
      handleUpdate();
    }, 10000);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9998] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 border-2 border-[#8B1A1A] rounded-2xl shadow-2xl p-4 md:p-6 max-w-sm backdrop-blur-xl">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-[#8B1A1A]/20 rounded-full flex items-center justify-center">
            <RefreshCw 
              size={24} 
              className={`text-[#8B1A1A] ${isUpdating ? 'animate-spin' : ''}`} 
            />
          </div>

          <div className="flex-1">
            {/* Title */}
            <h3 className="text-white font-black text-lg mb-1">
              New Version Available! 🎉
            </h3>
            
            {/* Description */}
            <p className="text-slate-300 text-sm mb-4">
              We've made improvements to enhance your experience. Update now to get the latest features.
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-[#8B1A1A] hover:bg-[#a01f1f] disabled:bg-slate-600 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span className="text-sm">Updating...</span>
                  </>
                ) : (
                  <span className="text-sm">Update Now</span>
                )}
              </button>
              
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-slate-300 hover:text-white font-semibold text-sm transition-colors"
              >
                Later
              </button>
            </div>

            {/* Auto-update notice */}
            {!isUpdating && (
              <p className="text-xs text-slate-500 mt-2 text-center">
                Auto-updating in 10s if dismissed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}