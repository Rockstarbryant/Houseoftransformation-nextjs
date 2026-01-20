export async function getFeaturedSermon() {
  try {
    const res = await fetch(`${API_URL}/sermons?limit=100`, {
       next: { revalidate: 60 }, // refresh every 60 seconds
      //cache: 'no-store', // Always get fresh data
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch sermons');
    }

    const data = await res.json();
    const allSermons = data.sermons || [];
    
    // Find pinned sermon first
    const pinnedSermon = allSermons.find(s => s.pinned);
    
    if (pinnedSermon) {
      return pinnedSermon;
    }
    
    // Otherwise return most recent
    const recentSermon = allSermons
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    return recentSermon || null;
  } catch (error) {
    console.error('Error fetching featured sermon:', error);
    return null;
  }
}

export async function getAllSermons() {
  try {
    const res = await fetch(`${API_URL}/sermons?limit=100`, {
        next: { revalidate: 60 }, // refresh every 60 seconds
      //cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Failed to fetch sermons');

    const data = await res.json();
    const sermons = data.sermons || data;
    
    // Add type detection and defaults for each sermon
    return sermons.map(s => ({
      ...s,
      type: s.type || detectSermonType(s),
      descriptionHtml: s.descriptionHtml || s.description || '',
      description: s.description || ''
    }));
  } catch (error) {
    console.error('Error fetching all sermons:', error);
    return [];
  }
}


export function detectSermonType(sermon) {
  if (!sermon) return 'text';
  if (sermon.videoUrl) return 'video';
  if (sermon.thumbnail) return 'photo';
  return 'text';
}