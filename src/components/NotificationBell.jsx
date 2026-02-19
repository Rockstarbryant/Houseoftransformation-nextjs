'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import tokenService from '@/lib/tokenService';

/**
 * Real-time Notification Bell with SSE + safeguards
 */
export default function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [authError, setAuthError] = useState(false);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const BASE_RECONNECT_DELAY = 2000;

  const connectToSSE = () => {
    // Don't retry if we have auth errors
    if (authError) {
      console.warn('[NotificationBell] Auth error detected - skipping reconnect');
      return;
    }

    // Prevent connecting if already trying too many times
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[NotificationBell] Max reconnect attempts reached. Giving up.');
      return;
    }

    const token = tokenService.getToken();
    
    // ✅ Validate token exists and is not expired
    if (!token || !tokenService.isAuthenticated()) {
      console.warn('[NotificationBell] No valid auth token - skipping SSE');
      setIsConnected(false);
      setAuthError(true);
      return;
    }

    // ✅ Check token expiry
    if (tokenService.isTokenExpiringSoon()) {
      console.warn('[NotificationBell] Token expiring soon - skip SSE connection');
      setAuthError(true);
      return;
    }

    console.log(`[NotificationBell] Connecting to SSE (attempt ${reconnectAttempts.current + 1})`);

    // Close old connection cleanly
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // ✅ FIXED: Correct API URL construction
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const url = `${baseURL}/announcements/stream?token=${encodeURIComponent(token)}`;

    console.log('[NotificationBell] SSE URL:', url);

    const es = new EventSource(url);

    es.onopen = () => {
      console.log('[NotificationBell] ✅ SSE connected');
      setIsConnected(true);
      setAuthError(false);
      reconnectAttempts.current = 0; // reset counter
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.debug('[SSE] ↓', data.type);

        switch (data.type) {
          case 'connected':
            setIsConnected(true);
            setAuthError(false);
            break;
            
          case 'unreadCount':
            setUnreadCount(data.count ?? 0);
            break;
            
          case 'new_announcement':
            setUnreadCount((c) => c + 1);
            // Optional browser notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('New Announcement', {
                body: data.announcement?.title || 'Check announcements',
              });
            }
            break;
            
          case 'announcement_deleted':
          case 'announcement_updated':
            // Refresh count via REST as fallback
            fetchUnreadCount();
            break;
            
          default:
            // ignore unknown types
        }
      } catch (err) {
        console.error('[NotificationBell] Parse error:', err, event.data);
      }
    };

    // REPLACE the onerror handler in connectToSSE():
    es.onerror = (err) => {
      console.error('[NotificationBell] SSE error:', err);
      setIsConnected(false);
      es.close();

      reconnectAttempts.current += 1;

      if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
        console.warn('[NotificationBell] Permanently stopping reconnect attempts.');
        setAuthError(true); // Only give up after max attempts
        return;
      }

      const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current - 1), 30000);
      console.log(`[NotificationBell] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
      reconnectTimeoutRef.current = setTimeout(connectToSSE, delay);
    };

    eventSourceRef.current = es;
  };

  const fetchUnreadCount = async () => {
    try {
      const token = tokenService.getToken();
      if (!token || !tokenService.isAuthenticated()) {
        console.warn('[NotificationBell] No valid token for unread count fetch');
        return;
      }

      // ✅ FIXED: Correct API URL construction
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseURL}/announcements/count/unread`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 404) {
          console.warn('[NotificationBell] /count/unread endpoint not found (404)');
        } else if (res.status === 401) {
          console.warn('[NotificationBell] Unauthorized on unread count fetch');
          setAuthError(true);
          // Clear invalid token
          tokenService.clearAll();
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch (err) {
      console.error('[NotificationBell] Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    // ✅ Only connect if we have valid auth
    const token = tokenService.getToken();
    if (!token || !tokenService.isAuthenticated()) {
      console.warn('[NotificationBell] No authentication - skipping SSE setup');
      setAuthError(true);
      return;
    }

    // 1. Try SSE
    connectToSSE();
    
    // 2. Always have a fallback count
    fetchUnreadCount();

    // Optional: request browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []); // Run once on mount

  const handleClick = () => {
    router.push('/portal/announcements');
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      aria-label="Notifications"
      title={authError ? 'Notifications offline - authentication required' : `${unreadCount} unread notifications`}
    >
      <Bell size={20} className="text-slate-600 dark:text-slate-400" />

      {unreadCount > 0 && !authError && (
        <span className="absolute top-0 right-0 min-w-[20px] h-5 flex items-center justify-center px-1 bg-red-500 text-white text-xs font-bold rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {/* Reconnecting indicator */}
      {!isConnected && !authError && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS && (
        <span
          className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"
          title="Reconnecting to notifications..."
        />
      )}

      {/* Auth error indicator */}
      {authError && (
        <span
          className="absolute bottom-0 right-0 w-2 h-2 bg-red-500 rounded-full"
          title="Authentication required for notifications"
        />
      )}

      {/* Max attempts reached */}
      {!authError && reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS && (
        <span
          className="absolute bottom-0 right-0 w-2 h-2 bg-gray-500 rounded-full"
          title="Notifications offline"
        />
      )}
    </button>
  );
}