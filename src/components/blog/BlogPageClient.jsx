'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import BlogList from '@/components/blog/BlogList';
import BlogFilter from '@/components/blog/BlogFilter';
import CreateBlogForm from '@/components/blog/CreateBlogForm';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';

export default function BlogPageClient({ initialBlogs }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { hasPermission } = useAuth();

  const handleBlogCreated = () => {
    setShowCreateForm(false);
    window.location.reload();
  };

  // Check if user can create blog
  const canCreateBlog = hasPermission('manage:blog');

  return (
    <>
      {/* Create Button */}
      {canCreateBlog && (
        <div className="flex justify-center md:justify-end mb-12">
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)} 
            variant="primary" 
            className="bg-[#8B1A1A] hover:bg-[#6B1515] text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-xl transition-colors"
          >
            <Plus size={20} />
            <span className="font-bold text-sm uppercase tracking-widest">Create Post</span>
          </Button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-16 bg-slate-50 dark:bg-slate-800 p-6 md:p-10 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-inner animate-in fade-in slide-in-from-top-4 duration-500">
          <CreateBlogForm 
            onCancel={() => setShowCreateForm(false)} 
            onBlogCreated={handleBlogCreated} 
          />
        </div>
      )}

      {/* Category Filter - Scrollable on mobile */}
      <div className="relative mb-12">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 md:hidden pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 md:hidden pointer-events-none" />
        
        <div className="overflow-x-auto no-scrollbar pb-2">
          <div className="flex min-w-max md:min-w-0 md:justify-center lg:justify-start px-4 md:px-0">
            <BlogFilter 
              selectedCategory={selectedCategory} 
              onCategoryChange={setSelectedCategory} 
            />
          </div>
        </div>
      </div>

      {/* Blog List */}
      <div className="relative min-h-[400px]">
        <BlogList 
          category={selectedCategory === 'all' ? null : selectedCategory}
          initialBlogs={initialBlogs}
        />
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}