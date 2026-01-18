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
   * Feedback Management - Granular by Category
   */
  
  // Broad permission (backward compatibility)
  const canManageFeedback = () => hasPermission('manage:feedback');

  // Sermon Feedback
  const canReadFeedbackSermon = () => hasAnyPermission(['read:feedback:sermon', 'manage:feedback']);
  const canRespondFeedbackSermon = () => hasAnyPermission(['respond:feedback:sermon', 'manage:feedback']);

  // Service Feedback
  const canReadFeedbackService = () => hasAnyPermission(['read:feedback:service', 'manage:feedback']);
  const canRespondFeedbackService = () => hasAnyPermission(['respond:feedback:service', 'manage:feedback']);

  // Testimony Feedback
  const canReadFeedbackTestimony = () => hasAnyPermission(['read:feedback:testimony', 'manage:feedback']);
  const canRespondFeedbackTestimony = () => hasAnyPermission(['respond:feedback:testimony', 'manage:feedback']);
  const canPublishFeedbackTestimony = () => hasAnyPermission(['publish:feedback:testimony', 'manage:feedback']);
  const canArchiveFeedbackTestimony = () => hasAnyPermission(['archive:feedback:testimony', 'manage:feedback']);

  // Suggestion Feedback
  const canReadFeedbackSuggestion = () => hasAnyPermission(['read:feedback:suggestion', 'manage:feedback']);
  const canRespondFeedbackSuggestion = () => hasAnyPermission(['respond:feedback:suggestion', 'manage:feedback']);
  const canArchiveFeedbackSuggestion = () => hasAnyPermission(['archive:feedback:suggestion', 'manage:feedback']);

  // Prayer Feedback
  const canReadFeedbackPrayer = () => hasAnyPermission(['read:feedback:prayer', 'manage:feedback']);
  const canRespondFeedbackPrayer = () => hasAnyPermission(['respond:feedback:prayer', 'manage:feedback']);
  const canArchiveFeedbackPrayer = () => hasAnyPermission(['archive:feedback:prayer', 'manage:feedback']);

  // General Feedback
  const canReadFeedbackGeneral = () => hasAnyPermission(['read:feedback:general', 'manage:feedback']);
  const canRespondFeedbackGeneral = () => hasAnyPermission(['respond:feedback:general', 'manage:feedback']);
  const canArchiveFeedbackGeneral = () => hasAnyPermission(['archive:feedback:general', 'manage:feedback']);

  // Feedback Stats
  const canViewFeedbackStats = () => hasAnyPermission(['view:feedback:stats', 'manage:feedback']);

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

  // ===== HELPER FUNCTIONS =====

  /**
   * Check if user can read feedback of any category
   */
  const canReadAnyFeedback = () => {
    return hasAnyPermission([
      'read:feedback:sermon',
      'read:feedback:service',
      'read:feedback:testimony',
      'read:feedback:suggestion',
      'read:feedback:prayer',
      'read:feedback:general',
      'manage:feedback'
    ]);
  };

  /**
   * Check if user can respond to feedback of any category
   */
  const canRespondAnyFeedback = () => {
    return hasAnyPermission([
      'respond:feedback:sermon',
      'respond:feedback:service',
      'respond:feedback:testimony',
      'respond:feedback:suggestion',
      'respond:feedback:prayer',
      'respond:feedback:general',
      'manage:feedback'
    ]);
  };

  /**
   * Check if user can archive feedback of any category
   */
  const canArchiveAnyFeedback = () => {
    return hasAnyPermission([
      'archive:feedback:sermon',
      'archive:feedback:service',
      'archive:feedback:testimony',
      'archive:feedback:suggestion',
      'archive:feedback:prayer',
      'archive:feedback:general',
      'manage:feedback'
    ]);
  };

  /**
   * Get feedback categories user can access (read)
   */
  const getAccessibleFeedbackCategories = () => {
    const categories = [];
    
    if (canReadFeedbackSermon()) categories.push('sermon');
    if (canReadFeedbackService()) categories.push('service');
    if (canReadFeedbackTestimony()) categories.push('testimony');
    if (canReadFeedbackSuggestion()) categories.push('suggestion');
    if (canReadFeedbackPrayer()) categories.push('prayer');
    if (canReadFeedbackGeneral()) categories.push('general');
    
    return categories;
  };

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

      if (canReadAnyFeedback()) {
        sections.push({
          name: 'Feedback',
          href: '/portal/feedback',
          icon: 'MessageSquare',
          permission: 'manage:feedback'
        });
      }

      if (canManageLivestream()) {
        sections.push({
          name: 'Livestream',
          href: '/portal/livestream',
          icon: 'Play',
          permission: 'manage:livestream'
        });
      }

      if (canManageVolunteers()) {
        sections.push({
          name: 'Volunteers',
          href: '/portal/volunteers',
          icon: 'Users',
          permission: 'manage:volunteers'
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

    // Livestream
    canManageLivestream,

    // Feedback (Granular by Category)
    canManageFeedback,
    canReadAnyFeedback,
    canRespondAnyFeedback,
    canArchiveAnyFeedback,
    getAccessibleFeedbackCategories,
    canReadFeedbackSermon,
    canRespondFeedbackSermon,
    canReadFeedbackService,
    canRespondFeedbackService,
    canReadFeedbackTestimony,
    canRespondFeedbackTestimony,
    canPublishFeedbackTestimony,
    canArchiveFeedbackTestimony,
    canReadFeedbackSuggestion,
    canRespondFeedbackSuggestion,
    canArchiveFeedbackSuggestion,
    canReadFeedbackPrayer,
    canRespondFeedbackPrayer,
    canArchiveFeedbackPrayer,
    canReadFeedbackGeneral,
    canRespondFeedbackGeneral,
    canArchiveFeedbackGeneral,
    canViewFeedbackStats,

    // Volunteers
    canManageVolunteers,

    // Settings
    canManageSettings,

    // Analytics & Reporting
    canViewAnalytics,
    canViewAuditLogs
  };
};