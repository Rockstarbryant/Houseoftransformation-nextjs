import api from './authService';
import { API_ENDPOINTS } from '../../utils/constants';

export const sermonService = {
  async getSermons(params = {}) {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      type,
      sortBy = 'date' 
    } = params;

    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy,
      ...(category && { category }),
      ...(search && { search }),
      ...(type && { type })
    });

    const response = await api.get(`${API_ENDPOINTS.SERMONS.LIST}?${queryParams}`);
    return response.data;
  },

  async getSermon(id) {
    const response = await api.get(API_ENDPOINTS.SERMONS.GET(id));
    return response.data;
  },

  /**
   * Create sermon with file uploads (thumbnail + multiple images)
   * Detects File objects and sends FormData
   */
  async createSermon(sermonData) {
    try {
      // Check if we have any files to upload
      const hasThumbnailFile = sermonData.thumbnail instanceof File;
      const hasImages = Array.isArray(sermonData.images) && 
                       sermonData.images.some(img => img instanceof File);

      if (hasThumbnailFile || hasImages) {
        // Use FormData for file uploads
        const formData = new FormData();
        
        // Add basic fields
        formData.append('title', sermonData.title);
        formData.append('pastor', sermonData.pastor);
        formData.append('date', sermonData.date);
        formData.append('category', sermonData.category);
        formData.append('description', sermonData.description);
        formData.append('type', sermonData.type);
        
        if (sermonData.videoUrl) {
          formData.append('videoUrl', sermonData.videoUrl);
        }

        // Add thumbnail file
        if (hasThumbnailFile) {
          formData.append('thumbnail', sermonData.thumbnail);
        }

        // Add multiple images
        if (hasImages) {
          sermonData.images.forEach((img, idx) => {
            if (img instanceof File) {
              formData.append(`images`, img);
            }
          });
        }

        const response = await api.post(API_ENDPOINTS.SERMONS.CREATE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      } else {
        // No files, send as JSON
        const response = await api.post(API_ENDPOINTS.SERMONS.CREATE, sermonData);
        return response.data;
      }
    } catch (error) {
      console.error('Create sermon error:', error);
      throw error;
    }
  },

  /**
   * Update sermon with optional file uploads
   */
  async updateSermon(id, updates) {
    try {
      const hasThumbnailFile = updates.thumbnail instanceof File;
      const hasImages = Array.isArray(updates.images) && 
                       updates.images.some(img => img instanceof File);

      if (hasThumbnailFile || hasImages) {
        // Use FormData for file uploads
        const formData = new FormData();

        // Add all fields
        Object.keys(updates).forEach(key => {
          if (key === 'thumbnail') {
            if (updates[key] instanceof File) {
              formData.append('thumbnail', updates[key]);
            } else if (typeof updates[key] === 'string') {
              formData.append('thumbnail', updates[key]);
            }
          } else if (key === 'images') {
            // Only append File objects for images, skip URL strings
            if (Array.isArray(updates[key])) {
              updates[key].forEach(img => {
                if (img instanceof File) {
                  formData.append('images', img);
                }
              });
            }
          } else if (updates[key] !== null && updates[key] !== undefined) {
            formData.append(key, updates[key]);
          }
        });

        const response = await api.put(API_ENDPOINTS.SERMONS.UPDATE(id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      } else {
        // No files, send as JSON
        const response = await api.put(API_ENDPOINTS.SERMONS.UPDATE(id), updates);
        return response.data;
      }
    } catch (error) {
      console.error('Update sermon error:', error);
      throw error;
    }
  },

  async deleteSermon(id) {
    const response = await api.delete(API_ENDPOINTS.SERMONS.DELETE(id));
    return response.data;
  },

  async toggleLike(id) {
    const response = await api.post(`/sermons/${id}/like`);
    return response.data;
  },

  async getFeaturedSermons(limit = 3) {
    const response = await api.get(`${API_ENDPOINTS.SERMONS.LIST}?featured=true&limit=${limit}`);
    return response.data;
  },

  async getSermonsByPastor(pastorId) {
    const response = await api.get(`${API_ENDPOINTS.SERMONS.LIST}?pastor=${pastorId}`);
    return response.data;
  },

  async getSermonsByType(type) {
    const response = await api.get(`${API_ENDPOINTS.SERMONS.LIST}?type=${type}`);
    return response.data;
  }
};