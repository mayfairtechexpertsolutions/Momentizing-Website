/**
 * Translations for everything a person can read in the web apps (screens, errors, validation, notifications).
 *
 * - `errors.*.json`: one entry per backend `ErrorCode` (generated from the Java enum; the API sends the code and its
 *   {placeholder} values, never a translated sentence).
 * - `ui.*.json`: messages the web apps raise themselves (client-side validation, offline notices, upload problems…),
 *   plus `field.<requestField>` labels and `value.<word>` translations for placeholder values such as "confirmed".
 * - `site.*.json`: public website text; `app.*.json`: signed-in CRM screens (client, specialist, assistant).
 *   The Admin panel is English-only and keeps its text inline.
 *
 * Source of truth: CRM/i18n. `scripts/sync-i18n.sh` copies this folder into CRM/Frontend/src/i18n and
 * Website/src/i18n. Mobile apps can read the same JSON files.
 */
import { useSyncExternalStore } from "react";
import errorsEn from "./errors.en.json";
import errorsId from "./errors.id.json";
import uiEn from "./ui.en.json";
import uiId from "./ui.id.json";
import siteEn from "./site.en.json";
import siteId from "./site.id.json";
import appEn from "./app.en.json";
import appId from "./app.id.json";

export type Locale = "en" | "id";
export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "id", label: "Bahasa Indonesia" },
];

const STORAGE_KEY = "momentizing_locale";
const EVENT = "momentizing:locale";

const errorCatalogs: Record<Locale, Record<string, string>> = { en: errorsEn, id: errorsId };
// site.*: public website pages (also the CRM's marketing copies); app.*: signed-in CRM screens; ui.*: shared messages.
const uiCatalogs: Record<Locale, Record<string, string>> = {
  en: { ...uiEn, ...siteEn, ...appEn },
  id: { ...uiId, ...siteId, ...appId },
};

let current: Locale | null = null;
/** False until the first hydration has finished: the server can only render English, so the first client render must too. */
let ready = false;

/** English unless the person picked a language on this device (owner decision 2026-10-31: no browser detection). */
function detect(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "id") return saved;
  } catch {
    // storage blocked: English
  }
  return "en";
}

/** The staff Admin panel is English-only, errors included, whatever the person chose elsewhere. */
export function isEnglishOnlySurface(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return path === "/admin" || path.startsWith("/admin/");
}

export function getLocale(): Locale {
  if (typeof window === "undefined" || !ready) return "en";
  if (isEnglishOnlySurface()) return "en";
  if (!current) current = detect();
  return current;
}

/** True when the person picked a language on this device (rather than getting the English default). */
export function hasChosenLocale(): boolean {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "id";
  } catch {
    return false;
  }
}

/** The person's own choice, ignoring the English-only Admin rule (for saving it to their account). */
export function getChosenLocale(): Locale {
  if (typeof window === "undefined") return "en";
  if (!current) current = detect();
  return current;
}

export function setLocale(locale: Locale) {
  current = locale;
  ready = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // not persisted; still applies for this visit
  }
  document.documentElement.lang = locale;
  window.dispatchEvent(new Event(EVENT));
}

/** Re-renders the component when the person switches language. */
export function useLocale(): Locale {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener(EVENT, onChange);
      return () => window.removeEventListener(EVENT, onChange);
    },
    getLocale,
    () => "en" as Locale
  );
}

/** Called once hydration is done (by LocaleBoundary): from here on `getLocale()` reports the real language. */
export function markLocaleReady() {
  if (ready) return;
  ready = true;
  document.documentElement.lang = getLocale();
  window.dispatchEvent(new Event(EVENT));
}

type Params = Record<string, unknown> | null | undefined;

/** "confirmed" -> value.confirmed; lets the sentence template stay a single translation. */
function translateValue(locale: Locale, value: unknown): string {
  const raw = String(value);
  const key = "value." + raw.toLowerCase().trim().replace(/\s+/g, "_");
  return uiCatalogs[locale][key] ?? uiCatalogs.en[key] ?? raw;
}

function fill(text: string, params: Params, locale: Locale): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in params ? translateValue(locale, params[name]) : whole));
}

/** The text for an API error code in the current language; `fallback` (the server's English) if the code is unknown. */
export function translateError(code: string | null | undefined, params?: Params, fallback?: string): string {
  const locale = getLocale();
  if (!code) return fallback ?? uiCatalogs[locale]["error.generic"];
  const template = errorCatalogs[locale][code] ?? errorCatalogs.en[code];
  return template ? fill(template, params, locale) : fallback ?? code;
}

const INTL_LOCALE: Record<Locale, string> = { en: "en-US", id: "id-ID" };

/** The BCP 47 tag for Intl formatting in the current language. */
export function intlLocale(): string {
  return INTL_LOCALE[getLocale()];
}

type DateInput = Date | string | number;
const toDate = (v: DateInput) => (v instanceof Date ? v : new Date(v));

/** Dates, times, numbers and money in the chosen language rather than the browser's own locale. */
export function formatDate(value: DateInput, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }): string {
  return toDate(value).toLocaleDateString(intlLocale(), opts);
}

export function formatTime(value: DateInput, opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" }): string {
  return toDate(value).toLocaleTimeString(intlLocale(), opts);
}

export function formatDateTime(value: DateInput, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }): string {
  return toDate(value).toLocaleString(intlLocale(), opts);
}

export function formatNumber(value: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(intlLocale(), opts).format(value);
}

export function formatMoney(value: number, currency: string, opts: Intl.NumberFormatOptions = { maximumFractionDigits: 0 }): string {
  return new Intl.NumberFormat(intlLocale(), { style: "currency", currency, ...opts }).format(value);
}

/** A status or enum word for display, "PENDING" -> "Pending" / "Menunggu" (value.* in ui.*.json; unknown words are humanised). */
export function valueLabel(raw: string | null | undefined): string {
  if (!raw) return "";
  const text = translateValue(getLocale(), raw);
  const words = text === raw ? raw.replace(/_/g, " ").toLowerCase() : text;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** A message the web app raises itself (see ui.*.json). Unknown keys come back as the key so a typo is visible. */
export function t(key: string, params?: Params): string {
  const locale = getLocale();
  const template = uiCatalogs[locale][key] ?? uiCatalogs.en[key];
  return template ? fill(template, params, locale) : key;
}

/** "Date of birth" for the request field `dateOfBirth` (falls back to the field name split into words). */
export function fieldLabel(path: string): string {
  const last = path.split(".").pop() ?? path;
  const key = "field." + last.replace(/\[\d+\]/g, "");
  const locale = getLocale();
  const known = uiCatalogs[locale][key] ?? uiCatalogs.en[key];
  if (known) return known;
  const words = last.replace(/\[\d+\]/g, "").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
