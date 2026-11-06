"use client";

import { useEffect } from "react";

import { withBase } from "@/lib/base-path";

/** Self-hosted (public/vendor/fontawesome, v6.0.0 free) so no visitor IP address is sent to a third-party CDN. */
const FONT_AWESOME = withBase("/vendor/fontawesome/css/all.min.css");

/**
 * Icon font, added AFTER the page is interactive. A `<link rel="stylesheet" precedence>` makes React 19 hold the whole
 * page back until the file arrives, so a slow or blocked CDN left the booking page on "Getting things ready…" (QA §14).
 * Added this way the page never waits for it; icons simply appear once the font loads.
 */
export function MarketingFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_AWESOME}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_AWESOME;
    document.head.appendChild(link);
  }, []);
  return null;
}
