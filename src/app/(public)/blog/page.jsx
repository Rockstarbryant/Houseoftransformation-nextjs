'use client';

import React, { useState } from 'react';
import { Plus, Newspaper, ArrowRight } from 'lucide-react';
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

  // --- Logic Preserved ---
  const handleBlogCreated = () => {
    setShowCreateForm(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-slate-50 to-transparent pointer-events-none" />

      {/* Main Container: Optimized for PC & Mobile edges */}
      <div className="relative pt-24 md:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Header Section: Editorial Layout */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-20">
            <div className="max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8B1A1A]/5 rounded-full mb-4">
                <Newspaper size={14} className="text-[#8B1A1A]" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#8B1A1A]">
                  Latest Updates
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                Church <span className="text-[#8B1A1A]">Insights</span> & News
              </h1>
              <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed">
                Stay updated with the latest stories, teachings, and announcements from our church community.
              </p>
            </div>

            {/* Admin Action Button */}
            {canPostBlog() && (
              <div className="flex justify-center md:justify-end">
                <Button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  variant="primary"
                  className="bg-[#8B1A1A] hover:bg-black text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-xl shadow-red-900/10 transition-all active:scale-95"
                >
                  <Plus size={20} />
                  <span className="font-bold text-sm uppercase tracking-widest">Create Post</span>
                </Button>
              </div>
            )}
          </div>

          {/* Conditional Alerts & Forms */}
          <div className="mb-12">
            {!canPostBlog() && user && (
              <PermissionAlert
                title="Admin Access Restricted"
                message="Your role does not have permission to publish blog posts."
                currentRole={user.role}
                actionType="blog post"
                className="rounded-3xl border-slate-100 shadow-sm"
              />
            )}

            {showCreateForm && (
              <div className="bg-slate-50 rounded-[2rem] p-6 md:p-10 border border-slate-100 shadow-inner mb-16">
                <CreateBlogForm
                  onCancel={() => setShowCreateForm(false)}
                  onBlogCreated={handleBlogCreated}
                />
              </div>
            )}
          </div>

          {/* Navigation & Content Area */}
          <div className="space-y-12">
            {/* Filter: Mobile swipable, PC center */}
            <div className="sticky top-20 z-10 bg-white/80 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0 border-y border-slate-50 md:border-none">
              <BlogFilter 
                selectedCategory={selectedCategory} 
                onCategoryChange={setSelectedCategory} 
              />
            </div>

            {/* Blog List Feed */}
            <div className="relative">
               <BlogList category={selectedCategory === 'All' ? null : selectedCategory} />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Mobile UI Enhancement */}
      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}