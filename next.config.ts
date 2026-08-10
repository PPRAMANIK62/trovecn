import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/PPRAMANIK62.png",
      },
    ],
  },
};

export default nextConfig;
