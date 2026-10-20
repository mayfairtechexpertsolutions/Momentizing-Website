/**
 * Calendar-date helpers that work in the visitor's LOCAL time zone.
 *
 * Two bugs these replace (both were live on the marketing site):
 *  - `new Date().toISOString().slice(0, 10)` is the UTC date, so late in the evening (or early morning, east of
 *    UTC) it is "yesterday" or "tomorrow" compared with the calendar the visitor is looking at.
 *  - `new Date("2026-10-03")` parses a bare date as UTC midnight, which renders as the PREVIOUS day anywhere west
 *    of UTC. A date-only string must be parsed as a local date.
 */

export function toIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parses "YYYY-MM-DD" as a local calendar date (noon, so DST shifts can never roll it to another day). */
export function parseIsoLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

export function todayIso(): string {
  return toIsoLocal(new Date());
}

export function addDaysIso(iso: string, days: number): string {
  const d = parseIsoLocal(iso);
  d.setDate(d.getDate() + days);
  return toIsoLocal(d);
}

/** "Friday, 3 October" */
export function formatDateLong(iso: string): string {
  return parseIsoLocal(iso).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

/** "Fri 3 Oct" */
export function formatDateShort(iso: string): string {
  return parseIsoLocal(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function dateParts(iso: string): { weekday: string; day: string; month: string } {
  const d = parseIsoLocal(iso);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
    day: String(d.getDate()),
    month: d.toLocaleDateString(undefined, { month: "short" }),
  };
}

/** "09:00" (24h "HH:mm" or "HH:mm:ss") -> "9:00 AM" in the visitor's locale. */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, m ?? 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** "YYYY-MM-DD" + "HH:mm" -> iCalendar UTC stamp "YYYYMMDDTHHmmssZ" (the platform stores session times as UTC wall-clock). */
export function icsStamp(dateIso: string, time: string, addMinutes = 0): string {
  const [y, mo, d] = dateIso.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d, h, mi + addMinutes, 0));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getUTCFullYear()}${p(dt.getUTCMonth() + 1)}${p(dt.getUTCDate())}T${p(dt.getUTCHours())}${p(dt.getUTCMinutes())}00Z`;
}
