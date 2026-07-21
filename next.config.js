/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|svg|webp|avif|woff2|woff)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/login", destination: "/auth/login", permanent: true },
      { source: "/signup", destination: "/auth/signup", permanent: true },
      { source: "/home", destination: "/", permanent: true },
    ];
  },

  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  env: {
    NEXT_PUBLIC_APP_NAME: "FinanceHub",
    NEXT_PUBLIC_APP_TAGLINE: "World-class finance education for everyone",
  },
};

module.exports = nextConfig;
