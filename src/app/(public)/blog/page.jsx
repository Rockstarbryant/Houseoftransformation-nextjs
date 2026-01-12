'use client';

import React, { useState } from 'react';
import { Plus, Newspaper } from 'lucide-react';
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
    <div className="min-h-screen bg-white relative">
      <div className="absolute top-0 right-0 w-full h-[600px] bg-[radial-gradient(circle_at_top_right,_rgba(139,26,26,0.02)_0%,_transparent_50%)] pointer-events-none" />

      <div className="relative pt-24 md:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8B1A1A]/5 rounded-full mb-4">
                <Newspaper size={14} className="text-[#8B1A1A]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B1A1A]">Insight Feed</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                Church <span className="text-[#8B1A1A]">News</span>
              </h1>
            </div>

            {canPostBlog() && (
              <div className="flex justify-center md:justify-end">
                <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="primary" className="bg-[#8B1A1A] hover:bg-black text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-xl">
                  <Plus size={20} /> <span className="font-bold text-sm uppercase tracking-widest">Create Post</span>
                </Button>
              </div>
            )}
          </div>

          {/* Form Area */}
          {showCreateForm && (
            <div className="mb-16 bg-slate-50 p-6 md:p-10 rounded-[2rem] border border-slate-100 shadow-inner animate-in fade-in slide-in-from-top-4 duration-500">
              <CreateBlogForm onCancel={() => setShowCreateForm(false)} onBlogCreated={handleBlogCreated} />
            </div>
          )}

          {/* FIX: SCROLLABLE CATEGORY FILTER CONTAINER */}
          <div className="relative mb-12">
            {/* Left & Right Fades to indicate scrollability on mobile */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 md:hidden pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 md:hidden pointer-events-none" />
            
            <div className="overflow-x-auto no-scrollbar pb-2">
              <div className="flex min-w-max md:min-w-0 md:justify-center lg:justify-start px-4 md:px-0">
                <BlogFilter 
                  selectedCategory={selectedCategory} 
                  onCategoryChange={setSelectedCategory} 
                />
              </div>
            </div>
          </div>

          {/* Blog List Feed */}
          <div className="relative min-h-[400px]">
             <BlogList category={selectedCategory === 'All' ? null : selectedCategory} />
          </div>
        </div>
      </div>

      {/* CSS for hiding scrollbar while allowing scrolling */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}