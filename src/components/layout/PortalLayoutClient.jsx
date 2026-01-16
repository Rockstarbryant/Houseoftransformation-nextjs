'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loader from '@/components/common/Loader';
import PortalSidebar from '@/components/layout/PortalSidebar';
import PortalHeader from '@/components/layout/PortalHeader';

/**
 * Portal Layout Client Component
 * Handles client-side interactivity
 */
export default function PortalLayoutClient({ children }) {
  const { user, isLoading, checkAuth } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      {/* Sidebar */}
      <aside className={`
        fixed md:static left-0 top-0 h-full z-40
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-20'}
        bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
      `}>
        <PortalSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
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

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}