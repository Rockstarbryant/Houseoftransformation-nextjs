'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, AlertCircle, Share2, Heart } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import Loader from '@/components/common/Loader';
import Card from '@/components/common/Card';
import { blogService } from '@/services/api/blogService';
import { formatDate } from '@/utils/helpers';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { canEditBlog, canDeleteBlog } = useAuthContext();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await blogService.getBlog(params.id);
      setPost(data.blog || data);
      setError(null);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      setDeleting(true);
      await blogService.deleteBlog(params.id);
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
      navigator.share({
        title: title,
        text: 'Check out this inspiring blog post!',
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const getRoleColor = (role) => {
    const colors = {
      member: 'text-gray-600',
      volunteer: 'text-indigo-600',
      usher: 'text-green-600',
      worship_team: 'text-yellow-600',
      pastor: 'text-red-600',
      bishop: 'text-blue-600',
      admin: 'text-purple-600'
    };
    return colors[role] || 'text-gray-600';
  };

  const getCategoryColor = (category) => {
    const colors = {
      testimonies: 'from-purple-600 to-purple-600',
      events: 'from-blue-600 to-blue-600',
      teaching: 'from-green-600 to-green-600',
      news: 'from-yellow-900 to-yellow-900'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      testimonies: 'Testimony',
      events: 'Event',
      teaching: 'Teaching',
      news: 'News'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => router.push('/blog')}
            className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 mb-8 font-semibold transition hover:gap-3"
          >
            <ArrowLeft size={20} /> Back to Blog
          </button>
          <Card className="p-12 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error ? 'Unable to Load Blog Post' : 'Blog Post Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">{error || 'This blog post no longer exists or has been removed.'}</p>
            {error && (
              <button
                onClick={fetchPost}
                className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
              >
                Try Again
              </button>
            )}
          </Card>
        </div>
      </div>
    );
  }

  const canEdit = canEditBlog(post.author?._id);
  const canDelete = canDeleteBlog(post.author?._id);
  const gradient = getCategoryColor(post.category);

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        <button
          onClick={() => router.push('/blog')}
          className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold mb-8 transition hover:gap-3"
        >
          <ArrowLeft size={20} />
          Back to Blog
        </button>

        <Card className="overflow-hidden mb-8">
          
          <div className={`bg-gradient-to-r ${gradient} h-80 flex items-center justify-center text-9xl overflow-hidden relative`}>
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="text-white opacity-30">📰</div>
            )}
          </div>

          <div className="p-8 md:p-12">
            
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-grow">
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className={`inline-block px-4 py-2 bg-gradient-to-r ${gradient} text-white text-sm font-bold rounded-full`}>
                    {getCategoryLabel(post.category)}
                  </span>

                  {post.approved === false && (
                    <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                      Pending Approval
                    </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  {post.title}
                </h1>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={handleLike}
                  className={`p-3 rounded-full transition-all transform hover:scale-110 ${
                    liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart size={24} className={liked ? 'fill-current' : ''} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all transform hover:scale-110"
                >
                  <Share2 size={24} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pb-6 mb-6 border-b border-gray-200 text-gray-600">
              <div>
                <p className="text-sm text-gray-500 mb-1">Published</p>
                <p className="font-semibold">
                  {post.createdAt ? formatDate(post.createdAt, 'long') : 'Date unknown'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">By</p>
                <p className={`font-bold ${getRoleColor(post.author?.role)}`}>
                  {post.author?.name || 'Church Administrator'}
                </p>
              </div>

              {post.author?.role && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Role</p>
                  <p className="font-semibold capitalize">
                    {post.author.role.replace('_', ' ')}
                  </p>
                </div>
              )}

              {(canEdit || canDelete) && (
                <div className="ml-auto flex gap-2">
                  {canEdit && (
                    <button className="p-2 text-blue-900 hover:bg-blue-100 rounded-lg transition disabled:opacity-50" disabled>
                      <Edit size={20} />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={handleDelete} disabled={deleting} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {post.description && (
              <p className="text-xl text-gray-700 italic mb-8 pb-8 border-b border-gray-200 leading-relaxed">
                {post.description}
              </p>
            )}

            <div className="prose prose-lg max-w-none mb-12">
              {post.content ? (
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg text-justify">
                  {post.content}
                </div>
              ) : (
                <p className="text-gray-500">No content available</p>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8 border-l-4 border-blue-900">
              <h3 className="font-bold text-blue-900 mb-4 text-lg">About the Author</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-purple-900 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {post.author?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{post.author?.name || 'Church Administrator'}</p>
                  {post.author?.role && (
                    <p className="text-sm text-gray-600 capitalize">
                      {post.author.role.replace('_', ' ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-8 text-center mb-8">
              <h3 className="text-2xl font-bold mb-3">Found this helpful?</h3>
              <p className="text-blue-100 mb-6">Share this post with your community or read more on our blog.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/blog')}
                  className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                >
                  Read More Posts
                </button>
                <button
                  onClick={handleShare}
                  className="bg-white/20 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={20} /> Share
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}