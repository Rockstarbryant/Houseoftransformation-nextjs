// /lib/blog.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getAllBlogs() {
  try {
    const res = await fetch(`${API_URL}/blogs`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Failed to fetch blogs');

    const data = await res.json();
    return data.blogs || [];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export async function getBlogById(id) {
  try {
    const res = await fetch(`${API_URL}/blogs/${id}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Failed to fetch blog');

    const data = await res.json();
    return data.blog || data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}