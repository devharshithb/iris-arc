import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Enable standalone output for Docker
  eslint: {
    // Disable ESLint during production builds (Docker)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during production builds (Docker)
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://127.0.0.1:8000/:path*", // FastAPI backend
      },
    ];
  },
};

export default nextConfig;
