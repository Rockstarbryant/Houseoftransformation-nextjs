/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pbs.twimg.com', 'res.cloudinary.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
}

module.exports = nextConfig