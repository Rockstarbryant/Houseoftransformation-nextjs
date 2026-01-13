// /app/(public)/profile/[userId]/page.jsx - Server Component
import { notFound } from 'next/navigation';
import ProfileClient from '@/components/profile/ProfileClient';
import { getUserById } from '@/lib/users';

export async function generateMetadata({ params }) {
  const profile = await getUserById(params.userId);
  
  if (!profile) {
    return {
      title: 'Profile Not Found - House of Transformation',
    };
  }

  return {
    title: `${profile.name} - Member Profile`,
    description: profile.bio || `View ${profile.name}'s profile at House of Transformation Church`,
  };
}

export default async function UserProfilePage({ params }) {
  // Fetch user profile on server
  const profile = await getUserById(params.userId);

  if (!profile) {
    notFound();
  }

  return <ProfileClient profile={profile} userId={params.userId} />;
}