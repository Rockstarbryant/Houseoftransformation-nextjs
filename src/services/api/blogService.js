import api from './authService';

export const blogService = {
  /**
   * Get all blogs or filter by category
   * @param {Object} params - Query parameters
   * @param {string} params.category - Optional category filter
   * @returns {Promise<Object>} Response with blogs array
   */
  async getBlogs(params = {}) {
    try {
      const { category } = params;
      console.log('[BLOG-SERVICE] Fetching blogs', category ? `for category: ${category}` : '');
      
      const response = await api.get('/blog', {
        params: category ? { category: category.toLowerCase().trim() } : {}
      });
      
      console.log('[BLOG-SERVICE] Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error fetching blogs:', error);
      throw error;
    }
  },

  /**
   * Get blogs by category (alternative method)
   * @param {string} category - Category name
   * @returns {Promise<Object>} Response with filtered blogs
   */
  async getBlogsByCategory(category) {
    try {
      const categoryLower = category.toLowerCase().trim();
      console.log('[BLOG-SERVICE] Fetching blogs for category:', categoryLower);
      
      const response = await api.get('/blog', {
        params: { category: categoryLower }
      });
      
      console.log('[BLOG-SERVICE] Category response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error fetching category blogs:', error);
      throw error;
    }
  },

  /**
   * Get single blog by ID
   * @param {string} id - Blog ID
   * @returns {Promise<Object>} Blog data
   */
  async getBlog(id) {
    try {
      console.log('[BLOG-SERVICE] Fetching blog:', id);
      const response = await api.get(`/blog/${id}`);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error fetching blog:', error);
      throw error;
    }
  },

  /**
   * Get single blog by slug (SEO-friendly)
   * @param {string} slug - Blog slug
   * @returns {Promise<Object>} Blog data
   */
  async getBlogBySlug(slug) {
    try {
      console.log('[BLOG-SERVICE] Fetching blog by slug:', slug);
      const response = await api.get(`/blog/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error fetching blog by slug:', error);
      throw error;
    }
  },

  /**
   * ✅ VIEW TRACKING: Track unique view for a blog
   * @param {string} id - Blog ID
   * @param {string} deviceId - Unique device identifier
   * @returns {Promise<Object>} Response with view count
   */
  async trackView(id, deviceId) {
    try {
      console.log('[BLOG-SERVICE] Tracking view for blog:', id);
      const response = await api.post(`/blog/${id}/view`, { deviceId });
      console.log('[BLOG-SERVICE] View tracked:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error tracking view:', error);
      throw error;
    }
  },

  /**
   * Create new blog post
   * @param {Object} blogData - Blog data (title, content, category, etc.)
   * @returns {Promise<Object>} Created blog
   */
  async createBlog(blogData) {
    try {
      console.log('[BLOG-SERVICE] Creating blog');
      const response = await api.post('/blog', blogData);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error creating blog:', error);
      throw error;
    }
  },

  /**
   * Update existing blog post
   * @param {string} id - Blog ID
   * @param {Object} blogData - Updated blog data
   * @returns {Promise<Object>} Updated blog
   */
  async updateBlog(id, blogData) {
    try {
      console.log('[BLOG-SERVICE] Updating blog:', id);
      const response = await api.put(`/blog/${id}`, blogData);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error updating blog:', error);
      throw error;
    }
  },

  /**
   * Delete blog post
   * @param {string} id - Blog ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteBlog(id) {
    try {
      console.log('[BLOG-SERVICE] Deleting blog:', id);
      const response = await api.delete(`/blog/${id}`);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error deleting blog:', error);
      throw error;
    }
  },

  /**
   * Approve blog post (admin only)
   * @param {string} id - Blog ID
   * @returns {Promise<Object>} Approved blog
   */
  async approveBlog(id) {
    try {
      console.log('[BLOG-SERVICE] Approving blog:', id);
      const response = await api.put(`/blog/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error approving blog:', error);
      throw error;
    }
  },

  /**
   * Get pending blogs awaiting approval (admin only)
   * @returns {Promise<Object>} Pending blogs
   */
  async getPendingBlogs() {
    try {
      console.log('[BLOG-SERVICE] Fetching pending blogs');
      const response = await api.get('/blog/pending');
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error fetching pending blogs:', error);
      throw error;
    }
  }
};