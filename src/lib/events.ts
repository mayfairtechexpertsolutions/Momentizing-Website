import { useApiQuery } from "./use-api-query";
import type { PageResponse } from "./types";

/**
 * Public events from GET /public/events. Each session carries its wall-clock date/times on the event's own clock
 * (`timezoneLabel`, usually WIB) plus UTC instants. Pages show the wall clock and never convert it — unlike booking
 * times, which are UTC.
 */
export type EventFormat = "IN_PERSON" | "ONLINE" | "HYBRID";

export interface PublicEventSession {
  id: number;
  startsAt: string;
  endsAt: string;
  date: string; // yyyy-MM-dd
  startTime: string; // HH:mm:ss
  endTime: string;
  label?: string | null;
}

export interface PublicEvent {
  id: number;
  title: string;
  summary?: string | null;
  description?: string | null;
  tags: string[];
  format: EventFormat;
  venueName?: string | null;
  address?: string | null;
  city?: string | null;
  mapUrl?: string | null;
  /** Only present when the organizer chose to show the meeting link publicly. */
  onlineUrl?: string | null;
  registrationUrl?: string | null;
  priceType: "FREE" | "PAID";
  priceLabel?: string | null;
  posterUrl?: string | null;
  videoFileUrl?: string | null;
  videoUrl?: string | null;
  timezone: string;
  timezoneLabel: string;
  cancelled: boolean;
  past: boolean;
  nextStartsAt?: string | null;
  sessions: PublicEventSession[];
}

export type EventWhen = "upcoming" | "past";
export type EventFormatFilter = "ONLINE" | "IN_PERSON" | null;

export function useEvents(when: EventWhen, format: EventFormatFilter, size = 24) {
  const query = `when=${when}&size=${size}${format ? `&format=${format}` : ""}`;
  return useApiQuery<PageResponse<PublicEvent>>(`/public/events?${query}`, { anonymous: true }, [query]);
}

export function useEvent(id: number | null) {
  return useApiQuery<PublicEvent>(id ? `/public/events/${id}` : null, { anonymous: true }, [id]);
}

export const FORMAT_LABEL: Record<EventFormat, string> = { IN_PERSON: "In person", ONLINE: "Online", HYBRID: "In person & online" };

export function priceText(e: Pick<PublicEvent, "priceType" | "priceLabel">): string {
  return e.priceType === "FREE" ? "Free" : e.priceLabel || "Paid";
}

export function placeText(e: Pick<PublicEvent, "format" | "venueName" | "city">): string {
  if (e.format === "ONLINE") return "Online";
  const place = [e.venueName, e.city].filter(Boolean).join(", ");
  return e.format === "HYBRID" ? (place ? `${place} · or online` : "In person or online") : place || "Venue to be announced";
}

/** "Thu, 12 Nov 2026" from a yyyy-MM-dd wall date, without letting the browser's zone move it. */
export function formatEventDate(date: string, options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" }): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function timeRange(s: Pick<PublicEventSession, "startTime" | "endTime">, zoneLabel: string): string {
  return `${s.startTime.slice(0, 5)}–${s.endTime.slice(0, 5)} ${zoneLabel}`;
}

/** The session to headline: the next one still to come, else the last one. */
export function headlineSession(e: Pick<PublicEvent, "sessions">, now = new Date()): PublicEventSession | undefined {
  return e.sessions.find((s) => new Date(s.endsAt) > now) ?? e.sessions[e.sessions.length - 1];
}

/** YouTube/Vimeo link -> privacy-friendly embed URL, or null when it isn't one we can embed. */
export function videoEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host === "youtube.com") {
      const id = u.searchParams.get("v") ?? (u.pathname.startsWith("/shorts/") ? u.pathname.split("/")[2] : null);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "vimeo.com" && /^\/\d+/.test(u.pathname)) return `https://player.vimeo.com/video/${u.pathname.split("/")[1]}`;
  } catch {
    return null;
  }
  return null;
}

const icsStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);

/** A one-event calendar file for one session, in UTC so every calendar app places it correctly. */
export function buildIcs(e: PublicEvent, s: PublicEventSession, pageUrl: string): string {
  const location = e.format === "ONLINE" ? "Online" : [e.venueName, e.address, e.city].filter(Boolean).join(", ");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Momentizing//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:momentizing-event-${e.id}-${s.id}@momentizing`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(s.startsAt)}`,
    `DTEND:${icsStamp(s.endsAt)}`,
    `SUMMARY:${icsText(e.title)}`,
    `DESCRIPTION:${icsText([e.summary, pageUrl].filter(Boolean).join("\n\n"))}`,
    location ? `LOCATION:${icsText(location)}` : "",
    `URL:${pageUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n") + "\r\n";
}
