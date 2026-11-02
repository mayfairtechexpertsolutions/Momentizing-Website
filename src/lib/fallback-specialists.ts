import fallbackData from "@/data/fallback-specialists.json";
import type { PublicSlots, PublicSpecialistCard } from "./guest-booking";
import { addDaysIso } from "./local-date";
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

/** WIB is UTC+7 all year (Indonesia has no daylight saving). */
export const WIB_OFFSET_MINUTES = 7 * 60;
const MINUTES_PER_DAY = 24 * 60;
const MS_PER_MINUTE = 60_000;

/** One weekday's session start times. */
export interface WeeklySlotDay {
  /** 0 = Monday … 6 = Sunday. */
  day: number;
  /** 24h "HH:mm", WIB, ascending. */
  times: string[];
}

export interface FallbackSpecialist extends MarketingSpecialist {
  weeklySlots: WeeklySlotDay[];
  durationMinutes: number;
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
  /** Optional; `defaultDurationMinutes` applies when absent. */
  durationMinutes?: number;
  /** Weekday name -> session start times (24h "HH:mm", WIB). */
  weeklySlots: Record<string, string[]>;
}

const DEFAULT_DURATION_MINUTES: number = fallbackData.defaultDurationMinutes;

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
    weeklySlots: Object.entries(record.weeklySlots)
      .map(([name, times]) => ({ day: dayIndex(name), times: [...times].sort() }))
      .sort((a, b) => a.day - b.day),
    durationMinutes: record.durationMinutes ?? DEFAULT_DURATION_MINUTES,
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

export const FALLBACK_SPECIALISTS: FallbackSpecialist[] = (fallbackData.specialists as unknown as FallbackProfileRecord[]).map(toSpecialist);

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

function addMinutesToClock(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + (m ?? 0) + minutes) % MINUTES_PER_DAY;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Merges back-to-back slots into ranges: 13:00 + 14:00 (60 min each) -> "1:00 PM – 3:00 PM". */
function slotRanges(times: string[], durationMinutes: number): string[] {
  const ranges: { from: string; to: string }[] = [];
  for (const time of times) {
    const last = ranges[ranges.length - 1];
    if (last && last.to === time) last.to = addMinutesToClock(time, durationMinutes);
    else ranges.push({ from: time, to: addMinutesToClock(time, durationMinutes) });
  }
  return ranges.map((r) => `${formatClock(r.from)} – ${formatClock(r.to)}`);
}

/** Posted hours for display, days with identical hours grouped: "Wednesday & Friday · 9:00 AM – 11:00 AM". */
export function describeWorkingHours(s: Pick<FallbackSpecialist, "weeklySlots" | "durationMinutes">): string[] {
  const daysByHours = new Map<string, string[]>();
  for (const { day, times } of s.weeklySlots) {
    const hours = slotRanges(times, s.durationMinutes).join(", ");
    daysByHours.set(hours, [...(daysByHours.get(hours) ?? []), WEEKDAY_NAMES[day]]);
  }
  return [...daysByHours].map(([hours, days]) => `${days.join(" & ")} · ${hours}`);
}

function isoOfUtcMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * The weekly pattern expanded into the same UTC-wall-clock response the live slots endpoint returns, so the booking
 * screen treats it exactly like real availability (SlotPicker then re-expresses it on the visitor's clock).
 * `fromUtc` is "YYYY-MM-DD". Static: it knows nothing about existing bookings; the team confirms on WhatsApp.
 */
export function fallbackSlots(specialist: FallbackSpecialist, fromUtc: string, days: number): PublicSlots {
  const byUtcDate = new Map<string, string[]>();
  // Start one day early: a morning WIB slot falls on the previous UTC date.
  for (let offset = -1; offset <= days; offset++) {
    const wibDate = addDaysIso(fromUtc, offset);
    const [y, mo, d] = wibDate.split("-").map(Number);
    const weekday = (new Date(Date.UTC(y, mo - 1, d)).getUTCDay() + 6) % 7;
    const day = specialist.weeklySlots.find((w) => w.day === weekday);
    for (const time of day?.times ?? []) {
      const [h, mi] = time.split(":").map(Number);
      const utcMs = Date.UTC(y, mo - 1, d, h, mi ?? 0) - WIB_OFFSET_MINUTES * MS_PER_MINUTE;
      const utc = new Date(utcMs);
      const utcDate = isoOfUtcMs(utcMs);
      const utcTime = `${String(utc.getUTCHours()).padStart(2, "0")}:${String(utc.getUTCMinutes()).padStart(2, "0")}`;
      byUtcDate.set(utcDate, [...(byUtcDate.get(utcDate) ?? []), utcTime]);
    }
  }
  const windowDays = Array.from({ length: days }, (_, i) => {
    const date = addDaysIso(fromUtc, i);
    return { date, times: (byUtcDate.get(date) ?? []).sort() };
  });
  return {
    specialistId: specialist.id,
    specialistName: specialist.name,
    durationMinutes: specialist.durationMinutes,
    sessionTypes: ["ONLINE"],
    timezone: "UTC",
    expertTimeZone: FALLBACK_TIME_ZONE_LABEL,
    days: windowDays,
    nextAvailableDate: windowDays.find((d) => d.times.length > 0)?.date ?? null,
  };
}
