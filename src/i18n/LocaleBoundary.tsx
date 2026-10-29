"use client";

import { useEffect, type ReactNode } from "react";
import { markLocaleReady, useLocale } from "./index";

/**
 * Wrap the page tree once (root layout). The first render matches the server's English; after hydration it switches to
 * the saved/browser language and remounts the tree so plain `t()` calls pick it up. English visitors see no remount.
 */
export function LocaleBoundary({ children }: { children: ReactNode }) {
  const locale = useLocale();
  useEffect(markLocaleReady, []);
  return <div key={locale} className="contents">{children}</div>;
}
