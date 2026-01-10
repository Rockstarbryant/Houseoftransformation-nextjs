/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // ✅ Proxy /admin to Vite dev server
      {
        source: '/admin',
        destination: 'http://localhost:3001/admin',
      },
      {
        source: '/admin/:path*',
        destination: 'http://localhost:3001/admin/:path*',
      },
      // ✅ Proxy API to backend
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  
  // Optional: Image optimization
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;