import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Railway 배포를 위한 설정
  output: 'standalone',

  // ESLint 에러를 빌드 중 무시 (프로덕션용)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript 에러를 빌드 중 무시 (프로덕션용)
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    domains: ['localhost', 'api.mapbox.com'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // Railway에서 이미지 최적화 비활성화
  },

  reactStrictMode: true,

  // Railway 환경 변수 설정
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
