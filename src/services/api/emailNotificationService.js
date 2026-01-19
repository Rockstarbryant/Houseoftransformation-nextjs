// src/services/api/emailNotificationService.js
import api from '@/lib/api';

/**
 * Email Notification Service
 * Handles all email notification operations
 */

class EmailNotificationService {
  
  // ============================================
  // USER MANAGEMENT
  // ============================================
  
  /**
   * Get all users for email selection
   */
  async getUsers() {
    try {
      const response = await api.get('/email-notifications/users');
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get all roles
   */
  async getRoles() {
    try {
      const response = await api.get('/email-notifications/roles');
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(roleId) {
    try {
      const response = await api.get(`/email-notifications/users/role/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error fetching users by role:', error);
      throw error;
    }
  }

  // ============================================
  // EMAIL SENDING
  // ============================================

  /**
   * Send email to single user
   */
  async sendSingleEmail(userId, subject, message, scheduledFor = null) {
    try {
      const response = await api.post('/email-notifications/send-single', {
        userId,
        subject,
        message,
        scheduledFor
      });
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error sending single email:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails to selected users
   */
  async sendBulkEmails(userIds, subject, message, scheduledFor = null) {
    try {
      const response = await api.post('/email-notifications/send-bulk', {
        userIds,
        subject,
        message,
        scheduledFor
      });
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error sending bulk emails:', error);
      throw error;
    }
  }

  /**
   * Send email to all users
   */
  async sendToAllUsers(subject, message, scheduledFor = null) {
    try {
      const response = await api.post('/email-notifications/send-all', {
        subject,
        message,
        scheduledFor
      });
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error sending to all users:', error);
      throw error;
    }
  }

  /**
   * Send email by role
   */
  async sendByRole(roleId, subject, message, scheduledFor = null) {
    try {
      const response = await api.post('/email-notifications/send-by-role', {
        roleId,
        subject,
        message,
        scheduledFor
      });
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error sending by role:', error);
      throw error;
    }
  }

  // ============================================
  // EMAIL HISTORY
  // ============================================

  /**
   * Get email history
   */
  async getEmailHistory(page = 1, limit = 20, status = null, type = null) {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      if (type) params.append('type', type);

      const response = await api.get(`/email-notifications/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error fetching history:', error);
      throw error;
    }
  }

  /**
   * Get email log details
   */
  async getEmailLogDetails(id) {
    try {
      const response = await api.get(`/email-notifications/history/${id}`);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error fetching email log:', error);
      throw error;
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStatistics() {
    try {
      const response = await api.get('/email-notifications/statistics');
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error fetching statistics:', error);
      throw error;
    }
  }

  // ============================================
  // TEMPLATES
  // ============================================

  /**
   * Get all templates
   */
  async getTemplates(category = null) {
    try {
      const params = category ? `?category=${category}` : '';
      const response = await api.get(`/email-notifications/templates${params}`);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Create template
   */
  async createTemplate(templateData) {
    try {
      const response = await api.post('/email-notifications/templates', templateData);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error creating template:', error);
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(id, templateData) {
    try {
      const response = await api.put(`/email-notifications/templates/${id}`, templateData);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error updating template:', error);
      throw error;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(id) {
    try {
      const response = await api.delete(`/email-notifications/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error deleting template:', error);
      throw error;
    }
  }

  // ============================================
  // DRAFTS
  // ============================================

  /**
   * Save draft
   */
  async saveDraft(draftData) {
    try {
      const response = await api.post('/email-notifications/drafts', draftData);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error saving draft:', error);
      throw error;
    }
  }

  /**
   * Get drafts
   */
  async getDrafts() {
    try {
      const response = await api.get('/email-notifications/drafts');
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error fetching drafts:', error);
      throw error;
    }
  }

  /**
   * Delete draft
   */
  async deleteDraft(id) {
    try {
      const response = await api.delete(`/email-notifications/drafts/${id}`);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error deleting draft:', error);
      throw error;
    }
  }

  // ============================================
  // INBOX (RECEIVED EMAILS)
  // ============================================

  /**
   * Get inbox
   */
  async getInbox(page = 1, limit = 20, status = null, category = null) {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      if (category) params.append('category', category);

      const response = await api.get(`/email-notifications/inbox?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error fetching inbox:', error);
      throw error;
    }
  }

  /**
   * Create received email
   */
  async createReceivedEmail(emailData) {
    try {
      const response = await api.post('/email-notifications/inbox', emailData);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error creating received email:', error);
      throw error;
    }
  }

  /**
   * Update received email
   */
  async updateReceivedEmail(id, updateData) {
    try {
      const response = await api.patch(`/email-notifications/inbox/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error updating received email:', error);
      throw error;
    }
  }

  /**
   * Delete received email
   */
  async deleteReceivedEmail(id) {
    try {
      const response = await api.delete(`/email-notifications/inbox/${id}`);
      return response.data;
    } catch (error) {
      console.error('[EMAIL-NOTIFICATION-SERVICE] Error deleting received email:', error);
      throw error;
    }
  }
}

export default new EmailNotificationService();