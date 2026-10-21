"use client";

import Link from "next/link";
import { appLink } from "@config";
import { useWhatsAppLink } from "@/lib/whatsapp";

export function MarketingFooter() {
  const whatsAppLink = useWhatsAppLink();
  return (
    <footer className="border-t border-momentizing-mint-deep bg-momentizing-mint/50 pt-12 pb-28 text-center sm:pb-12">
      <p className="px-4 text-xs font-bold tracking-widest text-momentizing-muted uppercase">
        Momentizing Holistic Center | Secure &amp; Transparent Care
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 px-4 text-xs font-bold tracking-widest text-momentizing-slate uppercase">
        <Link href="/legal" className="inline-flex min-h-11 items-center hover:opacity-70">
          Legal &amp; Support
        </Link>
        <Link href="/associates" className="inline-flex min-h-11 items-center hover:opacity-70">
          Find an Associate
        </Link>
        <Link href="/book" className="inline-flex min-h-11 items-center hover:opacity-70">
          Book a Session
        </Link>
        <Link href="/about" className="inline-flex min-h-11 items-center hover:opacity-70">
          About Us
        </Link>
        <Link href="/careers" className="inline-flex min-h-11 items-center hover:opacity-70">
          Careers
        </Link>
        <a href={appLink("/download")} className="inline-flex min-h-11 items-center hover:opacity-70">
          Get the App
        </a>
        <a
          href={whatsAppLink("Hi Momentizing, I'd like to book a session.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 hover:opacity-70"
        >
          <i className="fab fa-whatsapp" aria-hidden="true" /> WhatsApp Us
        </a>
      </div>
    </footer>
  );
}
