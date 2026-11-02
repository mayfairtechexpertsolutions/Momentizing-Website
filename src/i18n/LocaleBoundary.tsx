"use client";

import { useEffect, type ReactNode } from "react";
import { markLocaleReady, t, useLocale } from "./index";

/**
 * Wrap the page tree once (root layout). The first render matches the server's English; after hydration it switches to
 * the saved/browser language and remounts the tree so plain `t()` calls pick it up. English visitors see no remount.
 */
export function LocaleBoundary({ children }: { children: ReactNode }) {
  const locale = useLocale();
  useEffect(markLocaleReady, []);
  return <div key={locale} className="contents">{children}</div>;
}

/** Translated text for server components (pages that must keep their `metadata` export): `<T k="site.notFound.title" />`. */
export function T({ k, params }: { k: string; params?: Record<string, unknown> }) {
  useLocale();
  return <>{t(k, params)}</>;
}
