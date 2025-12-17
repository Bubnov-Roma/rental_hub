import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['your-supabase-domain.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
  reactCompiler: true,
};

export default nextConfig;
