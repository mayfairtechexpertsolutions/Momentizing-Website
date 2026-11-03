"use client";

import Link from "next/link";
import { isFallbackSpecialistId } from "@/lib/fallback-specialists";
import { useWhatsAppLink } from "@/lib/whatsapp";
import { t } from "@/i18n";

interface SpecialistBookingPanelProps {
  specialistId: number;
  specialistName: string;
  acceptingNewClients: boolean;
  /** Already formatted (e.g. "$250"); null when the specialist hasn't published a fee. */
  fee?: string | null;
  freeFirstSession?: boolean;
}

const cardClass = "rounded-[2rem] border border-momentizing-slate/10 bg-white p-6 shadow-xl shadow-momentizing-teal/10 sm:p-8";
const primaryClass =
  "flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-momentizing-teal px-6 py-3 text-center text-base font-bold text-white transition hover:bg-momentizing-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal";
const secondaryClass =
  "flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-momentizing-gold-deep px-6 py-3 text-center text-sm font-bold text-momentizing-gold-deep transition hover:bg-momentizing-gold-deep hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal";

const REASSURANCES = ["site.spec.noAccount", "site.panel.seeTimes", "site.spec.confirmedWa"];

/** Built-in profiles have no live calendar: the visitor requests a time and the team confirms on WhatsApp. */
const REQUEST_REASSURANCES = ["site.spec.noAccount", "site.fallback.chooseYourTime", "site.fallback.weConfirm"];

/**
 * The "book with this specialist" card on a public profile. It sends the visitor into the real booking flow, which shows
 * this specialist's actual open times and can hold one — no account needed. (It used to show a hard-coded 09:00-17:00 grid
 * that only recorded a *preference*.)
 */
export function SpecialistBookingPanel({ specialistId, specialistName, acceptingNewClients, fee, freeFirstSession }: SpecialistBookingPanelProps) {
  const whatsAppLink = useWhatsAppLink();
  const first = specialistName.split(" ")[0];
  const requestOnly = isFallbackSpecialistId(specialistId);

  if (!acceptingNewClients) {
    return (
      <div className={`${cardClass} text-center`}>
        <span aria-hidden="true" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-momentizing-peach text-momentizing-gold-deep">
          <i aria-hidden="true" className="fas fa-hourglass-half" />
        </span>
        <h2 className="mb-2 font-marketing-serif text-xl font-bold text-momentizing-slate">{t("site.panel.fullyBooked", { name: first })}</h2>
        <p className="mb-6 text-sm leading-relaxed text-momentizing-muted">
          {t("site.panel.noSpots")}
        </p>
        <Link href="/associates" className={primaryClass}>
          {t("site.spec.meetOthers")}
        </Link>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      {fee && (
        <div className="mb-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-marketing-serif text-4xl font-bold text-momentizing-slate">{fee}</span>
          <span className="text-sm text-momentizing-muted">{t("site.spec.perSession")}</span>
          {freeFirstSession && (
            <span className="ml-auto rounded-full bg-momentizing-mint px-3 py-1 text-xs font-bold text-momentizing-teal">{t("site.spec.firstFree")}</span>
          )}
        </div>
      )}
      <h2 className="mb-2 font-marketing-serif text-xl font-bold text-momentizing-gold-deep">{requestOnly ? t("site.fallback.requestTitle", { name: first }) : t("site.spec.bookWith", { name: first })}</h2>
      <p className="mb-5 text-sm leading-relaxed text-momentizing-muted">
        {requestOnly ? t("site.fallback.requestBlurb", { name: first }) : t("site.panel.pickTime")}
      </p>

      <ul className="mb-6 space-y-2.5">
        {(requestOnly ? REQUEST_REASSURANCES : REASSURANCES).map((r) => (
          <li key={r} className="flex items-center gap-3 text-sm font-semibold text-momentizing-slate">
            <span aria-hidden="true" className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-momentizing-mint text-xs text-momentizing-teal">
              <i aria-hidden="true" className="fas fa-check" />
            </span>
            {t(r)}
          </li>
        ))}
      </ul>

      <Link href={`/book?specialist=${specialistId}`} className={primaryClass}>
        <i aria-hidden="true" className="far fa-calendar-check" /> {requestOnly ? t("site.fallback.requestTime") : t("site.spec.chooseTime")}
      </Link>

      <div className="my-5 flex items-center gap-3 text-xs font-bold tracking-wider text-momentizing-muted uppercase" aria-hidden="true">
        <span className="h-px flex-1 bg-momentizing-mint-deep" />
        {t("site.common.or")}
        <span className="h-px flex-1 bg-momentizing-mint-deep" />
      </div>

      <a
        href={whatsAppLink(t("site.whatsapp.bookWith", { name: specialistName }))}
        target="_blank"
        rel="noopener noreferrer"
        className={secondaryClass}
      >
        <i aria-hidden="true" className="fab fa-whatsapp text-lg" /> {t("site.panel.chatFirst")}
        <span className="sr-only"> {t("site.common.newTab")}</span>
      </a>
    </div>
  );
}

/** Phone-only bar pinned to the bottom so "Choose a time" is always one tap away while reading a long profile.
 * Right padding keeps it clear of the floating WhatsApp button. */
export function MobileBookBar({ specialistId, fee }: { specialistId: number; fee: string | null }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] flex items-center gap-3 border-t border-momentizing-slate/10 bg-white/95 py-3 pr-24 pl-4 backdrop-blur lg:hidden">
      <div className="min-w-0 leading-tight">
        {fee ? (
          <>
            <p className="font-marketing-serif text-xl font-bold text-momentizing-slate">{fee}</p>
            <p className="text-xs text-momentizing-muted">{t("site.spec.perSession")}</p>
          </>
        ) : (
          <p className="text-sm font-bold text-momentizing-slate">{t("site.notFound.book")}</p>
        )}
      </div>
      <Link
        href={`/book?specialist=${specialistId}`}
        className="ml-auto flex min-h-12 items-center justify-center rounded-full bg-momentizing-teal px-6 text-sm font-bold whitespace-nowrap text-white transition hover:bg-momentizing-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal"
      >
        {isFallbackSpecialistId(specialistId) ? t("site.fallback.requestTime") : t("site.spec.chooseTime")}
      </Link>
    </div>
  );
}
