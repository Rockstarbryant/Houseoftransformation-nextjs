// /lib/blog.js
// ✅ SEO ENHANCED VERSION with slug support and better error handling
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getAllBlogs() {
  try {
    const res = await fetch(`${API_URL}/blog`, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error('[getAllBlogs] API error:', res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    console.log('[getAllBlogs] Fetched blogs count:', data.blogs?.length || data.length || 0);
    return data.blogs || data || [];
  } catch (error) {
    console.error('[getAllBlogs] Error fetching blogs:', error);
    return [];
  }
}

export async function getBlogById(id) {
  try {
    if (!id) {
      console.error('[getBlogById] No ID provided');
      return null;
    }

    console.log('[getBlogById] Fetching blog with ID:', id);

    const res = await fetch(`${API_URL}/blog/${id}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error('[getBlogById] API returned error:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    console.log('[getBlogById] API response structure:', Object.keys(data));
    
    // Check if blog exists (it will be truthy if it's an object)
    if (data.blog && typeof data.blog === 'object' && Object.keys(data.blog).length > 0) {
      console.log('[getBlogById] Blog found:', data.blog._id, data.blog.title);
      return data.blog;
    }
    
    // Fallback: if response is just the blog object directly
    if (data._id) {
      console.log('[getBlogById] Blog found (direct):', data._id, data.title);
      return data;
    }
    
    console.error('[getBlogById] Invalid blog response structure:', data);
    return null;
  } catch (error) {
    console.error('[getBlogById] Error fetching blog:', error);
    return null;
  }
}

/**
 * Fetch blog by slug (SEO-friendly URLs)
 * Backend route required: GET /api/blog/slug/:slug
 */
export async function getBlogBySlug(slug) {
  try {
    if (!slug) {
      console.error('[getBlogBySlug] No slug provided');
      return null;
    }

    console.log('[getBlogBySlug] Fetching blog with slug:', slug);

    const res = await fetch(`${API_URL}/blog/slug/${slug}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error('[getBlogBySlug] API returned error:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    console.log('[getBlogBySlug] API response structure:', Object.keys(data));
    
    if (data.blog && typeof data.blog === 'object' && Object.keys(data.blog).length > 0) {
      console.log('[getBlogBySlug] Blog found:', data.blog._id, data.blog.title);
      return data.blog;
    }
    
    // Fallback: if response is just the blog object directly
    if (data._id) {
      console.log('[getBlogBySlug] Blog found (direct):', data._id, data.title);
      return data;
    }
    
    console.error('[getBlogBySlug] Blog not found for slug:', slug);
    return null;
  } catch (error) {
    console.error('[getBlogBySlug] Error fetching blog by slug:', error);
    return null;
  }
}

/**
 * Helper: Generate URL-friendly slug from title
 * Example: "Easter Service 2024" -> "easter-service-2024"
 */
export function generateSlug(title) {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Remove consecutive hyphens
    .substring(0, 60);         // Max 60 chars
}