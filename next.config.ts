import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Prevent Next.js from resolving the wrong workspace root when a parent
  // directory also contains a package-lock.json (e.g. C:\Users\ismail\).
  outputFileTracingRoot: path.join(__dirname),
  devIndicators: false,
};

export default nextConfig;
