/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
   //❌ REMOVED - No longer supported in Next.js 16
   eslint: {
     ignoreDuringBuilds: true,
   },
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/admin/:path*',
          destination: 'https://hotadmin.vercel.app/:path*',
        },
      ],
    };
  },
  // ✅ ADD THIS if you want to silence the workspace root warning
  turbopack: {
    root: process.cwd(),
  },
};

module.exports = nextConfig;
