import fallbackData from "@/data/fallback-specialists.json";
import type { PublicSpecialistCard } from "./guest-booking";
import { parseIsoLocal } from "./local-date";
import type { MarketingSpecialist } from "./marketing-directory";
import type { PageResponse } from "./types";

/**
 * Static copy of the team's public profiles, transcribed from the "Our Experts" posters. It is shown ONLY when the
 * backend is unreachable or broken (see `isBackendUnavailable`), so the site never goes blank. It carries no real
 * ids, fees, reviews or open slots, so booking switches to a WhatsApp request (see `manual-booking.ts`).
 * When a poster changes, edit `src/data/fallback-specialists.json`; the live directory always wins when the backend answers.
 */

/** Hours on the posters are written in Western Indonesia Time (UTC+7). */
export const FALLBACK_TIME_ZONE_LABEL = "WIB";

/** Full English day names; the position is the 0 = Monday … 6 = Sunday index used by `DAY_LABELS` in marketing-directory. */
const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export interface WorkingWindow {
  days: number[];
  /** 24h "HH:mm", WIB. */
  from: string;
  to: string;
}

export interface FallbackSpecialist extends MarketingSpecialist {
  workingHours: WorkingWindow[];
}

/** One entry of `src/data/fallback-specialists.json` — the file the team edits. */
interface FallbackProfileRecord {
  id: number;
  name: string;
  professionType: string;
  bio: string;
  acceptsCouple?: boolean;
  areasOfExpertise: string[];
  credentials: string[];
  workingHours: { days: string[]; from: string; to: string }[];
}

/** Fallback ids are negative so they can never collide with a real backend id. */
export const isFallbackSpecialistId = (id: number): boolean => id < 0;

function dayIndex(name: string): number {
  const index = WEEKDAY_NAMES.indexOf(name);
  if (index < 0) throw new Error(`fallback-specialists.json: unknown day "${name}" (use a full English day name, e.g. "Tuesday")`);
  return index;
}

function toSpecialist(record: FallbackProfileRecord): FallbackSpecialist {
  return {
    id: record.id,
    name: record.name,
    professionType: record.professionType,
    bio: record.bio,
    specialisation: record.areasOfExpertise.join(", "),
    credentialsSummary: record.credentials.join("\n"),
    workingHours: record.workingHours.map((w) => ({ days: w.days.map(dayIndex), from: w.from, to: w.to })),
    avatarUrl: null,
    languages: null,
    acceptingNewClients: true,
    licenceNumber: null,
    yearsExperience: null,
    sessionFormats: null,
    preferredContact: null,
    practiceMode: "ONLINE",
    locations: [],
    sessionFeeCents: null,
    sessionFeeCurrency: "IDR",
    freeFirstSession: false,
    proBonoAvailable: false,
    averageRating: null,
    reviewCount: 0,
    acceptsIndividual: true,
    acceptsCouple: record.acceptsCouple ?? false,
  };
}

export const FALLBACK_SPECIALISTS: FallbackSpecialist[] = (fallbackData.specialists as FallbackProfileRecord[]).map(toSpecialist);

export function getFallbackSpecialist(id: number): FallbackSpecialist | null {
  return FALLBACK_SPECIALISTS.find((s) => s.id === id) ?? null;
}

/** The fallback list shaped like the real directory response, so callers need no special case. */
export function fallbackDirectoryPage(size: number): PageResponse<MarketingSpecialist> {
  const content = FALLBACK_SPECIALISTS.slice(0, Math.max(0, size));
  return {
    content,
    totalElements: FALLBACK_SPECIALISTS.length,
    totalPages: 1,
    number: 0,
    size: content.length,
    first: true,
    last: true,
  };
}

/** The shape the /book wizard works with. */
export function toPublicCard(s: FallbackSpecialist): PublicSpecialistCard {
  return {
    id: s.id,
    name: s.name,
    avatarUrl: s.avatarUrl,
    professionType: s.professionType ?? "",
    specialisation: s.specialisation,
    bio: s.bio,
    languages: s.languages,
    yearsExperience: s.yearsExperience,
    credentialsSummary: s.credentialsSummary,
    practiceMode: s.practiceMode,
    sessionFormats: s.sessionFormats,
    locationLabel: null,
    sessionFeeCents: s.sessionFeeCents,
    sessionFeeCurrency: s.sessionFeeCurrency,
    freeFirstSession: s.freeFirstSession,
    averageRating: s.averageRating,
    reviewCount: s.reviewCount,
    acceptsIndividual: s.acceptsIndividual ?? true,
    acceptsCouple: s.acceptsCouple ?? false,
    acceptingNewClients: s.acceptingNewClients,
    nextAvailableDate: null,
    slotsOnRequestedDate: null,
  };
}

/** "13:00" -> "1:00 PM". Fixed format (not locale-based) so it reads exactly like the posters. */
export function formatClock(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m ?? 0).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** "Wednesday & Friday · 9:00 AM – 11:00 AM" */
export function formatWorkingWindow(w: WorkingWindow): string {
  const days = w.days.map((d) => WEEKDAY_NAMES[d]).join(" & ");
  return `${days} · ${formatClock(w.from)} – ${formatClock(w.to)}`;
}

/** Monday-first weekday index (0 = Mon) of a local calendar date. */
function weekdayIndex(dateIso: string): number {
  return (parseIsoLocal(dateIso).getDay() + 6) % 7;
}

/** Whether a requested day + WIB time falls inside one of the expert's posted windows. Used for a soft hint only. */
export function isWithinWorkingHours(windows: WorkingWindow[], dateIso: string, time: string): boolean {
  const day = weekdayIndex(dateIso);
  return windows.some((w) => w.days.includes(day) && time >= w.from && time < w.to);
}
