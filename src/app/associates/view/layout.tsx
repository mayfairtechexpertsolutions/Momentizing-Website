import type { Metadata } from "next";
import type { ReactNode } from "react";

// The profile is fetched in the browser, so the static HTML has no content worth indexing.
export const metadata: Metadata = { title: "Specialist profile", robots: { index: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
