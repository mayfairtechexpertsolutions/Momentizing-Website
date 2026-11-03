"use client";

import { useCallback, useEffect, useState } from "react";
import { getFallbackSpecialist, fallbackSlots, isFallbackSpecialistId } from "@/lib/fallback-specialists";
import { fetchSlots, friendlyError, toViewerSlots, type PublicSlots } from "@/lib/guest-booking";
import { addDaysIso, formatDateLong, formatDateShort, formatTime, parseIsoLocal, zoneLabel } from "@/lib/local-date";
import { isBackendUnavailable } from "@/lib/api";
import { reportBackendUnavailable } from "@/lib/backend-status";
import { requestedHoursSlots } from "@/lib/manual-booking";
import { BookButton } from "./ui";
import { t } from "@/i18n";

const WINDOW_DAYS = 14;

/**
 * Open times for one specialist on one date, from the same availability the logged-in booking screen uses (or, for a
 * built-in profile while the backend is down, from its weekly pattern). It never hides a failure behind an empty list: a network/server error shows an error with a retry, and an
 * honestly empty day offers the next days that DO have openings.
 */
export function SlotPicker({
  specialistId,
  date,
  onDateChange,
  value,
  onChange,
  refreshKey = 0,
  onLoaded,
}: {
  specialistId: number;
  date: string;
  onDateChange: (iso: string) => void;
  value: string | null;
  onChange: (time: string) => void;
  /** Bump to force a refetch (e.g. after "that time was just taken"). */
  refreshKey?: number;
  /** Called with each successful availability response (session types, duration, timezone). */
  onLoaded?: (data: PublicSlots) => void;
}) {
  const [data, setData] = useState<PublicSlots | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- reset to the loading state before each (re)fetch */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    // One UTC day either side so the visitor's whole local day is covered, whichever side of UTC they live.
    const from = addDaysIso(date, -1);
    const fallback = isFallbackSpecialistId(specialistId) ? getFallbackSpecialist(specialistId) : null;
    // Built-in profiles have no backend calendar: their weekly pattern stands in, shaped like the real response.
    const request = fallback ? Promise.resolve(fallbackSlots(fallback, from, WINDOW_DAYS + 2)) : fetchSlots(specialistId, from, WINDOW_DAYS + 2);
    request
      .then((utc) => {
        const res = toViewerSlots(utc, date, WINDOW_DAYS);
        if (!cancelled) {
          setData(res);
          onLoaded?.(res);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        if (isBackendUnavailable(e)) {
          // No live calendar: offer preferred times instead of an error. The request goes to the team on WhatsApp.
          reportBackendUnavailable();
          setData(requestedHoursSlots(specialistId, "", date, WINDOW_DAYS));
          return;
        }
        setError(friendlyError(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onLoaded is a notification callback, not an input
  }, [specialistId, date, refreshKey, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (loading) {
    return (
      <div aria-busy="true" aria-label={t("site.slots.loading")} className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-2xl bg-momentizing-slate/10 motion-reduce:animate-none" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
        <p className="font-semibold">{t("site.slots.loadError")}</p>
        <p className="mt-1">{error ?? t("site.slots.checkConnection")}</p>
        <BookButton variant="secondary" onClick={retry} className="mt-3">
          {t("site.common.tryAgain")}
        </BookButton>
      </div>
    );
  }

  const today = data.days.find((d) => d.date === date) ?? data.days[0];
  const times = today?.times ?? [];
  const nextDays = data.days.filter((d) => d.date !== date && d.times.length > 0 && d.date > date).slice(0, 6);
  const groups: { label: string; items: string[] }[] = [
    { label: t("site.slots.morning"), items: times.filter((s) => Number(s.slice(0, 2)) < 12) },
    { label: t("site.slots.afternoon"), items: times.filter((s) => Number(s.slice(0, 2)) >= 12 && Number(s.slice(0, 2)) < 17) },
    { label: t("site.slots.evening"), items: times.filter((s) => Number(s.slice(0, 2)) >= 17) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-momentizing-muted">
        {t("site.slots.openOn")} <strong className="text-momentizing-slate">{formatDateLong(date)}</strong> · {t("site.slots.summary", { minutes: data.durationMinutes, zone: zoneLabel(parseIsoLocal(date)) })}
      </p>

      {times.length > 0 ? (
        <div className="flex flex-col gap-4" role="group" aria-label={t("site.slots.groupLabel", { date: formatDateLong(date) })}>
          {groups.map((g) => (
            <div key={g.label}>
              <p className="mb-2 text-xs font-semibold tracking-wide text-momentizing-muted uppercase">{g.label}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {g.items.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={value === slot}
                    onClick={() => onChange(slot)}
                    className={`min-h-12 rounded-2xl border px-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal ${
                      value === slot
                        ? "border-momentizing-teal bg-momentizing-teal text-white shadow-md"
                        : "border-momentizing-slate/20 bg-white text-momentizing-slate hover:border-momentizing-slate/50"
                    }`}
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-momentizing-mint/60 p-4">
          <p className="font-semibold text-momentizing-slate">{t("site.slots.none")}</p>
          {nextDays.length > 0 ? (
            <>
              <p className="mt-1 text-sm text-momentizing-muted">{t("site.slots.theseDays")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {nextDays.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => onDateChange(d.date)}
                    className="min-h-11 rounded-full border border-momentizing-teal/40 bg-white px-4 text-sm font-semibold text-momentizing-teal hover:bg-momentizing-mint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal"
                  >
                    {formatDateShort(d.date)} · {t("site.slots.nOpen", { n: d.times.length })}
                  </button>
                ))}
              </div>
            </>
          ) : data.nextAvailableDate ? (
            <BookButton variant="secondary" className="mt-3" onClick={() => onDateChange(data.nextAvailableDate as string)}>
              {t("site.slots.jumpTo", { date: formatDateShort(data.nextAvailableDate) })}
            </BookButton>
          ) : (
            <p className="mt-1 text-sm text-momentizing-muted">{t("site.slots.none30")}</p>
          )}
        </div>
      )}
    </div>
  );
}
