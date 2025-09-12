import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.pollo.ai'
      },
      {
        protocol: 'https',
        hostname: 'videocdn.pollo.ai'
      }
    ]
  }
};

export default nextConfig;
