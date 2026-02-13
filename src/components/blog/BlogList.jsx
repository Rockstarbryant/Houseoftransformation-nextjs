'use client';

import React, { useState, useEffect } from 'react';
import BlogCard from './BlogCard';
import Loader from '../common/Loader';
import { blogService } from '@/services/api/blogService';

// ✅ FIXED: Now accepts and uses initialBlogs from server
const BlogList = ({ limit, category, onBlogDelete, onBlogEdit, initialBlogs = [] }) => {
  const [posts, setPosts] = useState(initialBlogs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ FIX: Only refetch when category changes (not on initial mount if we have initialBlogs)
  useEffect(() => {
    // If we have initialBlogs and no category filter, use them
    if (initialBlogs.length > 0 && !category) {
      setPosts(initialBlogs);
      return;
    }
    
    // Otherwise, fetch from API
    fetchPosts();
  }, [category]); // Removed limit dependency to avoid unnecessary refetches

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
  
  if (posts.length === 0) return (
    <div className="text-center py-20">
      <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-sm">
        No blog posts found
      </p>
    </div>
  );

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