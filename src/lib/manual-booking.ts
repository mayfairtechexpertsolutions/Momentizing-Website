import { clockInZone, expertZoneLabel, formatClock } from "./fallback-specialists";
import { addDaysIso, formatDateLong, localToUtc, parseIsoLocal, zoneLabel } from "./local-date";
import type { PublicSlots } from "./guest-booking";

/**
 * Booking by WhatsApp request, used when the backend is unavailable and a specialist has no real calendar.
 * The visitor's choices become a pre-written WhatsApp message they press Send on. Nothing is held or confirmed here:
 * the team replies on WhatsApp to agree a time.
 */

/** Keeps the wa.me link comfortably under common URL length limits even with a long note. */
export const MAX_MANUAL_NOTE_CHARS = 500;

export interface ManualBookingRequest {
  specialistName: string;
  /** IANA zone the expert's hours are written in, e.g. "Asia/Jakarta". Unknown for specialists whose profile came from the backend. */
  expertTimeZone?: string;
  /** The visitor's own calendar date, "YYYY-MM-DD". */
  date: string;
  /** Start time on the visitor's own clock, "HH:mm" (as picked in the slot picker). */
  time: string;
  fullName: string;
  whatsapp: string;
  answers: {
    firstTime: boolean | null;
    online: boolean | null;
    couple: boolean | null;
    adult: boolean | null;
    urgent: boolean | null;
  };
  concerns: string[];
  note: string;
}

const yesNo = (value: boolean | null): string => (value === null ? "Not answered" : value ? "Yes" : "No");

/** The visitor's local `date` + `time` on the expert's clock, as "HH:mm". */
export function toExpertClock(date: string, time: string, expertTimeZone: string): string {
  const utc = localToUtc(date, time);
  const [y, mo, d] = utc.date.split("-").map(Number);
  const [h, m] = utc.time.split(":").map(Number);
  return clockInZone(expertTimeZone, Date.UTC(y, mo - 1, d, h, m));
}

/** The expert's calendar date ("YYYY-MM-DD") at the instant of the visitor's local `date` + `time`. */
function toExpertDate(date: string, time: string, expertTimeZone: string): string {
  const utc = localToUtc(date, time);
  const [y, mo, d] = utc.date.split("-").map(Number);
  const [h, m] = utc.time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-CA", { timeZone: expertTimeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.UTC(y, mo - 1, d, h, m)));
}

/**
 * "Friday, 3 October at 1:00 PM (WIB)"; when the visitor is in another zone, also "= 2:00 PM WIB", and the expert's
 * day when it differs ("= 12:00 AM GMT+7 on Tuesday, November 3"), so 9 AM Monday in California is not read as Monday midnight.
 */
export function formatManualWhen(date: string, time: string, expertTimeZone?: string): string {
  const visitorZone = zoneLabel(parseIsoLocal(date));
  const base = `${formatDateLong(date)} at ${formatClock(time)} (${visitorZone})`;
  if (!expertTimeZone) return base;
  const expertZone = expertZoneLabel(expertTimeZone, date);
  if (visitorZone === expertZone) return base;
  const expertDate = toExpertDate(date, time, expertTimeZone);
  const onDay = expertDate === date ? "" : ` on ${formatDateLong(expertDate)}`;
  return `${base} = ${formatClock(toExpertClock(date, time, expertTimeZone))} ${expertZone}${onDay}`;
}

function truncateNote(note: string): string {
  const trimmed = note.trim();
  return trimmed.length > MAX_MANUAL_NOTE_CHARS ? `${trimmed.slice(0, MAX_MANUAL_NOTE_CHARS - 1)}…` : trimmed;
}

/** The text pre-filled in WhatsApp. Plain lines so the team can read it at a glance on a phone. */
export function buildManualBookingMessage(req: ManualBookingRequest): string {
  const lines = [
    "Hi Momentizing, I'd like to request a session.",
    "",
    `Specialist: ${req.specialistName}`,
    `Preferred time: ${formatManualWhen(req.date, req.time, req.expertTimeZone)}`,
    `Name: ${req.fullName.trim()}`,
    `WhatsApp: ${req.whatsapp.trim()}`,
    `First time seeing a therapist or counsellor: ${yesNo(req.answers.firstTime)}`,
    `Prefers online sessions: ${yesNo(req.answers.online)}`,
    `Session for a couple: ${yesNo(req.answers.couple)}`,
    `18 or older: ${yesNo(req.answers.adult)}`,
    `Anything urgent or unsafe right now: ${yesNo(req.answers.urgent)}`,
  ];
  if (req.concerns.length > 0) lines.push(`Would like support with: ${req.concerns.join(", ")}`);
  const note = truncateNote(req.note);
  if (note) lines.push(`Note: ${note}`);
  lines.push("", "Please let me know if this time works. Thank you!");
  return lines.join("\n");
}

/** Preferred-time grid offered when a specialist's real calendar can't be loaded: waking hours on the visitor's own clock. */
const REQUEST_FIRST_HOUR = 8;
const REQUEST_LAST_HOUR = 20;
const REQUEST_SESSION_MINUTES = 60;

/**
 * Stand-in for a specialist's live calendar while the backend is down: every day offers the same hourly times, already
 * on the visitor's clock. It knows nothing about the specialist's hours or bookings; the team confirms on WhatsApp.
 */
export function requestedHoursSlots(specialistId: number, specialistName: string, fromLocal: string, days: number): PublicSlots {
  const times = Array.from({ length: REQUEST_LAST_HOUR - REQUEST_FIRST_HOUR + 1 }, (_, i) => `${String(REQUEST_FIRST_HOUR + i).padStart(2, "0")}:00`);
  return {
    specialistId,
    specialistName,
    durationMinutes: REQUEST_SESSION_MINUTES,
    sessionTypes: [],
    timezone: "viewer",
    days: Array.from({ length: days }, (_, i) => ({ date: addDaysIso(fromLocal, i), times })),
    nextAvailableDate: fromLocal,
  };
}

/** A WhatsApp request needs a person to read it, so a time starting sooner than this from now is not offered. */
export const REQUEST_LEAD_MINUTES = 120;

/**
 * Removes times that have already started (or start within the lead time) from slots already expressed on the
 * visitor's own clock (`toViewerSlots` output), and recomputes `nextAvailableDate`. Only the built-in/WhatsApp-request
 * calendars need this: live slots come from a backend that knows the time.
 */
export function dropPastTimes(slots: PublicSlots, now: Date = new Date(), leadMinutes: number = REQUEST_LEAD_MINUTES): PublicSlots {
  const cutoff = now.getTime() + leadMinutes * 60_000;
  const days = slots.days.map((d) => ({
    date: d.date,
    times: d.times.filter((time) => {
      const [h, m] = time.split(":").map(Number);
      const [y, mo, day] = d.date.split("-").map(Number);
      return new Date(y, mo - 1, day, h, m ?? 0).getTime() >= cutoff;
    }),
  }));
  return { ...slots, days, nextAvailableDate: days.find((d) => d.times.length > 0)?.date ?? null };
}
