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
   * ✅ IMPROVED: Upload photo with FormData and automatic retry logic
   * Expects FormData with fields: photo, title, description, category
   * 
   * @param {FormData} formData - The form data containing the photo and metadata
   * @param {number} maxRetries - Maximum number of retry attempts (default: 2)
   * @returns {Promise} Response data from the server
   */
  async uploadPhoto(formData, maxRetries = 2) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt}/${maxRetries}`);
          // Exponential backoff: wait 1s, then 2s, then 4s
          const delay = 1000 * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        console.log(`📤 Upload attempt ${attempt + 1}/${maxRetries + 1}`);

        const response = await api.post(API_ENDPOINTS.GALLERY.UPLOAD, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000, // 30 second timeout for mobile/slow connections
          // Optional: Track upload progress
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
        
        // Log the error details
        console.error(`❌ Upload attempt ${attempt + 1} failed:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });

        // Don't retry for client errors (400-499) - these are validation errors
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          console.log('🚫 Client error detected - not retrying');
          throw error;
        }

        // Don't retry if we've hit the max attempts
        if (attempt === maxRetries) {
          console.log('🚫 Max retries reached');
          throw error;
        }

        // Log the retry
        console.log(`⏳ Will retry in ${Math.pow(2, attempt)}s...`);
      }
    }

    // This should never be reached, but just in case
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
  },

  /**
   * ✅ NEW: Batch upload multiple photos with progress tracking
   * 
   * @param {Array} filesWithData - Array of objects with {file, title, description, category}
   * @param {Function} onProgress - Optional callback for progress updates
   * @returns {Promise} Object with successful and failed uploads
   * 
   * Example usage:
   * const results = await galleryService.uploadMultiplePhotos(
   *   [{file, title, description, category}, ...],
   *   (progress) => console.log(progress)
   * );
   * // Returns: { successful: [...], failed: [...], total: 5 }
   */
  async uploadMultiplePhotos(filesWithData, onProgress = null) {
    const results = {
      successful: [],
      failed: [],
      total: filesWithData.length
    };

    // Process all files sequentially
    for (let i = 0; i < filesWithData.length; i++) {
      const { file, title, description, category } = filesWithData[i];
      
      try {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('title', title);
        formData.append('description', description || '');
        formData.append('category', category || 'Worship Services');

        const response = await this.uploadPhoto(formData);
        results.successful.push({
          fileName: file.name,
          data: response
        });

        // Call progress callback if provided
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: filesWithData.length,
            fileName: file.name,
            status: 'success'
          });
        }

      } catch (error) {
        results.failed.push({
          fileName: file.name,
          error: error.response?.data?.message || error.message
        });

        // Call progress callback if provided
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: filesWithData.length,
            fileName: file.name,
            status: 'failed',
            error: error.message
          });
        }
      }
    }

    // Return results after ALL files are processed
    return results;
  }
};