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
      const hasThumbnailFile = sermonData.thumbnail instanceof File;
      const hasImages = Array.isArray(sermonData.images) && 
                       sermonData.images.some(img => img instanceof File);

      if (hasThumbnailFile || hasImages) {
        const formData = new FormData();
        
        // ✅ Only append known safe scalar fields
        const safeFields = ['title', 'pastor', 'date', 'category', 'description', 'descriptionHtml', 'type', 'videoUrl'];
        
        safeFields.forEach(field => {
          if (sermonData[field] !== null && sermonData[field] !== undefined) {
            formData.append(field, sermonData[field]);
          }
        });

        if (hasThumbnailFile) {
          formData.append('thumbnail', sermonData.thumbnail);
        }

        if (hasImages) {
          sermonData.images.forEach(img => {
            if (img instanceof File) {
              formData.append('images', img);
            }
          });
        }

        const response = await api.post(API_ENDPOINTS.SERMONS.CREATE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      } else {
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

      // ✅ Fields that must never be sent in updates
      const forbiddenFields = new Set([
        'likedBy', 'bookmarkedBy', 'viewedBy', 'views', 'likes', 
        'comments', '_id', '__v', 'createdAt', 'updatedAt', 'id'
      ]);

      if (hasThumbnailFile || hasImages) {
        const formData = new FormData();

        Object.keys(updates).forEach(key => {
          // ✅ Skip forbidden fields
          if (forbiddenFields.has(key)) return;
          
          if (key === 'thumbnail') {
            if (updates[key] instanceof File) {
              formData.append('thumbnail', updates[key]);
            } else if (typeof updates[key] === 'string' && updates[key].startsWith('http')) {
              formData.append('thumbnail', updates[key]);
            }
          } else if (key === 'images') {
            if (Array.isArray(updates[key])) {
              updates[key].forEach(img => {
                if (img instanceof File) {
                  formData.append('images', img);
                }
              });
            }
          } else if (updates[key] !== null && updates[key] !== undefined) {
            // ✅ Skip empty arrays serialized as strings
            const val = updates[key];
            if (Array.isArray(val) && val.length === 0) return;
            formData.append(key, val);
          }
        });

        const response = await api.put(API_ENDPOINTS.SERMONS.UPDATE(id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      } else {
        // ✅ Also sanitize JSON updates
        const sanitized = Object.fromEntries(
          Object.entries(updates).filter(([key]) => !forbiddenFields.has(key))
        );
        const response = await api.put(API_ENDPOINTS.SERMONS.UPDATE(id), sanitized);
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

  async trackView(id, deviceId) {
    const response = await api.post(`/sermons/${id}/view`, { deviceId });
    return response.data;
  },

  async toggleBookmark(id) {
    const response = await api.post(`/sermons/${id}/bookmark`);
    return response.data;
  },

  async getUserBookmarks(page = 1, limit = 12) {
    const response = await api.get(`/sermons/bookmarks/my-bookmarks?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getUserLikes(page = 1, limit = 12) {
    const response = await api.get(`/sermons/likes/my-likes?page=${page}&limit=${limit}`);
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