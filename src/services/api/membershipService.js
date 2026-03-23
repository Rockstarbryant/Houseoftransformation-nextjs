/**
 * membershipService.js
 * API calls for the church membership application system.
 */

import api from '@/lib/api';

const BASE = '/members';

// ── Public (no JWT) ───────────────────────────────────────────────────────────

/**
 * Submit a new membership application.
 * Called immediately after signup — the user has no JWT yet.
 * @param {Object} formData  All membership form fields
 */
export const submitMembershipApplication = async (formData) => {
  const { data } = await api.post(BASE, formData);
  return data;
};

/**
 * Check whether an application already exists for a given email.
 * @param {string} email
 */
export const checkMembershipByEmail = async (email) => {
  const { data } = await api.get(`${BASE}/check/${encodeURIComponent(email)}`);
  return data; // { success, exists, status }
};

// ── Authenticated user — own application ─────────────────────────────────────

/**
 * Get the currently logged-in user's membership record (if any).
 */
export const getMyMembership = async () => {
  const { data } = await api.get(`${BASE}/me`);
  return data; // { success, exists, data }
};

// ── Admin / manage:members ────────────────────────────────────────────────────

/**
 * Get aggregate counts by status.
 */
export const getMemberStats = async () => {
  const { data } = await api.get(`${BASE}/stats`);
  return data; // { success, data: { total, pending, approved, rejected } }
};

/**
 * Get paginated list of membership applications.
 * @param {{ page?, limit?, status?, search? }} params
 */
export const getAllMembers = async (params = {}) => {
  const { data } = await api.get(BASE, { params });
  return data; // { success, data: [...], pagination: { total, page, limit, pages } }
};

/**
 * Get a single membership record by ID.
 * @param {string} id  MongoDB ObjectId
 */
export const getMemberById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  return data; // { success, data: membership }
};

/**
 * Full update of a membership record (admin data correction).
 * @param {string} id
 * @param {Object} updates  Fields to overwrite
 */
export const updateMember = async (id, updates) => {
  const { data } = await api.put(`${BASE}/${id}`, updates);
  return data;
};

/**
 * Approve or reject an application.
 * @param {string} id
 * @param {'approved'|'rejected'} status
 * @param {string} [notes]  Optional review notes
 */
export const updateMemberStatus = async (id, status, notes = '') => {
  const { data } = await api.patch(`${BASE}/${id}/status`, { status, notes });
  return data;
};

/**
 * Permanently delete a membership record.
 * @param {string} id
 */
export const deleteMember = async (id) => {
  const { data } = await api.delete(`${BASE}/${id}`);
  return data;
};