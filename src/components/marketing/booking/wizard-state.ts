import type { GuestBooking, PublicSpecialistCard } from "@/lib/guest-booking";

export type StepId = "date" | "about" | "specialist" | "time" | "review";
export const STEPS: { id: StepId; label: string }[] = [
  { id: "date", label: "Pick a day" },
  { id: "about", label: "About you" },
  { id: "specialist", label: "Your specialist" },
  { id: "time", label: "Choose a time" },
  { id: "review", label: "Review" },
];

export interface Answers {
  firstTime: boolean | null;
  online: boolean | null;
  couple: boolean | null;
  adult: boolean | null;
  urgent: boolean | null;
}

export interface Draft {
  step: StepId;
  date: string | null;
  fullName: string;
  whatsapp: string;
  answers: Answers;
  concerns: string[];
  note: string;
  consent: boolean;
  specialist: PublicSpecialistCard | null;
  mode: "SUGGESTED" | "SPECIFIC";
  time: string | null;
}

export const EMPTY_DRAFT: Draft = {
  step: "date",
  date: null,
  fullName: "",
  whatsapp: "",
  answers: { firstTime: null, online: null, couple: null, adult: null, urgent: null },
  concerns: [],
  note: "",
  consent: false,
  specialist: null,
  mode: "SUGGESTED",
  time: null,
};

export const CONCERNS = ["Anxiety", "Stress & burnout", "Relationships", "Grief & loss", "Low mood", "Self-esteem", "Trauma", "Sleep", "Something else"];

const DRAFT_KEY = "momentizing.book.draft";
const BOOKING_KEY = "momentizing.book.active";

/** sessionStorage can be unavailable (private mode, blocked site data); the wizard must work without it. */
function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export const loadDraft = (): Draft | null =>
  safe(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? ({ ...EMPTY_DRAFT, ...JSON.parse(raw) } as Draft) : null;
  }, null);
export const saveDraft = (d: Draft) => safe(() => sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)), undefined);
export const clearDraft = () => safe(() => sessionStorage.removeItem(DRAFT_KEY), undefined);

/** The held/confirmed booking, so a refresh on the verify screen resumes polling instead of losing the claim token. */
export interface ActiveBooking {
  booking: GuestBooking;
  claimToken: string;
  fullName: string;
}
export const loadActiveBooking = (): ActiveBooking | null =>
  safe(() => {
    const raw = sessionStorage.getItem(BOOKING_KEY);
    return raw ? (JSON.parse(raw) as ActiveBooking) : null;
  }, null);
export const saveActiveBooking = (a: ActiveBooking) => safe(() => sessionStorage.setItem(BOOKING_KEY, JSON.stringify(a)), undefined);
export const clearActiveBooking = () => safe(() => sessionStorage.removeItem(BOOKING_KEY), undefined);

export function answersToRecord(a: Answers, concerns: string[]): Record<string, string> {
  const yn = (v: boolean | null) => (v === null ? "" : v ? "yes" : "no");
  const rec: Record<string, string> = {
    firstTimeInTherapy: yn(a.firstTime),
    prefersOnline: yn(a.online),
    forCouple: yn(a.couple),
    adult: yn(a.adult),
    urgentConcern: yn(a.urgent),
  };
  if (concerns.length) rec.concerns = concerns.join(", ");
  return rec;
}

/** Loose client-side sanity check only — the server is the authority on what is a valid mobile number. */
export function looksLikePhone(v: string): boolean {
  return /^\+?[\d\s\-()]{8,20}$/.test(v.trim()) && v.replace(/\D/g, "").length >= 8;
}
