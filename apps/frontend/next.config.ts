import type { NextConfig } from "next";
import withPWA from "next-pwa";

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
} as const;

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
} as const;

// @ts-ignore -- Ignoring type mismatch between next and next-pwa
const buildConfig = withPWA(pwaConfig)(nextConfig);

export default buildConfig;