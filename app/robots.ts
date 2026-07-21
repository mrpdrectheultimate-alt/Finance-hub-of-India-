import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/explore", "/track/", "/learn/"],
        disallow: ["/dashboard", "/admin", "/api/", "/auth/", "/profile", "/certificates"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
