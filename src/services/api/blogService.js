import api from './authService';

export const blogService = {
  async getBlogs() {
    try {
      const response = await api.get('/blog');  // ✅ Reverted to /blog
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getBlogsByCategory(category) {
    try {
      const response = await api.get(`/blog?category=${category}`);  // ✅ Reverted to /blog
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getBlog(id) {
    try {
      const response = await api.get(`/blog/${id}`);  // ✅ Reverted to /blog
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createBlog(blogData) {
    try {
      const response = await api.post('/blog', blogData);  // ✅ Reverted to /blog
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateBlog(id, blogData) {
    try {
      const response = await api.put(`/blog/${id}`, blogData);  // ✅ Reverted to /blog
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteBlog(id) {
    try {
      const response = await api.delete(`/blog/${id}`);  // ✅ Reverted to /blog
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async approveBlog(id) {
    try {
      const response = await api.put(`/blog/${id}/approve`);  // ✅ Reverted to /blog
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPendingBlogs() {
    try {
      const response = await api.get('/blog/pending');  // ✅ Reverted to /blog
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Legacy methods
  async getPosts() {
    return this.getBlogs();
  },

  async createBlogPost(blogData) {
    return this.createBlog(blogData);
  },

  async deletePost(id) {
    return this.deleteBlog(id);
  }
};