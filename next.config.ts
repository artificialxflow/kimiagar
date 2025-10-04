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
    
    // کاهش حجم bundle با tree shaking بهتر
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          pdf: {
            test: /[\\/]node_modules[\\/](jspdf|html2canvas)[\\/]/,
            name: 'pdf-lib',
            chunks: 'all',
          },
          charts: {
            test: /[\\/]components[\\/]Dashboard[\\/](PriceChart|CoinPriceChart)[\\/]/,
            name: 'charts',
            chunks: 'async',
          },
        },
      },
    };
    
    return config;
  },
  // Force production optimizations
  compress: true,
  generateEtags: false,
  poweredByHeader: false,
  trailingSlash: false,
  // کاهش حجم تصاویر
  experimental: {
    optimizePackageImports: ['lucide-react', 'jspdf', 'html2canvas'],
  },
};

export default nextConfig;
