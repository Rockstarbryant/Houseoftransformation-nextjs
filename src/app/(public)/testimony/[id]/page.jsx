// /app/(public)/testimony/[id]/page.jsx - Server Component
import { notFound } from 'next/navigation';
import TestimonyDetailClient from '@/components/feedback/TestimonyDetailClient';
import { getTestimonyById, getPublicTestimonies } from '@/lib/testimonies';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const testimony = await getTestimonyById(id);
  
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
  const { id } = await params;
  console.log('🔍 params.id:', id);
  
  const testimony = await getTestimonyById(id);
  console.log('🔍 testimony result:', testimony);
  
  if (!testimony) {
    console.log('❌ Testimony not found, calling notFound()');
    notFound();
  }

  const relatedTestimonies = await getPublicTestimonies(id);

  return (
    <TestimonyDetailClient 
      testimony={testimony}
      relatedTestimonies={relatedTestimonies}
    />
  );
}