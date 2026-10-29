import type { Metadata } from "next";
import type { ReactNode } from "react";

// The event is fetched in the browser, so the static HTML has no content worth indexing.
export const metadata: Metadata = { title: "Event", robots: { index: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
