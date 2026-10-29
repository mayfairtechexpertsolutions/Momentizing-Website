import { useApiQuery } from "./use-api-query";
import type { PageResponse } from "./types";

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

export const PRACTICE_MODE_LABEL: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "In-person",
  HYBRID: "Online & in-person",
};

/** "PSYCHOLOGIST" -> "Psychologist", "SOCIAL_WORKER" -> "Social worker"; null when there is nothing to show. */
export function professionLabel(professionType: string | null | undefined): string | null {
  if (!professionType) return null;
  const words = professionType.trim().toLowerCase().replace(/_/g, " ");
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : null;
}

export function formatSessionFee(cents: number | null, currency: string): string | null {
  if (cents == null) return null;
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(
    cents / 100
  );
}

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "" when the location has no day restriction (active every day). */
export function formatActiveDays(days: number[] | null): string {
  if (!days || days.length === 0) return "";
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => DAY_LABELS[d])
    .join(", ");
}

export function primaryLocation(p: Pick<MarketingSpecialist, "locations">): MarketingSpecialistLocation | null {
  return p.locations.find((l) => l.primary) ?? p.locations[0] ?? null;
}

/** Single specialist by id — same public data as the directory list, used by the detail page. */
export function useMarketingSpecialist(id: number) {
  return useApiQuery<MarketingSpecialist>(`/specialist/directory/${id}`, { anonymous: true });
}

/** Public reviews list for a specialist — no auth required to read, matches the directory itself. */
export function useSpecialistReviews(id: number, page = 0) {
  return useApiQuery<PageResponse<SpecialistReview>>(
    `/specialist/${id}/reviews?page=${page}&size=10&sort=createdAt,desc`,
    { anonymous: true },
    [id, page]
  );
}

/** Public marketing pages (homepage, /associates) — no auth required, backed by the real directory. */
export function useMarketingDirectory(size = 50) {
  return useApiQuery<PageResponse<MarketingSpecialist>>(`/specialist/directory?size=${size}`, {
    anonymous: true,
  });
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
