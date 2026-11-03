"use client";

import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import Link from "next/link";
import { appLink } from "@config";
import { useWhatsAppLink } from "@/lib/whatsapp";
import { t } from "@/i18n";
import { OnlineOnly } from "./OnlineOnly";

export function MarketingFooter() {
  const whatsAppLink = useWhatsAppLink();
  return (
    <footer className="border-t border-momentizing-mint-deep bg-momentizing-mint/50 pt-12 pb-28 text-center sm:pb-12">
      <p className="px-4 text-xs font-bold tracking-widest text-momentizing-muted uppercase">
        {t("site.footer.tagline")}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 px-4 text-xs font-bold tracking-widest text-momentizing-slate uppercase">
        <Link href="/" className="inline-flex min-h-11 items-center hover:opacity-70">
          {t("site.footer.home")}
        </Link>
        <Link href="/legal" className="inline-flex min-h-11 items-center hover:opacity-70">
          {t("site.footer.legal")}
        </Link>
        <Link href="/associates" className="inline-flex min-h-11 items-center hover:opacity-70">
          {t("site.nav.findAssociate")}
        </Link>
        <Link href="/book" className="inline-flex min-h-11 items-center hover:opacity-70">
          {t("site.nav.bookSession")}
        </Link>
        <Link href="/events" className="inline-flex min-h-11 items-center hover:opacity-70">
          {t("site.nav.events")}
        </Link>
        <Link href="/about" className="inline-flex min-h-11 items-center hover:opacity-70">
          {t("site.nav.about")}
        </Link>
        <Link href="/careers" className="inline-flex min-h-11 items-center hover:opacity-70">
          {t("site.nav.careers")}
        </Link>
        <OnlineOnly>
          <a href={appLink("/download")} className="inline-flex min-h-11 items-center hover:opacity-70">
            {t("site.nav.getApp")}
          </a>
        </OnlineOnly>
        <a
          href={whatsAppLink(t("site.whatsapp.bookGreeting"))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 hover:opacity-70"
        >
          <i className="fab fa-whatsapp" aria-hidden="true" /> {t("site.footer.whatsapp")}
        </a>
      </div>
      <LocaleSwitcher className="mt-3 justify-center text-momentizing-muted" selectClassName="bg-white text-momentizing-slate" />
    </footer>
  );
}
