import fallbackData from "@/data/fallback-events.json";
import { withBase } from "./base-path";
import { expertZoneLabel, zonedWallTimeToUtcMs } from "./fallback-specialists";
import type { EventFormat, EventFormatFilter, EventWhen, PublicEvent, PublicEventSession } from "./events";
import type { PageResponse } from "./types";

/**
 * Static events shown ONLY when the backend is unreachable or broken (see `isBackendUnavailable`), so /events and the
 * home band never go blank. The team edits `src/data/fallback-events.json`; the live events always win when the backend
 * answers. Same idea as `fallback-specialists.ts`: negative ids, validated when the site loads, so a typo fails the
 * build instead of reaching visitors.
 */

const FILE = "fallback-events.json";
const FORMATS: EventFormat[] = ["IN_PERSON", "ONLINE", "HYBRID"];
const PRICE_TYPES = ["FREE", "PAID"] as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const POSTER_FOLDER = "/events/";

/** Indonesian zones read as WIB / WITA / WIT in every language, as the live events do. */
const INDONESIAN_ZONE_LABELS: Record<string, string> = { "Asia/Jakarta": "WIB", "Asia/Makassar": "WITA", "Asia/Jayapura": "WIT" };

/** Not-found text for an unknown built-in id; the event page treats "not found" as a real 404, not a load failure. */
export const FALLBACK_EVENT_NOT_FOUND = "Event not found";

/** Fallback ids are negative so they can never collide with a real backend id. */
export const isFallbackEventId = (id: number): boolean => id < 0;

interface SessionRecord {
  date: string;
  startTime: string;
  endTime: string;
  label?: string;
}

/** One entry of `src/data/fallback-events.json` — the file the team edits. */
export interface FallbackEventRecord {
  id: number;
  enabled?: boolean;
  title: string;
  summary?: string;
  description?: string;
  tags?: string[];
  format: string;
  venueName?: string;
  address?: string;
  city?: string;
  mapUrl?: string;
  onlineUrl?: string;
  registrationUrl?: string;
  priceType: string;
  priceLabel?: string;
  poster?: string;
  timeZone: string;
  cancelled?: boolean;
  sessions: SessionRecord[];
}

function fail(who: string, problem: string): never {
  throw new Error(`${FILE}: "${who}" ${problem}`);
}

function assertTimeZone(who: string, timeZone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
  } catch {
    fail(who, `has an invalid timeZone "${timeZone}" (use an IANA name such as "Asia/Jakarta", not "WIB" or "UTC+7")`);
  }
}

function assertWebUrl(who: string, field: string, value: string | undefined) {
  if (value && !/^https?:\/\//i.test(value)) fail(who, `has ${field} "${value}" (must start with http:// or https://, or be "")`);
}

/** Throws a readable error for anything that would show wrongly on the site. */
export function validateRecord(record: FallbackEventRecord, seenIds: Set<number>): void {
  const who = record.title || `id ${record.id}`;
  if (!Number.isInteger(record.id) || record.id >= 0) fail(who, `has id ${record.id} (must be a negative whole number such as -1)`);
  if (seenIds.has(record.id)) fail(who, `repeats id ${record.id} (every id must be unique)`);
  seenIds.add(record.id);
  if (!record.title?.trim()) fail(who, "has no title");
  if (!FORMATS.includes(record.format as EventFormat)) fail(who, `has format "${record.format}" (allowed: ${FORMATS.join(", ")})`);
  if (!(PRICE_TYPES as readonly string[]).includes(record.priceType)) fail(who, `has priceType "${record.priceType}" (allowed: ${PRICE_TYPES.join(", ")})`);
  assertTimeZone(who, record.timeZone);
  assertWebUrl(who, "registrationUrl", record.registrationUrl);
  assertWebUrl(who, "mapUrl", record.mapUrl);
  assertWebUrl(who, "onlineUrl", record.onlineUrl);
  if (record.poster && /[\\/]/.test(record.poster)) fail(who, `has poster "${record.poster}" (file name only, e.g. "calm-mind.jpg"; the image goes in public/events/)`);
  if (!record.sessions?.length) fail(who, "has no sessions (add at least one date)");
  for (const s of record.sessions) {
    if (!DATE_PATTERN.test(s.date) || Number.isNaN(Date.parse(`${s.date}T00:00:00Z`))) fail(who, `has session date "${s.date}" (use YYYY-MM-DD)`);
    if (!TIME_PATTERN.test(s.startTime) || !TIME_PATTERN.test(s.endTime)) fail(who, `has session times "${s.startTime}"-"${s.endTime}" (use 24h HH:mm)`);
    if (s.endTime <= s.startTime) fail(who, `has a session on ${s.date} that ends (${s.endTime}) before it starts (${s.startTime})`);
  }
}

const RECORDS = fallbackData.events as unknown as FallbackEventRecord[];
(() => {
  const seen = new Set<number>();
  RECORDS.forEach((r) => validateRecord(r, seen));
})();

function toInstant(timeZone: string, date: string, time: string): string {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return new Date(zonedWallTimeToUtcMs(timeZone, y, mo, d, h, mi)).toISOString();
}

function toSession(record: FallbackEventRecord, s: SessionRecord, index: number): PublicEventSession {
  return {
    id: index + 1,
    startsAt: toInstant(record.timeZone, s.date, s.startTime),
    endsAt: toInstant(record.timeZone, s.date, s.endTime),
    date: s.date,
    startTime: `${s.startTime}:00`,
    endTime: `${s.endTime}:00`,
    label: s.label || null,
  };
}

/** Today's built-in event, shaped like the live response so callers need no special case. `now` only decides `past`. */
export function toPublicEvent(record: FallbackEventRecord, now = new Date()): PublicEvent {
  const sessions = [...record.sessions].sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)).map((s, i) => toSession(record, s, i));
  const nextSession = sessions.find((s) => new Date(s.endsAt) > now);
  const lastEnd = sessions[sessions.length - 1].endsAt;
  return {
    id: record.id,
    title: record.title,
    summary: record.summary || null,
    description: record.description || null,
    tags: record.tags ?? [],
    format: record.format as EventFormat,
    venueName: record.venueName || null,
    address: record.address || null,
    city: record.city || null,
    mapUrl: record.mapUrl || null,
    onlineUrl: record.onlineUrl || null,
    registrationUrl: record.registrationUrl || null,
    priceType: record.priceType as PublicEvent["priceType"],
    priceLabel: record.priceLabel || null,
    posterUrl: record.poster ? withBase(`${POSTER_FOLDER}${record.poster}`) : null,
    videoFileUrl: null,
    videoUrl: null,
    timezone: record.timeZone,
    timezoneLabel: INDONESIAN_ZONE_LABELS[record.timeZone] ?? expertZoneLabel(record.timeZone, sessions[0].date),
    cancelled: record.cancelled === true,
    past: new Date(lastEnd) <= now,
    nextStartsAt: nextSession?.startsAt ?? null,
    sessions,
  };
}

/** Every enabled built-in event. Recomputed per call so `past` and the zone label follow the clock and the language. */
export function getFallbackEvents(now = new Date()): PublicEvent[] {
  return RECORDS.filter((r) => r.enabled !== false).map((r) => toPublicEvent(r, now));
}

export function getFallbackEvent(id: number, now = new Date()): PublicEvent | null {
  return getFallbackEvents(now).find((e) => e.id === id) ?? null;
}

/**
 * The built-in events for one list request, shaped like the live page. Upcoming runs soonest first, past latest first.
 * A HYBRID event counts as both ONLINE and IN_PERSON, so it shows under either filter.
 */
export function selectEventsPage(events: PublicEvent[], when: EventWhen, format: EventFormatFilter, size: number, page = 0): PageResponse<PublicEvent> {
  const matching = events
    .filter((e) => (when === "past" ? e.past : !e.past))
    .filter((e) => !format || e.format === format || e.format === "HYBRID");
  const key = (e: PublicEvent) => (when === "past" ? e.sessions[e.sessions.length - 1].endsAt : (e.nextStartsAt ?? e.sessions[0].startsAt));
  matching.sort((a, b) => (when === "past" ? key(b).localeCompare(key(a)) : key(a).localeCompare(key(b))));
  const per = Math.max(1, size);
  const totalPages = Math.ceil(matching.length / per);
  const content = matching.slice(page * per, (page + 1) * per);
  return { content, totalElements: matching.length, totalPages, number: page, size, first: page === 0, last: page >= totalPages - 1 };
}

export function fallbackEventsPage(when: EventWhen, format: EventFormatFilter, size: number, now = new Date(), page = 0): PageResponse<PublicEvent> {
  return selectEventsPage(getFallbackEvents(now), when, format, size, page);
}
