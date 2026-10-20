"use client";

import { initials } from "@/components/marketing/booking/SpecialistParts";
import Link from "next/link";
import { useFavorites } from "@/lib/favorites";
import { PRACTICE_MODE_LABEL, formatSessionFee, primaryLocation, type MarketingSpecialist } from "@/lib/marketing-directory";
import { StarRating } from "./StarRating";

interface SpecialistCardProps {
  specialist: MarketingSpecialist;
  /** "compact" drops the location/experience lines and hover CTA so more cards fit per row
   * (used for dense grids like the homepage's top-8-rated showcase). */
  size?: "default" | "compact";
}

export function SpecialistCard({ specialist: p, size = "default" }: SpecialistCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(p.id);
  const compact = size === "compact";
  const location = primaryLocation(p);
  const locationText = location ? location.address : (PRACTICE_MODE_LABEL[p.practiceMode] ?? p.practiceMode);
  const extraLocations = p.locations.length > 1 ? p.locations.length - 1 : 0;

  return (
    // The favourite button is a SIBLING of the profile link, not a child: a <button> nested inside an <a> is invalid
    // HTML (screen readers announce it unpredictably and some browsers mis-route the click).
    <div
      className={`group relative border border-momentizing-gold/5 bg-white transition hover:border-momentizing-gold/30 hover:shadow-lg hover:shadow-momentizing-gold/5 focus-within:border-momentizing-gold/30 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <button
        type="button"
        aria-label={favorited ? `Remove ${p.name} from favorites` : `Save ${p.name} to favorites`}
        aria-pressed={favorited}
        onClick={() => toggleFavorite(p.id)}
        className={`absolute z-10 flex items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-momentizing-teal ${
          compact ? "top-5 right-5 h-9 w-9" : "top-6 right-6 h-11 w-11"
        }`}
      >
        <i aria-hidden="true" className={`${compact ? "text-xs" : ""} ${favorited ? "fas fa-heart text-momentizing-gold-deep" : "far fa-heart text-momentizing-muted"}`} />
      </button>

      <Link href={`/associates/view?id=${p.id}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-momentizing-teal">

      {/* Initials, not a photo: the public site deliberately doesn't show specialists' pictures. */}
      <div className={`relative mb-3 flex items-center overflow-hidden rounded-2xl bg-momentizing-mint ${compact ? "h-20 px-4" : "h-24 px-5"}`}>
        <span
          aria-hidden="true"
          className={`flex flex-shrink-0 items-center justify-center rounded-full bg-white font-marketing-serif font-bold text-momentizing-teal ${
            compact ? "h-12 w-12 text-lg" : "h-14 w-14 text-xl"
          }`}
        >
          {initials(p.name)}
        </span>
        {!p.acceptingNewClients && (
          <span className="absolute right-2 bottom-2 rounded-full bg-white px-2 py-1 text-xs font-bold text-momentizing-muted uppercase">
            Full
          </span>
        )}
      </div>

      <h4 className={`font-bold ${compact ? "text-sm" : "text-md"}`}>{p.name}</h4>
      <p
        className={`mb-2 font-bold tracking-[0.2em] text-momentizing-gold-deep uppercase ${
          compact ? "text-xs" : "text-xs"
        }`}
      >
        {p.specialisation ?? "Specialist"}
      </p>

      <div className={compact ? "mb-1" : "mb-3"}>
        <StarRating rating={p.averageRating} reviewCount={p.reviewCount} size="sm" showCount={!compact} />
      </div>

      {compact ? (
        <div className="space-y-1 text-xs text-momentizing-muted">
          <p className="truncate">
            <i className="fas fa-map-marker-alt mr-1.5 w-3 text-momentizing-teal" />
            {locationText}
            {extraLocations > 0 && <span className="text-momentizing-gold-deep"> +{extraLocations} more</span>}
          </p>
          {p.yearsExperience != null && (
            <p>
              <i className="fas fa-clock mr-1.5 w-3 text-momentizing-teal" />
              {p.yearsExperience} {p.yearsExperience === 1 ? "year" : "years"}
            </p>
          )}
          {p.sessionFeeCents != null && (
            <p>
              <i className="fas fa-dollar-sign mr-1.5 w-3 text-momentizing-teal" />
              {formatSessionFee(p.sessionFeeCents, p.sessionFeeCurrency)} / session
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-1 text-xs text-momentizing-muted">
            <p>
              <i className="fas fa-map-marker-alt mr-2 w-3 text-momentizing-teal" />
              {locationText}
              {extraLocations > 0 && <span className="text-momentizing-gold-deep"> +{extraLocations} more</span>}
            </p>
            {p.yearsExperience != null && (
              <p>
                <i className="fas fa-clock mr-2 w-3 text-momentizing-teal" />
                {p.yearsExperience} {p.yearsExperience === 1 ? "year" : "years"} experience
              </p>
            )}
            {p.sessionFeeCents != null && (
              <p>
                <i className="fas fa-dollar-sign mr-2 w-3 text-momentizing-teal" />
                {formatSessionFee(p.sessionFeeCents, p.sessionFeeCurrency)} / session
              </p>
            )}
          </div>
          {/* Visible on touch screens (there is no hover there); on desktop it appears on hover or keyboard focus. */}
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold tracking-widest text-momentizing-slate uppercase transition md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
            View Profile &amp; Book <i className="fas fa-arrow-right" aria-hidden="true" />
          </span>
        </>
      )}
      </Link>
    </div>
  );
}
