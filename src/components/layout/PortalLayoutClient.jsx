'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loader from '@/components/common/Loader';
import PortalSidebar from '@/components/layout/PortalSidebar';
import PortalHeader from '@/components/layout/PortalHeader';

/**
 * Portal Layout Client Component
 * Handles client-side interactivity with mobile-responsive sidebar
 */
export default function PortalLayoutClient({ children }) {
  const { user, isLoading, checkAuth } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile

  useEffect(() => {
    // Re-verify user on client side
    if (!isLoading && !user) {
      checkAuth().then((hasUser) => {
        if (!hasUser) {
          router.push('/login?redirect=/portal');
        }
      });
    }
  }, [user, isLoading, checkAuth, router]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      // Auto-open sidebar on desktop (md breakpoint = 768px)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <Loader 
        fullScreen 
        text="Loading your portal..." 
      />
    );
  }

  // Show loading if no user yet
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-600">Verifying credentials...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 overflow-hidden">
      {/* Sidebar - Mobile: Slides in from left, Desktop: Always visible */}
      <aside className={`
        fixed md:static left-0 top-0 h-full z-40
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-64
        bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
      `}>
        <PortalSidebar 
          isOpen={true} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex-shrink-0">
          <PortalHeader 
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay - Click to close */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}