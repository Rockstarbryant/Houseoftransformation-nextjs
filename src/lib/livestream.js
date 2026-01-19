// livestream.js - FIXED
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getActiveStream() {
  try {
    const res = await fetch(`${API_URL}/livestreams/active`, {
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
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error('API error:', res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    return data.livestreams || data || [];
  } catch (error) {
    console.error('Error fetching archives:', error);
    return [];
  }
}