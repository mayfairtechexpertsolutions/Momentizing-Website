"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export interface NavMenuItem {
  href: string;
  label: string;
  description?: string;
  /** Font Awesome classes, e.g. "fas fa-user". */
  icon?: string;
  /** Leaves this site (e.g. the app's login): rendered as a plain <a>. */
  external?: boolean;
}

/**
 * A disclosure dropdown for the desktop nav bar (a button that shows a list of links, not an ARIA menu). Opens on
 * click / Enter / Space, and on hover for mouse users; Esc closes it and returns focus to the button; arrow keys move
 * between links; an outside click or a route change closes it.
 */
export function NavMenu({
  label,
  items,
  active = false,
  align = "left",
  triggerClassName = "",
  triggerContent,
  footer,
}: {
  label: string;
  items: NavMenuItem[];
  /** Underline the trigger like an active nav link (one of its targets is the current place). */
  active?: boolean;
  align?: "left" | "right";
  triggerClassName?: string;
  /** Replaces the plain text label inside the button (e.g. icon + text). `label` still names it for screen readers. */
  triggerContent?: ReactNode;
  footer?: ReactNode;
}) {
  const pathname = usePathname() || "/";
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const setOpen = (v: boolean) => setOpenFor(v ? pathname : null);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  // A mouse reaches the button (hover opens it) before it clicks; that first click must not toggle it shut again.
  const openedByHover = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenFor(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenFor(null);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  function focusItem(delta: number | "first" | "last") {
    const links = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-navmenu-item]") ?? []);
    if (links.length === 0) return;
    const current = links.indexOf(document.activeElement as HTMLElement);
    const next = delta === "first" ? 0 : delta === "last" ? links.length - 1 : (current + delta + links.length) % links.length;
    links[next]?.focus();
  }

  const hoverOpen = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    if (!open) openedByHover.current = true;
    setOpen(true);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => {
      openedByHover.current = false;
      setOpenFor(null);
    }, 150);
  };

  return (
    <div ref={rootRef} className="relative" onPointerEnter={hoverOpen} onPointerLeave={hoverClose}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={triggerContent ? label : undefined}
        onClick={() => {
          if (openedByHover.current) {
            openedByHover.current = false;
            setOpen(true);
            return;
          }
          setOpen(!open);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => focusItem("first"));
          }
        }}
        className={`inline-flex min-h-11 items-center gap-1.5 uppercase transition hover:text-momentizing-gold-deep ${
          active ? "text-momentizing-gold-deep underline decoration-2 underline-offset-8" : ""
        } ${triggerClassName}`}
      >
        {triggerContent ?? label}
        <i aria-hidden="true" className={`fas fa-chevron-down text-[10px] transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        id={panelId}
        hidden={!open}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
            e.preventDefault();
            focusItem(e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : e.key === "Home" ? "first" : "last");
          }
        }}
        className={`absolute top-full z-50 pt-3 ${align === "right" ? "right-0" : "-left-4"}`}
      >
        <div className="w-80 rounded-2xl border border-momentizing-mint-deep bg-white p-2 font-marketing-sans tracking-normal normal-case shadow-md">
          <ul>
            {items.map((item) => {
              const body = (
                <>
                  {item.icon && (
                    <span aria-hidden="true" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-momentizing-mint text-momentizing-teal">
                      <i aria-hidden="true" className={item.icon} />
                    </span>
                  )}
                  <span className="flex flex-col">
                    <span className="text-sm font-bold text-momentizing-slate">{item.label}</span>
                    {item.description && <span className="text-xs font-normal text-momentizing-muted">{item.description}</span>}
                  </span>
                </>
              );
              const cls = "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-momentizing-cream focus-visible:bg-momentizing-cream";
              return (
                <li key={item.href}>
                  {item.external ? (
                    <a href={item.href} data-navmenu-item className={cls} onClick={() => setOpenFor(null)}>
                      {body}
                    </a>
                  ) : (
                    <Link href={item.href} data-navmenu-item className={cls} onClick={() => setOpenFor(null)}>
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          {footer && <div className="mt-1 border-t border-momentizing-mint px-3 pt-3 pb-1">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
