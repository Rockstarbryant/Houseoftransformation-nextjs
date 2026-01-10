'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import BlogList from '@/components/blog/BlogList';
import BlogFilter from '@/components/blog/BlogFilter';
import CreateBlogForm from '@/components/blog/CreateBlogForm';
import { useAuthContext } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import PermissionAlert from '@/components/common/PermissionAlert';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { canPostBlog, user } = useAuthContext();

  const handleBlogCreated = () => {
    setShowCreateForm(false);
    window.location.reload();
  };

  return (
    <div className="pt-20 pb-20 bg-teal-500 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900">Church News & Blog</h1>
          {canPostBlog() && (
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant="primary"
              className="flex items-center gap-2"
            >
              <Plus size={20} /> Create Post
            </Button>
          )}
        </div>

        {!canPostBlog() && user && (
          <PermissionAlert
            title="Cannot Create Blog Posts"
            message="Your role does not have permission to create blog posts."
            currentRole={user.role}
            actionType="blog post"
          />
        )}

        {showCreateForm && (
          <CreateBlogForm
            onCancel={() => setShowCreateForm(false)}
            onBlogCreated={handleBlogCreated}
          />
        )}

        <BlogFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        <BlogList category={selectedCategory === 'All' ? null : selectedCategory} />
      </div>
    </div>
  );
}