// /app/(public)/testimony/[id]/page.jsx - Server Component
import { notFound } from 'next/navigation';
import TestimonyDetailClient from '@/components/feedback/TestimonyDetailClient';
import { getTestimonyById, getPublicTestimonies } from '@/lib/testimonies';

export async function generateMetadata({ params }) {
  const testimony = await getTestimonyById(params.id);
  
  if (!testimony) {
    return {
      title: 'Testimony Not Found - House of Transformation',
    };
  }

  return {
    title: `${testimony.feedbackData?.title || 'Victory Report'} - Testimony`,
    description: testimony.feedbackData?.story?.substring(0, 160) || 'Read this powerful testimony from our church community',
  };
}

export default async function TestimonyDetailPage({ params }) {
  // Fetch testimony and related testimonies on server
  const testimony = await getTestimonyById(params.id);
  
  if (!testimony) {
    notFound();
  }

  const relatedTestimonies = await getPublicTestimonies(params.id);

  return (
    <TestimonyDetailClient 
      testimony={testimony}
      relatedTestimonies={relatedTestimonies}
    />
  );
}