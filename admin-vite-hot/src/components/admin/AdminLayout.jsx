import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Calendar, Newspaper, Image, Play,
  Users, UserPlus, MessageSquare, DollarSign, FileText, LogOut, Home,
  Menu, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuthContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/sermons', label: 'Sermons', icon: BookOpen },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/blog', label: 'Blog', icon: Newspaper },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/livestream', label: 'Livestream', icon: Play },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/volunteers', label: 'Volunteers', icon: UserPlus },
    { path: '/feedback', label: 'Feedback', icon: MessageSquare },
    { path: '/donations', label: 'Donations', icon: DollarSign },
    { path: '/audit-logs', label: 'Audit Logs', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`
          bg-blue-900 text-white flex flex-col fixed inset-y-0 left-0 z-50
          transition-transform duration-300 ease-in-out lg:transition-all lg:duration-300
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isSidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Header of sidebar */}
        <div className="p-4 flex items-center justify-between relative">
          {isSidebarOpen ? (
            <div>
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <p className="text-xs text-blue-200 mt-0.5">House of Transformation</p>
            </div>
          ) : (
            <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold mx-auto">
              HT
            </div>
          )}

          {/* Desktop collapse/expand button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:block p-1.5 hover:bg-blue-800 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>

          {/* Mobile close button */}
          {isMobileSidebarOpen && (
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden absolute right-4 top-5 p-2 rounded-md hover:bg-blue-800 text-white"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 pt-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition
                  ${isActive 
                    ? 'bg-white/15 text-white' 
                    : 'text-blue-100 hover:bg-blue-800'
                  }
                  ${!isSidebarOpen && 'justify-center'}
                `}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-800 mt-auto">
          {isSidebarOpen ? (
            <>
              <a 
                href="/" 
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition mb-4 w-full"
              >
                <Home size={16} />
                Back to Site
              </a>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold flex-shrink-0">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-blue-200 truncate">{user?.role || 'Administrator'}</p>
                </div>
              </div>

              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-6 py-4">
              <button 
                onClick={handleLogout}
                className="p-3 hover:bg-blue-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={24} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col lg:${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-blue-900 text-white shadow-md">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-blue-800"
            >
              <Menu size={24} />
            </button>

            {/* Desktop - show menu button when sidebar is collapsed */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hidden lg:block p-2 rounded-md hover:bg-blue-800"
              >
                <Menu size={24} />
              </button>
            )}

            <div className="text-lg font-semibold flex-1 text-center lg:text-left">
              Admin Dashboard
            </div>

            <div className="flex items-center gap-4">
              {/* Space for future user menu, notifications etc */}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;