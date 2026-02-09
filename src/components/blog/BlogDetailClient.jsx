'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, AlertCircle, Share2, Heart, Calendar, User, Quote } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { blogService } from '@/services/api/blogService';
import { formatDate } from '@/utils/helpers';
import NextImage from 'next/image';

export default function BlogDetailClient({ post }) {
  const router = useRouter();
  const { canEditBlog, canDeleteBlog } = useAuth();

  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(false);

  // --- ALL LOGIC PRESERVED 100% ---
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      setDeleting(true);
      await blogService.deleteBlog(post._id);
      alert('Blog post deleted successfully!');
      router.push('/blog');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete blog post');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    const title = post?.title || 'Read this blog post';
    if (navigator.share) {
      navigator.share({ title, text: 'Check out this inspiring blog post!', url })
        .catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleLike = () => setLiked(!liked);

  // --- STYLE HELPERS (100% PRESERVED) ---
  const roleColors = {
    member: 'text-slate-600',
    pastor: 'text-[#8B1A1A]',
    bishop: 'text-blue-700',
    admin: 'text-slate-900',
  };

  const categoryColors = {
    testimonies: 'bg-purple-50 text-purple-700 border-purple-100',
    events: 'bg-blue-50 text-blue-700 border-blue-100',
    teaching: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    news: 'bg-amber-50 text-amber-700 border-amber-100'
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-20">
      {/* Editorial Header Section - 100% PRESERVED */}
      <div className="relative pt-24 md:pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => router.push('/blog')}
            className="group flex items-center gap-2 text-slate-400 hover:text-[#8B1A1A] font-bold text-xs uppercase tracking-widest mb-10 transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to News
          </button>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${categoryColors[post.category] || 'bg-slate-100 text-slate-700'}`}>
              {post.category || 'General'}
            </span>
            {post.approved === false && (
              <span className="bg-amber-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                Under Review
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] mb-8">
            {post.title}
          </h1>

          {/* Author & Meta Row - 100% PRESERVED */}
          <div className="flex flex-wrap items-center justify-between gap-6 py-8 border-y border-slate-100 dark:border-slate-700 mb-16">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-gradient-to-br from-slate-800 to-black dark:bg-slate-900 flex items-center justify-center text-white dark:text-white font-black">
                {post.author?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className={`text-sm font-black ${roleColors[post.author?.role] || 'text-slate-900 dark:text-white'}`}>
                  {post.author?.name || 'Church Admin'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {post.author?.role?.replace('_', ' ') || 'Contributor'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1">Published</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(post.createdAt, 'long')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleLike} 
                  className={`p-3 rounded-full transition-all ${liked ? 'bg-red-50 text-red-600 dark:text-red-600' : 'bg-slate-50 text-slate-400 dark:text-slate-400 hover:text-red-500'}`}
                >
                  <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                </button>
                <button 
                  onClick={handleShare} 
                  className="p-3 bg-slate-50 text-slate-400 dark:text-slate-500 hover:text-slate-900 rounded-full transition-all"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - 100% PRESERVED */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Featured Image */}
        <div className="relative aspect-video md:aspect-[21/9] rounded-[2rem] overflow-hidden bg-slate-100 mb-16 shadow-2xl">
          {post.image ? (
          <NextImage
            src={post.image}
            alt={post.title}
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200 text-9xl font-black">
            📰
          </div>
        )}
        </div>

        {/* Article Body - 100% PRESERVED */}
        <article className="relative">
          <Quote className="absolute -left-12 top-0 text-slate-50 hidden lg:block" size={80} />

          {post.description && (
            <div className="mb-12">
              <p className="text-2xl md:text-3xl font-serif italic text-slate-900 dark:text-white leading-relaxed border-l-4 border-[#8B1A1A] pl-8">
                {post.description}
              </p>
            </div>
          )}

          <div className="prose prose-slate prose-lg md:prose-xl max-w-none">
            {post.content ? (
              <div className="text-slate-700 dark:text-slate-300 leading-[1.8] font-serif whitespace-pre-wrap text-justify selection:bg-red-100">
                {post.content}
              </div>
            ) : (
              <p className="text-slate-400 dark:text-white italic">This post contains no additional text content.</p>
            )}
          </div>
        </article>

        {/* Admin Actions Footer - 100% PRESERVED */}
        {(canEditBlog(post.author?._id) || canDeleteBlog(post.author?._id)) && (
          <div className="mt-16 pt-8 border-t border-slate-100 flex justify-end gap-3">
            {canEditBlog(post.author?._id) && (
              <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors opacity-50 cursor-not-allowed">
                <Edit size={16} /> Edit Article
              </button>
            )}
            {canDeleteBlog(post.author?._id) && (
              <button 
                onClick={handleDelete} 
                disabled={deleting}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-50 text-red-600 font-bold text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
              >
                <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete Post'}
              </button>
            )}
          </div>
        )}

        {/* Footer Call to Action - 100% PRESERVED */}
        <div className="mt-20 p-8 md:p-12 rounded-[2.5rem] bg-slate-900 dark:bg-white text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B1A1A] to-transparent opacity-10 group-hover:opacity-20 transition-opacity" />
          <div className="relative z-10">
            <h3 className="text-2xl md:text-4xl font-black text-white mb-4 tracking-tighter leading-tight">
              Join the Conversation
            </h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto font-medium">
              Was this message helpful? Share it with your friends or explore more from our ministry.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => router.push('/blog')}
                className="bg-white text-black px-10 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-[#8B1A1A] hover:text-white transition-all shadow-xl"
              >
                Explore More
              </button>
              <button 
                onClick={handleShare}
                className="bg-white/10 text-white backdrop-blur-md px-10 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={16} /> Share Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
