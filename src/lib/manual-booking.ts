import { FALLBACK_TIME_ZONE_LABEL, formatClock } from "./fallback-specialists";
import { formatDateLong } from "./local-date";

/**
 * Booking by WhatsApp request, used when the backend is unavailable and a specialist has no real calendar.
 * The visitor's choices become a pre-written WhatsApp message they press Send on. Nothing is held or confirmed here:
 * the team replies on WhatsApp to agree a time.
 */

/** Keeps the wa.me link comfortably under common URL length limits even with a long note. */
export const MAX_MANUAL_NOTE_CHARS = 500;

/** Start times offered in the manual picker (WIB), every 30 minutes. */
const FIRST_START_HOUR = 6;
const LAST_START_HOUR = 21;
const START_STEP_MINUTES = 30;

export const MANUAL_TIME_OPTIONS: string[] = Array.from({ length: (LAST_START_HOUR - FIRST_START_HOUR + 1) * (60 / START_STEP_MINUTES) }, (_, i) => {
  const totalMinutes = FIRST_START_HOUR * 60 + i * START_STEP_MINUTES;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
});

export interface ManualBookingRequest {
  specialistName: string;
  /** Local calendar date, "YYYY-MM-DD". */
  date: string;
  /** WIB start time, "HH:mm". */
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

/** "Friday, 3 October at 1:00 PM (WIB)" */
export function formatManualWhen(date: string, time: string): string {
  return `${formatDateLong(date)} at ${formatClock(time)} (${FALLBACK_TIME_ZONE_LABEL})`;
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
    `Preferred time: ${formatManualWhen(req.date, req.time)}`,
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
