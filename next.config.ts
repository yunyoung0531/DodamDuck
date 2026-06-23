import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'sy2978.dothome.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'lbixfndmgtewifwskbrg.supabase.co',
      },
    ],
  },
};

export default nextConfig;
