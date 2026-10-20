"use client";

import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface SpecialistBookingPanelProps {
  specialistId: number;
  specialistName: string;
  acceptingNewClients: boolean;
}

const cardClass = "rounded-[2rem] border border-momentizing-slate/10 bg-white p-6 shadow-xl shadow-momentizing-slate/5 sm:p-8";
const primaryClass =
  "flex min-h-12 w-full items-center justify-center rounded-full bg-momentizing-slate px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-momentizing-slate/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal";

/**
 * The "book with this specialist" card on a public profile. It used to show a hard-coded 09:00-17:00 grid that only
 * recorded a *preference*; it now sends the visitor into the real booking flow, which shows this specialist's actual
 * open times and can hold one — no account needed. A signed-in client goes to the in-app booking screen instead.
 */
export function SpecialistBookingPanel({ specialistId, specialistName, acceptingNewClients }: SpecialistBookingPanelProps) {
  if (!acceptingNewClients) {
    return (
      <div className={`${cardClass} text-center`}>
        <h3 className="mb-2 font-marketing-serif text-xl">Not currently accepting clients</h3>
        <p className="text-sm text-momentizing-muted">
          {specialistName} is at capacity right now. Browse{" "}
          <Link href="/associates" className="font-semibold underline">
            other associates
          </Link>{" "}
          who are accepting new clients today.
        </p>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <h3 className="mb-2 font-marketing-serif text-xl">Book with {specialistName}</h3>
      <p className="mb-6 text-sm text-momentizing-muted">
        See {specialistName.split(" ")[0]}&apos;s real open times and reserve one in a few gentle steps. No account needed.
      </p>
      <Link href={`/book?specialist=${specialistId}`} className={primaryClass}>
        Choose a time
      </Link>
      <p className="mt-4 text-center text-sm text-momentizing-muted">
        Prefer to chat first?{" "}
        <a
          href={buildWhatsAppLink(`Hi Momentizing, I'd like to book a session with ${specialistName}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline"
        >
          Message us on WhatsApp
        </a>
      </p>
    </div>
  );
}
