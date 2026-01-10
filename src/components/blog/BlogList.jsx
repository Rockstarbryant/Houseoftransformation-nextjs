'use client';

import React, { useState, useEffect } from 'react';
import BlogCard from './BlogCard';
import Loader from '../common/Loader';
import { blogService } from '@/services/api/blogService';

const BlogList = ({ limit, category, onBlogDelete, onBlogEdit }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [limit, category]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let data;
      if (category) {
        data = await blogService.getBlogsByCategory(category);
      } else {
        data = await blogService.getBlogs();
      }
      setPosts(data.blogs || data);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    try {
      await blogService.deleteBlog(blogId);
      setPosts(posts.filter(p => p._id !== blogId));
      if (onBlogDelete) {
        onBlogDelete(blogId);
      }
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Failed to delete blog post');
    }
  };

  const handleEdit = (blog) => {
    if (onBlogEdit) {
      onBlogEdit(blog);
    }
  };

  if (loading) return <Loader />;
  
  if (error) return <div className="text-center text-red-500">{error}</div>;
  
  if (posts.length === 0) return <div className="text-center text-gray-500">No blog posts found</div>;

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {posts.map(post => (
        <BlogCard 
          key={post._id} 
          post={post}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
};

export default BlogList;