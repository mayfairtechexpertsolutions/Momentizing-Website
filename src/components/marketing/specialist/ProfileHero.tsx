"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { initials } from "@/components/marketing/booking/SpecialistParts";
import { useWhatsAppLink } from "@/lib/whatsapp";
import { StarRating } from "@/components/marketing/StarRating";
import {
  PRACTICE_MODE_LABEL,
  formatSessionFee,
  languageList,
  professionLabel,
  specialisationTags,
  type MarketingSpecialist,
} from "@/lib/marketing-directory";
import { useFavorites } from "@/lib/favorites";

interface Fact {
  icon: string;
  label: string;
  value: string;
  note?: string;
}

function quickFacts(p: MarketingSpecialist): Fact[] {
  const fee = formatSessionFee(p.sessionFeeCents, p.sessionFeeCurrency);
  const langs = languageList(p.languages);
  const facts: Fact[] = [];
  // Experience already sits beside the profession above the name; only repeat it here when that line can't show it.
  if (p.yearsExperience === 0) facts.push({ icon: "fa-award", label: "Experience", value: "Under a year" });
  facts.push({ icon: "fa-video", label: "Sessions", value: PRACTICE_MODE_LABEL[p.practiceMode] ?? p.practiceMode });
  if (fee) facts.push({ icon: "fa-tag", label: "Per session", value: fee, note: p.freeFirstSession ? "First session free" : undefined });
  if (langs.length > 0) facts.push({ icon: "fa-language", label: "Languages", value: langs.join(" · ") });
  return facts;
}

/** First sentence of the bio, trimmed to a headline-sized teaser; null when there's nothing worth quoting. */
function bioTeaser(bio: string | null): string | null {
  const text = bio?.replace(/\s+/g, " ").trim();
  if (!text) return null;
  const sentence = text.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? text;
  if (sentence.length < 25) return null;
  return sentence.length > 140 ? `${sentence.slice(0, 137).trimEnd()}…` : sentence;
}

const iconButtonClass =
  "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/80 text-momentizing-slate ring-1 ring-momentizing-slate/10 transition hover:bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal motion-reduce:transition-none";

/** Native share sheet where there is one (most phones), otherwise copy the link; a recommendation is how many people find a therapist. */
function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const share = async () => {
    const url = window.location.href.split("#")[0];
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} · Momentizing`, url });
      } catch {
        /* dismissed the sheet */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked: nothing sensible to fall back to */
    }
  };

  return (
    <span className="relative">
      <button type="button" onClick={share} aria-label={`Share ${name}'s profile`} className={iconButtonClass}>
        <i aria-hidden="true" className={copied ? "fas fa-check text-momentizing-teal" : "fas fa-share-alt"} />
      </button>
      <span role="status" className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap">
        {copied && <span className="rounded-full bg-momentizing-slate px-3 py-1 text-xs font-bold text-white shadow-md">Link copied</span>}
      </span>
    </span>
  );
}

/** Top of a public profile: a mint wash (same family as the home hero) holding a large portrait, the name and a quote in
 * their own words, trust cues, the two next steps, and one facts bar, so a visitor can decide "is this person right for
 * me?" before scrolling. */
export function ProfileHero({ specialist: p }: { specialist: MarketingSpecialist }) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(p.id);
  const profession = professionLabel(p.professionType);
  const facts = quickFacts(p);
  const whatsAppLink = useWhatsAppLink();
  const first = p.name.split(" ")[0];
  const teaser = bioTeaser(p.bio);
  const tags = specialisationTags(p.specialisation).slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-momentizing-mint px-6 pt-24 pb-10 md:pt-28 md:pb-14">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-momentizing-peach/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-momentizing-mint-deep/70 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
          <Link
            href="/associates"
            onClick={(e) => {
              // Came from the directory? Go back so its filters/scroll position survive; direct visits fall through to the link.
              if (window.history.length > 1 && document.referrer) {
                try {
                  const ref = new URL(document.referrer);
                  if (ref.origin === window.location.origin && ref.pathname.startsWith("/associates") && !ref.pathname.startsWith("/associates/view")) {
                    e.preventDefault();
                    router.back();
                  }
                } catch {
                  /* malformed referrer: use the normal link */
                }
              }
            }}
            className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-white/80 px-4 text-sm font-bold text-momentizing-teal shadow-sm ring-1 ring-momentizing-teal/15 transition hover:bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal motion-reduce:transition-none"
          >
            <i aria-hidden="true" className="fas fa-arrow-left text-xs transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none" />
            Back to all associates
          </Link>
        </nav>

        <div className="grid items-center gap-8 md:gap-10 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14">
          {/* Portrait: a tall 4:5 frame reads as a person, not an avatar; the tilted wash behind it adds depth without clutter. */}
          <div className="relative mx-auto w-40 sm:w-56 md:w-full">
            <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-[2.5rem] bg-momentizing-peach md:rounded-[3rem]" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border-[6px] border-white bg-momentizing-cream shadow-2xl shadow-momentizing-teal/20 md:rounded-[3rem]">
              {p.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatarUrl} alt={`Portrait of ${p.name}`} className="h-full w-full object-cover object-top" />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-full w-full items-center justify-center bg-gradient-to-br from-momentizing-mint to-momentizing-peach/60 font-marketing-serif text-7xl font-bold text-momentizing-teal"
                >
                  {initials(p.name)}
                </div>
              )}
            </div>
            <span className="absolute -bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold whitespace-nowrap text-momentizing-slate shadow-lg">
              <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
                {p.acceptingNewClients && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-momentizing-teal/50 motion-reduce:animate-none" />
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${p.acceptingNewClients ? "bg-momentizing-teal" : "bg-momentizing-muted"}`} />
              </span>
              {p.acceptingNewClients ? "Accepting new clients" : "Fully booked"}
            </span>
          </div>

          <div className="min-w-0 text-center md:text-left">
            <p className="inline-flex flex-wrap items-center justify-center gap-x-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold tracking-[0.1em] text-momentizing-teal uppercase sm:tracking-[0.18em]">
              {profession ?? "Specialist"}
              {p.yearsExperience != null && p.yearsExperience > 0 && (
                <>
                  <span aria-hidden="true" className="text-momentizing-teal/40">•</span>
                  <span className="whitespace-nowrap">
                    {p.yearsExperience} {p.yearsExperience === 1 ? "year" : "years"} experience
                  </span>
                </>
              )}
            </p>

            <h1 className="mt-4 font-marketing-serif text-4xl leading-[1.1] font-bold text-balance text-momentizing-gold-deep sm:text-5xl xl:text-6xl">{p.name}</h1>

            {teaser && (
              <blockquote className="relative mx-auto mt-5 max-w-xl md:mx-0 md:pl-6">
                <span aria-hidden="true" className="absolute top-0 left-0 hidden h-full w-1 rounded-full bg-momentizing-gold/60 md:block" />
                <p className="font-marketing-serif text-lg leading-snug text-momentizing-slate/85 italic md:text-xl">&ldquo;{teaser}&rdquo;</p>
              </blockquote>
            )}

            <ul aria-label="Highlights" className="mt-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <li className="inline-flex min-h-8 items-center rounded-full bg-white/80 px-3 ring-1 ring-momentizing-slate/10">
                <StarRating rating={p.averageRating} reviewCount={p.reviewCount} size="sm" />
              </li>
              {p.licenceNumber && (
                <li className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white/80 px-3 text-xs font-bold text-momentizing-teal ring-1 ring-momentizing-slate/10">
                  <i aria-hidden="true" className="fas fa-shield-alt" /> Licensed practitioner
                </li>
              )}
              {p.freeFirstSession && (
                <li className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-momentizing-teal px-3 text-xs font-bold text-white">
                  <i aria-hidden="true" className="fas fa-gift" /> Free first session
                </li>
              )}
              {p.proBonoAvailable && (
                <li className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-momentizing-peach px-3 text-xs font-bold text-momentizing-gold-deep">
                  <i aria-hidden="true" className="fas fa-hand-holding-heart" /> Pro-bono slots open
                </li>
              )}
            </ul>

            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="text-xs font-bold tracking-wider text-momentizing-muted uppercase">Helps with</span>
                <ul aria-label="Specialties" className="contents">
                  {tags.map((t) => (
                    <li key={t} className="rounded-full border border-momentizing-teal/25 px-3 py-1 text-xs font-bold text-momentizing-teal">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center md:justify-start">
              {p.acceptingNewClients ? (
                <Link
                  href={`/book?specialist=${p.id}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-momentizing-teal px-7 text-base font-bold text-white shadow-lg shadow-momentizing-teal/25 transition hover:-translate-y-0.5 hover:bg-momentizing-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <i aria-hidden="true" className="far fa-calendar-check" /> Book with {first}
                </Link>
              ) : (
                <Link
                  href="/associates"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-momentizing-teal px-7 text-base font-bold text-white shadow-lg shadow-momentizing-teal/25 transition hover:bg-momentizing-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal motion-reduce:transition-none"
                >
                  <i aria-hidden="true" className="fas fa-users" /> Meet other associates
                </Link>
              )}
              <div className="flex items-center justify-center gap-3">
                <a
                  href={whatsAppLink(
                    p.acceptingNewClients
                      ? `Hi Momentizing, I'd like to ask about booking a session with ${p.name}.`
                      : `Hi Momentizing, I'd like to know when ${p.name} has availability again.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white/80 px-6 text-sm font-bold text-momentizing-gold-deep ring-1 ring-momentizing-gold-deep/30 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal motion-reduce:transition-none sm:flex-none"
                >
                  <i aria-hidden="true" className="fab fa-whatsapp text-lg" /> {p.acceptingNewClients ? "Ask a question" : "Ask about availability"}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <button
                  type="button"
                  onClick={() => toggleFavorite(p.id)}
                  aria-pressed={favorited}
                  aria-label={favorited ? `Remove ${p.name} from favorites` : `Save ${p.name} to favorites`}
                  className={iconButtonClass}
                >
                  <i aria-hidden="true" className={favorited ? "fas fa-heart text-momentizing-gold-deep" : "far fa-heart"} />
                </button>
                <ShareButton name={p.name} />
              </div>
            </div>

            {p.acceptingNewClients && (
              <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-semibold text-momentizing-muted md:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <i aria-hidden="true" className="fas fa-check text-xs text-momentizing-teal" /> No account needed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i aria-hidden="true" className="fas fa-check text-xs text-momentizing-teal" /> Real open times
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i aria-hidden="true" className="fas fa-check text-xs text-momentizing-teal" /> Confirmed on WhatsApp
                </span>
              </p>
            )}
          </div>
        </div>

        {facts.length > 0 && (
          <ul
            aria-label="At a glance"
            className={`mt-12 grid grid-cols-2 overflow-hidden rounded-3xl bg-white/85 shadow-[0_8px_30px_rgba(47,62,70,0.08)] ring-1 ring-momentizing-slate/5 backdrop-blur ${
              facts.length >= 4 ? "md:grid-cols-4" : facts.length === 3 ? "md:grid-cols-3" : ""
            }`}
          >
            {facts.map((f, i) => (
              <li
                key={f.label}
                className={`flex items-start gap-3 p-5 md:p-6 ${facts.length % 2 === 1 && i === facts.length - 1 ? "col-span-2 md:col-span-1" : ""} ${i % 2 === 1 ? "border-l border-momentizing-slate/10" : ""} ${
                  i >= 2 ? "border-t border-momentizing-slate/10 md:border-t-0" : ""
                } ${i > 0 ? "md:border-l md:border-momentizing-slate/10" : ""}`}
              >
                <span aria-hidden="true" className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-momentizing-mint text-momentizing-teal sm:flex">
                  <i aria-hidden="true" className={`fas ${f.icon}`} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold tracking-wider text-momentizing-muted uppercase">{f.label}</span>
                  <span className="mt-0.5 block font-marketing-serif text-lg leading-snug font-bold break-words text-momentizing-slate">{f.value}</span>
                  {f.note && <span className="mt-0.5 block text-xs font-bold text-momentizing-teal">{f.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
