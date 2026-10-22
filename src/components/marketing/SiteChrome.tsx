"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MarketingFonts } from "./MarketingFonts";
import { MarketingNav } from "./MarketingNav";
import { MarketingFooter } from "./MarketingFooter";
import { ScrollReveal } from "./ScrollReveal";
import { WhatsAppFloatingButton } from "./WhatsAppFloatingButton";

/** Nav, footer and WhatsApp button live in the root layout so they persist across client-side navigation
 * (no remount flash, menu and scroll state survive). `/book` is a focused flow and `/help` is a standalone
 * crisis page, so they opt out of parts of the chrome. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const path = (usePathname() || "/").replace(/\/+$/, "") || "/";
  const isHelp = path === "/help";
  const isBook = path === "/book";

  return (
    <>
      <MarketingFonts />
      {!isHelp && (
        <>
          <a href="#main" className="skip-link">
            Skip to main content
          </a>
          <MarketingNav variant={isBook ? "simple" : "full"} />
          <ScrollReveal />
        </>
      )}
      <div className="flex-1">{children}</div>
      {!isHelp && !isBook && (
        <>
          <MarketingFooter />
          <WhatsAppFloatingButton />
        </>
      )}
    </>
  );
}
