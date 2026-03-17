import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { 
        protocol: 'https', 
        hostname: 'xesbocpjxavyeobmuxca.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/**', 
      }, 
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      }],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
  reactCompiler: true,
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
