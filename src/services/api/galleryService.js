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
   * ✅ COMPLETE MOBILE FIX: Upload photo with retry + mobile optimization
   */
  async uploadPhoto(formData, maxRetries = 3) { // ✅ Increased to 3 retries for mobile
    let lastError;

    // ✅ CRITICAL: Mobile needs delay AFTER FormData creation
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('📱 Mobile detected - adding stabilization delay');
      await new Promise(resolve => setTimeout(resolve, 15000)); // ✅ Increased to 1.5s
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt}/${maxRetries}`);
          // Exponential backoff: 2s, 4s, 8s
          const delay = 6000 * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        console.log(`📤 Upload attempt ${attempt + 1}/${maxRetries + 1}`);

        const response = await api.post(API_ENDPOINTS.GALLERY.UPLOAD, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          },
          timeout: isMobile ? 90000 : 60000, // ✅ 90s for mobile, 60s for desktop
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          }
        });

        console.log('✅ Upload successful');
        return response.data;

      } catch (error) {
        lastError = error;
        
        console.error(`❌ Upload attempt ${attempt + 1} failed:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });

        // Don't retry for client errors (400-499) - these are validation errors
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          console.log('🚫 Client error - not retrying');
          throw error;
        }

        // Don't retry if max attempts reached
        if (attempt === maxRetries) {
          console.log('🚫 Max retries reached');
          throw error;
        }

        console.log(`⏳ Will retry in ${2 * Math.pow(2, attempt)}s...`);
      }
    }

    throw lastError;
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