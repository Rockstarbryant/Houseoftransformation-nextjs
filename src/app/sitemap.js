// app/sitemap.js
// SEO ADDITION: Dynamic sitemap generation
// This file generates XML sitemap for search engines (Google, Bing, etc.)

export default async function sitemap() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const baseUrl = 'https://houseoftransformation-nextjs.vercel.app';

  try {
    // Fetch all approved blogs
    const blogsRes = await fetch(`${API_URL}/blog`, {
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: { 'Content-Type': 'application/json' }
    });

    let blogs = [];
    
    if (blogsRes.ok) {
      const blogsData = await blogsRes.json();
      blogs = blogsData.blogs || blogsData || [];
    }

    // Generate blog URLs
    const blogUrls = blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog._id}`,
      lastModified: new Date(blog.updatedAt || blog.createdAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Static pages with priorities
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/sermons`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/events`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/donate`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/gallery`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/service-areas`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/new-here`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/volunteer`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/livestream`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/feedback`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ];

    // Combine all URLs
    const allUrls = [...staticPages, ...blogUrls];

    console.log(`[SITEMAP] Generated ${allUrls.length} URLs (${staticPages.length} static + ${blogUrls.length} blogs)`);

    return allUrls;
  } catch (error) {
    console.error('[SITEMAP] Error generating sitemap:', error);
    
    // Fallback: Return only static pages if dynamic fetch fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/sermons`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
    ];
  }
}