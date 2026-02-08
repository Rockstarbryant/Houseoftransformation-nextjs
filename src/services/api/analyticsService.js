// src/services/api/analyticsService.js - UPDATED FOR NEW DASHBOARD
import api from '@/lib/api';

/**
 * Analytics Service
 * Handles all analytics-related API calls for the new dashboard
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
 * Get content analytics (sermons, blogs, gallery, events)
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
 * Get engagement analytics (feedback, volunteers, livestreams)
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
 * Get financial analytics (campaigns, pledges, payments)
 */
export const getFinancialAnalytics = async () => {
  try {
    const response = await api.get('/analytics/financial');
    return response.data;
  } catch (error) {
    console.error('[AnalyticsService] Get financial analytics error:', error);
    throw error;
  }
};

/**
 * Get communication analytics (emails, announcements)
 */
export const getCommunicationAnalytics = async () => {
  try {
    const response = await api.get('/analytics/communication');
    return response.data;
  } catch (error) {
    console.error('[AnalyticsService] Get communication analytics error:', error);
    throw error;
  }
};

/**
 * Get system analytics (audit logs, banned users, recent activity)
 */
export const getSystemAnalytics = async () => {
  try {
    const response = await api.get('/analytics/system');
    return response.data;
  } catch (error) {
    console.error('[AnalyticsService] Get system analytics error:', error);
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
  if (!num) return '0';
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