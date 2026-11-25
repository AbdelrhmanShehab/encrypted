import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root; otherwise Turbopack can infer E:\ and fail to resolve tailwindcss.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
    // Resize + compress every image (phones get small WebP files instead of full-size originals)
    formats: ["image/webp"],
    // Product image URLs never change, so cache the optimized copies for 31 days
    minimumCacheTTL: 60 * 60 * 24 * 31,
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600],
    imageSizes: [64, 96, 128, 256, 384],
  },

  // Security + SEO headers applied to every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing (security + SEO signal)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Stop pages from being framed (clickjacking protection)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Force HTTPS for 1 year (Strict-Transport-Security)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Basic XSS protection header
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Prevent referrer leakage on external links
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // Explicitly tell Googlebot NOT to index private pages
      {
        source: "/(checkout|account|favorites|confirmation|admin)(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
