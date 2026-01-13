// /lib/livestream.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getActiveStream() {
  try {
    const res = await fetch(`${API_URL}/livestreams/active`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.livestream || null;
  } catch (error) {
    console.error('Error fetching active stream:', error);
    return null;
  }
}

export async function getStreamArchives() {
  try {
    const res = await fetch(`${API_URL}/livestreams?limit=100&sortBy=-startTime`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Failed to fetch archives');

    const data = await res.json();
    return data.livestreams || [];
  } catch (error) {
    console.error('Error fetching archives:', error);
    return [];
  }
}