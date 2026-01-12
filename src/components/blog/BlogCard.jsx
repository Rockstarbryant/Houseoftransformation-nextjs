'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Edit, Trash2, Calendar, User, Newspaper } from 'lucide-react';
import Card from '../common/Card';
import { formatDate, truncateText } from '@/utils/helpers';
import { useAuthContext } from '@/context/AuthContext';

const BlogCard = ({ post, onDelete, onEdit }) => {
  const router = useRouter();
  const { canEditBlog, canDeleteBlog } = useAuthContext();

  const handleReadMore = () => {
    router.push(`/blog/${post._id}`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      onDelete(post._id);
    }
  };

  // Refined Color Mapping for Premium Look
  const categoryColors = {
    testimonies: 'bg-purple-50 text-purple-700 border-purple-100',
    events: 'bg-blue-50 text-blue-700 border-blue-100',
    teaching: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    news: 'bg-amber-50 text-amber-700 border-amber-100'
  };

  const roleColors = {
    member: 'text-slate-600',
    pastor: 'text-[#8B1A1A]',
    bishop: 'text-blue-700',
    admin: 'text-slate-900',
    volunteer: 'text-indigo-600'
  };

  return (
    <div className="w-full h-full p-0.5 md:p-0">
      <Card 
        className="group flex flex-col h-full bg-white rounded-xl md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden mx-0.5 md:mx-0 cursor-pointer"
        onClick={handleReadMore}
      >
        {/* Top Banner: Cinematic Placeholder */}
        <div className="relative h-48 md:h-56 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-90 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-2xl">
            {post.image || <Newspaper className="text-white/20 w-16 h-16" />}
          </div>
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${categoryColors[post.category] || 'bg-white/90 text-slate-800 border-slate-200'}`}>
              {post.category || 'General'}
            </span>
            {post.approved === false && (
              <span className="bg-amber-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                Pending
              </span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 md:p-8 flex flex-col flex-grow">
          {/* Date */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            <Calendar size={12} className="text-[#8B1A1A]" />
            {formatDate(post.createdAt || post.date, 'short')}
          </div>

          <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tighter leading-tight group-hover:text-[#8B1A1A] transition-colors">
            {post.title}
          </h3>

          <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed mb-6 flex-grow">
            {truncateText(post.excerpt || post.content, 110)}
          </p>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                {post.author?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className={`text-[11px] font-black leading-none ${roleColors[post.author?.role] || 'text-slate-900'}`}>
                  {post.author?.name || 'Unknown'}
                </span>
                {post.author?.role && (
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    {post.author.role.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>

            {/* Admin Actions & Read More */}
            <div className="flex items-center gap-1">
              {canEditBlog(post.author?._id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(post);
                  }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                >
                  <Edit size={16} />
                </button>
              )}
              {canDeleteBlog(post.author?._id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <div className="ml-2 w-8 h-8 rounded-full bg-[#8B1A1A]/5 flex items-center justify-center text-[#8B1A1A] group-hover:bg-[#8B1A1A] group-hover:text-white transition-all duration-300">
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BlogCard;