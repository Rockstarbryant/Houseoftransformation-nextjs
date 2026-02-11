import BookmarksClient from '@/components/portal/BookmarksClient';

export const metadata = {
  title: 'My Saved Sermons',
  description: 'View your bookmarked and liked sermons'
};

export default function BookmarksPage() {
  return <BookmarksClient />;
}