import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",          // enables static HTML export
  images: {
    unoptimized: true,       // required for next/image when exporting
  },
};

export default nextConfig;
