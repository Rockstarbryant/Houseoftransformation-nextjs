/**
 * Notice Service
 * Uses the shared axios `api` instance from @/lib/api.
 * The instance already attaches Bearer tokens automatically via its
 * request interceptor — no manual auth headers needed.
 */

import api from '@/lib/api';

/**
 * GET /api/notices/active
 * Public — no auth required. Called by NoticeBar on every page.
 * Uses the axios instance so the base URL is consistent.
 */
export const getActiveNotice = async () => {
  try {
    const res = await api.get('/notices/active');
    return res.data?.data ?? null; // notice object or null
  } catch (error) {
    // Silently fail — never block page render for a notice bar
    console.error('[noticeService] getActiveNotice error:', error?.response?.data || error.message);
    return null;
  }
};

/**
 * GET /api/notices
 * Protected — manage:announcements
 */
export const getAllNotices = async () => {
  const res = await api.get('/notices');
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed to fetch notices');
  return res.data.data;
};

/**
 * POST /api/notices
 * Protected — manage:announcements
 */
export const createNotice = async (data) => {
  const res = await api.post('/notices', data);
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed to create notice');
  return res.data.data;
};

/**
 * PUT /api/notices/:id
 * Protected — manage:announcements
 */
export const updateNotice = async (id, data) => {
  const res = await api.put(`/notices/${id}`, data);
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed to update notice');
  return res.data.data;
};

/**
 * PATCH /api/notices/:id/toggle
 * Protected — manage:announcements
 */
export const toggleNotice = async (id) => {
  const res = await api.patch(`/notices/${id}/toggle`);
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed to toggle notice');
  return res.data.data;
};

/**
 * DELETE /api/notices/:id
 * Protected — manage:announcements
 */
export const deleteNotice = async (id) => {
  const res = await api.delete(`/notices/${id}`);
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed to delete notice');
  return true;
};