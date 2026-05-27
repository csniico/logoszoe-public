import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Tell Turbopack the project root is this folder, not C:\Users\niico
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Stops Next.js from compiling all icons in the library on every page
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
