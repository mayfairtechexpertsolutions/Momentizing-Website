"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Flips `data-seen` to "true" once, the first time the block scrolls into view. CSS keys off the attribute
 * (see `.journey-road` / `.journey-pin` in globals.css), so the content itself is always in the HTML. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setSeen(true), 0);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-seen={seen} className={className}>
      {children}
    </div>
  );
}
