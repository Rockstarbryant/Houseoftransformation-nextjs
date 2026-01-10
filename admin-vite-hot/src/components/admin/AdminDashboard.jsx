import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Edit, 
  Users, 
  BookOpen, 
  Calendar, 
  Newspaper, 
  Image, 
  Play, 
  TrendingUp, 
  ArrowRight,
  UserPlus,
  Clock
} from 'lucide-react';
import Card from '../common/Card';
import { sermonService } from '../../services/api/sermonService';
import { eventService } from '../../services/api/eventService';
import { volunteerService } from '../../services/api/volunteerService';
import { feedbackService } from '../../services/api/feedbackService';
import api from '../../services/api/authService';
import { MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  const [realStats, setRealStats] = useState({
    totalSermons: 0,
    totalEvents: 0,
    totalMembers: 0,
    newMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    adminCount: 0,
    totalVolunteerApplications: 0,
    pendingApplications: 0,
    approvedVolunteers: 0,
    totalVolunteerHours: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackStats, setFeedbackStats] = useState({ total: 0, positive: 0, negative: 0 });

  const fetchRealData = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ FIXED: Make ALL requests in parallel using Promise.all()
      // This loads everything at the same time instead of one after another
      const [sermonsData, eventsData, usersResponse, volStatsData, feedbackData] = await Promise.all([
        // Get sermons
        sermonService.getSermons().catch(err => {
          console.error('Error fetching sermons:', err);
          return { sermons: [] };
        }),

        // Get events
        eventService.getEvents().catch(err => {
          console.error('Error fetching events:', err);
          return { events: [] };
        }),

        // Get users
        api.get('/users').catch(err => {
          console.error('Error fetching users:', err);
          return { data: { users: [] } };
        }),

        // Get volunteer stats
        volunteerService.getStats().catch(err => {
          console.error('Error fetching volunteer stats:', err);
          return { success: false, stats: {} };
        }),

        // Get feedback stats
        feedbackService.getAllFeedback().catch(err => {
          console.error('Error fetching feedback:', err);
          return { feedback: [] };
        })
      ]);

      // Process users data
      const users = usersResponse.data?.users || [];
      const activeCount = users.filter(u => u.isActive).length;
      const inactiveCount = users.filter(u => !u.isActive).length;
      const adminCount = users.filter(u => u.role === 'admin').length;
      const recentUsersData = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Process volunteer stats
      const volunteerStats = volStatsData.success && volStatsData.stats ? {
        totalApplications: volStatsData.stats.totalApplications || 0,
        pendingApplications: volStatsData.stats.pendingApplications || 0,
        approvedVolunteers: volStatsData.stats.approvedVolunteers || 0,
        totalHours: volStatsData.stats.totalHours || 0
      } : {
        totalApplications: 0,
        pendingApplications: 0,
        approvedVolunteers: 0,
        totalHours: 0
      };

      // Set all stats at once
      setRealStats({
        totalSermons: sermonsData.sermons?.length || 0,
        totalEvents: eventsData.events?.length || 0,
        totalMembers: users.length,
        newMembers: users.filter(u => {
          const joinDate = new Date(u.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return joinDate > thirtyDaysAgo;
        }).length,
        activeMembers: activeCount,
        inactiveMembers: inactiveCount,
        adminCount: adminCount,
        totalVolunteerApplications: volunteerStats.totalApplications,
        pendingApplications: volunteerStats.pendingApplications,
        approvedVolunteers: volunteerStats.approvedVolunteers,
        totalVolunteerHours: volunteerStats.totalHours
      });

      setRecentUsers(recentUsersData);

      // Process feedback stats
      if (feedbackData?.feedback) {
        setFeedbackStats({
          total: feedbackData.feedback.length,
          positive: feedbackData.feedback.filter(f => f.rating >= 4).length || 0,
          negative: feedbackData.feedback.filter(f => f.rating <= 2).length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealData();
  }, [fetchRealData]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your church community and content</p>
        </div>
        <a href="/" className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold transition">
          ← Back to Site
        </a>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      {!loading && (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <BarChart size={28} /> Key Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-blue-900">
                <p className="text-gray-600 text-sm mb-2">Total Members</p>
                <p className="text-3xl font-bold text-blue-900">{realStats.totalMembers}</p>
                <p className="text-xs text-green-600 mt-2">+{realStats.newMembers} this month</p>
              </Card>

              <Card className="border-l-4 border-green-600">
                <p className="text-gray-600 text-sm mb-2">Active Members</p>
                <p className="text-3xl font-bold text-green-600">{realStats.activeMembers}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {realStats.totalMembers > 0 ? Math.round((realStats.activeMembers / realStats.totalMembers) * 100) : 0}% active
                </p>
              </Card>

              <Card className="border-l-4 border-purple-600">
                <p className="text-gray-600 text-sm mb-2">Active Volunteers</p>
                <p className="text-3xl font-bold text-purple-600">{realStats.approvedVolunteers}</p>
                <p className="text-xs text-gray-500 mt-2">{realStats.totalVolunteerHours} hours served</p>
              </Card>

              <Card className="border-l-4 border-orange-600">
                <p className="text-gray-600 text-sm mb-2">Pending Applications</p>
                <p className="text-3xl font-bold text-orange-600">{realStats.pendingApplications}</p>
                <p className="text-xs text-gray-500 mt-2">Need review</p>
              </Card>
            </div>
          </div>

          {/* Volunteer Alert */}
          {realStats.pendingApplications > 0 && (
            <div className="mb-8">
              <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Clock className="text-orange-600" size={32} />
                  <div>
                    <h3 className="text-lg font-bold text-orange-900 mb-1">
                      {realStats.pendingApplications} Volunteer Application{realStats.pendingApplications !== 1 ? 's' : ''} Awaiting Review
                    </h3>
                    <p className="text-sm text-orange-700">
                      Review and approve volunteer applications to grow your ministry teams
                    </p>
                  </div>
                </div>
                <Link 
                  to="/volunteers"
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition flex items-center gap-2 whitespace-nowrap"
                >
                  Review Now
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          )}

          {/* Content Stats */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Content Library</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="text-center">
                <BookOpen className="mx-auto text-blue-900 mb-2" size={28} />
                <p className="text-gray-600 text-sm mb-1">Sermons</p>
                <p className="text-2xl font-bold text-blue-900">{realStats.totalSermons}</p>
              </Card>

              <Card className="text-center">
                <Calendar className="mx-auto text-blue-900 mb-2" size={28} />
                <p className="text-gray-600 text-sm mb-1">Events</p>
                <p className="text-2xl font-bold text-blue-900">{realStats.totalEvents}</p>
              </Card>

              <Card className="text-center">
                <Newspaper className="mx-auto text-blue-900 mb-2" size={28} />
                <p className="text-gray-600 text-sm mb-1">Blog Posts</p>
                <p className="text-2xl font-bold text-blue-900">-</p>
              </Card>
            </div>
          </div>

          {/* Main Management Sections */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* User Management */}
            <Card className="md:col-span-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <Users size={24} /> Member Management
                </h3>
                <Users className="text-blue-900" size={24} />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Total Members</span>
                  <span className="font-bold text-blue-900 text-lg">{realStats.totalMembers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Active</span>
                  <span className="font-bold text-green-600 text-lg">{realStats.activeMembers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Leadership</span>
                  <span className="font-bold text-purple-600 text-lg">{realStats.adminCount}</span>
                </div>
                {realStats.inactiveMembers > 0 && (
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <span className="font-semibold text-gray-700">Inactive</span>
                    <span className="font-bold text-orange-600 text-lg">{realStats.inactiveMembers}</span>
                  </div>
                )}
              </div>

              <Link to="/users" className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors block text-center flex items-center justify-center gap-2 group">
                Manage All Members
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Card>

            {/* Content Management */}
            <Card className="md:col-span-1">
              <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <Edit size={24} /> Content Management
              </h3>
              <div className="space-y-2">
                <Link 
                  to="/sermons" 
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 transition-colors flex items-center gap-3 group"
                >
                  <BookOpen size={20} className="text-blue-900 group-hover:scale-110 transition-transform" />
                  <span className="flex-grow font-semibold text-gray-800">Manage Sermons</span>
                  <span className="text-sm font-bold text-blue-900 bg-white px-2 py-1 rounded">{realStats.totalSermons}</span>
                </Link>

                <Link 
                  to="/events" 
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-50 to-transparent hover:from-green-100 transition-colors flex items-center gap-3 group"
                >
                  <Calendar size={20} className="text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="flex-grow font-semibold text-gray-800">Manage Events</span>
                  <span className="text-sm font-bold text-green-600 bg-white px-2 py-1 rounded">{realStats.totalEvents}</span>
                </Link>

                <Link 
                  to="/blog" 
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-50 to-transparent hover:from-purple-100 transition-colors flex items-center gap-3 group"
                >
                  <Newspaper size={20} className="text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="flex-grow font-semibold text-gray-800">Manage Blog Posts</span>
                  <span className="text-sm font-bold text-purple-600 bg-white px-2 py-1 rounded">-</span>
                </Link>

                <Link 
                  to="/gallery" 
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-50 to-transparent hover:from-yellow-100 transition-colors flex items-center gap-3 group"
                >
                  <Image size={20} className="text-yellow-600 group-hover:scale-110 transition-transform" />
                  <span className="flex-grow font-semibold text-gray-800">Manage Gallery</span>
                  <span className="text-sm font-bold text-yellow-600 bg-white px-2 py-1 rounded">-</span>
                </Link>

                <Link 
                  to="/livestream" 
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-50 to-transparent hover:from-red-100 transition-colors flex items-center gap-3 group"
                >
                  <Play size={20} className="text-red-600 group-hover:scale-110 transition-transform" />
                  <span className="flex-grow font-semibold text-gray-800">Manage Live Stream</span>
                  <span className="text-sm font-bold text-red-600 bg-white px-2 py-1 rounded">Live</span>
                </Link>

                <Link 
                  to="/volunteers" 
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-50 to-transparent hover:from-indigo-100 transition-colors flex items-center gap-3 group relative"
                >
                  <UserPlus size={20} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span className="flex-grow font-semibold text-gray-800">Volunteer Applications</span>
                  <span className="text-sm font-bold text-indigo-600 bg-white px-2 py-1 rounded">{realStats.totalVolunteerApplications}</span>
                  {realStats.pendingApplications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                      {realStats.pendingApplications}
                    </span>
                  )}
                </Link>

                <Link 
                  to="/feedback" 
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-pink-50 to-transparent hover:from-pink-100 transition-colors flex items-center gap-3 group"
                >
                  <MessageSquare size={20} className="text-pink-600" />
                  <span className="flex-grow font-semibold text-gray-800">Feedback & Testimonies</span>
                  <span className="text-sm font-bold text-pink-600 bg-white px-2 py-1 rounded">
                    {feedbackStats.total}
                  </span>  
                </Link>
              </div>
            </Card>
          </div>

          {/* Recent Members */}
          {recentUsers.length > 0 && (
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <TrendingUp size={24} /> Recently Joined Members
                </h3>
                <Link to="/users" className="text-blue-900 hover:underline font-semibold text-sm">
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4 flex-grow">
                      <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'pastor' ? 'bg-red-100 text-red-800' :
                          user.role === 'volunteer' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Joined {formatDate(user.createdAt)}</p>
                      </div>
                      <Link
                        to={`/profile/${user._id}`}
                        className="p-2 text-blue-900 hover:bg-blue-100 rounded-lg transition"
                        title="View profile"
                      >
                        <Users size={20} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;