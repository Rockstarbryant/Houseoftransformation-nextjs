// /app/(public)/livestream/page.jsx
import LivestreamClient from '@/components/livestream/LivestreamClient';
import { getActiveStream, getStreamArchives } from '@/lib/livestream';

export const metadata = {
  title: 'Live Stream - House of Transformation Church',
  description: 'Watch live services and access archived messages from our church.',
};

export default async function LiveStreamPage() {
// Fetch data on server
const activeStream = await getActiveStream();
const archives = await getStreamArchives();
return (
<div className="pt-20 min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
<LivestreamClient 
     activeStream={activeStream}
     initialArchives={archives}
   />
</div>
);
}