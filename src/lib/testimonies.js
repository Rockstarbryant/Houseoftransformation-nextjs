// /lib/testimonies.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getTestimonyById(id) {
  try {
    console.log('📡 Fetching testimony from:', `${API_URL}/feedback/${id}`);
    
    const res = await fetch(`${API_URL}/feedback/${id}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('📡 API Response Status:', res.status);
    
    if (!res.ok) {
      console.log('❌ Response not OK:', res.statusText);
      return null;
    }

    const data = await res.json();
    console.log('📡 API Response Data:', data);
    
    return data.feedback || null;
  } catch (error) {
    console.error('❌ Error fetching testimony:', error);
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
    
    // Exclude current testimony and get random 3
    const filtered = testimonies.filter(t => t._id !== excludeId);
    return filtered.sort(() => Math.random() - 0.5).slice(0, 3);
  } catch (error) {
    console.error('Error fetching related testimonies:', error);
    return [];
  }
}