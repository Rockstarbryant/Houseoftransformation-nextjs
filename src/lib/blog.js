// /lib/blog.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getAllBlogs() {
  try {
    const res = await fetch(`${API_URL}/blogs`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.blogs || data || [];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export async function getBlogById(id) {
  try {
    if (!id) return null;

    const res = await fetch(`${API_URL}/blogs/${id}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return null;

    const data = await res.json();
    
    // ✅ FIX: Handle the response structure correctly
    if (data.success && data.blog) {
      return data.blog;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}