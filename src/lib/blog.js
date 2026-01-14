// /lib/blog.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getAllBlogs() {
  try {
    const res = await fetch(`${API_URL}/blogs`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error('Failed to fetch blogs:', res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    return data.blogs || [];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export async function getBlogById(id) {
  try {
    if (!id) {
      console.error('No blog ID provided');
      return null;
    }

    const url = `${API_URL}/blogs/${id}`;
    console.log('Fetching blog from:', url);

    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('API response status:', res.status);

    if (!res.ok) {
      console.error('Failed to fetch blog:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    console.log('Blog fetched successfully:', data.blog?.title || 'Unknown');
    
    return data.blog || data;
  } catch (error) {
    console.error('Error fetching blog:', error.message);
    return null;
  }
}
