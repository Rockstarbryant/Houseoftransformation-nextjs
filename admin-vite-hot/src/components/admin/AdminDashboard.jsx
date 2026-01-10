import React, { useState, createContext, useContext } from 'react';
import { 
  LayoutDashboard, BookOpen, Calendar, Newspaper, Image, Play,
  Users, UserPlus, MessageSquare, DollarSign, FileText, LogOut, 
  Home, Menu, X, Bell, Settings, TrendingUp, AlertTriangle, Clock,
  CheckCircle, ArrowUpRight, ArrowDownRight, Activity, Target
} from 'lucide-react';

// Notification Context
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationContainer notifications={notifications} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

// Notification Container
const NotificationContainer = ({ notifications }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-96 max-w-full pointer-events-none">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm animate-[slideIn_0.3s_ease-out] pointer-events-auto ${
            notif.type === 'success' ? 'bg-green-50 border-green-500 text-green-900' :
            notif.type === 'error' ? 'bg-red-50 border-red-500 text-red-900' :
            notif.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-900' :
            'bg-blue-50 border-blue-500 text-blue-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <Bell size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium flex-1">{notif.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Admin Layout Component
const ModernAdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { addNotification } = useNotification();

  const navItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sermons', path: '/sermons', label: 'Sermons', icon: BookOpen, badge: '10' },
    { id: 'events', path: '/events', label: 'Events', icon: Calendar, badge: '1' },
    { id: 'blog', path: '/blog', label: 'Blog', icon: Newspaper },
    { id: 'gallery', path: '/gallery', label: 'Gallery', icon: Image },
    { id: 'livestream', path: '/livestream', label: 'Livestream', icon: Play },
    { id: 'users', path: '/users', label: 'Members', icon: Users, badge: '6' },
    { id: 'volunteers', path: '/volunteers', label: 'Volunteers', icon: UserPlus, badgeColor: 'orange' },
    { id: 'feedback', path: '/feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'donations', path: '/donations', label: 'Donations', icon: DollarSign },
    { id: 'audit-logs', path: '/audit-logs', label: 'Audit Logs', icon: FileText },
  ];

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarOpen ? 'w-64' : 'w-20'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-blue-600 text-white">
            <div className="flex items-center justify-between">
              {isSidebarOpen && (
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Admin Panel</h2>
                  <p className="text-xs text-blue-100 mt-0.5">House of Transformation</p>
                </div>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 hover:bg-blue-700 rounded-lg transition-colors hidden lg:block"
              >
                <Menu size={20} />
              </button>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 hover:bg-blue-700 rounded-lg transition-colors lg:hidden"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {isSidebarOpen && (
                      <>
                        <span className="text-sm flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            item.badgeColor === 'orange' 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
              <Home size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="text-sm font-medium">Back to Site</span>}
            </button>

            {isSidebarOpen && (
              <div className="px-3 py-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    C
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Church Admin</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
              </div>
            )}

            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
              <LogOut size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {navItems.find(n => n.id === currentPage)?.label || 'Dashboard'}
                </h1>
                <p className="text-xs text-gray-500">
                  {currentPage === 'dashboard' 
                    ? 'Overview of your church operations' 
                    : 'Manage your church community and content'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell size={20} className="text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings size={20} className="text-gray-700" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <DashboardContent currentPage={currentPage} addNotification={addNotification} />
        </main>
      </div>
    </div>
  );
};

// Professional Dashboard Content
const DashboardContent = ({ currentPage, addNotification }) => {
  if (currentPage !== 'dashboard') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-4">
            {React.createElement(
              navItems.find(n => n.id === currentPage)?.icon || LayoutDashboard,
              { size: 40, className: 'text-blue-600' }
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {navItems.find(n => n.id === currentPage)?.label}
          </h3>
          <p className="text-gray-600 mb-6">Professional redesign of this page coming up next!</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Total Members', 
      value: '6', 
      change: '+6', 
      trend: 'up', 
      color: 'blue',
      icon: Users,
      subtitle: 'This month'
    },
    { 
      label: 'Active Members', 
      value: '6', 
      change: '100%', 
      trend: 'up', 
      color: 'green',
      icon: Activity,
      subtitle: 'Engagement rate'
    },
    { 
      label: 'Active Volunteers', 
      value: '6', 
      change: '0 hours', 
      trend: 'neutral', 
      color: 'purple',
      icon: UserPlus,
      subtitle: 'Served this month'
    },
    { 
      label: 'Pending Tasks', 
      value: '0', 
      change: 'All clear', 
      trend: 'up', 
      color: 'orange',
      icon: Clock,
      subtitle: 'Awaiting review'
    }
  ];

  const recentActivity = [
    { action: 'New member joined', user: 'John Doe', time: '2 hours ago', type: 'user' },
    { action: 'Sermon published', user: 'Pastor Smith', time: '5 hours ago', type: 'content' },
    { action: 'Event created', user: 'Admin', time: '1 day ago', type: 'event' },
    { action: 'Volunteer approved', user: 'Sarah Johnson', time: '2 days ago', type: 'volunteer' },
  ];

  const quickStats = [
    { label: 'Sermons', value: '10', change: '+2 this week', icon: BookOpen, color: 'blue' },
    { label: 'Events', value: '1', change: 'Upcoming', icon: Calendar, color: 'green' },
    { label: 'Blog Posts', value: '0', change: 'Start writing', icon: Newspaper, color: 'purple' },
    { label: 'Gallery Photos', value: '0', change: 'Add photos', icon: Image, color: 'pink' },
  ];

  const alerts = [
    { 
      type: 'warning', 
      title: 'No pending volunteer applications',
      message: 'All applications have been reviewed',
      icon: CheckCircle
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${
                  stat.color === 'blue' ? 'bg-blue-50' :
                  stat.color === 'green' ? 'bg-green-50' :
                  stat.color === 'purple' ? 'bg-purple-50' :
                  'bg-orange-50'
                }`}>
                  <Icon size={20} className={
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    'text-orange-600'
                  } />
                </div>
                {stat.trend === 'up' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <ArrowUpRight size={16} />
                    <span className="text-xs font-bold">{stat.change}</span>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const Icon = alert.icon;
            return (
              <div key={idx} className={`rounded-lg border-l-4 p-4 ${
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                alert.type === 'success' ? 'bg-green-50 border-green-500' :
                'bg-red-50 border-red-500'
              }`}>
                <div className="flex items-start gap-3">
                  <Icon size={20} className={
                    alert.type === 'warning' ? 'text-yellow-600' :
                    alert.type === 'success' ? 'text-green-600' :
                    'text-red-600'
                  } />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{alert.title}</h4>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Content Overview</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((item, idx) => (
            <button
              key={idx}
              onClick={() => addNotification(`Opening ${item.label}...`, 'info')}
              className="bg-white rounded-lg border border-gray-200 p-4 text-left hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  item.color === 'blue' ? 'bg-blue-50' :
                  item.color === 'green' ? 'bg-green-50' :
                  item.color === 'purple' ? 'bg-purple-50' :
                  'bg-pink-50'
                }`}>
                  <item.icon size={20} className={
                    item.color === 'blue' ? 'text-blue-600' :
                    item.color === 'green' ? 'text-green-600' :
                    item.color === 'purple' ? 'text-purple-600' :
                    'text-pink-600'
                  } />
                </div>
                <span className="text-2xl font-bold text-gray-900">{item.value}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{item.label}</p>
              <p className="text-xs text-gray-500">{item.change}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'user' ? 'bg-blue-500' :
                  activity.type === 'content' ? 'bg-green-500' :
                  activity.type === 'event' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Activity
          </button>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Performance Insights
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Member Engagement</span>
                <span className="text-sm font-bold text-green-600">100%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Content Publishing</span>
                <span className="text-sm font-bold text-blue-600">83%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '83%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Volunteer Participation</span>
                <span className="text-sm font-bold text-purple-600">75%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900 font-medium">📊 Your church is performing well! Keep up the great work.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// App wrapper with notification provider
const App = () => {
  return (
    <NotificationProvider>
      <ModernAdminLayout />
    </NotificationProvider>
  );
};

const navItems = [
  { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sermons', path: '/sermons', label: 'Sermons', icon: BookOpen },
  { id: 'events', path: '/events', label: 'Events', icon: Calendar },
  { id: 'blog', path: '/blog', label: 'Blog', icon: Newspaper },
  { id: 'gallery', path: '/gallery', label: 'Gallery', icon: Image },
  { id: 'livestream', path: '/livestream', label: 'Livestream', icon: Play },
  { id: 'users', path: '/users', label: 'Users', icon: Users },
  { id: 'volunteers', path: '/volunteers', label: 'Volunteers', icon: UserPlus },
  { id: 'feedback', path: '/feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'donations', path: '/donations', label: 'Donations', icon: DollarSign },
  { id: 'audit-logs', path: '/audit-logs', label: 'Audit Logs', icon: FileText },
];

export default App;