"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { appLink } from "@config";
import { withBase } from "@/lib/base-path";

// Every home section that follows the nav targets, so the highlight clears once you scroll past Corporate.
const SECTION_IDS = ["services", "packages", "corporate", "associates-preview", "faq"];

interface MarketingNavProps {
  variant?: "full" | "simple";
  simpleLabel?: string;
}

export function MarketingNav({ variant = "full", simpleLabel = "Back Home" }: MarketingNavProps) {
  // Remember which page opened the menu, so it closes by itself when the route changes (the nav now persists).
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const pathname = usePathname() || "/";
  const path = pathname.replace(/\/+$/, "") || "/";
  const onHome = path === "/";
  const menuOpen = openFor === pathname;
  const setMenuOpen = (open: boolean) => setOpenFor(open ? pathname : null);
  const anchor = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  // Shadow once the page has scrolled; on the home page also mark the section currently in view.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      if (window.scrollY < 200) setActiveId(null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    let io: IntersectionObserver | undefined;
    if (onHome && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) if (entry.isIntersecting) setActiveId(entry.target.id);
        },
        { rootMargin: "-25% 0px -60% 0px" },
      );
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      }
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, [onHome]);

  // Close the mobile menu on Escape or when the viewport grows into the desktop bar; lock page scroll while it is open.
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setOpenFor(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const mq = window.matchMedia("(min-width: 1280px)");
    const onMq = () => mq.matches && close();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [menuOpen]);

  const activeClass = "text-momentizing-gold-deep underline decoration-2 underline-offset-8";
  const linkClass = (id: string) => `transition hover:text-momentizing-gold-deep ${activeId === id ? activeClass : ""}`;
  const pageClass = (href: string) => `transition hover:text-momentizing-gold-deep ${path === href ? activeClass : ""}`;
  const pageCurrent = (href: string) => (path === href ? ("page" as const) : undefined);

  return (
    <nav className={`fixed z-50 w-full border-b border-momentizing-mint-deep bg-white/95 backdrop-blur-md transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex-shrink-0" onClick={() => setMenuOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase("/website/momentizing-logo.jpeg")} alt="Momentizing" width={200} height={71} className="h-12 mix-blend-multiply md:h-14" />
        </Link>

        {variant === "simple" ? (
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full border border-momentizing-slate/40 px-6 py-2 text-xs font-bold tracking-widest text-momentizing-slate uppercase transition hover:bg-momentizing-slate hover:text-white"
          >
            {simpleLabel}
          </Link>
        ) : (
          <>
            {/* Browse on the left, you + the one main action on the right. "Get the App" and "Careers" live in the footer
                (and the mobile menu) so the bar stays calm and the logo is never squeezed. */}
            <div className="hidden items-center gap-10 text-xs font-bold tracking-widest whitespace-nowrap uppercase xl:flex">
              <div className="flex items-center gap-7">
                <Link href={anchor("services")} className={linkClass("services")} aria-current={activeId === "services" ? "location" : undefined}>
                  Services
                </Link>
                <Link href={anchor("packages")} className={linkClass("packages")} aria-current={activeId === "packages" ? "location" : undefined}>
                  Packages
                </Link>
                <Link href={anchor("corporate")} className={linkClass("corporate")} aria-current={activeId === "corporate" ? "location" : undefined}>
                  Corporate
                </Link>
                <Link href="/associates" className={pageClass("/associates")} aria-current={pageCurrent("/associates")}>
                  Find an Associate
                </Link>
                <Link href="/about" className={pageClass("/about")} aria-current={pageCurrent("/about")}>
                  About
                </Link>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/my-bookings" className={pageClass("/my-bookings")} aria-current={pageCurrent("/my-bookings")}>
                  My bookings
                </Link>
                <a href={appLink("/login")} className="transition hover:text-momentizing-gold-deep">
                  Login
                </a>
                <Link href="/book" className="rounded-full bg-momentizing-teal px-6 py-3 text-white transition hover:bg-momentizing-slate">
                  Book a Session
                </Link>
              </div>
            </div>

            <button
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-momentizing-slate xl:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="marketing-mobile-menu"
            >
              <i className={`fas ${menuOpen ? "fa-times" : "fa-bars"} text-xl`} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {variant === "full" && menuOpen && (
        <div
          id="marketing-mobile-menu"
          className="flex max-h-[calc(100dvh-5rem)] flex-col gap-1 overflow-y-auto border-t border-momentizing-gold/10 bg-white px-6 py-5 text-xs font-bold tracking-widest uppercase xl:hidden [&_a]:flex [&_a]:min-h-11 [&_a]:items-center"
        >
          <Link href={anchor("services")} onClick={() => setMenuOpen(false)}>
            Services
          </Link>
          <Link href={anchor("packages")} onClick={() => setMenuOpen(false)}>
            Packages
          </Link>
          <Link href={anchor("corporate")} onClick={() => setMenuOpen(false)}>
            Corporate
          </Link>
          <Link href="/associates" aria-current={pageCurrent("/associates")} className={path === "/associates" ? "text-momentizing-gold-deep" : undefined} onClick={() => setMenuOpen(false)}>
            Find an Associate
          </Link>
          <Link href="/about" aria-current={pageCurrent("/about")} className={path === "/about" ? "text-momentizing-gold-deep" : undefined} onClick={() => setMenuOpen(false)}>
            About
          </Link>
          <hr className="my-2 border-momentizing-gold/20" />
          <Link href="/my-bookings" onClick={() => setMenuOpen(false)}>
            My bookings
          </Link>
          <a href={appLink("/login")} onClick={() => setMenuOpen(false)}>
            Login
          </a>
          <a href={appLink("/download")} onClick={() => setMenuOpen(false)}>
            Get the App
          </a>
          <Link href="/careers" className="text-momentizing-muted" onClick={() => setMenuOpen(false)}>
            Careers
          </Link>
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="mt-3 justify-center rounded-full bg-momentizing-teal px-6 py-3 text-center text-white"
          >
            Book a Session
          </Link>
        </div>
      )}
    </nav>
  );
}
