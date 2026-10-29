import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

// Indexable pages only. /my-bookings, /associates/view and /events/view are noindex and left out.
const PAGES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/book/", priority: 0.9, changeFrequency: "monthly" },
  { path: "/associates/", priority: 0.8, changeFrequency: "weekly" },
  { path: "/events/", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about/", priority: 0.7, changeFrequency: "monthly" },
  { path: "/help/", priority: 0.6, changeFrequency: "yearly" },
  { path: "/careers/", priority: 0.5, changeFrequency: "monthly" },
  { path: "/legal/", priority: 0.4, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
