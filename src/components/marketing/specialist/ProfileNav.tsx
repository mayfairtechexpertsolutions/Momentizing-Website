"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

/** Fixed site header (h-20) plus a little air; the nav's own height is measured so the two never drift apart. */
const SITE_HEADER = 80;
const GAP = 16;

interface NavItem {
  id: string;
  label: string;
}

/** Sticky in-page navigation with scroll-spy: the tab for the section being read is highlighted, a click glides to the
 * section so its heading lands just under the bars, and the tab strip follows along on narrow screens. */
export function ProfileNav({ items }: { items: NavItem[] }) {
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(items[0]?.id ?? "");
  // While a click-driven glide is running the spy stands down, so the highlight doesn't flicker through every section passed.
  const gliding = useRef<number | null>(null);

  const offset = useCallback(() => SITE_HEADER + (navRef.current?.offsetHeight ?? 48) + GAP, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (gliding.current !== null) return;
      const line = offset() + 8;
      let current = items[0]?.id ?? "";
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // At the very bottom a short last section can never reach the line, so hand it the highlight.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = items[items.length - 1]?.id ?? current;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items, offset]);

  // Keep the highlighted tab visible inside the horizontally scrolling strip (without moving the page itself).
  useEffect(() => {
    const list = listRef.current;
    const tab = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!list || !tab) return;
    const left = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
    list.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [active]);

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return; // fall back to the plain anchor
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = target.getBoundingClientRect().top + window.scrollY - offset();
    setActive(id);
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);

    // Release the spy once the page stops moving, then move keyboard/screen-reader focus to the section.
    if (gliding.current !== null) window.clearTimeout(gliding.current);
    let last = -1;
    const settle = () => {
      if (Math.abs(window.scrollY - last) < 1) {
        gliding.current = null;
        target.focus({ preventScroll: true });
        return;
      }
      last = window.scrollY;
      gliding.current = window.setTimeout(settle, 80);
    };
    gliding.current = window.setTimeout(settle, 80);
  };

  return (
    <nav ref={navRef} aria-label="Profile sections" className="sticky top-20 z-40 border-b border-momentizing-slate/10 bg-white/90 backdrop-blur-md">
      <ul ref={listRef} className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6 [scrollbar-width:none]">
        {items.map((i) => {
          const on = i.id === active;
          return (
            <li key={i.id} data-id={i.id} className="flex-shrink-0">
              <a
                href={`#${i.id}`}
                onClick={(e) => go(e, i.id)}
                aria-current={on ? "location" : undefined}
                className={`flex min-h-12 items-center border-b-2 px-3 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-momentizing-teal motion-reduce:transition-none ${
                  on
                    ? "border-momentizing-teal text-momentizing-teal"
                    : "border-transparent text-momentizing-muted hover:border-momentizing-teal/40 hover:text-momentizing-teal"
                }`}
              >
                {i.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
