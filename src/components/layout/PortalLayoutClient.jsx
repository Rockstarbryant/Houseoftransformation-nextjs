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
  // Start with sidebar closed on all devices
  useEffect(() => {
    const handleResize = () => {
      // Keep sidebar state as user set it, don't auto-open on desktop
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false); // Only close on mobile if it was open
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Show loading while checking auth
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  // Show loading while checking auth
  /*
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
  }  */

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 overflow-hidden">
      {/* Sidebar - Toggleable on all devices */}
      <aside className={`
        fixed left-0 top-0 h-full z-40
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64
        bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
      `}>
        <PortalSidebar 
          isOpen={true} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
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

      {/* Sidebar overlay - Click to close (all devices) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}