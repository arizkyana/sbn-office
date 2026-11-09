import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    serverActions: {
      // Cover campaign maksimal 2 MB + overhead multipart.
      bodySizeLimit: "3mb",
    },
  },
  images: {
    remotePatterns: [
      new URL(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/**`,
      ),
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
