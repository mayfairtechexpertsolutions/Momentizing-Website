"use client";

import { initials } from "@/components/marketing/booking/SpecialistParts";
import Link from "next/link";
import { useFavorites } from "@/lib/favorites";
import {
  PRACTICE_MODE_LABEL,
  formatSessionFee,
  languageList,
  primaryLocation,
  professionLabel,
  specialisationTags,
  type MarketingSpecialist,
} from "@/lib/marketing-directory";

interface SpecialistCardProps {
  specialist: MarketingSpecialist;
  /** "compact" drops the bio/languages and tightens spacing so two cards fit side by side on a phone
   * (used for dense grids like the homepage showcase). */
  size?: "default" | "compact";
}

/** Same practice-mode icon the profile uses, so a card and its profile read the same way. */
const MODE_ICON: Record<string, string> = { ONLINE: "fa-video", IN_PERSON: "fa-map-marker-alt", HYBRID: "fa-video" };

export function SpecialistCard({ specialist: p, size = "default" }: SpecialistCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(p.id);
  const compact = size === "compact";
  const profession = professionLabel(p.professionType);
  const location = primaryLocation(p);
  const city = location?.address ?? null;
  const tags = specialisationTags(p.specialisation);
  const shownTags = tags.slice(0, 2);
  const hiddenTags = tags.length - shownTags.length;
  const langs = languageList(p.languages);
  const fee = formatSessionFee(p.sessionFeeCents, p.sessionFeeCurrency);
  const hasReviews = p.averageRating != null && p.reviewCount > 0;
  const mode = PRACTICE_MODE_LABEL[p.practiceMode] ?? p.practiceMode;

  return (
    // The favourite button is a SIBLING of the profile link, not a child: a <button> nested inside an <a> is invalid
    // HTML (screen readers announce it unpredictably and some browsers mis-route the click).
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-momentizing-slate/10 bg-white shadow-[0_8px_30px_rgba(47,62,70,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(47,62,70,0.12)] focus-within:border-momentizing-teal/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <button
        type="button"
        aria-label={favorited ? `Remove ${p.name} from favorites` : `Save ${p.name} to favorites`}
        aria-pressed={favorited}
        onClick={() => toggleFavorite(p.id)}
        className="absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-momentizing-teal motion-reduce:transition-none"
      >
        <i aria-hidden="true" className={favorited ? "fas fa-heart text-momentizing-gold-deep" : "far fa-heart text-momentizing-muted"} />
      </button>

      <Link
        href={`/associates/view?id=${p.id}`}
        className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-momentizing-teal"
      >
        {/* Photo first: a real face is the strongest trust signal on a care directory. Square keeps faces in frame
         * far more often than the old 4:3 crop did. */}
        <div className="relative aspect-square w-full overflow-hidden bg-momentizing-mint">
          {p.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.avatarUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div aria-hidden="true" className="flex h-full w-full items-center justify-center bg-gradient-to-br from-momentizing-mint to-momentizing-peach/60">
              <span
                className={`flex items-center justify-center rounded-full bg-white font-marketing-serif font-bold text-momentizing-teal shadow-sm ${
                  compact ? "h-16 w-16 text-2xl" : "h-24 w-24 text-4xl"
                }`}
              >
                {initials(p.name)}
              </span>
            </div>
          )}
          {/* Soft fade so the pills stay legible on any photo. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-momentizing-slate/40 to-transparent" />

          {p.freeFirstSession && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-momentizing-teal px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              <i aria-hidden="true" className="fas fa-gift" /> {compact ? "Free 1st" : "Free first session"}
            </span>
          )}

          <span className="absolute bottom-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-momentizing-slate shadow-sm">
            <span aria-hidden="true" className={`h-2 w-2 flex-shrink-0 rounded-full ${p.acceptingNewClients ? "bg-momentizing-teal" : "bg-momentizing-muted"}`} />
            <span className="truncate">{p.acceptingNewClients ? (compact ? "Taking clients" : "Accepting new clients") : "Fully booked"}</span>
          </span>
        </div>

        <div className={`flex flex-1 flex-col ${compact ? "p-3.5 sm:p-4" : "p-5"}`}>
          <p className="text-xs font-bold tracking-[0.14em] text-momentizing-teal uppercase">
            {profession ?? "Specialist"}
            {!compact && p.yearsExperience != null && p.yearsExperience > 0 && (
              <span className="text-momentizing-muted">
                {" "}
                · {p.yearsExperience} {p.yearsExperience === 1 ? "yr" : "yrs"}
              </span>
            )}
          </p>
          <h3 className={`mt-1 font-marketing-serif leading-snug font-bold text-balance text-momentizing-slate ${compact ? "text-base sm:text-lg" : "text-xl"}`}>{p.name}</h3>

          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold">
            {hasReviews ? (
              <>
                <i aria-hidden="true" className="fas fa-star text-momentizing-gold-deep" />
                <span className="text-momentizing-slate">{p.averageRating?.toFixed(1)}</span>
                <span className="font-semibold text-momentizing-muted">
                  ({p.reviewCount} {p.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-momentizing-teal">
                <i aria-hidden="true" className="fas fa-seedling" /> {compact ? "New here" : "New to Momentizing"}
              </span>
            )}
          </p>

          {shownTags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Specialisations">
              {shownTags.map((t) => (
                <li key={t} className="max-w-full truncate rounded-full bg-momentizing-mint px-2.5 py-1 text-xs font-bold text-momentizing-teal">
                  {t}
                </li>
              ))}
              {hiddenTags > 0 && (
                <li className="rounded-full px-1.5 py-1 text-xs font-bold text-momentizing-muted">
                  +{hiddenTags}
                  <span className="sr-only"> more</span>
                </li>
              )}
            </ul>
          )}

          {!compact && p.bio && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-momentizing-muted">{p.bio}</p>}

          <ul className="mt-3 mb-4 space-y-1.5 text-sm text-momentizing-muted">
            <li className="flex items-start gap-2">
              <i aria-hidden="true" className={`fas ${MODE_ICON[p.practiceMode] ?? "fa-video"} mt-1 w-3.5 flex-shrink-0 text-xs text-momentizing-teal`} />
              <span className="min-w-0">{mode}</span>
            </li>
            {city && p.practiceMode !== "ONLINE" && (
              <li className="flex items-start gap-2">
                <i aria-hidden="true" className="fas fa-map-marker-alt mt-1 w-3.5 flex-shrink-0 text-xs text-momentizing-teal" />
                <span className={`min-w-0 ${compact ? "truncate" : ""}`}>
                  {city}
                  {p.locations.length > 1 && !compact && <span className="text-momentizing-muted"> · {p.locations.length} locations</span>}
                </span>
              </li>
            )}
            {!compact && langs.length > 0 && (
              <li className="flex items-start gap-2">
                <i aria-hidden="true" className="fas fa-language mt-1 w-3.5 flex-shrink-0 text-xs text-momentizing-teal" />
                <span>{langs.join(" · ")}</span>
              </li>
            )}
          </ul>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-momentizing-slate/10 pt-4">
            <p className="min-w-0 text-sm leading-tight text-momentizing-muted">
              {fee ? (
                <>
                  <span className="font-marketing-serif text-lg font-bold text-momentizing-slate">{fee}</span>
                  <span className="block text-xs">per session</span>
                </>
              ) : (
                "Fee on profile"
              )}
            </p>
            {compact ? (
              <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-momentizing-teal text-white transition group-hover:bg-momentizing-slate group-focus-within:bg-momentizing-slate">
                <span className="sr-only">View {p.name}&apos;s profile</span>
                <i className="fas fa-arrow-right transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
              </span>
            ) : (
              <span className="inline-flex min-h-11 flex-shrink-0 items-center gap-2 rounded-full bg-momentizing-teal px-4 text-sm font-bold text-white transition group-hover:bg-momentizing-slate group-focus-within:bg-momentizing-slate">
                View profile
                <span className="sr-only"> of {p.name}</span>
                <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
