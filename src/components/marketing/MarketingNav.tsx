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
        <Link href="/">
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
            <div className="hidden items-center space-x-5 text-xs font-bold tracking-widest whitespace-nowrap uppercase xl:space-x-8 lg:flex">
              <a href="#services" className="hover:text-momentizing-gold-deep transition">
                Services
              </a>
              <a href="#packages" className="hover:text-momentizing-gold-deep transition">
                Packages
              </a>
              <a href="#corporate" className="hover:text-momentizing-gold-deep transition">
                Corporate
              </a>
              <Link href="/associates" className="font-bold text-momentizing-slate underline decoration-momentizing-gold decoration-2 underline-offset-8 hover:opacity-70 transition">
                Find an Associate
              </Link>
              <a href={appLink("/login")} className="hover:text-momentizing-gold-deep transition">
                Login
              </a>
              <a
                href={appLink("/download")}
                className="rounded-full border border-momentizing-slate px-5 py-3 text-momentizing-slate transition hover:bg-momentizing-slate hover:text-white"
              >
                Get the App
              </a>
              <Link href="/book" className="rounded-full bg-momentizing-teal px-6 py-3 text-white transition hover:bg-momentizing-slate">
                Book a Session
              </Link>
            </div>

            <button
              className="flex h-11 w-11 items-center justify-center text-momentizing-slate lg:hidden"
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
          className="flex max-h-[calc(100dvh-5rem)] flex-col gap-1 overflow-y-auto [&>a]:flex [&>a]:min-h-11 [&>a]:items-center border-t border-momentizing-gold/10 bg-white px-6 py-6 text-xs font-bold tracking-widest uppercase lg:hidden"
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
          <Link href="/associates" className="text-momentizing-slate underline decoration-momentizing-gold decoration-2 underline-offset-8" onClick={() => setMenuOpen(false)}>
            Find an Associate
          </Link>
          <a href={appLink("/login")} onClick={() => setMenuOpen(false)}>
            Login
          </a>
          <a href={appLink("/download")} onClick={() => setMenuOpen(false)}>
            Get the App
          </a>
          <Link href="/book" onClick={() => setMenuOpen(false)} className="rounded-full bg-momentizing-teal px-6 py-3 text-center text-white">
            Book a Session
          </Link>
        </div>
      )}
    </nav>
  );
}
