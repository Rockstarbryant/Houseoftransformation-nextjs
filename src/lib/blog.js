// /lib/blog.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getAllBlogs() {
  try {
    const res = await fetch(`${API_URL}/blog`, {
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

    const res = await fetch(`${API_URL}/blog/${id}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error('API returned error:', res.status);
      return null;
    }

    const data = await res.json();
    console.log('Blog API response:', data);
    
    // ✅ FIX: Check if blog exists (it will be truthy if it's an object)
    if (data.blog && typeof data.blog === 'object' && Object.keys(data.blog).length > 0) {
      return data.blog;
    }
    
    // Fallback: if response is just the blog object directly
    if (data._id) {
      return data;
    }
    
    console.error('Invalid blog response structure:', data);
    return null;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}