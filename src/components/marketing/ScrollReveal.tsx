"use client";

import { useEffect } from "react";

/** Renders nothing. After mount, fades in each `[data-reveal]` block the first time it scrolls into view.
 * Blocks already on screen are left alone, and with reduced motion nothing is hidden at all. */
export function ScrollReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "shown";
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    for (const el of blocks) {
      if (el.getBoundingClientRect().top < window.innerHeight) continue;
      el.dataset.reveal = "pending";
      io.observe(el);
    }
    return () => {
      io.disconnect();
      for (const el of blocks) if (el.dataset.reveal === "pending") el.dataset.reveal = "shown";
    };
  }, []);

  return null;
}
