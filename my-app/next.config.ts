import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",          // enables static HTML export
  trailingSlash: true,       // ensures /calendar/ -> /calendar/index.html
  images: {
    unoptimized: true,       // required for next/image when exporting
  },
};

export default nextConfig;
