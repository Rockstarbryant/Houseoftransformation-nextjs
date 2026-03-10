// src/services/api/communicationService.js
import api from '@/lib/api';

class CommunicationService {

  // ── Meta ────────────────────────────────────────────────────────────────────

  async getUsers() {
    const res = await api.get('/communications/users');
    return res.data;
  }

  async getRoles() {
    const res = await api.get('/communications/roles');
    return res.data;
  }

  async getUsersByRole(roleId) {
    const res = await api.get(`/communications/users/role/${roleId}`);
    return res.data;
  }

  // ── Send ────────────────────────────────────────────────────────────────────

  /**
   * @param {object} payload
   * @param {string}   payload.subject       - Email subject (required for email channel)
   * @param {string}   payload.message       - Plain text body
   * @param {string[]} payload.channels      - ['email'] | ['sms'] | ['email','sms']
   * @param {string}   payload.recipientType - 'all' | 'bulk' | 'single' | 'role'
   * @param {string[]} [payload.targetRoles]   - Role ObjectIds (for role type)
   * @param {string[]} [payload.targetUserIds] - User ObjectIds (for bulk/single)
   * @param {string}   [payload.templateId]
   * @param {string}   [payload.scheduledFor] - ISO datetime
   */
  async send(payload) {
    const res = await api.post('/communications/send', payload);
    return res.data;
  }

  // ── History ─────────────────────────────────────────────────────────────────

  async getAll({ page = 1, limit = 20, status = null, channel = null } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (status)  params.set('status',  status);
    if (channel) params.set('channel', channel);
    const res = await api.get(`/communications?${params}`);
    return res.data;
  }

  async getById(id) {
    const res = await api.get(`/communications/${id}`);
    return res.data;
  }

  async deleteById(id) {
    const res = await api.delete(`/communications/${id}`);
    return res.data;
  }

  // ── Stats ───────────────────────────────────────────────────────────────────

  async getStats() {
    const res = await api.get('/communications/stats');
    return res.data;
  }

  // ── Templates ───────────────────────────────────────────────────────────────

  async getTemplates(category = null) {
    const params = category ? `?category=${category}` : '';
    const res = await api.get(`/communications/templates${params}`);
    return res.data;
  }

  async createTemplate(data) {
    const res = await api.post('/communications/templates', data);
    return res.data;
  }

  async updateTemplate(id, data) {
    const res = await api.put(`/communications/templates/${id}`, data);
    return res.data;
  }

  async deleteTemplate(id) {
    const res = await api.delete(`/communications/templates/${id}`);
    return res.data;
  }
}

export default new CommunicationService();