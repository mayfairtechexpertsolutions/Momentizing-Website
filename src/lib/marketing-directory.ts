import { fallbackDirectoryPage, getFallbackSpecialist, isFallbackSpecialistId } from "./fallback-specialists";
import { useApiQuery } from "./use-api-query";
import type { PageResponse } from "./types";
import { intlLocale, t } from "@/i18n";

/** Mirrors SpecialistLocationDto on the backend. activeDays: 0=Monday..6=Sunday; null/empty = every day. */
export interface MarketingSpecialistLocation {
  id: number;
  label: string | null;
  address: string;
  primary: boolean;
  activeDays: number[] | null;
}

/** Mirrors SpecialistDirectoryEntry on the backend — the real, public directory data. */
export interface MarketingSpecialist {
  id: number;
  name: string;
  avatarUrl: string | null;
  /** Profession enum from the backend (e.g. PSYCHOLOGIST); optional so older payloads still parse. */
  professionType?: string | null;
  specialisation: string | null;
  bio: string | null;
  languages: string | null;
  acceptingNewClients: boolean;
  licenceNumber: string | null;
  yearsExperience: number | null;
  credentialsSummary: string | null;
  sessionFormats: string | null;
  preferredContact: string | null;
  practiceMode: string;
  locations: MarketingSpecialistLocation[];
  sessionFeeCents: number | null;
  sessionFeeCurrency: string;
  freeFirstSession: boolean;
  proBonoAvailable: boolean;
  averageRating: number | null;
  reviewCount: number;
  acceptsIndividual?: boolean;
  acceptsCouple?: boolean;
}

export interface SpecialistReview {
  id: number;
  clientDisplayName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

const PRACTICE_MODES = ["ONLINE", "IN_PERSON", "HYBRID"];

/** "Online", "In-person"… in the chosen language; undefined for a mode the site doesn't know. */
export function practiceModeLabel(mode: string): string | undefined {
  return PRACTICE_MODES.includes(mode) ? t(`site.mode.${mode}`) : undefined;
}

const PROFESSIONS = ["PSYCHOLOGIST", "CLINICAL_PSYCHOLOGIST", "THERAPIST", "PSYCHIATRIST", "COUNSELOR", "COACH", "WELLNESS_PRACTITIONER"];

/** "PSYCHOLOGIST" -> "Psychologist", "SOCIAL_WORKER" -> "Social worker"; null when there is nothing to show. */
export function professionLabel(professionType: string | null | undefined): string | null {
  if (!professionType) return null;
  const code = professionType.trim().toUpperCase();
  if (PROFESSIONS.includes(code)) return t(`site.profession.${code}`);
  const words = professionType.trim().toLowerCase().replace(/_/g, " ");
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : null;
}

export function formatSessionFee(cents: number | null, currency: string): string | null {
  if (cents == null) return null;
  return new Intl.NumberFormat(intlLocale(), { style: "currency", currency, maximumFractionDigits: 0 }).format(
    cents / 100
  );
}


/** "" when the location has no day restriction (active every day). */
export function formatActiveDays(days: number[] | null): string {
  if (!days || days.length === 0) return "";
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => t(`site.day.${d}`))
    .join(", ");
}

export function primaryLocation(p: Pick<MarketingSpecialist, "locations">): MarketingSpecialistLocation | null {
  return p.locations.find((l) => l.primary) ?? p.locations[0] ?? null;
}

/** Not-found text for an unknown fallback id; the profile page treats "not found" as a real 404, not a load failure. */
const FALLBACK_NOT_FOUND = "Associate not found";

/**
 * Single specialist by id — same public data as the directory list, used by the detail page.
 * A negative id is a built-in fallback profile (no request). A real id whose request fails because the backend is down
 * stays an error: we can't know who that person is without the backend.
 */
export function useMarketingSpecialist(id: number) {
  const fallbackId = isFallbackSpecialistId(id);
  // A missing or non-numeric `?id=` is "no such profile", not a reason to ask the backend about `/directory/NaN`.
  const validId = Number.isInteger(id) && id !== 0;
  const query = useApiQuery<MarketingSpecialist>(fallbackId || !validId ? null : `/specialist/directory/${id}`, { anonymous: true });
  if (!validId) return { ...query, data: null, error: FALLBACK_NOT_FOUND, isLoading: false };
  if (!fallbackId) return query;
  const fallback = getFallbackSpecialist(id);
  return { ...query, data: fallback, error: fallback ? null : FALLBACK_NOT_FOUND, isLoading: false };
}

/** Public reviews list for a specialist — no auth required to read, matches the directory itself. */
export function useSpecialistReviews(id: number, page = 0) {
  return useApiQuery<PageResponse<SpecialistReview>>(
    `/specialist/${id}/reviews?page=${page}&size=10&sort=createdAt,desc`,
    { anonymous: true },
    [id, page]
  );
}

/**
 * Public marketing pages (homepage, /associates) — no auth required, backed by the real directory.
 * When the backend can't answer (down / 5xx — never for an empty list or a 4xx) the built-in team profiles are returned
 * with `isFallback: true`, so the site still introduces the team.
 */
export function useMarketingDirectory(size = 50, enabled = true) {
  const query = useApiQuery<PageResponse<MarketingSpecialist>>(enabled ? `/specialist/directory?size=${size}` : null, {
    anonymous: true,
  });
  if (!query.unavailable) return { ...query, isFallback: false };
  return { ...query, data: fallbackDirectoryPage(size), error: null, isLoading: false, isFallback: true };
}

export function specialisationTags(specialisation: string | null): string[] {
  if (!specialisation) return [];
  return specialisation
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function languageList(languages: string | null): string[] {
  if (!languages) return [];
  return languages
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
