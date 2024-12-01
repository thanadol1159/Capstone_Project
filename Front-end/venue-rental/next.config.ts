import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // basePath: "/nk1",
  output: "standalone",
  reactStrictMode: true,
  // swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  redirects: async () => [
    {
      source: "/", 
      destination: "/venue-rental", 
      permanent: false, 
    },
  ],
  // output: "standalone",
};

export default nextConfig;
