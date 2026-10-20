"use client";

import Link from "next/link";
import { appLink } from "@config";

export const CLAIM_STORAGE_KEY = "momentizing.guest-claim";

const BENEFITS = [
  { title: "Gentle reminders", body: "We'll remind you before every session so nothing slips by." },
  { title: "See your booking anytime", body: "Your session and its status, always in one place." },
  { title: "Track how you're feeling", body: "Private mood check-ins and journaling, at your own pace." },
  { title: "Message your specialist", body: "Ask a question or share an update between sessions." },
  { title: "Reschedule with ease", body: "Move or rebook a session in a few taps." },
];

/**
 * Shown AFTER a confirmed booking — never before — so it can't feel like a condition of booking. The claim token is
 * handed to the app in the URL fragment (and sessionStorage for same-origin setups).
 */
export function WhyJoinCard({ claimToken, fullName }: { claimToken: string | null; fullName: string }) {
  function remember() {
    try {
      sessionStorage.setItem(CLAIM_STORAGE_KEY, JSON.stringify({ token: claimToken, name: fullName }));
    } catch {
      /* storage blocked: registration still works, the booking just won't auto-link */
    }
  }

  // The app is usually a different origin, where sessionStorage isn't shared, so the token also rides in the URL
  // fragment: browsers never send it to a server or in a Referer, and the app strips it on arrival.
  const registerHref = appLink(
    claimToken ? `/register?from=booking#${new URLSearchParams({ claim: claimToken, name: fullName })}` : "/register?from=booking",
  );

  return (
    <section aria-labelledby="why-join" className="rounded-3xl border border-momentizing-teal/40 bg-momentizing-mint p-6 sm:p-8">
      <h2 id="why-join" className="font-marketing-serif text-2xl">
        Why join us?
      </h2>
      <p className="mt-2 text-momentizing-muted">Your booking is already confirmed. A free account makes the journey easier — and links this booking to it automatically.</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {BENEFITS.map((b) => (
          <li key={b.title} className="flex gap-3">
            <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-momentizing-teal text-sm font-bold text-white">
              ✓
            </span>
            <span>
              <span className="block font-semibold">{b.title}</span>
              <span className="text-sm text-momentizing-muted">{b.body}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a href={registerHref} onClick={remember} className="sm:flex-1">
          <span className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-momentizing-teal px-6 py-3 text-sm font-semibold text-white hover:bg-momentizing-slate/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal">
            Create my free account
          </span>
        </a>
        <Link href="/" className="sm:flex-1">
          <span className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-momentizing-slate/30 bg-white px-6 py-3 text-sm font-semibold text-momentizing-slate hover:bg-momentizing-slate/5">
            Maybe later
          </span>
        </Link>
      </div>
      <p className="mt-3 text-sm text-momentizing-muted">No pressure — your booking stays valid either way.</p>
    </section>
  );
}
