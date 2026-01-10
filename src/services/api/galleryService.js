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
   * Upload photo with FormData
   * Expects FormData with fields: photo, title, description, category
   */
  async uploadPhoto(formData) {
    try {
      const response = await api.post(API_ENDPOINTS.GALLERY.UPLOAD, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
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
  }
};