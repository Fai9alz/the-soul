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
  async redirects() {
    return [
      { source: "/apply", destination: "/apply-now", permanent: false },
    ];
  },
};

export default nextConfig;