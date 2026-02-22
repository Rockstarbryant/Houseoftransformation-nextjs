// /lib/testimonies.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getTestimonyById(id) {
  try {
    const res = await fetch(`${API_URL}/feedback/public/${id}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error('Failed to fetch testimony:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    return data.feedback || null;
  } catch (error) {
    console.error('Error fetching testimony:', error);
    return null;
  }
}

export async function getPublicTestimonies(excludeId = null) {
  try {
    const res = await fetch(`${API_URL}/feedback/testimonies/public`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const testimonies = data.testimonies || [];
    
    const filtered = testimonies.filter(t => t._id !== excludeId);
    return filtered.sort(() => Math.random() - 0.5).slice(0, 3);
  } catch (error) {
    console.error('Error fetching related testimonies:', error);
    return [];
  }
}