// src/services/api/analyticsService.js
import api from '@/lib/api';

/**
 * Analytics Service
 * Handles all analytics-related API calls
 */

// ============================================
// GET ANALYTICS DATA
// ============================================

/**
 * Get overview dashboard stats
 */
export const getOverview = async () => {
  try {
    const response = await api.get('/analytics/overview');
    return response.data;
  } catch (error) {
    console.error('[AnalyticsService] Get overview error:', error);
    throw error;
  }
};

/**
 * Get user analytics
 */
export const getUserAnalytics = async () => {
  try {
    const response = await api.get('/analytics/users');
    return response.data;
  } catch (error) {
    console.error('[AnalyticsService] Get user analytics error:', error);
    throw error;
  }
};

/**
 * Get content analytics (sermons, blogs, gallery)
 */
export const getContentAnalytics = async () => {
  try {
    const response = await api.get('/analytics/content');
    return response.data;
  } catch (error) {
    console.error('[AnalyticsService] Get content analytics error:', error);
    throw error;
  }
};

/**
 * Get engagement analytics (feedback, volunteers, events)
 */
export const getEngagementAnalytics = async () => {
  try {
    const response = await api.get('/analytics/engagement');
    return response.data;
  } catch (error) {
    console.error('[AnalyticsService] Get engagement analytics error:', error);
    throw error;
  }
};

/**
 * Get recent activity timeline
 * @param {number} limit - Number of activities to fetch (default: 20)
 */
export const getRecentActivity = async (limit = 20) => {
  try {
    const response = await api.get(`/analytics/activity?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('[AnalyticsService] Get activity error:', error);
    throw error;
  }
};

/**
 * Get growth trends over time
 * @param {string} period - Time period ('7days', '30days', '6months', '1year')
 */
export const getGrowthTrends = async (period = '6months') => {
  try {
    const response = await api.get(`/analytics/trends?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('[AnalyticsService] Get trends error:', error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format large numbers with K, M suffixes
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 100;
  return (((current - previous) / previous) * 100).toFixed(1);
};

/**
 * Format month name from number
 */
export const getMonthName = (monthNum) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNum - 1] || 'Unknown';
};

/**
 * Format date for charts
 */
export const formatChartDate = (dateObj) => {
  if (dateObj.day) {
    return `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`;
  }
  return `${getMonthName(dateObj.month)} ${dateObj.year}`;
};

/**
 * Prepare data for line charts
 */
export const prepareLineChartData = (data, labelKey = 'date', valueKey = 'count') => {
  return data.map(item => ({
    label: typeof item._id === 'object' ? formatChartDate(item._id) : item._id,
    value: item[valueKey] || item.count || 0
  }));
};

/**
 * Prepare data for pie charts
 */
export const preparePieChartData = (data, labelKey = '_id', valueKey = 'count') => {
  return data.map(item => ({
    name: item[labelKey] || item._id || 'Unknown',
    value: item[valueKey] || item.count || 0
  }));
};

/**
 * Prepare data for bar charts
 */
export const prepareBarChartData = (data) => {
  return data.map(item => ({
    category: item._id || 'Unknown',
    count: item.count || 0,
    percentage: 0 // Will be calculated later
  }));
};

/**
 * Calculate color for trend indicator
 */
export const getTrendColor = (value) => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-slate-600';
};

/**
 * Get trend icon direction
 */
export const getTrendIcon = (value) => {
  if (value > 0) return '↑';
  if (value < 0) return '↓';
  return '→';
};

/**
 * Export analytics data as CSV
 */
export const exportToCSV = (data, filename = 'analytics-export.csv') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get color palette for charts
 */
export const getChartColors = () => {
  return [
    '#8B1A1A', // Primary red
    '#DC2626', // Red 600
    '#EF4444', // Red 500
    '#F87171', // Red 400
    '#FCA5A5', // Red 300
    '#3B82F6', // Blue 500
    '#8B5CF6', // Purple 500
    '#10B981', // Green 500
    '#F59E0B', // Amber 500
    '#6366F1'  // Indigo 500
  ];
};

/**
 * Format activity action for display
 */
export const formatActivityAction = (action) => {
  return action
    .replace(/\./g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get icon for activity type
 */
export const getActivityIcon = (action) => {
  const iconMap = {
    'auth': '🔐',
    'user': '👤',
    'sermon': '📖',
    'blog': '📝',
    'event': '📅',
    'gallery': '🖼️',
    'livestream': '📡',
    'volunteer': '🤝',
    'feedback': '💬',
    'system': '⚙️'
  };

  const type = action.split('.')[0];
  return iconMap[type] || '📌';
};

/**
 * Calculate growth rate
 */
export const calculateGrowthRate = (data) => {
  if (!data || data.length < 2) return 0;
  
  const recent = data[data.length - 1]?.count || 0;
  const previous = data[data.length - 2]?.count || 0;
  
  return calculatePercentageChange(recent, previous);
};

/**
 * Get time period label
 */
export const getTimePeriodLabel = (period) => {
  const labels = {
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    '6months': 'Last 6 Months',
    '1year': 'Last Year'
  };
  return labels[period] || 'Custom Period';
};