"use client";

import Link from "next/link";
import { useWhatsAppLink } from "@/lib/whatsapp";

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

const REASSURANCES = [
  "No account needed",
  "See real open times",
  "Confirmed on WhatsApp",
];

/**
 * The "book with this specialist" card on a public profile. It sends the visitor into the real booking flow, which shows
 * this specialist's actual open times and can hold one — no account needed. (It used to show a hard-coded 09:00-17:00 grid
 * that only recorded a *preference*.)
 */
export function SpecialistBookingPanel({ specialistId, specialistName, acceptingNewClients, fee, freeFirstSession }: SpecialistBookingPanelProps) {
  const whatsAppLink = useWhatsAppLink();
  const first = specialistName.split(" ")[0];

  if (!acceptingNewClients) {
    return (
      <div className={`${cardClass} text-center`}>
        <span aria-hidden="true" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-momentizing-peach text-momentizing-gold-deep">
          <i aria-hidden="true" className="fas fa-hourglass-half" />
        </span>
        <h2 className="mb-2 font-marketing-serif text-xl font-bold text-momentizing-slate">{first} is fully booked right now</h2>
        <p className="mb-6 text-sm leading-relaxed text-momentizing-muted">
          There are no open spots at the moment. Other associates are happy to welcome you today.
        </p>
        <Link href="/associates" className={primaryClass}>
          Meet other associates
        </Link>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      {fee && (
        <div className="mb-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-marketing-serif text-4xl font-bold text-momentizing-slate">{fee}</span>
          <span className="text-sm text-momentizing-muted">per session</span>
          {freeFirstSession && (
            <span className="ml-auto rounded-full bg-momentizing-mint px-3 py-1 text-xs font-bold text-momentizing-teal">First session free</span>
          )}
        </div>
      )}
      <h2 className="mb-2 font-marketing-serif text-xl font-bold text-momentizing-gold-deep">Book with {first}</h2>
      <p className="mb-5 text-sm leading-relaxed text-momentizing-muted">
        Pick a time that suits you and reserve it in a few gentle steps.
      </p>

      <ul className="mb-6 space-y-2.5">
        {REASSURANCES.map((r) => (
          <li key={r} className="flex items-center gap-3 text-sm font-semibold text-momentizing-slate">
            <span aria-hidden="true" className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-momentizing-mint text-xs text-momentizing-teal">
              <i aria-hidden="true" className="fas fa-check" />
            </span>
            {r}
          </li>
        ))}
      </ul>

      <Link href={`/book?specialist=${specialistId}`} className={primaryClass}>
        <i aria-hidden="true" className="far fa-calendar-check" /> Choose a time
      </Link>

      <div className="my-5 flex items-center gap-3 text-xs font-bold tracking-wider text-momentizing-muted uppercase" aria-hidden="true">
        <span className="h-px flex-1 bg-momentizing-mint-deep" />
        or
        <span className="h-px flex-1 bg-momentizing-mint-deep" />
      </div>

      <a
        href={whatsAppLink(`Hi Momentizing, I'd like to book a session with ${specialistName}.`)}
        target="_blank"
        rel="noopener noreferrer"
        className={secondaryClass}
      >
        <i aria-hidden="true" className="fab fa-whatsapp text-lg" /> Chat first on WhatsApp
        <span className="sr-only"> (opens in a new tab)</span>
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
            <p className="text-xs text-momentizing-muted">per session</p>
          </>
        ) : (
          <p className="text-sm font-bold text-momentizing-slate">Book a session</p>
        )}
      </div>
      <Link
        href={`/book?specialist=${specialistId}`}
        className="ml-auto flex min-h-12 items-center justify-center rounded-full bg-momentizing-teal px-6 text-sm font-bold whitespace-nowrap text-white transition hover:bg-momentizing-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal"
      >
        Choose a time
      </Link>
    </div>
  );
}
