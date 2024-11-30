import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/nk1",
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // output: "standalone",
};

export default nextConfig;
