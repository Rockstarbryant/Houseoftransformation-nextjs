'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Register Service Worker for persistent PiP and offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('⚠️ Service Worker registration failed:', error);
        });
    }

    // Handle visibility change for wake lock
    const handleVisibilityChange = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        // Try to reacquire wake lock if app becomes visible again
        if (navigator.wakeLock) {
          try {
            const savedPiP = localStorage.getItem('persistentPiP');
            if (savedPiP) {
              await navigator.wakeLock.request('screen');
              console.log('✅ Wake Lock reacquired');
            }
          } catch (err) {
            console.log('⚠️ Wake Lock error on visibility:', err);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}