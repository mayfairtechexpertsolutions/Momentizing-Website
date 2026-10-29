"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { appLink } from "@config";
import { withBase } from "@/lib/base-path";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { NavMenu, type NavMenuItem } from "./NavMenu";

// Every home section that follows the nav targets, so the highlight clears once you scroll past Corporate.
const SECTION_IDS = ["services", "packages", "corporate", "associates-preview", "events", "faq"];
const SERVICE_IDS = ["services", "packages", "corporate"];

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
    const mq = window.matchMedia("(min-width: 1024px)");
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
  const pageClass = (href: string) => `transition hover:text-momentizing-gold-deep ${path === href ? activeClass : ""}`;
  const pageCurrent = (href: string) => (path === href ? ("page" as const) : undefined);
  const mobileCurrent = (href: string) => (path === href ? "text-momentizing-gold-deep" : undefined);
  const close = () => setMenuOpen(false);

  const serviceItems: NavMenuItem[] = [
    { href: anchor("services"), label: "1:1 services", description: "Counselling, coaching and assessment", icon: "fas fa-hand-holding-heart" },
    { href: anchor("packages"), label: "Packages", description: "Session bundles that cost less per session", icon: "fas fa-layer-group" },
    { href: anchor("corporate"), label: "Corporate wellbeing", description: "Programs for teams and workplaces", icon: "fas fa-building" },
  ];
  const accountItems: NavMenuItem[] = [
    { href: "/my-bookings", label: "My bookings", description: "Find and manage a booking", icon: "far fa-calendar-check" },
    { href: appLink("/login"), label: "Log in", description: "Open the Momentizing app", icon: "fas fa-arrow-right-to-bracket", external: true },
    { href: appLink("/download"), label: "Get the App", description: "Install on your phone", icon: "fas fa-mobile-screen", external: true },
  ];

  return (
    <nav className={`fixed z-50 w-full border-b border-momentizing-mint-deep bg-white/95 backdrop-blur-md transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex-shrink-0" onClick={() => setMenuOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase("/website/momentizing-logo.jpeg")} alt="Momentizing" width={200} height={71} className="h-12 mix-blend-multiply md:h-14 lg:h-12 xl:h-14" />
        </Link>

        {variant === "simple" ? (
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full border border-momentizing-slate/40 px-5 py-2 text-xs font-bold tracking-widest whitespace-nowrap text-momentizing-slate uppercase transition sm:px-6 hover:bg-momentizing-slate hover:text-white"
          >
            {simpleLabel}
          </Link>
        ) : (
          <>
            {/* Browse on the left, you + the one main action on the right. Services/Packages/Corporate share one menu and
                everything about "you" (bookings, login, app, language) shares another, so the bar fits from 1024px. */}
            <div className="hidden items-center gap-8 text-xs font-bold tracking-widest whitespace-nowrap uppercase lg:flex xl:gap-10">
              <div className="flex items-center gap-6 xl:gap-7">
                <NavMenu label="Services" items={serviceItems} active={activeId !== null && SERVICE_IDS.includes(activeId)} />
                <Link href="/associates" className={pageClass("/associates")} aria-current={pageCurrent("/associates")}>
                  Find an Associate
                </Link>
                <Link href="/events" className={pageClass("/events")} aria-current={pageCurrent("/events")}>
                  Events
                </Link>
                <Link href="/about" className={pageClass("/about")} aria-current={pageCurrent("/about")}>
                  About
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <NavMenu
                  label="Account"
                  align="right"
                  items={accountItems}
                  active={path === "/my-bookings"}
                  triggerClassName="rounded-full border border-momentizing-slate/30 px-4 hover:border-momentizing-gold-deep"
                  triggerContent={
                    <>
                      <i aria-hidden="true" className="far fa-user text-sm" /> Account
                    </>
                  }
                  footer={<LocaleSwitcher className="w-full justify-between text-momentizing-muted" selectClassName="bg-white text-momentizing-slate" />}
                />
                <Link href="/book" className={`rounded-full bg-momentizing-teal px-6 py-3 text-white transition hover:bg-momentizing-slate ${path === "/book" ? "bg-momentizing-slate" : ""}`}>
                  Book a Session
                </Link>
              </div>
            </div>

            <button
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-momentizing-slate lg:hidden"
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
          className="flex max-h-[calc(100dvh-5rem)] flex-col overflow-y-auto border-t border-momentizing-gold/10 bg-white px-6 pt-4 pb-5 text-xs font-bold tracking-widest uppercase lg:hidden [&_a]:flex [&_a]:min-h-11 [&_a]:items-center"
        >
          <MobileGroup title="Explore">
            <Link href={anchor("services")} onClick={close}>
              Services
            </Link>
            <Link href={anchor("packages")} onClick={close}>
              Packages
            </Link>
            <Link href={anchor("corporate")} onClick={close}>
              Corporate
            </Link>
            <Link href="/associates" aria-current={pageCurrent("/associates")} className={mobileCurrent("/associates")} onClick={close}>
              Find an Associate
            </Link>
            <Link href="/events" aria-current={pageCurrent("/events")} className={mobileCurrent("/events")} onClick={close}>
              Events
            </Link>
          </MobileGroup>
          <MobileGroup title="Company">
            <Link href="/about" aria-current={pageCurrent("/about")} className={mobileCurrent("/about")} onClick={close}>
              About
            </Link>
            <Link href="/careers" aria-current={pageCurrent("/careers")} className={mobileCurrent("/careers")} onClick={close}>
              Careers
            </Link>
          </MobileGroup>
          <MobileGroup title="Your account">
            <Link href="/my-bookings" aria-current={pageCurrent("/my-bookings")} className={mobileCurrent("/my-bookings")} onClick={close}>
              My bookings
            </Link>
            <a href={appLink("/login")} onClick={close}>
              Log in
            </a>
            <a href={appLink("/download")} onClick={close}>
              Get the App
            </a>
            <LocaleSwitcher className="min-h-11 font-normal tracking-normal normal-case text-momentizing-muted" selectClassName="bg-white text-momentizing-slate" />
          </MobileGroup>
          <Link
            href="/book"
            onClick={close}
            className="mt-4 min-h-12 justify-center rounded-full bg-momentizing-teal px-6 py-3 text-center text-white transition hover:bg-momentizing-slate"
          >
            Book a Session
          </Link>
        </div>
      )}
    </nav>
  );
}

function MobileGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-momentizing-gold/15 py-2 last-of-type:border-b-0">
      <p className="pt-2 pb-1 text-xs tracking-[0.2em] text-momentizing-muted">{title}</p>
      {children}
    </div>
  );
}
