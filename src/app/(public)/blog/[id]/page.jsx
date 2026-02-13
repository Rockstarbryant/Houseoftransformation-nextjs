// /app/(public)/blog/[id]/page.jsx - SLUG-AWARE VERSION (OPTIONAL)
// ✅ ADVANCED SEO: Supports both ID and slug routing with automatic redirects
// Deploy this AFTER backend slug support is implemented
import { notFound, redirect } from 'next/navigation';
import BlogDetailClient from '@/components/blog/BlogDetailClient';
import { getBlogById, getBlogBySlug } from '@/lib/blog';

// SEO ADDITION: Enhanced metadata generation
export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const identifier = resolvedParams.id;
    
    // Try to fetch by slug first, fallback to ID
    let post = null;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    
    if (isObjectId) {
      post = await getBlogById(identifier);
    } else {
      post = await getBlogBySlug(identifier);
      if (!post) {
        post = await getBlogById(identifier);
      }
    }
    
    if (!post) {
      return {
        title: 'Post Not Found - House of Transformation',
      };
    }

    const description = post.description || post.content?.substring(0, 160) || 'Read this blog post from House of Transformation Church';
    
    return {
      title: `${post.title} - Church News`,
      description: description,
      keywords: [
        post.category,
        'House of Transformation',
        'HOT Church Busia',
        post.title,
        'Christian blog Kenya'
      ].join(', '),
      
      openGraph: {
        title: post.title,
        description: description,
        images: post.image ? [
          {
            url: post.image,
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ] : [],
        type: 'article',
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt || post.createdAt,
        authors: [post.author?.name || 'H.O.T Ministry'],
        siteName: 'Busia House of Transformation',
      },
      
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: description,
        images: post.image ? [post.image] : [],
        creator: '@HOTChurchBusia',
      },
      
      // Use slug in canonical if available
      alternates: {
        canonical: `https://houseoftransformation-nextjs.vercel.app/blog/${post.slug || post._id}`,
      },
    };
  } catch (error) {
    return {
      title: 'Post Not Found - House of Transformation',
    };
  }
}

export default async function BlogDetailPage({ params }) {
  try {
    const resolvedParams = await params;
    const identifier = resolvedParams.id;
    
    // SEO SMART ROUTING: Try slug first, fallback to ID
    let post = null;
    let shouldRedirect = false;
    
    // Check if identifier looks like MongoDB ObjectId (24 hex chars)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    
    if (isObjectId) {
      // It's an ID - fetch by ID
      post = await getBlogById(identifier);
      
      // If post has a slug, redirect to slug URL (SEO best practice)
      if (post && post.slug) {
        redirect(`/blog/${post.slug}`);
      }
    } else {
      // It's potentially a slug - try slug first
      post = await getBlogBySlug(identifier);
      
      // If slug fails, try as ID anyway (for edge cases)
      if (!post) {
        post = await getBlogById(identifier);
        
        // If found by ID but accessed via invalid slug, redirect to correct slug
        if (post && post.slug && post.slug !== identifier) {
          redirect(`/blog/${post.slug}`);
        }
      }
    }

    if (!post) {
      notFound();
    }

    // Canonical URL (prefer slug)
    const canonicalUrl = `https://houseoftransformation-nextjs.vercel.app/blog/${post.slug || post._id}`;

    return (
      <>
        {/* Canonical link */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* JSON-LD Article Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": post.title,
              "description": post.description || post.content?.substring(0, 160) || "",
              "image": post.image || "",
              "datePublished": post.createdAt,
              "dateModified": post.updatedAt || post.createdAt,
              "author": {
                "@type": "Person",
                "name": post.author?.name || "H.O.T Ministry",
                "jobTitle": post.authorRole || "Ministry Team"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Busia House of Transformation",
                "url": "https://houseoftransformation-nextjs.vercel.app",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://res.cloudinary.com/dcu8uuzrs/image/upload/v1768913903/church-gallery/tql6mjtmman1gxlzl91e.jpg",
                  "width": 600,
                  "height": 60
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": canonicalUrl
              },
              "articleSection": post.category || "Church News",
              "keywords": [post.category, "House of Transformation", "Christian blog Kenya"].join(", ")
            })
          }}
        />
        
        {/* Hidden server-rendered content for crawlers */}
        <div className="sr-only" itemScope itemType="https://schema.org/Article">
          <h1 itemProp="headline">{post.title}</h1>
          <meta itemProp="datePublished" content={post.createdAt} />
          <meta itemProp="author" content={post.author?.name || "H.O.T Ministry"} />
          {post.description && <p itemProp="description">{post.description}</p>}
          <div itemProp="articleBody">{post.content?.substring(0, 500)}</div>
        </div>
        
        {/* Original client component - ZERO CHANGES */}
        <BlogDetailClient post={post} />
      </>
    );
  } catch (error) {
    console.error('Error loading blog:', error);
    notFound();
  }
}