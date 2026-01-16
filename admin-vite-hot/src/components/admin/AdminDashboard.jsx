import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock,
  ArrowRight,
  AlertCircle,
  Activity,
  BookOpen,
  Calendar,
  Newspaper,
  UserPlus,
  MessageSquare,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import Card from '../common/Card';
import { sermonService } from '../../services/api/sermonService';
import { eventService } from '../../services/api/eventService';
import { volunteerService } from '../../services/api/volunteerService';
import { feedbackService } from '../../services/api/feedbackService';
import api from '../../services/api/authService';

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

      // Make ALL requests in parallel using Promise.all()
      const [sermonsData, eventsData, usersResponse, volStatsData, feedbackData] = await Promise.all([
        sermonService.getSermons().catch(err => {
          console.error('Error fetching sermons:', err);
          return { sermons: [] };
        }),
        eventService.getEvents().catch(err => {
          console.error('Error fetching events:', err);
          return { events: [] };
        }),
        api.get('/users').catch(err => {
          console.error('Error fetching users:', err);
          return { data: { users: [] } };
        }),
        volunteerService.getStats().catch(err => {
          console.error('Error fetching volunteer stats:', err);
          return { success: false, stats: {} };
        }),
        feedbackService.getAllFeedback().catch(err => {
          console.error('Error fetching feedback:', err);
          return { feedback: [] };
        })
      ]);

      // Process users data
      const users = usersResponse.data?.users || [];
      const activeCount = users.filter(u => u.isActive).length;
      const inactiveCount = users.filter(u => !u.isActive).length;
      const adminCount = users.filter(u => u.role?.name === 'admin').length;
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

  // Calculate engagement rate
  const engagementRate = realStats.totalMembers > 0 
    ? Math.round((realStats.activeMembers / realStats.totalMembers) * 100) 
    : 0;

   // Add these utility functions at the TOP of AdminDashboard.jsx, BEFORE the component definition

const getRoleDisplayName = (role) => {
  if (!role) return 'Unknown';
  
  // If role is an object with a 'name' property
  if (typeof role === 'object' && role.name) {
    return role.name.replace(/_/g, ' ').toUpperCase();
  }
  
  // If role is a string
  if (typeof role === 'string') {
    return role.replace(/_/g, ' ').toUpperCase();
  }
  
  return 'Unknown';
};

const getRoleColor = (role) => {
  // Extract role name from object or string
  let roleName = '';
  
  if (typeof role === 'object' && role.name) {
    roleName = role.name;
  } else if (typeof role === 'string') {
    roleName = role;
  }
  
  const colors = {
    'admin': 'bg-purple-100 text-purple-800',
    'pastor': 'bg-red-100 text-red-800',
    'bishop': 'bg-orange-100 text-orange-800',
    'volunteer': 'bg-indigo-100 text-indigo-800',
    'usher': 'bg-blue-100 text-blue-800',
    'worship_team': 'bg-pink-100 text-pink-800',
    'member': 'bg-gray-100 text-gray-800'
  };
  
  return colors[roleName] || 'bg-gray-100 text-gray-800';
};

  return (
    <div className="w-full mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Overview of your church operations</p>
          </div>
          <Link 
            to="/" 
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            ← Back to Site
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {/* Key Metrics - Top Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Members */}
            <Card className="border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpRight size={16} />
                  <span className="text-xs font-bold">+{realStats.newMembers}</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{realStats.totalMembers}</h3>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </Card>

            {/* Active Members */}
            <Card className="border-l-4 border-green-600 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Activity className="text-green-600" size={20} />
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <span className="text-xs font-bold">{engagementRate}%</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{realStats.activeMembers}</h3>
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-xs text-gray-500 mt-1">Engagement rate</p>
            </Card>

            {/* Active Volunteers */}
            <Card className="border-l-4 border-purple-600 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <UserPlus className="text-purple-600" size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{realStats.approvedVolunteers}</h3>
              <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
              <p className="text-xs text-gray-500 mt-1">{realStats.totalVolunteerHours} hours served</p>
            </Card>

            {/* Pending Applications */}
            <Card className="border-l-4 border-orange-600 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="text-orange-600" size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{realStats.pendingApplications}</h3>
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
            </Card>
          </div>

          {/* Alert for Pending Applications */}
          {realStats.pendingApplications > 0 && (
            <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-orange-600 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-orange-900">
                      {realStats.pendingApplications} Volunteer Application{realStats.pendingApplications !== 1 ? 's' : ''} Awaiting Review
                    </h3>
                    <p className="text-sm text-orange-700">
                      Review and approve volunteer applications to grow your ministry teams
                    </p>
                  </div>
                </div>
                <Link 
                  to="/volunteers"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition flex items-center gap-2 whitespace-nowrap"
                >
                  Review Now
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* No Pending Alert */}
          {realStats.pendingApplications === 0 && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <div>
                  <h3 className="font-bold text-green-900">All Clear!</h3>
                  <p className="text-sm text-green-700">No pending volunteer applications. All applications have been reviewed.</p>
                </div>
              </div>
            </div>
          )}

          {/* Content Overview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Content Overview</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/sermons" className="group">
                <Card className="text-center hover:shadow-lg hover:border-blue-300 transition-all">
                  <div className="inline-flex p-3 bg-blue-50 rounded-lg mb-3">
                    <BookOpen className="text-blue-600" size={24} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{realStats.totalSermons}</p>
                  <p className="text-sm font-medium text-gray-600">Sermons</p>
                  <p className="text-xs text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">View all →</p>
                </Card>
              </Link>

              <Link to="/events" className="group">
                <Card className="text-center hover:shadow-lg hover:border-green-300 transition-all">
                  <div className="inline-flex p-3 bg-green-50 rounded-lg mb-3">
                    <Calendar className="text-green-600" size={24} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{realStats.totalEvents}</p>
                  <p className="text-sm font-medium text-gray-600">Events</p>
                  <p className="text-xs text-green-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">View all →</p>
                </Card>
              </Link>

              <Link to="/blog" className="group">
                <Card className="text-center hover:shadow-lg hover:border-purple-300 transition-all">
                  <div className="inline-flex p-3 bg-purple-50 rounded-lg mb-3">
                    <Newspaper className="text-purple-600" size={24} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">-</p>
                  <p className="text-sm font-medium text-gray-600">Blog Posts</p>
                  <p className="text-xs text-purple-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Start writing →</p>
                </Card>
              </Link>

              <Link to="/feedback" className="group">
                <Card className="text-center hover:shadow-lg hover:border-pink-300 transition-all">
                  <div className="inline-flex p-3 bg-pink-50 rounded-lg mb-3">
                    <MessageSquare className="text-pink-600" size={24} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{feedbackStats.total}</p>
                  <p className="text-sm font-medium text-gray-600">Feedback</p>
                  <p className="text-xs text-pink-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">View all →</p>
                </Card>
              </Link>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Member Management */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Member Management</h3>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Members</span>
                  <span className="text-lg font-bold text-blue-600">{realStats.totalMembers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Active</span>
                  <span className="text-lg font-bold text-green-600">{realStats.activeMembers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Leadership</span>
                  <span className="text-lg font-bold text-purple-600">{realStats.adminCount}</span>
                </div>
                {realStats.inactiveMembers > 0 && (
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <span className="text-sm font-medium text-gray-700">Inactive</span>
                    <span className="text-lg font-bold text-orange-600">{realStats.inactiveMembers}</span>
                  </div>
                )}
              </div>

              <Link 
                to="/users" 
                className="w-full block text-center px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Manage All Members
              </Link>
            </Card>

            {/* Performance Insights */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-green-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Performance Insights</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Member Engagement</span>
                    <span className="text-sm font-bold text-green-600">{engagementRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500" 
                      style={{ width: `${engagementRate}%` }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Volunteer Participation</span>
                    <span className="text-sm font-bold text-purple-600">
                      {realStats.totalMembers > 0 
                        ? Math.round((realStats.approvedVolunteers / realStats.totalMembers) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${realStats.totalMembers > 0 
                          ? Math.round((realStats.approvedVolunteers / realStats.totalMembers) * 100) 
                          : 0}%` 
                      }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Feedback Satisfaction</span>
                    <span className="text-sm font-bold text-blue-600">
                      {feedbackStats.total > 0 
                        ? Math.round((feedbackStats.positive / feedbackStats.total) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${feedbackStats.total > 0 
                          ? Math.round((feedbackStats.positive / feedbackStats.total) * 100) 
                          : 0}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-medium">
                  📊 {engagementRate >= 80 
                    ? 'Excellent engagement! Keep up the great work.' 
                    : engagementRate >= 50
                    ? 'Good engagement. Consider ways to increase member participation.'
                    : 'Focus on engagement strategies to connect with more members.'}
                </p>
              </div>
            </Card>
          </div>

          {/* Recently Joined Members */}
          {/* Recently Joined Members */}
{recentUsers.length > 0 && (
  <Card>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <TrendingUp size={24} className="text-blue-600" />
        Recently Joined Members
      </h3>
      <Link to="/users" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
        View All →
      </Link>
    </div>

    <div className="space-y-3">
      {recentUsers.map((user) => {
        // Safely extract role display info
        const roleDisplay = getRoleDisplayName(user.role);
        const roleColor = getRoleColor(user.role);
        
        return (
          <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${roleColor}`}>
                {roleDisplay}
              </span>
              <p className="text-xs text-gray-500 mt-1">Joined {formatDate(user.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  </Card>
)}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;