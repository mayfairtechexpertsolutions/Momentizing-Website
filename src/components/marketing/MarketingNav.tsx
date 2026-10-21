"use client";

import Link from "next/link";
import { useState } from "react";
import { appLink } from "@config";
import { withBase } from "@/lib/base-path";

interface MarketingNavProps {
  variant?: "full" | "simple";
  simpleLabel?: string;
}

export function MarketingNav({ variant = "full", simpleLabel = "Back Home" }: MarketingNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed z-50 w-full border-b border-momentizing-mint-deep bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase("/website/momentizing-logo.jpeg")} alt="Momentizing" className="h-12 mix-blend-multiply md:h-14" />
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
                <a href="#services" className="transition hover:text-momentizing-gold-deep">
                  Services
                </a>
                <a href="#packages" className="transition hover:text-momentizing-gold-deep">
                  Packages
                </a>
                <a href="#corporate" className="transition hover:text-momentizing-gold-deep">
                  Corporate
                </a>
                <Link href="/associates" className="transition hover:text-momentizing-gold-deep">
                  Find an Associate
                </Link>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/my-bookings" className="transition hover:text-momentizing-gold-deep">
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
              onClick={() => setMenuOpen((open) => !open)}
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
          <a href="#services" onClick={() => setMenuOpen(false)}>
            Services
          </a>
          <a href="#packages" onClick={() => setMenuOpen(false)}>
            Packages
          </a>
          <a href="#corporate" onClick={() => setMenuOpen(false)}>
            Corporate
          </a>
          <Link href="/associates" onClick={() => setMenuOpen(false)}>
            Find an Associate
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
