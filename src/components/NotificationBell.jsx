'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { tokenService } from '@/services/tokenService';

/**
 * Real-time Notification Bell with SSE
 * Shows unread announcement count with live updates
 */
export default function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);

  // Connect to SSE stream
  const connectToSSE = () => {
    try {
      const token = tokenService.getToken();
      
      if (!token) {
        console.log('[NotificationBell] No token available');
        return;
      }

      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      console.log('[NotificationBell] Connecting to SSE stream...');

      // Create EventSource with auth token
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // EventSource doesn't support custom headers, so we pass token as query param
      const url = `${baseURL}/api/announcements/stream?token=${encodeURIComponent(token)}`;
      
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log('[NotificationBell] SSE connection established');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[NotificationBell] Received SSE event:', data.type);

          switch (data.type) {
            case 'connected':
              setIsConnected(true);
              break;
            
            case 'unreadCount':
              setUnreadCount(data.count);
              break;
            
            case 'new_announcement':
              // Increment unread count for new announcement
              setUnreadCount(prev => prev + 1);
              
              // Optional: Show browser notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Announcement', {
                  body: data.announcement.title,
                  icon: '/favicon.ico',
                  tag: data.announcement._id
                });
              }
              break;
            
            case 'announcement_updated':
              // Could trigger a refresh if needed
              break;
            
            case 'announcement_deleted':
              // Might need to adjust unread count
              fetchUnreadCount();
              break;
          }
        } catch (error) {
          console.error('[NotificationBell] Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[NotificationBell] SSE connection error:', error);
        setIsConnected(false);
        eventSource.close();

        // Attempt to reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current += 1;

        console.log(`[NotificationBell] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectToSSE();
        }, delay);
      };

      eventSourceRef.current = eventSource;

    } catch (error) {
      console.error('[NotificationBell] Error connecting to SSE:', error);
    }
  };

  // Fetch unread count via REST API (fallback)
  const fetchUnreadCount = async () => {
    try {
      const token = tokenService.getToken();
      
      if (!token) return;

      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseURL}/api/announcements/count/unread`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('[NotificationBell] Error fetching unread count:', error);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Initialize
  useEffect(() => {
    connectToSSE();
    fetchUnreadCount();
    requestNotificationPermission();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Handle click
  const handleClick = () => {
    router.push('/portal/announcements');
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      aria-label="Notifications"
    >
      <Bell size={20} className="text-slate-600 dark:text-slate-400" />
      
      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 min-w-[20px] h-5 flex items-center justify-center px-1 bg-red-500 text-white text-xs font-bold rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {/* Connection Indicator (only show when disconnected) */}
      {!isConnected && (
        <span className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" 
          title="Reconnecting..." 
        />
      )}
    </button>
  );
}