/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict React mode
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  // Compression
  compress: true,

  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },

  // Redirects for legacy URLs
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/courses", destination: "/explore", permanent: true },
      { source: "/calculator", destination: "/practice/sip", permanent: false },
    ];
  },

  // Experimental features
  experimental: {
    // optimizePackageImports improves tree-shaking
    optimizePackageImports: ["lucide-react", "@supabase/supabase-js"],
  },

  // Suppress specific warnings in development
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
