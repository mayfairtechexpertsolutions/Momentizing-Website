import { ApiError, apiFetch, type ApiFetchOptions } from "./api";
import { addDaysIso, utcToLocal } from "./local-date";
import { MOMENTIZING_WHATSAPP_NUMBER } from "./whatsapp";

/** What an anonymous visitor may see about a specialist — the API deliberately omits licence numbers and street addresses. */
export interface PublicSpecialistCard {
  id: number;
  name: string;
  avatarUrl: string | null;
  professionType: string;
  specialisation: string | null;
  bio: string | null;
  languages: string | null;
  yearsExperience: number | null;
  credentialsSummary: string | null;
  practiceMode: string;
  sessionFormats: string | null;
  locationLabel: string | null;
  sessionFeeCents: number | null;
  sessionFeeCurrency: string | null;
  freeFirstSession: boolean;
  averageRating: number | null;
  reviewCount: number;
  acceptsIndividual: boolean;
  acceptsCouple: boolean;
  acceptingNewClients: boolean;
  nextAvailableDate: string | null;
  slotsOnRequestedDate: number | null;
}

export interface PublicSlots {
  specialistId: number;
  specialistName: string;
  durationMinutes: number;
  sessionTypes: string[];
  /** How the wall-clock times are to be read. */
  timezone: string;
  /** The expert's own zone (their hours are written in it); display only. */
  expertTimeZone?: string;
  days: { date: string; times: string[] }[];
  nextAvailableDate: string | null;
}

export type GuestBookingStatus = "AWAITING_VERIFICATION" | "CONFIRMED" | "EXPIRED" | "CANCELLED";

export interface GuestBooking {
  status: GuestBookingStatus;
  referenceCode: string;
  holdExpiresAt: string | null;
  /** Present on the create response only; keep it to poll status and to link a new account. */
  claimToken: string | null;
  verificationWhatsapp: string;
  verificationMessage: string;
  specialistId: number;
  specialistName: string;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  sessionType: string;
  paymentStatus: string | null;
}

export interface FormTokenInfo {
  formToken: string;
  minSeconds: number;
  businessWhatsapp: string;
}

export interface GuestBookingPayload {
  specialistId: number;
  sessionDate: string;
  startTime: string;
  fullName: string;
  whatsapp: string;
  sessionType?: string;
  forCouple?: boolean;
  mode?: "SUGGESTED" | "SPECIFIC";
  answers?: Record<string, string>;
  note?: string;
  adultConfirmed: boolean;
  consentAccepted: boolean;
  turnstileToken?: string;
  formToken: string;
  website: string; // honeypot — always empty for a real visitor
}

export interface GuestHelpPayload {
  fullName: string;
  whatsapp: string;
  specialistId?: number;
  preferredDate?: string;
  preferredTimes?: string;
  answers?: Record<string, string>;
  note?: string;
  consentAccepted: boolean;
  turnstileToken?: string;
  formToken: string;
  website: string;
}

export interface SuggestionPayload {
  date?: string;
  concerns?: string[];
  note?: string;
  prefersOnline?: boolean;
  forCouple?: boolean;
}

const json = (body: unknown): ApiFetchOptions => ({ method: "POST", body: JSON.stringify(body), anonymous: true });

// Every call is anonymous: a logged-in visitor's token must never be attached to a public request.
export const fetchFormToken = () => apiFetch<FormTokenInfo>("/public/booking-flow/form-token", { anonymous: true });

export const fetchSuggestions = (payload: SuggestionPayload) =>
  apiFetch<PublicSpecialistCard[]>("/public/booking-flow/suggestions", { ...json(payload), anonymous: true });

export const searchSpecialists = (q: string) =>
  apiFetch<PublicSpecialistCard[]>(`/public/specialists/search?q=${encodeURIComponent(q)}`, { anonymous: true });

export const fetchPublicSpecialist = (id: number) =>
  apiFetch<PublicSpecialistCard>(`/public/specialists/${id}`, { anonymous: true });

export const fetchSlots = (id: number, from: string, days: number) =>
  apiFetch<PublicSlots>(`/public/specialists/${id}/slots?from=${from}&days=${days}`, { anonymous: true });

export const createGuestBooking = (payload: GuestBookingPayload, idempotencyKey: string) =>
  apiFetch<GuestBooking>("/public/guest-bookings", {
    ...json(payload),
    headers: { "Idempotency-Key": idempotencyKey },
    anonymous: true,
  });

export const fetchGuestBookingStatus = (claimToken: string) =>
  apiFetch<GuestBooking>("/public/guest-bookings/status", { headers: { "X-Guest-Token": claimToken }, anonymous: true });

export const requestBookingHelp = (payload: GuestHelpPayload) =>
  apiFetch<unknown>("/public/booking-help", { ...json(payload), anonymous: true });

/** wa.me link to the business line with the verification text pre-filled. Uses the number the server says to use. */
export function verificationLink(booking: Pick<GuestBooking, "verificationWhatsapp" | "verificationMessage">): string {
  const digits = (booking.verificationWhatsapp || MOMENTIZING_WHATSAPP_NUMBER).replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(booking.verificationMessage)}`;
}

/** A fresh idempotency key per distinct attempt: same details -> same key (a retry after a lost response can't
 * double-book), any changed detail -> new key (the server would otherwise replay the OLD booking). */
export function newIdempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Browsers report a network failure as a bare "Failed to fetch" / "Load failed" — say something a person can act on. */
export function friendlyError(e: unknown, fallback = "Something went wrong. Please try again."): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof TypeError || (e instanceof Error && /failed to fetch|load failed|networkerror/i.test(e.message))) {
    return "We can't reach the server. Please check your connection and try again.";
  }
  return e instanceof Error && e.message ? e.message : fallback;
}

/**
 * The API speaks UTC wall-clock; a visitor thinks in their own clock. Re-expresses a response so every day and time is in
 * the visitor's zone: `from`-based windows are fetched one UTC day either side, flattened to instants, and regrouped by the
 * visitor's local date for the `days` days starting at `localStart`.
 */
export function toViewerSlots(res: PublicSlots, localStart: string, days: number): PublicSlots {
  const byDate = new Map<string, string[]>();
  for (const d of res.days) {
    for (const t of d.times) {
      const local = utcToLocal(d.date, t);
      const list = byDate.get(local.date) ?? [];
      list.push(local.time);
      byDate.set(local.date, list);
    }
  }
  const out: PublicSlots["days"] = [];
  for (let i = 0; i < days; i++) {
    const date = addDaysIso(localStart, i);
    out.push({ date, times: (byDate.get(date) ?? []).sort() });
  }
  return {
    ...res,
    days: out,
    nextAvailableDate: res.nextAvailableDate ? utcToLocal(res.nextAvailableDate, "12:00").date : null,
  };
}

// ---- "My upcoming bookings" by phone number + WhatsApp code -------------------------------------------------------

export interface MyBooking {
  referenceCode: string;
  specialistName: string;
  /** UTC wall-clock, like every stored session; display with `formatSessionWhen`. */
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  sessionType: string;
  status: "PENDING" | "CONFIRMED";
}

export interface MyBookings {
  viewToken: string;
  bookings: MyBooking[];
  /** The number already belongs to an account: past sessions need a login. */
  hasAccount: boolean;
  /** Present only for a website guest who has just proved their number and could now create an account. */
  claimToken: string | null;
  name: string | null;
}

export const requestMyBookingsCode = (payload: { whatsapp: string; formToken: string; turnstileToken?: string; website?: string }) =>
  apiFetch<{ requested: boolean }>("/public/my-bookings/request-code", { ...json(payload) });

export const verifyMyBookings = (whatsapp: string, code: string) =>
  apiFetch<MyBookings>("/public/my-bookings/verify", { ...json({ whatsapp, code }) });

/** The token goes in a header so it never lands in a URL or an access log. */
export const refreshMyBookings = (viewToken: string) =>
  apiFetch<MyBookings>("/public/my-bookings", { headers: { "X-Lookup-Token": viewToken }, anonymous: true });
