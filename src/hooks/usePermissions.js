import { useAuth } from '@/context/AuthContext';

/**
 * usePermissions Hook
 * Provides permission checking for portal features
 * Uses new role-based permission system from backend
 */
export const usePermissions = () => {
  const { 
    user, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    getPermissions,
    isAdmin,
    canManage
  } = useAuth();

  // ===== PERMISSION CHECKERS =====

  /**
   * Events Management
   */
  const canManageEvents = () => hasPermission('manage:events');
  const canCreateEvent = () => hasPermission('manage:events');
  const canEditEvent = () => hasPermission('manage:events');
  const canDeleteEvent = () => hasPermission('manage:events');
  const canViewEventAnalytics = () => hasPermission('manage:events');

  /**
   * Sermons Management
   */
  const canManageSermons = () => hasPermission('manage:sermons');
  const canCreateSermon = () => hasPermission('manage:sermons');
  const canEditSermon = () => hasPermission('manage:sermons');
  const canDeleteSermon = () => hasPermission('manage:sermons');

  /**
   * Gallery Management
   */
  const canManageGallery = () => hasPermission('manage:gallery');
  const canUploadPhoto = () => hasPermission('manage:gallery');
  const canEditPhoto = () => hasPermission('manage:gallery');
  const canDeletePhoto = () => hasPermission('manage:gallery');

  /**
   * Donations Management
   */
  const canManageDonations = () => hasPermission('manage:donations');
  const canViewDonationReports = () => hasPermission('manage:donations');

  /**
   * Users Management
   */
  const canManageUsers = () => hasPermission('manage:users');
  const canViewUsers = () => hasPermission('manage:users');
  const canEditUsers = () => hasPermission('manage:users');
  const canDeleteUsers = () => hasPermission('manage:users');

  /**
   * Roles Management
   */
  const canManageRoles = () => hasPermission('manage:roles');
  const canCreateRole = () => hasPermission('manage:roles');
  const canEditRole = () => hasPermission('manage:roles');
  const canDeleteRole = () => hasPermission('manage:roles');
  const canAssignRoles = () => hasPermission('manage:roles');

  /**
   * Blog Management
   */
  const canManageBlog = () => hasPermission('manage:blog');
  const canCreateBlog = () => hasPermission('manage:blog');
  const canEditBlog = () => hasPermission('manage:blog');
  const canDeleteBlog = () => hasPermission('manage:blog');

  /**
   * Livestream Management
   */
  const canManageLivestream = () => hasPermission('manage:livestream');

  /**
   * Feedback Management
   */
  const canManageFeedback = () => hasPermission('manage:feedback');

  /**
   * Volunteers Management
   */
  const canManageVolunteers = () => hasPermission('manage:volunteers');

  /**
   * Settings Management
   */
  const canManageSettings = () => hasPermission('manage:settings');

  /**
   * Analytics & Reporting
   */
  const canViewAnalytics = () => hasPermission('view:analytics');
  const canViewAuditLogs = () => hasPermission('view:audit_logs');

  // ===== PORTAL ACCESS CONTROL =====

  /**
   * Get accessible portal sections for sidebar
   * Returns: Array of section objects
   */
  const getAccessibleSections = () => {
    try {
      const sections = [];

      // Everyone can access profile
      sections.push({
        name: 'Profile',
        href: '/portal/profile',
        icon: 'User',
        permission: null
      });

      if (canManageEvents()) {
        sections.push({
          name: 'Events',
          href: '/portal/events',
          icon: 'Calendar',
          permission: 'manage:events'
        });
      }

      if (canManageSermons()) {
        sections.push({
          name: 'Sermons',
          href: '/portal/sermons',
          icon: 'BookOpen',
          permission: 'manage:sermons'
        });
      }

      if (canManageGallery()) {
        sections.push({
          name: 'Gallery',
          href: '/portal/gallery',
          icon: 'ImageIcon',
          permission: 'manage:gallery'
        });
      }

      if (canManageDonations()) {
        sections.push({
          name: 'Donations',
          href: '/portal/donations',
          icon: 'Heart',
          permission: 'manage:donations'
        });
      }

      if (canManageUsers()) {
        sections.push({
          name: 'Users',
          href: '/portal/users',
          icon: 'Users',
          permission: 'manage:users'
        });
      }

      if (canManageRoles()) {
        sections.push({
          name: 'Roles & Permissions',
          href: '/portal/roles',
          icon: 'Shield',
          permission: 'manage:roles'
        });
      }

      if (canViewAnalytics()) {
        sections.push({
          name: 'Analytics',
          href: '/portal/analytics',
          icon: 'BarChart3',
          permission: 'view:analytics'
        });
      }

      if (canViewAuditLogs()) {
        sections.push({
          name: 'Audit Logs',
          href: '/portal/audit-logs',
          icon: 'Shield',
          permission: 'view:audit_logs'
        });
      }

      return sections;
    } catch (error) {
      console.error('[usePermissions] Error in getAccessibleSections:', error);
      // Return at least profile section as fallback
      return [{
        name: 'Profile',
        href: '/portal/profile',
        icon: 'User',
        permission: null
      }];
    }
  };

  /**
   * Check if user can access portal at all
   */
  const canAccessPortal = () => {
    return user && user.role;
  };

  /**
   * Check if user has any admin-like permissions
   */
  const hasAdminPermissions = () => {
    const adminPermissions = [
      'manage:users',
      'manage:roles',
      'manage:settings',
      'view:audit_logs'
    ];
    return hasAnyPermission(adminPermissions);
  };

  return {
    user,
    isAdmin,
    canAccessPortal,
    hasAdminPermissions,
    getAccessibleSections,
    getPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Events
    canManageEvents,
    canCreateEvent,
    canEditEvent,
    canDeleteEvent,
    canViewEventAnalytics,

    // Sermons
    canManageSermons,
    canCreateSermon,
    canEditSermon,
    canDeleteSermon,

    // Gallery
    canManageGallery,
    canUploadPhoto,
    canEditPhoto,
    canDeletePhoto,

    // Donations
    canManageDonations,
    canViewDonationReports,

    // Users
    canManageUsers,
    canViewUsers,
    canEditUsers,
    canDeleteUsers,

    // Roles
    canManageRoles,
    canCreateRole,
    canEditRole,
    canDeleteRole,
    canAssignRoles,

    // Blog
    canManageBlog,
    canCreateBlog,
    canEditBlog,
    canDeleteBlog,

    // Other features
    canManageLivestream,
    canManageFeedback,
    canManageVolunteers,
    canManageSettings,
    canViewAnalytics,
    canViewAuditLogs
  };
};