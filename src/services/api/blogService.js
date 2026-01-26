import api from './authService';

export const blogService = {
  async getBlogs() {
    try {
      console.log('[BLOG-SERVICE] Fetching all blogs');
      const response = await api.get('/blog');
      console.log('[BLOG-SERVICE] Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error fetching blogs:', error);
      throw error;
    }
  },

  async getBlogsByCategory(category) {
    try {
      // Ensure category is lowercase
      const categoryLower = category.toLowerCase().trim();
      console.log('[BLOG-SERVICE] Fetching blogs for category:', categoryLower);
      
      // Use query parameter format
      const response = await api.get('/blog', {
        params: {
          category: categoryLower
        }
      });
      
      console.log('[BLOG-SERVICE] Category response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error fetching category blogs:', error);
      throw error;
    }
  },

  async getBlog(id) {
    try {
      const response = await api.get(`/blog/${id}`);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error fetching blog:', error);
      throw error;
    }
  },

  async createBlog(blogData) {
    try {
      const response = await api.post('/blog', blogData);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error creating blog:', error);
      throw error;
    }
  },

  async updateBlog(id, blogData) {
    try {
      const response = await api.put(`/blog/${id}`, blogData);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error updating blog:', error);
      throw error;
    }
  },

  async deleteBlog(id) {
    try {
      const response = await api.delete(`/blog/${id}`);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error deleting blog:', error);
      throw error;
    }
  },

  async approveBlog(id) {
    try {
      const response = await api.put(`/blog/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error approving blog:', error);
      throw error;
    }
  },

  async getPendingBlogs() {
    try {
      const response = await api.get('/blog/pending');
      return response.data;
    } catch (error) {
      console.error('[BLOG-SERVICE] Error fetching pending blogs:', error);
      throw error;
    }
  }
};