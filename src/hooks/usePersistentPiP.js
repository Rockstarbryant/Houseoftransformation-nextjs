'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing persistent floating PiP state
 * Syncs across browser tabs and survives page reloads
 */
export function usePersistentPiP() {
  const [floatingPiP, setFloatingPiP] = useState(null);
  const [pipSize, setPipSize] = useState({ width: 360, height: 240 });
  const [pipPosition, setPipPosition] = useState({ x: 20, y: 80 });
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadFromStorage = () => {
      try {
        const savedPiP = localStorage.getItem('persistentPiP');
        const savedSize = localStorage.getItem('persistentPiPSize');
        const savedPosition = localStorage.getItem('persistentPiPPosition');

        if (savedPiP) {
          setFloatingPiP(JSON.parse(savedPiP));
          console.log('✅ Restored PiP from localStorage');
        }
        if (savedSize) setPipSize(JSON.parse(savedSize));
        if (savedPosition) setPipPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error('Failed to load PiP from localStorage:', e);
      }
      
      setIsHydrated(true);
    };

    // Small delay to ensure DOM is ready
    loadFromStorage();

    // Request wake lock if PiP is active
    const requestWakeLock = async () => {
      const savedPiP = localStorage.getItem('persistentPiP');
      if (navigator.wakeLock && savedPiP) {
        try {
          await navigator.wakeLock.request('screen');
          console.log('✅ Wake Lock acquired on mount');
        } catch (err) {
          console.log('Wake Lock error:', err);
        }
      }
    };

    requestWakeLock();
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return;

    if (floatingPiP) {
      try {
        localStorage.setItem('persistentPiP', JSON.stringify(floatingPiP));
        localStorage.setItem('persistentPiPSize', JSON.stringify(pipSize));
        localStorage.setItem('persistentPiPPosition', JSON.stringify(pipPosition));
        
        // Request wake lock to keep screen awake
        if (navigator.wakeLock) {
          navigator.wakeLock.request('screen').catch((err) => {
            console.log('Wake Lock error during update:', err);
          });
        }
      } catch (e) {
        console.error('Failed to save PiP to localStorage:', e);
      }
    }
  }, [floatingPiP, pipSize, pipPosition, isHydrated]);

  // Handle visibility change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const savedPiP = localStorage.getItem('persistentPiP');
          if (savedPiP) {
            const pip = JSON.parse(savedPiP);
            const size = JSON.parse(localStorage.getItem('persistentPiPSize') || '{"width":360,"height":240}');
            const pos = JSON.parse(localStorage.getItem('persistentPiPPosition') || '{"x":20,"y":80}');
            
            setFloatingPiP(pip);
            setPipSize(size);
            setPipPosition(pos);

            // Reacquire wake lock
            if (navigator.wakeLock) {
              await navigator.wakeLock.request('screen');
              console.log('✅ Wake lock reacquired on app return');
            }
          }
        } catch (e) {
          console.error('Failed to restore PiP on visibility:', e);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Listen for storage changes in other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e) => {
      if (e.key === 'persistentPiP' && e.newValue) {
        try {
          setFloatingPiP(JSON.parse(e.newValue));
          const size = JSON.parse(localStorage.getItem('persistentPiPSize') || '{"width":360,"height":240}');
          const pos = JSON.parse(localStorage.getItem('persistentPiPPosition') || '{"x":20,"y":80}');
          setPipSize(size);
          setPipPosition(pos);
          console.log('✅ PiP synced from another tab');
        } catch (e) {
          console.error('Failed to sync PiP from storage event:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const openPiP = useCallback(async (stream) => {
    setFloatingPiP(stream);
    if (navigator.wakeLock) {
      try {
        await navigator.wakeLock.request('screen');
        console.log('✅ Wake Lock acquired for PiP');
      } catch (err) {
        console.log('Wake Lock error:', err);
      }
    }
  }, []);

  const closePiP = useCallback(() => {
    setFloatingPiP(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('persistentPiP');
      localStorage.removeItem('persistentPiPSize');
      localStorage.removeItem('persistentPiPPosition');
    }
  }, []);

  return {
    floatingPiP,
    setFloatingPiP,
    pipSize,
    setPipSize,
    pipPosition,
    setPipPosition,
    openPiP,
    closePiP,
    isHydrated,
  };
}