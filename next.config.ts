import type { NextConfig } from "next";

// Static export for GitHub Pages. For a project site (https://<user>.github.io/<repo>) set NEXT_PUBLIC_BASE_PATH=/<repo>
// at build time (the deploy workflow does this); leave it empty for a custom domain or user/org site.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
