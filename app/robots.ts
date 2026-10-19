import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/url";

export default function robots(): MetadataRoute.Robots {
  const APP_URL = getAppUrl();

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
