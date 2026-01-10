import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Calendar, Newspaper, Image, Play,
  Users, UserPlus, MessageSquare, DollarSign, FileText, LogOut, Home
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuthContext();

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
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-blue-900 text-white flex flex-col fixed h-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-sm text-blue-200 mt-1">House of Transformation</p>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition ${
                  isActive ? 'bg-white text-blue-900' : 'text-white hover:bg-blue-800'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <a href="/" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition mb-3 w-full">
            <Home size={16} />
            Back to Site
          </a>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-semibold text-sm truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-blue-200">{user?.role || 'Administrator'}</p>
            </div>
          </div>

          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;