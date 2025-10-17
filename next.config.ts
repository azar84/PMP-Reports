import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Optimize build size
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: [
      'pmp-reports-backend.herokuapp.com', 
      'pmp-reports.com', 
      'api.producthunt.com',
      'res.cloudinary.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pmp-reports-backend.herokuapp.com',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'pmp-reports.com',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.producthunt.com',
        port: '',
        pathname: '/widgets/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
