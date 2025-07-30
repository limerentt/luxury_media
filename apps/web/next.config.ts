import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google profile images
  },
};

export default nextConfig;
