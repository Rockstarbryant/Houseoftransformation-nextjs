'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Edit, Trash2, Calendar, Newspaper, User, Eye } from 'lucide-react';
import Card from '../common/Card';
import { formatDate, truncateText } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';
import NextImage from 'next/image';

const BlogCard = ({ post, onDelete, onEdit }) => {
  const { canEditBlog, canDeleteBlog } = useAuth();

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      onDelete(post._id);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(post);
  };

  const categoryColors = {
    testimonies: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300',
    events: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300',
    teaching: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300',
    news: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300'
  };

  const colorStyle = categoryColors[post.category?.toLowerCase()] || 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300';

  // ✅ FIX: Use slug if available, fallback to ID
  const blogUrl = post.slug ? `/blog/${post.slug}` : `/blog/${post._id}`;

  return (
    <Link 
      href={blogUrl}
      className="group cursor-pointer h-full block transition-all duration-300"
    >
      <Card className="h-full flex flex-col overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white dark:bg-slate-900 group-hover:ring-2 group-hover:ring-[#8B1A1A]/20">
        
        {/* Image Container */}
        <div className="relative h-52 overflow-hidden">
          {post.image ? (  
            <NextImage
              src={post.image}  
              alt={post.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Newspaper size={48} className="text-slate-300 dark:text-slate-600" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colorStyle} backdrop-blur-md shadow-sm`}>
              {post.category || 'General'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex-grow space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest">
              <Calendar size={14} className="text-[#8B1A1A]" />
              {formatDate(post.createdAt)}
            </div>
            {/* ✅ VIEW COUNT DISPLAY */}
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <Eye size={14} />
              <span className="text-[10px] font-bold">{post.views || 0}</span>
            </div>
          </div>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter group-hover:text-[#8B1A1A] transition-colors">
            {post.title}
          </h3>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            {truncateText(post.excerpt || post.content, 120)}
          </p>
        </div>

        {/* Footer Section */}
        <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <User size={14} />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {post.author?.name || 'H.O.T Ministry'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {canEditBlog(post.author?._id) && (
              <button
                onClick={handleEdit}
                className="action-button p-2 text-slate-400 hover:text-blue-600 transition-all rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                type="button"
              >
                <Edit size={16} />
              </button>
            )}
            {canDeleteBlog(post.author?._id) && (
              <button
                onClick={handleDelete}
                className="action-button p-2 text-slate-400 hover:text-red-600 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            )}
            
            <div className="ml-2 w-8 h-8 rounded-full bg-[#8B1A1A]/5 flex items-center justify-center text-[#8B1A1A] group-hover:bg-[#8B1A1A] group-hover:text-white transition-all duration-300 shadow-sm">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BlogCard;