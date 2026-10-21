import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

// AI search/answer crawlers are allowed on purpose (GEO): the public pages are what we want cited. Private,
// per-visitor pages are excluded for everyone.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/my-bookings/", "/associates/view/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
