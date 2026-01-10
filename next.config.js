/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',           // optional, leave empty
        pathname: '/**',    // allow any path under your Cloudinary account
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/**',
      },
      // Optional: if you have other sources (YouTube thumbnails, etc.)
       {
         protocol: 'https',
         hostname: 'img.youtube.com',
         pathname: '/**',
       },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  eslint: {
  ignoreDuringBuilds: true,
},
};

module.exports = nextConfig;