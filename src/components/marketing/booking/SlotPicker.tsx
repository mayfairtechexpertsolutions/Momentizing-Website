"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSlots, friendlyError, type PublicSlots } from "@/lib/guest-booking";
import { formatDateLong, formatDateShort, formatTime } from "@/lib/local-date";
import { BookButton } from "./ui";

const WINDOW_DAYS = 14;

/**
 * Real open times for one specialist on one date, straight from the same availability the logged-in booking screen
 * uses. It never hides a failure behind an empty list: a network/server error shows an error with a retry, and an
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
    fetchSlots(specialistId, date, WINDOW_DAYS)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          onLoaded?.(res);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(friendlyError(e, "We couldn't load the available times."));
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
      <div aria-busy="true" aria-label="Loading available times" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-2xl bg-momentizing-slate/10 motion-reduce:animate-none" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
        <p className="font-semibold">We couldn&apos;t load the available times.</p>
        <p className="mt-1">{error ?? "Please check your connection."}</p>
        <BookButton variant="secondary" onClick={retry} className="mt-3">
          Try again
        </BookButton>
      </div>
    );
  }

  const today = data.days.find((d) => d.date === date) ?? data.days[0];
  const times = today?.times ?? [];
  const nextDays = data.days.filter((d) => d.date !== date && d.times.length > 0 && d.date > date).slice(0, 6);
  const groups: { label: string; items: string[] }[] = [
    { label: "Morning", items: times.filter((t) => Number(t.slice(0, 2)) < 12) },
    { label: "Afternoon", items: times.filter((t) => Number(t.slice(0, 2)) >= 12 && Number(t.slice(0, 2)) < 17) },
    { label: "Evening", items: times.filter((t) => Number(t.slice(0, 2)) >= 17) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-momentizing-muted">
        Open times on <strong className="text-momentizing-slate">{formatDateLong(date)}</strong> · {data.durationMinutes}-minute session · times in {data.timezone}
      </p>

      {times.length > 0 ? (
        <div className="flex flex-col gap-4" role="group" aria-label={`Available times on ${formatDateLong(date)}`}>
          {groups.map((g) => (
            <div key={g.label}>
              <p className="mb-2 text-xs font-semibold tracking-wide text-momentizing-muted uppercase">{g.label}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {g.items.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={value === t}
                    onClick={() => onChange(t)}
                    className={`min-h-12 rounded-2xl border px-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal ${
                      value === t
                        ? "border-momentizing-teal bg-momentizing-teal text-white shadow-md"
                        : "border-momentizing-slate/20 bg-white text-momentizing-slate hover:border-momentizing-slate/50"
                    }`}
                  >
                    {formatTime(t)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-momentizing-mint/60 p-4">
          <p className="font-semibold text-momentizing-slate">No open times on this day.</p>
          {nextDays.length > 0 ? (
            <>
              <p className="mt-1 text-sm text-momentizing-muted">These days have openings:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {nextDays.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => onDateChange(d.date)}
                    className="min-h-11 rounded-full border border-momentizing-teal/40 bg-white px-4 text-sm font-semibold text-momentizing-teal hover:bg-momentizing-mint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal"
                  >
                    {formatDateShort(d.date)} · {d.times.length} open
                  </button>
                ))}
              </div>
            </>
          ) : data.nextAvailableDate ? (
            <BookButton variant="secondary" className="mt-3" onClick={() => onDateChange(data.nextAvailableDate as string)}>
              Jump to {formatDateShort(data.nextAvailableDate)}
            </BookButton>
          ) : (
            <p className="mt-1 text-sm text-momentizing-muted">There are no openings in the next 30 days. Choose someone else, or ask us for help below.</p>
          )}
        </div>
      )}

      <p className="text-xs text-momentizing-muted">All times are shown in {data.timezone}, the same clock the Momentizing app uses.</p>
    </div>
  );
}
