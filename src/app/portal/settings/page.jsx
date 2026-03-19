// app/portal/settings/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Settings as SettingsIcon, Mail, Bell, Shield, CreditCard, Share2,
  AlertTriangle, Key, Zap, Save, RefreshCw, Download, CheckCircle,
  XCircle, AlertCircle, Eye, EyeOff, Globe, Phone, BookOpen, Calendar, ImageIcon, Users, MapPin,
  Plus, Trash2,
} from 'lucide-react';
import {
  getSettings, updateGeneralSettings, updateEmailSettings, updateNotificationSettings,
  updateSecuritySettings, updatePaymentSettings, updateSocialMedia, updateMaintenanceMode,
  updateApiKeys, updateFeatures, resetSettings, simulateMpesaStkPush, exportSettingsAsJSON, maskSensitiveData,
  testMpesaConnection, updateDonationSettings,
  updateChurchInfo, updatePaymentMethods, updateLeadership, updateServiceTimes,
} from '@/services/api/settingsService';
import Loader from '@/components/common/Loader';

/**
 * Settings Management Portal
 * Admin-only page for system configuration
 */
export default function SettingsPage() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const { hasPermission } = usePermissions();
  const canAccessSettings = hasPermission('manage:settings');

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const [settings, setSettings] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswords, setShowPasswords] = useState({});
  const [collapsedLeaders, setCollapsedLeaders] = useState({});
  const [collapsedServiceTimes, setCollapsedServiceTimes] = useState({});

  useEffect(() => {
    if (canAccessSettings) {
      fetchSettings();
    }
  }, [canAccessSettings]);

  // ============================================
  // PERMISSION CHECK
  // ============================================

  if (!canAccessSettings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Only administrators can access system settings
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSettings();
      if (response.success) {
        setSettings(response.settings);
        setOriginalSettings(JSON.parse(JSON.stringify(response.settings)));
        setHasChanges(false);
      } else {
        setError('Failed to load settings');
      }
    } catch (err) {
      console.error('[Settings] Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SAVE HANDLERS — existing
  // ============================================

  const handleSaveGeneral = async () => {
    try {
      setSaving(true);
      setError(null);
      // Snapshot the values we're saving RIGHT NOW before any async gap
      const saving = {
        siteName:        settings.siteName,
        siteTagline:     settings.siteTagline,
        siteDescription: settings.siteDescription,
        contactEmail:    settings.contactEmail,
        contactPhone:    settings.contactPhone,
        contactAddress:  settings.contactAddress,
      };
      const response = await updateGeneralSettings(saving);
      console.log('[Settings] General save response:', response);
      if (response.success) {
        setSuccess('General settings saved successfully!');
        // Only patch the exact fields we sent — never spread the full server response
        // (which is a full Mongoose document and would overwrite unrelated nested objects)
        setSettings(prev => ({ ...prev, ...saving }));
        setOriginalSettings(prev => JSON.parse(JSON.stringify({ ...prev, ...saving })));
        setHasChanges(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Settings] Save general error:', err);
      setError(err.response?.data?.message || 'Failed to save general settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      setSaving(true);
      setError(null);
      const emailSnapshot = { ...settings.emailSettings };
      const response = await updateEmailSettings(emailSnapshot);
      if (response.success) {
        setSuccess('Email settings saved successfully!');
        setSettings(prev => ({ ...prev, emailSettings: { ...prev.emailSettings, ...emailSnapshot } }));
        setOriginalSettings(prev => JSON.parse(JSON.stringify({ ...prev, emailSettings: { ...prev.emailSettings, ...emailSnapshot } })));
        setHasChanges(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Settings] Save email error:', err);
      setError(err.response?.data?.message || 'Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      setError(null);
      const saving = { ...settings.notificationSettings };
      const response = await updateNotificationSettings(settings.notificationSettings);
      if (response.success) {
        setSuccess('Notification settings saved successfully!');
        setSettings(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, ...saving } }));
        setOriginalSettings(prev => JSON.parse(JSON.stringify({ ...prev, notificationSettings: { ...prev.notificationSettings, ...saving } })));
        setHasChanges(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Settings] Save notifications error:', err);
      setError(err.response?.data?.message || 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setSaving(true);
      setError(null);
      const saving = { ...settings.securitySettings };
      const response = await updateSecuritySettings(settings.securitySettings);
      if (response.success) {
        setSuccess('Security settings saved successfully!');
        setSettings(prev => ({ ...prev, securitySettings: { ...prev.securitySettings, ...saving } }));
        setOriginalSettings(prev => JSON.parse(JSON.stringify({ ...prev, securitySettings: { ...prev.securitySettings, ...saving } })));
        setHasChanges(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Settings] Save security error:', err);
      setError(err.response?.data?.message || 'Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async () => {
    try {
      setSaving(true);
      setError(null);
      const paymentSnapshot = {
        paymentGateway: settings.paymentSettings.paymentGateway,
        minimumDonation: settings.paymentSettings.minimumDonation,
        currency: settings.paymentSettings.currency,
        mpesa: settings.paymentSettings.mpesa,
        stripe: settings.paymentSettings.stripe,
        paypal: settings.paymentSettings.paypal,
        flutterwave: settings.paymentSettings.flutterwave,
        enablePayments: settings.paymentSettings.enablePayments,
      };
      const response = await updatePaymentSettings(paymentSnapshot);
      if (response.success) {
        setSuccess('Payment settings saved successfully!');
        setSettings(prev => ({ ...prev, paymentSettings: { ...prev.paymentSettings, ...paymentSnapshot } }));
        setOriginalSettings(prev => JSON.parse(JSON.stringify({ ...prev, paymentSettings: { ...prev.paymentSettings, ...paymentSnapshot } })));
        setHasChanges(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to save payment settings');
      }
    } catch (err) {
      console.error('[Settings] Save payment error:', err);
      setError(err.response?.data?.message || 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocial = async () => {
    try {
      setSaving(true);
      setError(null);
      const saving = { ...settings.socialMedia };
      const response = await updateSocialMedia(saving);
      if (response.success) {
        setSuccess('Social media links saved successfully!');
        setSettings(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, ...saving } }));
        setOriginalSettings(prev => JSON.parse(JSON.stringify({ ...prev, socialMedia: { ...prev.socialMedia, ...saving } })));
        setHasChanges(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Settings] Save social error:', err);
      setError(err.response?.data?.message || 'Failed to save social media links');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMaintenance = async () => {
    try {
      setSaving(true);
      setError(null);
      const saving = { ...settings.maintenanceMode };
      const response = await updateMaintenanceMode(saving);
      if (response.success) {
        setSuccess('Maintenance mode updated successfully!');
        setSettings(prev => ({ ...prev, maintenanceMode: { ...prev.maintenanceMode, ...saving } }));
        setOriginalSettings(prev => JSON.parse(JSON.stringify({ ...prev, maintenanceMode: { ...prev.maintenanceMode, ...saving } })));
        setHasChanges(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Settings] Save maintenance error:', err);
      setError(err.response?.data?.message || 'Failed to update maintenance mode');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiKeys = async () => {
    try {
      setSaving(true);
      setError(null);
      const saving = { ...settings.apiKeys };
      const response = await updateApiKeys(saving);
      if (response.success) {
        setSuccess('API keys saved successfully!');
        setSettings(prev => ({ ...prev, apiKeys: { ...prev.apiKeys, ...saving } }));
        setOriginalSettings(prev => JSON.parse(JSON.stringify({ ...prev, apiKeys: { ...prev.apiKeys, ...saving } })));
        setHasChanges(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Settings] Save API keys error:', err);
      setError(err.response?.data?.message || 'Failed to save API keys');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFeatures = async () => {
    try {
      setSaving(true);
      setError(null);
      const saving = { ...settings.features };
      const response = await updateFeatures(saving);
      if (response.success) {
        setSuccess('Feature flags saved successfully!');
        setSettings(prev => ({ ...prev, features: { ...prev.features, ...saving } }));
        setOriginalSettings(prev => JSON.parse(JSON.stringify({ ...prev, features: { ...prev.features, ...saving } })));
        setHasChanges(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('[Settings] Save features error:', err);
      setError(err.response?.data?.message || 'Failed to save feature flags');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // SAVE HANDLERS — new (church info, leadership, service times)
  // ============================================

  const handleSaveChurchInfo = async () => {
    try {
      setSaving(true);
      setError(null);
      const saving = {
        churchMotto:       settings.churchMotto,
        foundedYear:       settings.foundedYear,
        prayerLine:        settings.prayerLine,
        counselingContact: settings.counselingContact,
        newMembersContact: settings.newMembersContact,
      };
      const response = await updateChurchInfo(saving);
      console.log('[Settings] Church info save response:', response);
      if (response.success) {
        setSuccess('Church info saved successfully!');
        setSettings(prev => ({ ...prev, ...saving }));
        setOriginalSettings(prev => JSON.parse(JSON.stringify({ ...prev, ...saving })));
        setHasChanges(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save church info');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLeadership = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await updateLeadership(settings.leadership ?? []);
      // Backend may return { success, leadership } or { success, settings: { leadership } }
      const saved = response.leadership ?? response.settings?.leadership ?? settings.leadership ?? [];
      if (response.success !== false) {
        setSuccess('Leadership updated successfully!');
        setSettings(prev => ({ ...prev, leadership: saved }));
        setOriginalSettings(prev => ({ ...prev, leadership: JSON.parse(JSON.stringify(saved)) }));
        setHasChanges(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leadership');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveServiceTimes = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await updateServiceTimes(settings.serviceTimes ?? []);
      // Backend may return { success, serviceTimes } or { success, settings: { serviceTimes } }
      const saved = response.serviceTimes ?? response.settings?.serviceTimes ?? settings.serviceTimes ?? [];
      if (response.success !== false) {
        setSuccess('Service times updated successfully!');
        setSettings(prev => ({ ...prev, serviceTimes: saved }));
        setOriginalSettings(prev => ({ ...prev, serviceTimes: JSON.parse(JSON.stringify(saved)) }));
        setHasChanges(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update service times');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaymentMethods = async () => {
  try {
    setSaving(true);
    setError(null);
    const payload = {
      churchPaymentMethods: settings.churchPaymentMethods,
      titheCard:            settings.titheCard,
      offeringCard:         settings.offeringCard,
    };
    const response = await updatePaymentMethods(payload);
    if (response.success) {
      setSuccess('Payment display settings saved!');
      setSettings(prev => ({ ...prev, ...payload }));
      setOriginalSettings(prev => JSON.parse(JSON.stringify({ ...prev, ...payload })));
      setHasChanges(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to save payment methods');
  } finally {
    setSaving(false);
  }
};

// Generic helper for deeply-nested churchPaymentMethods fields
const updatePaymentMethodField = (method, field, value) => {
  setSettings(prev => ({
    ...prev,
    churchPaymentMethods: {
      ...prev.churchPaymentMethods,
      [method]: { ...(prev.churchPaymentMethods?.[method] || {}), [field]: value },
    },
  }));
  setHasChanges(true);
};

// Helper for titheCard / offeringCard toggles
const updateCardConfig = (card, field, value) => {
  setSettings(prev => ({
    ...prev,
    [card]: { ...(prev[card] || {}), [field]: value },
  }));
  setHasChanges(true);
};

  // ============================================
  // LEADERSHIP HELPERS
  // ============================================

  const addLeader = () => {
    setSettings(prev => ({
      ...prev,
      leadership: [
        ...(prev.leadership ?? []),
        {
          name: '', title: '', ministry: '', phone: '', whatsapp: '',
          email: '', facebook: '', instagram: '', twitter: '',
          bio: '', avatar: '', isVisible: true,
          displayOrder: (prev.leadership?.length ?? 0),
        },
      ],
    }));
    setHasChanges(true);
  };

  const removeLeader = (index) => {
    setSettings(prev => ({
      ...prev,
      leadership: (prev.leadership ?? []).filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const updateLeaderField = (index, field, value) => {
    setSettings(prev => {
      const updated = [...(prev.leadership ?? [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, leadership: updated };
    });
    setHasChanges(true);
  };

  const toggleLeader = (index) => {
  setCollapsedLeaders(prev => ({ ...prev, [index]: !prev[index] }));
};

const toggleServiceTime = (index) => {
  setCollapsedServiceTimes(prev => ({ ...prev, [index]: !prev[index] }));
};

const collapseAllLeaders = () => {
  const all = {};
  (settings.leadership ?? []).forEach((_, i) => { all[i] = true; });
  setCollapsedLeaders(all);
};

const expandAllLeaders = () => setCollapsedLeaders({});

  // ============================================
  // SERVICE TIME HELPERS
  // ============================================

  const addServiceTime = () => {
    setSettings(prev => ({
      ...prev,
      serviceTimes: [
        ...(prev.serviceTimes ?? []),
        { name: '', day: '', time: '', venue: '', description: '', isActive: true },
      ],
    }));
    setHasChanges(true);
  };

  const removeServiceTime = (index) => {
    setSettings(prev => ({
      ...prev,
      serviceTimes: (prev.serviceTimes ?? []).filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const updateServiceTimeField = (index, field, value) => {
    setSettings(prev => {
      const updated = [...(prev.serviceTimes ?? [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, serviceTimes: updated };
    });
    setHasChanges(true);
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const handleChange = (category, field, value) => {
    setSettings(prev => {
      const updated = { ...prev };
      if (category && category.includes('.')) {
        const [parent, child] = category.split('.');
        updated[parent] = {
          ...updated[parent],
          [child]: {
            ...updated[parent][child],
            [field]: value,
          },
        };
      } else if (category) {
        updated[category] = { ...updated[category], [field]: value };
      } else {
        updated[field] = value;
      }
      return updated;
    });
    setHasChanges(true);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to discard all unsaved changes?')) {
      setSettings(JSON.parse(JSON.stringify(originalSettings)));
      setHasChanges(false);
      setError(null);
      setSuccess(null);
    }
  };

  const handleExport = () => {
    try {
      exportSettingsAsJSON(settings);
      setSuccess('Settings exported successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('[Settings] Export error:', err);
      setError('Failed to export settings');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    switch (activeTab) {
      case 'general':       return handleSaveGeneral();
      case 'email':         return handleSaveEmail();
      case 'notifications': return handleSaveNotifications();
      case 'security':      return handleSaveSecurity();
      case 'payment':       return handleSavePayment();
      case 'social':        return handleSaveSocial();
      case 'maintenance':   return handleSaveMaintenance();
      case 'api-keys':      return handleSaveApiKeys();
      case 'features':      return handleSaveFeatures();
      default:              return;
    }
  };

  // ============================================
  // TAB CONFIGURATION
  // ============================================

  const tabs = [
    { id: 'general',       name: 'General',       icon: SettingsIcon, color: 'blue'   },
    { id: 'email',         name: 'Email',          icon: Mail,         color: 'green'  },
    { id: 'notifications', name: 'Notifications',  icon: Bell,         color: 'purple' },
    { id: 'security',      name: 'Security',       icon: Shield,       color: 'red'    },
    { id: 'payment',       name: 'Payment',        icon: CreditCard,   color: 'yellow' },
    { id: 'social',        name: 'Social Media',   icon: Share2,       color: 'pink'   },
    { id: 'maintenance',   name: 'Maintenance',    icon: AlertTriangle,color: 'orange' },
    { id: 'api-keys',      name: 'API Keys',       icon: Key,          color: 'indigo' },
    { id: 'features',      name: 'Features',       icon: Zap,          color: 'cyan'   },
  ];

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return <Loader fullScreen text="Loading settings..." />;
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Settings Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Unable to load system settings
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            System Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Configure and manage system-wide settings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <Download size={20} />
            Export
          </button>

          {hasChanges && (
            <>
              <button
                onClick={handleReset}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={20} />
                Reset
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-3 bg-[#8B1A1A] text-white font-bold rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* MAINTENANCE MODE STATUS BADGE */}
      {activeTab === 'maintenance' && settings.maintenanceMode.enabled && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute w-3 h-3 bg-white rounded-full animate-ping"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-black text-lg">🚨 MAINTENANCE MODE IS ACTIVE</p>
                <p className="text-sm opacity-90">Non-admin users cannot access the site</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold opacity-75">Status</p>
              <p className="text-lg font-black">LIVE NOW</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && settings.maintenanceMode.enabled && (
        <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={20} />
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">Quick Test</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Open this URL in a new incognito/private window to see how non-admin users experience the maintenance page:
              </p>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-white break-all">
                {typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com'}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                ✓ You should see the maintenance page
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-green-800 dark:text-green-200 font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <XCircle className="text-red-600" size={20} />
          <p className="text-red-800 dark:text-red-200 font-semibold">{error}</p>
        </div>
      )}

      {hasChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-yellow-600" size={20} />
          <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
            You have unsaved changes. Save before leaving this page.
          </p>
        </div>
      )}

      {/* Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-6">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white">Categories</h3>
            </div>
            <nav className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                      isActive
                        ? 'bg-[#8B1A1A] text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-semibold">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">

            {/* ── GENERAL SETTINGS ─────────────────────────────────────────── */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    General Settings
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Basic information about your church and contact details
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => handleChange(null, 'siteName', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Site Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.siteTagline}
                      onChange={(e) => handleChange(null, 'siteTagline', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => handleChange(null, 'siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      <Mail className="inline mr-2" size={16} />
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleChange(null, 'contactEmail', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      <Phone className="inline mr-2" size={16} />
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.contactPhone}
                      onChange={(e) => handleChange(null, 'contactPhone', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Contact Address
                  </label>
                  <input
                    type="text"
                    value={settings.contactAddress}
                    onChange={(e) => handleChange(null, 'contactAddress', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                  />
                </div>

                {/* ── CHURCH IDENTITY EXTRAS ─────────────────────────────── */}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-6 mt-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Church Identity Extras
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    Motto, founding year, and dedicated ministry contact lines shown in the member Connect tab.
                  </p>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Church Motto / Vision Statement
                        </label>
                        <input
                          type="text"
                          value={settings.churchMotto ?? ''}
                          onChange={e => handleChange(null, 'churchMotto', e.target.value)}
                          placeholder="e.g. Transforming Lives, Building Nations"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Year Founded
                        </label>
                        <input
                          type="number"
                          value={settings.foundedYear ?? ''}
                          onChange={e => handleChange(null, 'foundedYear', Number(e.target.value))}
                          min="1900"
                          max={new Date().getFullYear()}
                          placeholder="2005"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Prayer Line
                        </label>
                        <input
                          type="tel"
                          value={settings.prayerLine ?? ''}
                          onChange={e => handleChange(null, 'prayerLine', e.target.value)}
                          placeholder="+254 7XX XXX XXX"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Shown as 24/7 Prayer Line</p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Counseling Contact
                        </label>
                        <input
                          type="tel"
                          value={settings.counselingContact ?? ''}
                          onChange={e => handleChange(null, 'counselingContact', e.target.value)}
                          placeholder="+254 7XX XXX XXX"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Pastoral counseling line</p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          New Members Desk
                        </label>
                        <input
                          type="tel"
                          value={settings.newMembersContact ?? ''}
                          onChange={e => handleChange(null, 'newMembersContact', e.target.value)}
                          placeholder="+254 7XX XXX XXX"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Orientation & onboarding</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveChurchInfo}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#8B1A1A] text-white text-sm font-bold rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        Save Church Info
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── SERVICE TIMES ──────────────────────────────────────── */}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Service Schedule</h3>
                    <button
                      onClick={addServiceTime}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#8B1A1A] transition-colors hover:bg-[#8B1A1A] hover:text-white"
                      style={{ color: '#8B1A1A' }}
                    >
                      <Plus size={13} /> Add Service
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    Service times shown on the member Connect tab and public-facing pages.
                  </p>

                  {(settings.serviceTimes ?? []).length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                      <Calendar size={24} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No service times added yet</p>
                      <button
                        onClick={addServiceTime}
                        className="mt-3 text-xs font-bold"
                        style={{ color: '#8B1A1A' }}
                      >
                        + Add first service time
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(settings.serviceTimes ?? []).map((svc, i) => (
                        <div
                          key={i}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
                          >
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                              Service {i + 1}
                            </p>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={svc.isActive ?? true}
                                  onChange={e => updateServiceTimeField(i, 'isActive', e.target.checked)}
                                  className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                                />
                                <span className="text-xs text-slate-500">Active</span>
                              </label>
                              <button
                                onClick={() => removeServiceTime(i)}
                                className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Service Name</label>
                              <input
                                type="text"
                                value={svc.name ?? ''}
                                onChange={e => updateServiceTimeField(i, 'name', e.target.value)}
                                placeholder="Sunday Morning Service"
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Day</label>
                              <select
                                value={svc.day ?? ''}
                                onChange={e => updateServiceTimeField(i, 'day', e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                              >
                                <option value="">Select day</option>
                                {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Time</label>
                              <input
                                type="text"
                                value={svc.time ?? ''}
                                onChange={e => updateServiceTimeField(i, 'time', e.target.value)}
                                placeholder="9:00 AM – 12:00 PM"
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Venue</label>
                              <input
                                type="text"
                                value={svc.venue ?? ''}
                                onChange={e => updateServiceTimeField(i, 'venue', e.target.value)}
                                placeholder="Main Sanctuary"
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Description (optional)</label>
                            <input
                              type="text"
                              value={svc.description ?? ''}
                              onChange={e => updateServiceTimeField(i, 'description', e.target.value)}
                              placeholder="e.g. Worship, Word, Prayer"
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(settings.serviceTimes ?? []).length > 0 && (
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleSaveServiceTimes}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#8B1A1A] text-white text-sm font-bold rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        Save Service Times
                      </button>
                    </div>
                  )}
                </div>

                {/* ── LEADERSHIP DIRECTORY ───────────────────────────────── */}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Leadership & Staff Directory
                    </h3>
                    <div className="flex items-center gap-2">
                      {(settings.leadership ?? []).length > 0 && (
                        <>
                          <button
                            onClick={expandAllLeaders}
                            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            Expand all
                          </button>
                          <button
                            onClick={collapseAllLeaders}
                            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            Collapse all
                          </button>
                        </>
                      )}
                      <button
                        onClick={addLeader}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#8B1A1A] transition-colors hover:bg-[#8B1A1A] hover:text-white"
                        style={{ color: '#8B1A1A' }}
                      >
                        <Plus size={13} /> Add Leader
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    Names, roles, ministries, and contact details shown to all logged-in members on the Connect tab.
                  </p>

                  {(settings.leadership ?? []).length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                      <Users size={24} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No leaders added yet</p>
                      <button
                        onClick={addLeader}
                        className="mt-3 text-xs font-bold"
                        style={{ color: '#8B1A1A' }}
                      >
                        + Add first leader
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(settings.leadership ?? []).map((leader, i) => (
                        <div
                    key={i}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all"
                  >
                    {/* ── Collapsible Header ── */}
                    <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleLeader(i)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleLeader(i)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer select-none"
                  >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Chevron */}
                        <svg
                          className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
                            collapsedLeaders[i] ? '-rotate-90' : 'rotate-0'
                          }`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                        <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate">
                          Leader {i + 1}{leader.name ? ` — ${leader.name}` : ''}
                          {leader.title && (
                            <span className="normal-case font-semibold text-slate-400 dark:text-slate-500 ml-1">
                              · {leader.title}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Right-side controls — stop propagation so they don't toggle collapse */}
                      <div
                        className="flex items-center gap-2 flex-shrink-0 ml-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={leader.isVisible ?? true}
                            onChange={e => updateLeaderField(i, 'isVisible', e.target.checked)}
                            className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                          />
                          <span className="text-xs text-slate-500 hidden sm:inline">Visible</span>
                        </label>
                        <button
                          onClick={() => removeLeader(i)}
                          className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      </div>

                    {/* ── Collapsible Body ── */}
                    {!collapsedLeaders[i] && (
                      <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                        {/* Identity */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                            <input
                              type="text"
                              value={leader.name ?? ''}
                              onChange={e => updateLeaderField(i, 'name', e.target.value)}
                              placeholder="Pastor John Doe"
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Title / Position</label>
                            <input
                              type="text"
                              value={leader.title ?? ''}
                              onChange={e => updateLeaderField(i, 'title', e.target.value)}
                              placeholder="Senior Pastor"
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Ministry / Department</label>
                            <input
                              type="text"
                              value={leader.ministry ?? ''}
                              onChange={e => updateLeaderField(i, 'ministry', e.target.value)}
                              placeholder="Main Ministry / Youth / Worship"
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                            />
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                              <Phone className="inline mr-1" size={11} /> Phone
                            </label>
                            <input
                              type="tel"
                              value={leader.phone ?? ''}
                              onChange={e => updateLeaderField(i, 'phone', e.target.value)}
                              placeholder="+254 7XX XXX XXX"
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">WhatsApp Number</label>
                            <input
                              type="tel"
                              value={leader.whatsapp ?? ''}
                              onChange={e => updateLeaderField(i, 'whatsapp', e.target.value)}
                              placeholder="+254 7XX XXX XXX"
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                              <Mail className="inline mr-1" size={11} /> Email
                            </label>
                            <input
                              type="email"
                              value={leader.email ?? ''}
                              onChange={e => updateLeaderField(i, 'email', e.target.value)}
                              placeholder="pastor@hot.org"
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                            />
                          </div>
                        </div>

                        {/* Social */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Facebook URL</label>
                            <input
                              type="url"
                              value={leader.facebook ?? ''}
                              onChange={e => updateLeaderField(i, 'facebook', e.target.value)}
                              placeholder="https://facebook.com/..."
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Instagram URL</label>
                            <input
                              type="url"
                              value={leader.instagram ?? ''}
                              onChange={e => updateLeaderField(i, 'instagram', e.target.value)}
                              placeholder="https://instagram.com/..."
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">X (Twitter) URL</label>
                            <input
                              type="url"
                              value={leader.twitter ?? ''}
                              onChange={e => updateLeaderField(i, 'twitter', e.target.value)}
                              placeholder="https://x.com/..."
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                            />
                          </div>
                        </div>

                        {/* Bio + Avatar + Order */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Short Bio</label>
                            <textarea
                              value={leader.bio ?? ''}
                              onChange={e => updateLeaderField(i, 'bio', e.target.value)}
                              placeholder="Brief description shown on the Connect tab…"
                              rows={2}
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none resize-none"
                            />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Avatar URL (Cloudinary)</label>
                              <input
                                type="url"
                                value={leader.avatar ?? ''}
                                onChange={e => updateLeaderField(i, 'avatar', e.target.value)}
                                placeholder="https://res.cloudinary.com/..."
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Display Order</label>
                              <input
                                type="number"
                                value={leader.displayOrder ?? 0}
                                onChange={e => updateLeaderField(i, 'displayOrder', Number(e.target.value))}
                                min="0"
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                              />
                              <p className="text-[10px] text-slate-400 mt-0.5">Lower = shown first</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                      ))}
                    </div>
                  )}

                  {(settings.leadership ?? []).length > 0 && (
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleSaveLeadership}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#8B1A1A] text-white text-sm font-bold rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        Save Leadership
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── EMAIL SETTINGS ───────────────────────────────────────────── */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Email Settings
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Configure SMTP settings for sending emails
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.emailSettings.smtpHost}
                      onChange={(e) => handleChange('emailSettings', 'smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={settings.emailSettings.smtpPort}
                      onChange={(e) => handleChange('emailSettings', 'smtpPort', Number(e.target.value))}
                      placeholder="587"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={settings.emailSettings.smtpUser}
                      onChange={(e) => handleChange('emailSettings', 'smtpUser', e.target.value)}
                      placeholder="your-email@gmail.com"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      SMTP Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.smtpPassword ? 'text' : 'password'}
                        value={settings.emailSettings.smtpPassword}
                        onChange={(e) => handleChange('emailSettings', 'smtpPassword', e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('smtpPassword')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.smtpPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings.emailSettings.fromEmail}
                      onChange={(e) => handleChange('emailSettings', 'fromEmail', e.target.value)}
                      placeholder="noreply@church.org"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.emailSettings.fromName}
                      onChange={(e) => handleChange('emailSettings', 'fromName', e.target.value)}
                      placeholder="House of Transformation"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTIFICATION SETTINGS ────────────────────────────────────── */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Notification Settings
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Configure notification preferences for different events
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Notification Channels</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
                        <div className="flex items-center gap-3">
                          <Mail size={20} className="text-slate-500" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Email Notifications</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications via email</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notificationSettings.emailNotifications}
                          onChange={(e) => handleChange('notificationSettings', 'emailNotifications', e.target.checked)}
                          className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
                        <div className="flex items-center gap-3">
                          <Phone size={20} className="text-slate-500" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">SMS Notifications</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications via SMS</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notificationSettings.smsNotifications}
                          onChange={(e) => handleChange('notificationSettings', 'smsNotifications', e.target.checked)}
                          className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
                        <div className="flex items-center gap-3">
                          <Bell size={20} className="text-slate-500" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Push Notifications</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Receive browser push notifications</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notificationSettings.pushNotifications}
                          onChange={(e) => handleChange('notificationSettings', 'pushNotifications', e.target.checked)}
                          className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Event Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
                        <span className="font-semibold text-slate-900 dark:text-white">New User Registration</span>
                        <input
                          type="checkbox"
                          checked={settings.notificationSettings.notifyOnNewUser}
                          onChange={(e) => handleChange('notificationSettings', 'notifyOnNewUser', e.target.checked)}
                          className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
                        <span className="font-semibold text-slate-900 dark:text-white">New Donation</span>
                        <input
                          type="checkbox"
                          checked={settings.notificationSettings.notifyOnNewDonation}
                          onChange={(e) => handleChange('notificationSettings', 'notifyOnNewDonation', e.target.checked)}
                          className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
                        <span className="font-semibold text-slate-900 dark:text-white">New Volunteer Application</span>
                        <input
                          type="checkbox"
                          checked={settings.notificationSettings.notifyOnNewVolunteer}
                          onChange={(e) => handleChange('notificationSettings', 'notifyOnNewVolunteer', e.target.checked)}
                          className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECURITY SETTINGS ────────────────────────────────────────── */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Security Settings
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Configure password policies and session management
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.securitySettings.sessionTimeout}
                      onChange={(e) => handleChange('securitySettings', 'sessionTimeout', Number(e.target.value))}
                      min="5"
                      max="1440"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Password Minimum Length
                    </label>
                    <input
                      type="number"
                      value={settings.securitySettings.passwordMinLength}
                      onChange={(e) => handleChange('securitySettings', 'passwordMinLength', Number(e.target.value))}
                      min="6"
                      max="32"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Password Requirements</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
                      <span className="font-semibold text-slate-900 dark:text-white">Require Special Characters</span>
                      <input
                        type="checkbox"
                        checked={settings.securitySettings.requireSpecialChars}
                        onChange={(e) => handleChange('securitySettings', 'requireSpecialChars', e.target.checked)}
                        className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
                      <span className="font-semibold text-slate-900 dark:text-white">Require Numbers</span>
                      <input
                        type="checkbox"
                        checked={settings.securitySettings.requireNumbers}
                        onChange={(e) => handleChange('securitySettings', 'requireNumbers', e.target.checked)}
                        className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
                      <span className="font-semibold text-slate-900 dark:text-white">Require Uppercase Letters</span>
                      <input
                        type="checkbox"
                        checked={settings.securitySettings.requireUppercase}
                        onChange={(e) => handleChange('securitySettings', 'requireUppercase', e.target.checked)}
                        className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.securitySettings.maxLoginAttempts}
                      onChange={(e) => handleChange('securitySettings', 'maxLoginAttempts', Number(e.target.value))}
                      min="3"
                      max="10"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Lockout Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.securitySettings.lockoutDuration}
                      onChange={(e) => handleChange('securitySettings', 'lockoutDuration', Number(e.target.value))}
                      min="5"
                      max="60"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            )}


            {/* ── PAYMENT & DONATIONS SETTINGS ─────────────────────────────── */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Payment & Donations Settings
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Configure payment gateways and donation features
                  </p>
                </div>

                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Enable Donations</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Allow users to make donations and pledges</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.paymentSettings.enablePayments}
                    onChange={(e) => handleChange('paymentSettings', 'enablePayments', e.target.checked)}
                    className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Primary Payment Gateway
                    </label>
                    <select
                      value={settings.paymentSettings.paymentGateway}
                      onChange={(e) => handleChange('paymentSettings', 'paymentGateway', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    >
                      <option value="mpesa">M-Pesa</option>
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={settings.paymentSettings.currency}
                      onChange={(e) => handleChange('paymentSettings', 'currency', e.target.value)}
                      placeholder="KES"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Minimum Donation Amount ({settings.paymentSettings.currency})
                  </label>
                  <input
                    type="number"
                    value={settings.paymentSettings.minimumDonation}
                    onChange={(e) => handleChange('paymentSettings', 'minimumDonation', Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                  />
                </div>

                {/* M-PESA CONFIGURATION */}
                {settings.paymentSettings.paymentGateway === 'mpesa' && (
                  <div className="bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-6 space-y-6">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h3 className="font-bold text-orange-900 dark:text-orange-200">M-Pesa Configuration</h3>
                        <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">
                          Configure your M-Pesa business account credentials for processing mobile money donations
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Consumer Key
                        </label>
                        <input
                          type="text"
                          value={settings.paymentSettings.mpesa.consumerKey}
                          onChange={(e) => handleChange('paymentSettings.mpesa', 'consumerKey', e.target.value)}
                          placeholder="From Safaricom Developer Portal"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Get this from your Safaricom Daraja API credentials
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Consumer Secret
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.mpesaSecret ? 'text' : 'password'}
                            value={settings.paymentSettings.mpesa.consumerSecret}
                            onChange={(e) => handleChange('paymentSettings.mpesa', 'consumerSecret', e.target.value)}
                            placeholder="••••••••••••••••"
                            className="w-full px-4 py-3 pr-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('mpesaSecret')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.mpesaSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Business Shortcode
                        </label>
                        <input
                          type="text"
                          value={settings.paymentSettings.mpesa.shortcode}
                          onChange={(e) => handleChange('paymentSettings.mpesa', 'shortcode', e.target.value)}
                          placeholder="174379"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Passkey
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.mpesaPasskey ? 'text' : 'password'}
                            value={settings.paymentSettings.mpesa.passkey}
                            onChange={(e) => handleChange('paymentSettings.mpesa', 'passkey', e.target.value)}
                            placeholder="••••••••••••••••"
                            className="w-full px-4 py-3 pr-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('mpesaPasskey')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.mpesaPasskey ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Party A (Phone Number)
                        </label>
                        <input
                          type="tel"
                          value={settings.paymentSettings.mpesa.partyA || ''}
                          onChange={(e) => handleChange('paymentSettings.mpesa', 'partyA', e.target.value)}
                          placeholder="254712345678"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Phone number initiating the STK/C2B request
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Party B (Business Shortcode)
                        </label>
                        <input
                          type="text"
                          value={settings.paymentSettings.mpesa.partyB || ''}
                          onChange={(e) => handleChange('paymentSettings.mpesa', 'partyB', e.target.value)}
                          placeholder="174379"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Organization receiving the funds
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Transaction Type
                        </label>
                        <select
                          value={settings.paymentSettings.mpesa.transactionType || 'CustomerPayBillOnline'}
                          onChange={(e) => handleChange('paymentSettings.mpesa', 'transactionType', e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        >
                          <option value="CustomerPayBillOnline">Pay Bill Online</option>
                          <option value="CustomerBuyGoodsOnline">Buy Goods Online</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Default Amount (KES)
                        </label>
                        <input
                          type="number"
                          value={settings.paymentSettings.mpesa.amount || 0}
                          onChange={(e) => handleChange('paymentSettings.mpesa', 'amount', Number(e.target.value))}
                          placeholder="100"
                          min="1"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Transaction Description
                        </label>
                        <input
                          type="text"
                          value={settings.paymentSettings.mpesa.transactionDesc || ''}
                          onChange={(e) => handleChange('paymentSettings.mpesa', 'transactionDesc', e.target.value)}
                          placeholder="Church Donation"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Account Reference
                        </label>
                        <input
                          type="text"
                          value={settings.paymentSettings.mpesa.accountRef || ''}
                          onChange={(e) => handleChange('paymentSettings.mpesa', 'accountRef', e.target.value)}
                          placeholder="HOT-DONATION"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Environment
                        </label>
                        <select
                          value={settings.paymentSettings.mpesa.environment}
                          onChange={(e) => handleChange('paymentSettings.mpesa', 'environment', e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        >
                          <option value="sandbox">Sandbox (Testing)</option>
                          <option value="production">Production (Live)</option>
                        </select>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Use sandbox for testing, production for live transactions
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Callback URL
                        </label>
                        <input
                          type="url"
                          value={settings.paymentSettings.mpesa.callbackUrl}
                          onChange={(e) => handleChange('paymentSettings.mpesa', 'callbackUrl', e.target.value)}
                          placeholder="https://yourdomain.com/api/payments/mpesa-callback"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          URL where M-Pesa will send payment confirmations
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Request Timeout (ms)
                      </label>
                      <input
                        type="number"
                        value={settings.paymentSettings.mpesa.timeout}
                        onChange={(e) => handleChange('paymentSettings.mpesa', 'timeout', Number(e.target.value))}
                        min="1000"
                        max="30000"
                        step="1000"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          setSaving(true);
                          setError(null);
                          const result = await testMpesaConnection();
                          if (result.success) {
                            setSuccess('M-Pesa connection is valid!');
                            setTimeout(() => setSuccess(null), 3000);
                          } else {
                            setError(result.message || 'M-Pesa configuration is invalid. Please check your credentials.');
                          }
                        } catch (err) {
                          console.error('[Settings] M-Pesa test error:', err);
                          setError(err.response?.data?.message || err.message || 'Failed to test M-Pesa connection');
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Testing...
                        </>
                      ) : (
                        'Test M-Pesa Connection'
                      )}
                    </button>

                    {/* STK PUSH SIMULATION */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
                      <div className="flex items-start gap-3 mb-6">
                        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                          <h3 className="font-bold text-blue-900 dark:text-blue-200">STK Push Simulation</h3>
                          <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                            Test M-Pesa payment flow by simulating an STK push. Enter a test phone number and amount.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                              Test Phone Number
                            </label>
                            <input
                              type="tel"
                              id="simulatePhoneNumber"
                              placeholder="254712345678"
                              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Format: 254XXXXXXXXX (Kenya)
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                              Test Amount (KES)
                            </label>
                            <input
                              type="number"
                              id="simulateAmount"
                              placeholder="100"
                              min="1"
                              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Account Reference (Optional)
                          </label>
                          <input
                            type="text"
                            id="simulateAccountRef"
                            placeholder="HOT-TEST-001"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                          />
                        </div>

                        <button
                          onClick={async () => {
                            try {
                              setSaving(true);
                              setError(null);
                              const phoneNumber = document.getElementById('simulatePhoneNumber').value;
                              const amount = document.getElementById('simulateAmount').value;
                              const accountRef = document.getElementById('simulateAccountRef').value;
                              if (!phoneNumber || !amount) {
                                setError('Phone number and amount are required');
                                setSaving(false);
                                return;
                              }
                              const result = await simulateMpesaStkPush(phoneNumber, parseInt(amount), accountRef);
                              if (result.success) {
                                setSuccess('STK Push simulated! Check console for details.');
                                console.log('[Settings] STK Push Simulation Result:', result.simulation);
                                setTimeout(() => setSuccess(null), 5000);
                                document.getElementById('simulatePhoneNumber').value = '';
                                document.getElementById('simulateAmount').value = '';
                                document.getElementById('simulateAccountRef').value = '';
                              } else {
                                setError(result.message || 'Failed to simulate STK push');
                              }
                            } catch (err) {
                              console.error('[Settings] STK push simulation error:', err);
                              setError(err.response?.data?.message || err.message || 'Failed to simulate STK push');
                            } finally {
                              setSaving(false);
                            }
                          }}
                          disabled={saving}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {saving ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Simulating...
                            </>
                          ) : (
                            'Simulate STK Push'
                          )}
                        </button>

                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-semibold">How it works:</span> This simulates what happens when a user initiates a payment. In production, the STK push would appear on the customer's phone. The simulation shows the exact credentials and parameters that would be sent to M-Pesa.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PUBLIC PAYMENT DISPLAY ──────────────────────────────────────────── */}
<div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
  <div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
      Public Payment Display
    </h3>
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Control what donors see on the Donate page. These are display values
      only — they are separate from your M-Pesa STK Push API credentials above.
    </p>
  </div>

  {/* ── Card visibility ─────────────────────────────────────────────────── */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {[
      { card: 'titheCard',    label: 'Show Tithe Card'    },
      { card: 'offeringCard', label: 'Show Offering Card' },
    ].map(({ card, label }) => (
      <label key={card} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
        <span className="font-semibold text-slate-900 dark:text-white text-sm">{label}</span>
        <input
          type="checkbox"
          checked={settings[card]?.enabled ?? true}
          onChange={e => updateCardConfig(card, 'enabled', e.target.checked)}
          className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
        />
      </label>
    ))}
  </div>

  {/* ── Method definitions ──────────────────────────────────────────────── */}
  {[
    {
      key: 'paybill',
      title: 'M-Pesa Paybill',
      fields: [
        { f: 'label',              label: 'Display Label',         type: 'text',  ph: 'M-Pesa Paybill'    },
        { f: 'number',             label: 'Paybill Number',        type: 'text',  ph: '247247'             },
        { f: 'titheAccountRef',    label: 'Tithe Account Ref',     type: 'text',  ph: 'TITHE'              },
        { f: 'offeringAccountRef', label: 'Offering Account Ref',  type: 'text',  ph: 'OFFERING'           },
        { f: 'campaignAccountRef', label: 'Campaign Account Ref',  type: 'text',  ph: 'CAMPAIGN'           },
      ],
    },
    {
      key: 'till',
      title: 'M-Pesa Till Number',
      fields: [
        { f: 'label',  label: 'Display Label', type: 'text', ph: 'M-Pesa Till Number' },
        { f: 'number', label: 'Till Number',   type: 'text', ph: '123456'             },
      ],
    },
    {
      key: 'bank',
      title: 'Bank Transfer',
      fields: [
        { f: 'label',         label: 'Display Label',   type: 'text', ph: 'Bank Transfer'             },
        { f: 'bankName',      label: 'Bank Name',       type: 'text', ph: 'Kenya Commercial Bank'     },
        { f: 'accountNumber', label: 'Account Number',  type: 'text', ph: '1234567890'                },
        { f: 'accountName',   label: 'Account Name',    type: 'text', ph: 'House of Transformation'   },
        { f: 'branchName',    label: 'Branch (opt)',    type: 'text', ph: 'Busia Branch'              },
      ],
    },
    {
      key: 'pochiLaBiashara',
      title: 'Pochi la Biashara',
      fields: [
        { f: 'label',  label: 'Display Label',  type: 'text', ph: 'Pochi la Biashara'  },
        { f: 'number', label: 'Phone Number',   type: 'tel',  ph: '+254 7XX XXX XXX'   },
        { f: 'name',   label: 'Account Name',   type: 'text', ph: 'House of Transformation' },
      ],
    },
    {
      key: 'paypal',
      title: 'PayPal',
      fields: [
        { f: 'label', label: 'Display Label', type: 'text',  ph: 'PayPal'              },
        { f: 'email', label: 'PayPal Email',  type: 'email', ph: 'give@hot.org'        },
        { f: 'link',  label: 'PayPal Link (opt)', type: 'url', ph: 'https://paypal.me/...' },
      ],
    },
  ].map(({ key, title, fields }) => {
    const pm = settings.churchPaymentMethods?.[key] || {};
    return (
      <div key={key} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {/* Header with enable toggle */}
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <span className="font-bold text-sm text-slate-900 dark:text-white">{title}</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-slate-500">
              {pm.enabled ? 'Enabled' : 'Disabled'}
            </span>
            <input
              type="checkbox"
              checked={pm.enabled ?? false}
              onChange={e => updatePaymentMethodField(key, 'enabled', e.target.checked)}
              className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
            />
          </label>
        </div>

        {pm.enabled && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 space-y-3">
            {/* Value fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fields.map(({ f, label, type, ph }) => (
                <div key={f}>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                  <input
                    type={type}
                    value={pm[f] ?? ''}
                    onChange={e => updatePaymentMethodField(key, f, e.target.value)}
                    placeholder={ph}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Per-card visibility (skip for methods that don't have card-level toggles) */}
            {key !== 'paypal' && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-[11px] font-bold uppercase text-slate-400 mb-2 tracking-wide">
                  Show on…
                </p>
                <div className="flex flex-wrap gap-4">
                  {[
                    { card: 'titheCard',    showKey: 'show' + key.charAt(0).toUpperCase() + key.slice(1), label: 'Tithe Card'    },
                    { card: 'offeringCard', showKey: 'show' + key.charAt(0).toUpperCase() + key.slice(1), label: 'Offering Card' },
                  ].map(({ card, showKey, label }) => (
                    <label key={card} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings[card]?.[showKey] ?? false}
                        onChange={e => updateCardConfig(card, showKey, e.target.checked)}
                        className="w-4 h-4 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  })}

  {/* Save button */}
  <div className="flex justify-end">
    <button
      onClick={handleSavePaymentMethods}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#8B1A1A] text-white text-sm font-bold rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
    >
      {saving ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Save size={16} />
      )}
      Save Payment Display
    </button>
  </div>
</div>

                {/* Donation Features */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-4">Donation Features</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'enableCampaigns',       label: 'Enable Campaigns'        },
                      { key: 'enablePledges',          label: 'Enable Pledges'          },
                      { key: 'enableOfferings',        label: 'Enable Offerings'        },
                      { key: 'sendReceipts',           label: 'Send Donation Receipts'  },
                      { key: 'enablePledgeReminders',  label: 'Enable Pledge Reminders' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
                        <span className="font-semibold text-slate-900 dark:text-white">{label}</span>
                        <input
                          type="checkbox"
                          checked={settings.donationSettings[key]}
                          onChange={(e) => handleChange('donationSettings', key, e.target.checked)}
                          className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SOCIAL MEDIA SETTINGS ────────────────────────────────────── */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Social Media Links
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Configure your social media presence
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/yourchurch',          type: 'url', icon: Globe  },
                    { key: 'twitter',   label: 'Twitter',   placeholder: 'https://twitter.com/yourchurch',           type: 'url', icon: Globe  },
                    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourchurch',         type: 'url', icon: Globe  },
                    { key: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/c/yourchurch',         type: 'url', icon: Globe  },
                    { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/company/yourchurch',  type: 'url', icon: Globe  },
                    { key: 'whatsapp',  label: 'WhatsApp',  placeholder: '+254 XXX XXX XXX',                         type: 'tel', icon: Phone  },
                  ].map(({ key, label, placeholder, type, icon: Icon }) => (
                    <div key={key}>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        <Icon className="inline mr-2" size={16} />
                        {label}
                      </label>
                      <input
                        type={type}
                        value={settings.socialMedia[key]}
                        onChange={(e) => handleChange('socialMedia', key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MAINTENANCE MODE ─────────────────────────────────────────── */}
            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Maintenance Mode
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Enable maintenance mode to temporarily disable site access
                  </p>
                </div>

                <div className={`p-6 rounded-xl border-2 transition-all ${
                  settings.maintenanceMode.enabled
                    ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={settings.maintenanceMode.enabled ? 'text-orange-600' : 'text-slate-500'} size={24} />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-lg">
                          {settings.maintenanceMode.enabled ? 'Maintenance Mode Active' : 'Enable Maintenance Mode'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {settings.maintenanceMode.enabled
                            ? 'Site is currently in maintenance mode'
                            : 'Disable public access to the website'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode.enabled}
                      onChange={(e) => handleChange('maintenanceMode', 'enabled', e.target.checked)}
                      className="w-6 h-6 text-orange-600 rounded focus:ring-orange-500"
                    />
                  </label>
                </div>

                {settings.maintenanceMode.enabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Maintenance Message
                      </label>
                      <textarea
                        value={settings.maintenanceMode.message}
                        onChange={(e) => handleChange('maintenanceMode', 'message', e.target.value)}
                        rows={3}
                        placeholder="We are currently performing maintenance..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Estimated Time
                      </label>
                      <input
                        type="text"
                        value={settings.maintenanceMode.estimatedTime}
                        onChange={(e) => handleChange('maintenanceMode', 'estimatedTime', e.target.value)}
                        placeholder="2 hours"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="font-semibold text-yellow-900 dark:text-yellow-200">Warning</p>
                          <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                            Maintenance mode will prevent all non-admin users from accessing the site.
                            Make sure to disable it when maintenance is complete.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── API KEYS ─────────────────────────────────────────────────── */}
            {activeTab === 'api-keys' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    API Keys
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Manage API keys for third-party services
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold text-red-900 dark:text-red-200">Security Notice</p>
                      <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                        Keep these API keys secure. Never share them publicly or commit them to version control.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Google Maps API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.googleMaps ? 'text' : 'password'}
                        value={settings.apiKeys.googleMapsKey}
                        onChange={(e) => handleChange('apiKeys', 'googleMapsKey', e.target.value)}
                        placeholder="AIza..."
                        className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('googleMaps')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.googleMaps ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Cloudinary Key
                      </label>
                      <input
                        type="text"
                        value={settings.apiKeys.cloudinaryKey}
                        onChange={(e) => handleChange('apiKeys', 'cloudinaryKey', e.target.value)}
                        placeholder="Cloudinary API key"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Cloudinary Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.cloudinarySecret ? 'text' : 'password'}
                          value={settings.apiKeys.cloudinarySecret}
                          onChange={(e) => handleChange('apiKeys', 'cloudinarySecret', e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('cloudinarySecret')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.cloudinarySecret ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      SendGrid API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.sendgrid ? 'text' : 'password'}
                        value={settings.apiKeys.sendgridKey}
                        onChange={(e) => handleChange('apiKeys', 'sendgridKey', e.target.value)}
                        placeholder="SG...."
                        className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('sendgrid')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.sendgrid ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Twilio SID
                      </label>
                      <input
                        type="text"
                        value={settings.apiKeys.twilioSid}
                        onChange={(e) => handleChange('apiKeys', 'twilioSid', e.target.value)}
                        placeholder="AC..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Twilio Auth Token
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.twilioToken ? 'text' : 'password'}
                          value={settings.apiKeys.twilioToken}
                          onChange={(e) => handleChange('apiKeys', 'twilioToken', e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('twilioToken')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.twilioToken ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── FEATURE FLAGS ────────────────────────────────────────────── */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Feature Toggles
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Enable or disable specific features across the platform
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'enableBlog',        label: 'Blog',        desc: 'Enable blog posts',           icon: BookOpen   },
                    { key: 'enableEvents',      label: 'Events',      desc: 'Enable events management',    icon: Calendar   },
                    { key: 'enableSermons',     label: 'Sermons',     desc: 'Enable sermon library',       icon: BookOpen   },
                    { key: 'enableGallery',     label: 'Gallery',     desc: 'Enable photo gallery',        icon: ImageIcon  },
                    { key: 'enableDonations',   label: 'Donations',   desc: 'Enable online donations',     icon: CreditCard },
                    { key: 'enableVolunteers',  label: 'Volunteers',  desc: 'Enable volunteer program',    icon: Users      },
                    { key: 'enableTestimonies', label: 'Testimonies', desc: 'Enable testimony sharing',    icon: CheckCircle},
                    { key: 'enableLivestream',  label: 'Livestream',  desc: 'Enable live streaming',       icon: Globe      },
                  ].map(({ key, label, desc, icon: Icon }) => (
                    <label key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#8B1A1A] transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon size={20} className="text-slate-500" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.features[key]}
                        onChange={(e) => handleChange('features', key, e.target.checked)}
                        className="w-5 h-5 text-[#8B1A1A] rounded focus:ring-[#8B1A1A]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}