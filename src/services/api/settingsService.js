// src/services/api/settingsService.js - UPDATED
import api from '@/lib/api';

/**
 * Settings Service
 * Handles all settings-related API calls
 */

// ============================================
// GET SETTINGS
// ============================================

export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Get settings error:', error);
    throw error;
  }
};

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

export const updateGeneralSettings = async (data) => {
  try {
    const response = await api.patch('/settings/general', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update general settings error:', error);
    throw error;
  }
};

export const updateEmailSettings = async (data) => {
  try {
    const response = await api.patch('/settings/email', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update email settings error:', error);
    throw error;
  }
};

export const updateNotificationSettings = async (data) => {
  try {
    const response = await api.patch('/settings/notifications', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update notification settings error:', error);
    throw error;
  }
};

export const updateSecuritySettings = async (data) => {
  try {
    const response = await api.patch('/settings/security', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update security settings error:', error);
    throw error;
  }
};

export const updatePaymentSettings = async (data) => {
  try {
    const response = await api.patch('/settings/payment', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update payment settings error:', error);
    throw error;
  }
};

// ============================================
// M-PESA SPECIFIC SETTINGS
// ============================================

export const getMpesaSettings = async () => {
  try {
    const response = await api.get('/settings/mpesa');
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Get M-Pesa settings error:', error);
    throw error;
  }
};

export const updateMpesaSettings = async (data) => {
  try {
    const response = await api.patch('/settings/mpesa', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update M-Pesa settings error:', error);
    throw error;
  }
};

export const testMpesaConnection = async () => {
  try {
    const response = await api.post('/settings/mpesa/test', {});
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Test M-Pesa connection error:', error);
    throw error;
  }
};

// ============================================
// DONATION SETTINGS
// ============================================

export const getDonationSettings = async () => {
  try {
    const response = await api.get('/settings/donations');
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Get donation settings error:', error);
    throw error;
  }
};

export const updateDonationSettings = async (data) => {
  try {
    const response = await api.patch('/settings/donations', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update donation settings error:', error);
    throw error;
  }
};

export const updatePaymentGateway = async (data) => {
  try {
    const response = await api.patch('/settings/payment-gateway', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update payment gateway error:', error);
    throw error;
  }
};

// ============================================
// OTHER SETTINGS
// ============================================

export const updateSocialMedia = async (data) => {
  try {
    const response = await api.patch('/settings/social', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update social media error:', error);
    throw error;
  }
};

export const updateMaintenanceMode = async (data) => {
  try {
    const response = await api.patch('/settings/maintenance', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update maintenance mode error:', error);
    throw error;
  }
};

export const updateApiKeys = async (data) => {
  try {
    const response = await api.patch('/settings/api-keys', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update API keys error:', error);
    throw error;
  }
};

export const updateFeatures = async (data) => {
  try {
    const response = await api.patch('/settings/features', data);
    return response.data;
  } catch (error) {
    console.error('[SettingsService] Update features error:', error);
    throw error;
  }
};

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

export const maskSensitiveData = (value, visibleChars = 4) => {
  if (!value || value.length <= visibleChars) return value;
  const masked = '*'.repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
};

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
      name: 'Payment & Donations',
      icon: 'CreditCard',
      description: 'Payment gateways and M-Pesa configuration'
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