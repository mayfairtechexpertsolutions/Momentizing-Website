import { useEffect, useState } from "react";
import { apiFetch, isBackendUnavailable } from "./api";
import { fallbackEventsPage } from "./fallback-events";
import type { EventFormatFilter, PublicEvent, PublicEventSession } from "./events";
import type { PageResponse } from "./types";

/** One dot on the calendar: a single session of an event (a multi-date event appears on every one of its dates). */
export interface CalendarEntry {
  event: PublicEvent;
  session: PublicEventSession;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** yyyy-MM-dd from year and 0-based month + day, with no zone involved. */
export const dateKey = (year: number, month: number, day: number): string => `${year}-${pad(month + 1)}-${pad(day)}`;

/** Today's date in the visitor's own zone as yyyy-MM-dd (what "today" means on a wall calendar). */
export const todayKey = (now = new Date()): string => dateKey(now.getFullYear(), now.getMonth(), now.getDate());

/** Groups every session of every event by its wall date, earliest first (then by id so the order is stable). */
export function entriesByDate(events: PublicEvent[]): Map<string, CalendarEntry[]> {
  const byDate = new Map<string, CalendarEntry[]>();
  for (const event of events) {
    for (const session of event.sessions) {
      const list = byDate.get(session.date) ?? [];
      list.push({ event, session });
      byDate.set(session.date, list);
    }
  }
  for (const list of byDate.values()) list.sort((a, b) => a.session.startTime.localeCompare(b.session.startTime) || a.event.id - b.event.id);
  return byDate;
}

/** The weeks (Monday first) that cover a month: arrays of 7 yyyy-MM-dd strings, including the spill-over days. */
export function monthWeeks(year: number, month: number): string[][] {
  const first = new Date(Date.UTC(year, month, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const weeks = Math.ceil((lead + daysInMonth) / 7);
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const day = new Date(Date.UTC(year, month, 1 - lead + w * 7 + d));
      return dateKey(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate());
    }),
  );
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(Date.UTC(year, month + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
}

// The public list answers at most 24 events a request and has no date filter, so the calendar walks the pages. The caps
// keep a runaway archive from turning one visit into dozens of requests; older past events stay on the Past list.
const PAGE = 24;
const MAX_UPCOMING_PAGES = 10;
const MAX_PAST_PAGES = 3;

async function loadAll(when: "upcoming" | "past", format: EventFormatFilter, maxPages: number): Promise<PublicEvent[]> {
  const all: PublicEvent[] = [];
  for (let page = 0; page < maxPages; page++) {
    const res = await apiFetch<PageResponse<PublicEvent>>(`/public/events?when=${when}&page=${page}&size=${PAGE}${format ? `&format=${format}` : ""}`, { anonymous: true });
    all.push(...res.content);
    if (res.last) break;
  }
  return all;
}

interface CalendarState {
  key: string;
  events: PublicEvent[];
  error: string | null;
}

/** Every upcoming and recent past event for the calendar (live, or the built-in ones when the backend is down). */
export function useCalendarEvents(enabled: boolean, format: EventFormatFilter) {
  const key = enabled ? `calendar:${format ?? "all"}` : "";
  const [state, setState] = useState<CalendarState | null>(null);
  const [nonce, setNonce] = useState(0);
  const requestKey = `${key}:${nonce}`;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    Promise.all([loadAll("upcoming", format, MAX_UPCOMING_PAGES), loadAll("past", format, MAX_PAST_PAGES)])
      .then(([upcoming, past]) => ({ events: [...upcoming, ...past], error: null }))
      .catch((err: unknown) => {
        if (!isBackendUnavailable(err)) return { events: [], error: err instanceof Error ? err.message : String(err) };
        const now = new Date();
        return { events: [...fallbackEventsPage("upcoming", format, 1000, now).content, ...fallbackEventsPage("past", format, 1000, now).content], error: null };
      })
      .then((result) => {
        if (!cancelled) setState({ key: requestKey, ...result });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, format, requestKey]);

  const ready = state?.key === requestKey;
  return {
    events: ready ? state.events : [],
    error: ready ? state.error : null,
    isLoading: enabled && !ready,
    refetch: () => setNonce((n) => n + 1),
  };
}
