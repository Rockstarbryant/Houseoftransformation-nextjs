// src/services/api/settingsService.js
import api from '@/lib/api';

/**
 * Settings Service
 * Handles all settings-related API calls
 */

// ============================================
// GET SETTINGS
// ============================================

/**
 * Get all settings (admin only)
 */
export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Get settings error:', error);
    throw error;
  }
};

/**
 * Get public settings (no auth required)
 */
export const getPublicSettings = async () => {
  try {
    const response = await api.get('/settings/public');
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Get public settings error:', error);
    throw error;
  }
};

// ============================================
// UPDATE SETTINGS BY CATEGORY
// ============================================

/**
 * Update general settings
 * @param {object} data - { siteName, siteTagline, siteDescription, contactEmail, contactPhone, contactAddress }
 */
export const updateGeneralSettings = async (data) => {
  try {
    const response = await api.patch('/settings/general', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update general settings error:', error);
    throw error;
  }
};

/**
 * Update email settings
 * @param {object} data - { smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail, fromName }
 */
export const updateEmailSettings = async (data) => {
  try {
    const response = await api.patch('/settings/email', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update email settings error:', error);
    throw error;
  }
};

/**
 * Update notification settings
 * @param {object} data - notification preferences
 */
export const updateNotificationSettings = async (data) => {
  try {
    const response = await api.patch('/settings/notifications', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update notification settings error:', error);
    throw error;
  }
};

/**
 * Update security settings
 * @param {object} data - security configuration
 */
export const updateSecuritySettings = async (data) => {
  try {
    const response = await api.patch('/settings/security', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update security settings error:', error);
    throw error;
  }
};

/**
 * Update payment settings
 * @param {object} data - payment gateway configuration
 */
export const updatePaymentSettings = async (data) => {
  try {
    const response = await api.patch('/settings/payment', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update payment settings error:', error);
    throw error;
  }
};

/**
 * Update social media links
 * @param {object} data - social media URLs
 */
export const updateSocialMedia = async (data) => {
  try {
    const response = await api.patch('/settings/social', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update social media error:', error);
    throw error;
  }
};

/**
 * Update maintenance mode
 * @param {object} data - { enabled, message, allowedIPs, estimatedTime }
 */
export const updateMaintenanceMode = async (data) => {
  try {
    const response = await api.patch('/settings/maintenance', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update maintenance mode error:', error);
    throw error;
  }
};

/**
 * Update API keys
 * @param {object} data - API keys for third-party services
 */
export const updateApiKeys = async (data) => {
  try {
    const response = await api.patch('/settings/api-keys', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update API keys error:', error);
    throw error;
  }
};

/**
 * Update feature flags
 * @param {object} data - feature enable/disable flags
 */
export const updateFeatures = async (data) => {
  try {
    const response = await api.patch('/settings/features', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update features error:', error);
    throw error;
  }
};

/**
 * Reset all settings to default
 */
export const resetSettings = async () => {
  try {
    const response = await api.post('/settings/reset');
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Reset settings error:', error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate email settings
 */
export const validateEmailSettings = (data) => {
  const errors = {};

  if (data.smtpHost && !data.smtpHost.trim()) {
    errors.smtpHost = 'SMTP host is required';
  }

  if (data.smtpPort && (data.smtpPort < 1 || data.smtpPort > 65535)) {
    errors.smtpPort = 'Invalid port number';
  }

  if (data.fromEmail && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.fromEmail)) {
    errors.fromEmail = 'Invalid email format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate social media URLs
 */
export const validateSocialMedia = (data) => {
  const errors = {};
  const urlPattern = /^https?:\/\/.+/;

  Object.keys(data).forEach(key => {
    if (data[key] && !urlPattern.test(data[key])) {
      errors[key] = 'Invalid URL format';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Mask sensitive data for display
 */
export const maskSensitiveData = (value, visibleChars = 4) => {
  if (!value || value.length <= visibleChars) return value;
  const masked = '*'.repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
};

/**
 * Export settings as JSON
 */
export const exportSettingsAsJSON = (settings) => {
  const dataStr = JSON.stringify(settings, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Get settings categories for navigation
 */
export const getSettingsCategories = () => {
  return [
    {
      id: 'general',
      name: 'General',
      icon: 'Settings',
      description: 'Site name, contact info, and basic settings'
    },
    {
      id: 'email',
      name: 'Email',
      icon: 'Mail',
      description: 'SMTP configuration and email templates'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: 'Bell',
      description: 'Email, SMS, and push notification preferences'
    },
    {
      id: 'security',
      name: 'Security',
      icon: 'Shield',
      description: 'Password policies and session settings'
    },
    {
      id: 'payment',
      name: 'Payment',
      icon: 'CreditCard',
      description: 'Payment gateways and donation settings'
    },
    {
      id: 'social',
      name: 'Social Media',
      icon: 'Share2',
      description: 'Social media links and profiles'
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      icon: 'AlertTriangle',
      description: 'Maintenance mode and system alerts'
    },
    {
      id: 'api-keys',
      name: 'API Keys',
      icon: 'Key',
      description: 'Third-party service API keys'
    },
    {
      id: 'features',
      name: 'Features',
      icon: 'Zap',
      description: 'Enable or disable site features'
    }
  ];
};