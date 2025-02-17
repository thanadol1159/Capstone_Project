import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // basePath: "/nk1",
  output: "standalone",
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  assetPrefix: "https://capstone24.sit.kmutt.ac.th/nk1/",
};

export default nextConfig;
