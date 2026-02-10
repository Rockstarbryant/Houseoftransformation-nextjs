'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Register Service Worker with update detection (NO browser alerts)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration);

          // Check for updates every 60 seconds
          setInterval(() => {
            registration.update();
          }, 60000);

          // Listen for updates (notification handled by UpdateNotification component)
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🆕 New Service Worker found!');

            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New version available!');
                // UpdateNotification component will show the UI
              }
            });
          });

          // Auto-reload when new service worker takes control
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              refreshing = true;
              console.log('🔄 Service Worker updated, reloading...');
              window.location.reload();
            }
          });
        })
        .catch((error) => {
          console.log('⚠️ Service Worker registration failed:', error);
        });
    }

    // Handle visibility change for wake lock
    const handleVisibilityChange = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
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