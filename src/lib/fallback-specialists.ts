import fallbackData from "@/data/fallback-specialists.json";
import type { PublicSlots, PublicSpecialistCard } from "./guest-booking";
import { withBase } from "./base-path";
import { addDaysIso, parseIsoLocal } from "./local-date";
import { intlLocale } from "@/i18n";
import type { MarketingSpecialist, MarketingSpecialistLocation } from "./marketing-directory";
import type { PageResponse } from "./types";

/**
 * Static copy of the team's public profiles, transcribed from the "Our Experts" posters. It is shown ONLY when the
 * backend is unreachable or broken (see `isBackendUnavailable`), so the site never goes blank. It carries no real
 * ids, fees, reviews or open slots, so booking switches to a WhatsApp request (see `manual-booking.ts`).
 * When a poster changes, edit `src/data/fallback-specialists.json`; the live directory always wins when the backend answers.
 */

/** Full English day names; the position is the 0 = Monday … 6 = Sunday index used by `DAY_LABELS` in marketing-directory. */
const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MINUTES_PER_DAY = 24 * 60;
const MS_PER_MINUTE = 60_000;

/** One weekday's session start times. */
export interface WeeklySlotDay {
  /** 0 = Monday … 6 = Sunday. */
  day: number;
  /** 24h "HH:mm" in the profile's own time zone, ascending. */
  times: string[];
}

export interface FallbackSpecialist extends MarketingSpecialist {
  weeklySlots: WeeklySlotDay[];
  durationMinutes: number;
  /** IANA name the weekly times are written in, e.g. "Asia/Jakarta". */
  timeZone: string;
  /** Portrait shown when the profile has no photo (or its file is missing); picked by the JSON `gender`. */
  defaultPhotoUrl: string;
  /** Kept for the team, deliberately NOT mapped to `sessionFeeCents` so the website never displays it. */
  recordedSessionFee: { cents: number | null; currency: string };
}

const PRACTICE_MODES = ["ONLINE", "IN_PERSON", "HYBRID"];
const GENDERS = ["FEMALE", "MALE", ""];
const DEFAULT_PHOTO_BY_GENDER: Record<string, string> = { FEMALE: "female", MALE: "male", "": "neutral" };

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
  /** IANA time zone name ("Area/City", e.g. "Asia/Jakarta") the weekly times are written in. */
  timeZone: string;
  /** File name inside public/team/ ("" = use the default portrait). */
  photo: string;
  /** "FEMALE" | "MALE" | "": chooses the default portrait only. */
  gender: string;
  /** "ONLINE" | "IN_PERSON" | "HYBRID". */
  practiceMode: string;
  /** Required (at least one) for IN_PERSON and HYBRID. The first is the main location. */
  locations: { label: string; address: string }[];
  languages: string[];
  yearsExperience: number | null;
  licenceNumber: string | null;
  sessionFeeCents: number | null;
  sessionFeeCurrency: string;
  /** Weekday name -> session start times (24h "HH:mm", in `timeZone`). */
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

function assertValidTimeZone(timeZone: string, who: string): string {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return timeZone;
  } catch {
    throw new Error(`fallback-specialists.json: "${who}" has an invalid timeZone "${timeZone}" (use an IANA name such as "Asia/Jakarta", not "WIB" or "UTC+7")`);
  }
}

function assertOneOf(value: string, allowed: string[], field: string, who: string): string {
  if (!allowed.includes(value)) {
    throw new Error(`fallback-specialists.json: "${who}" has ${field} "${value}" (allowed: ${allowed.map((a) => `"${a}"`).join(", ")})`);
  }
  return value;
}

function toLocations(record: FallbackProfileRecord): MarketingSpecialistLocation[] {
  return record.locations.map((l, index) => ({ id: index + 1, label: l.label || null, address: l.address, primary: index === 0, activeDays: null }));
}

/** Public URL of a team photo file, or null when the profile has none. Only a bare file name is accepted. */
function photoUrl(photo: string): string | null {
  const name = photo.trim();
  if (!name) return null;
  if (/[\\/]/.test(name)) throw new Error(`fallback-specialists.json: photo "${photo}" must be a file name only (put the file in public/team/)`);
  return withBase(`/team/${encodeURIComponent(name)}`);
}

function toSpecialist(record: FallbackProfileRecord): FallbackSpecialist {
  const practiceMode = assertOneOf(record.practiceMode, PRACTICE_MODES, "practiceMode", record.name);
  const gender = assertOneOf(record.gender, GENDERS, "gender", record.name);
  const locations = toLocations(record);
  if (practiceMode !== "ONLINE" && locations.length === 0) {
    throw new Error(`fallback-specialists.json: "${record.name}" is ${practiceMode} but has no locations (add { "label", "address" })`);
  }
  const defaultPhotoUrl = withBase(`/team/default/${DEFAULT_PHOTO_BY_GENDER[gender]}.svg`);
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
    timeZone: assertValidTimeZone(record.timeZone, record.name),
    avatarUrl: photoUrl(record.photo) ?? defaultPhotoUrl,
    defaultPhotoUrl,
    languages: record.languages.length > 0 ? record.languages.join(", ") : null,
    acceptingNewClients: true,
    licenceNumber: record.licenceNumber,
    yearsExperience: record.yearsExperience,
    sessionFormats: null,
    preferredContact: null,
    practiceMode,
    locations,
    sessionFeeCents: null,
    sessionFeeCurrency: record.sessionFeeCurrency,
    recordedSessionFee: { cents: record.sessionFeeCents, currency: record.sessionFeeCurrency },
    freeFirstSession: false,
    proBonoAvailable: false,
    averageRating: null,
    reviewCount: 0,
    acceptsIndividual: true,
    acceptsCouple: record.acceptsCouple ?? false,
  };
}

export const FALLBACK_SPECIALISTS: FallbackSpecialist[] = (fallbackData.specialists as unknown as FallbackProfileRecord[]).map(toSpecialist);

/** The default portrait to fall back to if a built-in profile's photo file is missing; undefined for live profiles. */
export function fallbackPhotoFor(id: number): string | undefined {
  return isFallbackSpecialistId(id) ? getFallbackSpecialist(id)?.defaultPhotoUrl : undefined;
}

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
    locationLabel: s.locations[0] ? (s.locations[0].label ?? s.locations[0].address) : null,
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

/** Minutes the zone is ahead of UTC at that instant (e.g. 420 for Asia/Jakarta). */
function zoneOffsetMinutes(timeZone: string, utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).formatToParts(new Date(utcMs));
  const value = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const wallAsUtc = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"));
  return Math.round((wallAsUtc - Math.floor(utcMs / MS_PER_MINUTE) * MS_PER_MINUTE) / MS_PER_MINUTE);
}

/** The UTC instant at which the clock in `timeZone` reads the given wall time. Handles zones with daylight saving. */
function zonedWallTimeToUtcMs(timeZone: string, year: number, month: number, day: number, hour: number, minute: number): number {
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const firstGuess = wallAsUtc - zoneOffsetMinutes(timeZone, wallAsUtc) * MS_PER_MINUTE;
  return wallAsUtc - zoneOffsetMinutes(timeZone, firstGuess) * MS_PER_MINUTE;
}

/** Short zone name on a date as the reader's language shows it, e.g. "WIB" (Indonesian) or "GMT+7" (English). */
export function expertZoneLabel(timeZone: string, dateIso: string): string {
  return (
    new Intl.DateTimeFormat(intlLocale(), { timeZone, timeZoneName: "short" })
      .formatToParts(parseIsoLocal(dateIso))
      .find((p) => p.type === "timeZoneName")?.value ?? timeZone
  );
}

/** The clock reading in `timeZone` at a UTC instant, as "HH:mm". */
export function clockInZone(timeZone: string, utcMs: number): string {
  const offset = zoneOffsetMinutes(timeZone, utcMs);
  const total = (((Math.floor(utcMs / MS_PER_MINUTE) + offset) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
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
  // Start one day early: a morning slot east of UTC falls on the previous UTC date.
  for (let offset = -1; offset <= days; offset++) {
    const expertDate = addDaysIso(fromUtc, offset);
    const [y, mo, d] = expertDate.split("-").map(Number);
    const weekday = (new Date(Date.UTC(y, mo - 1, d)).getUTCDay() + 6) % 7;
    const day = specialist.weeklySlots.find((w) => w.day === weekday);
    for (const time of day?.times ?? []) {
      const [h, mi] = time.split(":").map(Number);
      const utcMs = zonedWallTimeToUtcMs(specialist.timeZone, y, mo, d, h, mi ?? 0);
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
    sessionTypes: specialist.practiceMode === "HYBRID" ? ["ONLINE", "IN_PERSON"] : [specialist.practiceMode],
    timezone: "UTC",
    expertTimeZone: specialist.timeZone,
    days: windowDays,
    nextAvailableDate: windowDays.find((d) => d.times.length > 0)?.date ?? null,
  };
}
