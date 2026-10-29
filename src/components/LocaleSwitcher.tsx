"use client";

import { LOCALES, setLocale, t, useLocale, type Locale } from "@/i18n";

/**
 * Picks the language used for error and validation messages (English / Bahasa Indonesia). The choice is remembered
 * on this device; with no choice the browser's language decides.
 */
export function LocaleSwitcher({ className = "", selectClassName = "" }: { className?: string; selectClassName?: string }) {
  const locale = useLocale();
  return (
    <label className={`inline-flex items-center gap-2 text-xs ${className}`}>
      <span>{t("locale.label")}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className={`min-h-11 cursor-pointer rounded-full border border-momentizing-mint-deep bg-transparent px-3 text-sm ${selectClassName}`}
        aria-label={t("locale.label")}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
