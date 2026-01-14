import api from './authService';

export const blogService = {
  async getBlogs() {
    try {
      const response = await api.get('/blogs');  // ✅ Changed to /blogs
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getBlogsByCategory(category) {
    try {
      const response = await api.get(`/blogs?category=${category}`);  // ✅ Changed to /blogs
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getBlog(id) {
    try {
      const response = await api.get(`/blogs/${id}`);  // ✅ Changed to /blogs
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createBlog(blogData) {
    try {
      const response = await api.post('/blogs', blogData);  // ✅ Changed to /blogs
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateBlog(id, blogData) {
    try {
      const response = await api.put(`/blogs/${id}`, blogData);  // ✅ Changed to /blogs
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteBlog(id) {
    try {
      const response = await api.delete(`/blogs/${id}`);  // ✅ Changed to /blogs
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async approveBlog(id) {
    try {
      const response = await api.put(`/blogs/${id}/approve`);  // ✅ Changed to /blogs
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPendingBlogs() {
    try {
      const response = await api.get('/blogs/pending');  // ✅ Changed to /blogs
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