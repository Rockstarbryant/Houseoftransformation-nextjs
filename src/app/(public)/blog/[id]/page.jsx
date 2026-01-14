// /app/(public)/blog/[id]/page.jsx - Server Component
import { notFound } from 'next/navigation';
import BlogDetailClient from '@/components/blog/BlogDetailClient';
import { getBlogById } from '@/lib/blog';

export async function generateMetadata({ params }) {
  try {
    const post = await getBlogById(params.id);
    
    if (!post) {
      return {
        title: 'Post Not Found - House of Transformation',
      };
    }

    return {
      title: `${post.title} - Church News`,
      description: post.description || post.content?.substring(0, 160) || 'Read this blog post from House of Transformation Church',
    };
  } catch (error) {
    return {
      title: 'Post Not Found - House of Transformation',
    };
  }
}

export default async function BlogDetailPage({ params }) {
  try {
    // Fetch blog post on server
    const post = await getBlogById(params.id);

    // If post doesn't exist, show 404
    if (!post) {
      notFound();
    }

    return <BlogDetailClient post={post} />;
  } catch (error) {
    console.error('Error loading blog:', error);
    notFound();
  }
}