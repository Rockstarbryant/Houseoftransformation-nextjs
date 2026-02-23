import api from './authService';
import { API_ENDPOINTS } from '../../utils/constants';

export const galleryService = {
  /**
   * Get all photos with optional category filter
   */
  async getPhotos(params = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.GALLERY.LIST, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  },

  /**
   * Upload a single photo.
   * Called once per file by GalleryUploader (sequential loop).
   * 
   * FIXES:
   * - No artificial delays (they cause timeouts on mobile)
   * - Long timeout (90s) to handle slow mobile data
   * - Do NOT override Content-Type manually — let the browser set it with
   *   the correct multipart boundary. Setting it manually breaks multipart.
   */
  async uploadPhoto(formData) {
    try {
      const response = await api.post(API_ENDPOINTS.GALLERY.UPLOAD, formData, {
        // ⚠️  CRITICAL: Do NOT set 'Content-Type': 'multipart/form-data' manually.
        // The browser must set this automatically so it includes the correct
        // boundary string (e.g. "multipart/form-data; boundary=----xyz").
        // If you override it, multer receives a malformed body and can't parse
        // the file — causing "No file uploaded" errors on both mobile and PC.
        headers: {
          // Only override if your axios instance globally sets application/json
          // and you need to reset to undefined so the browser takes over:
          'Content-Type': undefined,
        },
        timeout: 90000, // 90s — generous for slow mobile connections
      });
      return response.data;
    } catch (error) {
      console.error('Upload service error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Delete photo by ID
   */
  async deletePhoto(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.GALLERY.DELETE(id));
      return response.data;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  },

  /**
   * Like/unlike photo by ID
   */
  async likePhoto(id) {
    try {
      const response = await api.post(API_ENDPOINTS.GALLERY.LIKE(id));
      return response.data;
    } catch (error) {
      console.error('Like error:', error);
      throw error;
    }
  },
};