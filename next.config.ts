import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [100],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;