'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Edit, Trash2 } from 'lucide-react';
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

  const categoryColors = {
    testimonies: 'bg-purple-100 text-purple-800',
    events: 'bg-blue-100 text-blue-800',
    teaching: 'bg-green-100 text-green-800',
    news: 'bg-yellow-100 text-yellow-800'
  };

  const roleColors = {
    member: 'text-gray-600',
    volunteer: 'text-indigo-600',
    usher: 'text-green-600',
    worship_team: 'text-yellow-600',
    pastor: 'text-red-600',
    bishop: 'text-blue-600',
    admin: 'text-purple-600'
  };

  return (
    <Card hover className="overflow-hidden cursor-pointer" onClick={handleReadMore}>
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 h-48 flex items-center justify-center text-6xl">
        {post.image || '📰'}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <span className={`px-3 py-1 rounded-full font-semibold text-xs ${categoryColors[post.category] || 'bg-gray-100 text-gray-800'}`}>
            {post.category || 'General'}
          </span>
          {post.approved === false && (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-xs">
              Pending
            </span>
          )}
          <span>{formatDate(post.createdAt || post.date, 'short')}</span>
        </div>
        <h3 className="text-xl font-bold text-blue-900 mb-3">{post.title}</h3>
        <p className="text-gray-600 mb-4">{truncateText(post.excerpt || post.content, 120)}</p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span>By <span className={`font-semibold ${roleColors[post.author?.role] || ''}`}>
              {post.author?.name || 'Unknown'}
            </span></span>
            {post.author?.role && (
              <span className="text-xs ml-1 capitalize">({post.author.role.replace('_', ' ')})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canEditBlog(post.author?._id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(post);
                }}
                className="p-2 text-blue-900 hover:bg-blue-50 rounded-lg transition"
                title="Edit"
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
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleReadMore();
              }}
              className="text-blue-900 font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              Read More <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BlogCard;