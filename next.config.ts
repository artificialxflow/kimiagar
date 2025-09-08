import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client'],
  images: {
    domains: ['localhost', 'kimiagar-node.liara.run'],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    EXTERNAL_PRICE_API_URL: process.env.EXTERNAL_PRICE_API_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
  // Force production optimizations
  compress: true,
  generateEtags: false,
  poweredByHeader: false,
  trailingSlash: false,
};

export default nextConfig;
