import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/nk1",
  // async rewrites() {
  //   return [
  //     {
  //       source: "/nk1/api/:path*",
  //       destination: "http://django:8080/api/:path*",
  //     },
  //   ];
  // },
  output: "standalone", 
};

export default nextConfig;
