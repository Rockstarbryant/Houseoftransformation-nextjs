'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Edit, Trash2, Calendar, Newspaper } from 'lucide-react';
import Card from '../common/Card';
import { formatDate, truncateText } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';

const BlogCard = ({ post, onDelete, onEdit }) => {
  const router = useRouter();
  const { canEditBlog, canDeleteBlog } = useAuth();
  // Robust navigation handler
  const handleReadMore = (e) => {
    if (e) e.stopPropagation(); // Stop click from triggering other elements
    router.push(`/blog/${post._id}`);
  };



  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      onDelete(post._id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(post);
  };

  const categoryColors = {
    testimonies: 'bg-purple-50 text-purple-700 border-purple-100',
    events: 'bg-blue-50 text-blue-700 border-blue-100',
    teaching: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    news: 'bg-amber-50 text-amber-700 border-amber-100'
  };

  return (
    <div className="w-full h-full p-0.5 md:p-0">
      {/* 1. Added e to the Card onClick */}
      <Card 
        className="group flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl md:rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden mx-0.5 md:mx-0 cursor-pointer"
        onClick={(e) => handleReadMore(e)}
      >
        {/* Banner Section */}
        <div className="relative h-48 md:h-56 overflow-hidden bg-slate-900 dark:bg-slate-700 group-hover:scale-105 transition-transform duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-90 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-2xl">
            {post.image || <Newspaper className="text-white/20 w-16 h-16" />}
          </div>
          
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${categoryColors[post.category] || 'bg-white/90 text-slate-800 border-slate-200'}`}>
              {post.category || 'General'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 md:p-8 flex flex-col flex-grow">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            <Calendar size={12} className="text-[#8B1A1A]" />
            {formatDate(post.createdAt || post.date, 'short')}
          </div>

          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter leading-tight group-hover:text-[#8B1A1A] transition-colors">
            {post.title}
          </h3>

          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 flex-grow">
            {truncateText(post.excerpt || post.content, 110)}
          </p>

          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                {post.author?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black leading-none text-slate-900 dark:text-white">
                  {post.author?.name || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Admin & Read More Actions */}
            <div className="flex items-center gap-1">
              {canEditBlog(post.author?._id) && (
                <button
                  onClick={handleEdit}
                  className="p-2 text-slate-400 hover:text-blue-600 transition-all"
                  type="button"
                >
                  <Edit size={16} />
                </button>
              )}
              {canDeleteBlog(post.author?._id) && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-slate-400 hover:text-red-600 transition-all"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              )}
              
              {/* 2. Changed to a button with type="button" and handleReadMore */}
              <button 
                type="button"
                onClick={(e) => handleReadMore(e)}
                className="ml-2 w-8 h-8 rounded-full bg-[#8B1A1A]/5 flex items-center justify-center text-[#8B1A1A] group-hover:bg-[#8B1A1A] group-hover:text-white transition-all duration-300 shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BlogCard;