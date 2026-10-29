/**
 * Translations for everything a person can read as an error or validation message.
 *
 * - `errors.*.json`: one entry per backend `ErrorCode` (generated from the Java enum; the API sends the code and its
 *   {placeholder} values, never a translated sentence).
 * - `ui.*.json`: messages the web apps raise themselves (client-side validation, offline notices, upload problems…),
 *   plus `field.<requestField>` labels and `value.<word>` translations for placeholder values such as "confirmed".
 *
 * Source of truth: CRM/i18n. `scripts/sync-i18n.sh` copies this folder into CRM/Frontend/src/i18n and
 * Website/src/i18n. Mobile apps can read the same JSON files.
 */
import { useSyncExternalStore } from "react";
import errorsEn from "./errors.en.json";
import errorsId from "./errors.id.json";
import uiEn from "./ui.en.json";
import uiId from "./ui.id.json";

export type Locale = "en" | "id";
export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "id", label: "Bahasa Indonesia" },
];

const STORAGE_KEY = "momentizing_locale";
const EVENT = "momentizing:locale";

const errorCatalogs: Record<Locale, Record<string, string>> = { en: errorsEn, id: errorsId };
const uiCatalogs: Record<Locale, Record<string, string>> = { en: uiEn, id: uiId };

let current: Locale | null = null;
/** False until the first hydration has finished: the server can only render English, so the first client render must too. */
let ready = false;

function detect(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "id") return saved;
  } catch {
    // storage blocked: fall through to the browser language
  }
  return (navigator.language ?? "").toLowerCase().startsWith("id") ? "id" : "en";
}

export function getLocale(): Locale {
  if (typeof window === "undefined" || !ready) return "en";
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
