// src/components/admin/AuditLogsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { auditService } from '../../services/api/auditService';

const AuditLogsDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [securityAlerts, setSecurityAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    success: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  
  const [activeTab, setActiveTab] = useState('logs'); // logs, stats, security

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'logs') {
        const response = await auditService.getLogs(filters, {
          page: pagination.page,
          limit: pagination.limit,
          sortBy: 'timestamp',
          sortOrder: 'desc'
        });
        setLogs(response.logs || []);
        setPagination(prev => ({ ...prev, ...response.pagination }));
      } else if (activeTab === 'stats') {
        const statsResponse = await auditService.getStats({
          startDate: filters.startDate,
          endDate: filters.endDate
        });
        setStats(statsResponse.stats);
      } else if (activeTab === 'security') {
        const alertsResponse = await auditService.getSecurityAlerts(24);
        setSecurityAlerts(alertsResponse.alerts);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const handleExport = async () => {
    try {
      await auditService.exportLogs(filters);
      alert('Export completed successfully!');
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('success')) return 'text-green-600';
    if (action.includes('failed')) return 'text-red-600';
    if (action.includes('delete')) return 'text-red-600';
    if (action.includes('create')) return 'text-blue-600';
    if (action.includes('update')) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStatusBadge = (success) => {
    return success ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
        Success
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
        Failed
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Audit Logs Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor all system activities and security events</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'logs'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'stats'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'security'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Security Alerts
        </button>
      </div>

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Actions</option>
                  <option value="auth.login.success">Login Success</option>
                  <option value="auth.login.failed">Login Failed</option>
                  <option value="auth.signup.success">Signup</option>
                  <option value="user.create">User Create</option>
                  <option value="user.update">User Update</option>
                  <option value="user.delete">User Delete</option>
                  <option value="user.role.change">Role Change</option>
                  <option value="sermon.create">Sermon Create</option>
                  <option value="blog.create">Blog Create</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Type
                </label>
                <select
                  value={filters.resourceType}
                  onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="user">User</option>
                  <option value="sermon">Sermon</option>
                  <option value="blog">Blog</option>
                  <option value="event">Event</option>
                  <option value="gallery">Gallery</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.success}
                  onChange={(e) => handleFilterChange('success', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Success</option>
                  <option value="false">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <input
                type="text"
                placeholder="Search by email, name, endpoint..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading audit logs...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-600">
                <p>Error: {error}</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p>No audit logs found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="text-gray-900">{log.userName || 'N/A'}</div>
                            <div className="text-gray-500">{log.userEmail || 'Anonymous'}</div>
                            <div className="text-gray-400 text-xs">{log.userRole || 'N/A'}</div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="text-gray-900">{log.resourceType}</div>
                            {log.resourceName && (
                              <div className="text-gray-500 text-xs">{log.resourceName}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              log.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                              log.method === 'POST' ? 'bg-green-100 text-green-800' :
                              log.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                              log.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.method}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.ipAddress}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusBadge(log.success)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-blue-600">{stats.totalActions}</div>
              <div className="text-gray-600 mt-2">Total Actions</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-green-600">{stats.successCount}</div>
              <div className="text-gray-600 mt-2">Successful</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-red-600">{stats.failedCount}</div>
              <div className="text-gray-600 mt-2">Failed</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-purple-600">{stats.successRate}%</div>
              <div className="text-gray-600 mt-2">Success Rate</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Top Actions</h3>
            <div className="space-y-2">
              {stats.topActions.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{item._id}</span>
                  <span className="text-gray-600">{item.count} times</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Top Users</h3>
            <div className="space-y-2">
              {stats.topUsers.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{item.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">{item.email || 'N/A'}</div>
                  </div>
                  <span className="text-gray-600">{item.count} actions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Alerts Tab */}
      {activeTab === 'security' && securityAlerts && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              Failed Login Attempts (Last 24 hours)
            </h3>
            <div className="text-2xl font-bold mb-4">{securityAlerts.failedLogins.count} IPs</div>
            <div className="space-y-2">
              {securityAlerts.failedLogins.details.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <div>
                    <div className="font-medium">{item._id}</div>
                    <div className="text-sm text-gray-600">
                      Attempts: {item.count} | Last: {new Date(item.lastAttempt).toLocaleString()}
                    </div>
                    {item.emails && item.emails.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Emails: {item.emails.join(', ')}
                      </div>
                    )}
                  </div>
                  <span className="text-red-600 font-bold">{item.count}x</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-yellow-600">
              Access Denied (Last 24 hours)
            </h3>
            <div className="text-2xl font-bold mb-4">{securityAlerts.accessDenied.count} attempts</div>
            <div className="space-y-2">
              {securityAlerts.accessDenied.details.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <div>
                    <div className="font-medium">{item.email || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">{item._id.endpoint}</div>
                    <div className="text-xs text-gray-500">
                      Last: {new Date(item.lastAttempt).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-yellow-600 font-bold">{item.count}x</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-600">
              Recent Errors (Last 24 hours)
            </h3>
            <div className="text-2xl font-bold mb-4">{securityAlerts.errors.count} errors</div>
            <div className="space-y-2">
              {securityAlerts.errors.details.slice(0, 10).map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-red-600">{item.error?.message || 'Unknown error'}</div>
                      <div className="text-sm text-gray-600 mt-1">{item.endpoint}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(item.timestamp).toLocaleString()} | {item.userEmail || 'Anonymous'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsDashboard;