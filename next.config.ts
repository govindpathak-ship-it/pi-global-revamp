import type { NextConfig } from "next";

// Set NEXT_PUBLIC_BASE_PATH=/pi-global-revamp for GitHub Pages project hosting; leave unset for local dev / root hosting.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
