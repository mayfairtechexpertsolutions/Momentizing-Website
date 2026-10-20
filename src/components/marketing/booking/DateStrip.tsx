"use client";

import { useEffect, useMemo, useRef } from "react";
import { addDaysIso, dateParts, formatDateLong, todayIso } from "@/lib/local-date";

/** A scrollable strip of the next `days` calendar days (visitor's local dates). Pills are real toggle buttons. */
export function DateStrip({
  value,
  onChange,
  days = 30,
  label = "Choose a date",
  marked,
}: {
  value: string | null;
  onChange: (iso: string) => void;
  days?: number;
  label?: string;
  /** Dates known to have open times get a small dot (only used once availability is known). */
  marked?: Set<string>;
}) {
  const items = useMemo(() => {
    const start = todayIso();
    return Array.from({ length: days }, (_, i) => addDaysIso(start, i));
  }, [days]);

  // Keep the chosen day in view when it lies further along the strip (e.g. after "jump to next open day").
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = container.current;
    const selected = box?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!box || !selected) return;
    const target = selected.offsetLeft - box.clientWidth / 2 + selected.clientWidth / 2;
    box.scrollTo({ left: Math.max(0, target), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [value]);

  return (
    <div ref={container} role="group" aria-label={label} className="relative -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-3">
      {items.map((iso, i) => {
        const p = dateParts(iso);
        const selected = value === iso;
        const showMonth = i === 0 || p.day === "1";
        return (
          <div key={iso} className="flex flex-shrink-0 snap-start flex-col items-center gap-1">
            <span className="h-4 text-xs font-semibold text-momentizing-muted">{showMonth ? p.month : ""}</span>
            <button
              type="button"
              data-date-pill
              // Roving tabindex: the strip is ONE tab stop (the chosen day, else the first), arrow keys move within it —
              // otherwise a keyboard user must tab through 30 buttons to reach "Continue".
              tabIndex={(value ?? items[0]) === iso ? 0 : -1}
              onKeyDown={(e) => {
                const pills = [...(container.current?.querySelectorAll<HTMLButtonElement>("[data-date-pill]") ?? [])];
                const at = pills.indexOf(e.currentTarget);
                const next = e.key === "ArrowRight" ? at + 1 : e.key === "ArrowLeft" ? at - 1 : e.key === "Home" ? 0 : e.key === "End" ? pills.length - 1 : null;
                if (next === null || next < 0 || next >= pills.length) return;
                e.preventDefault();
                pills.forEach((p) => (p.tabIndex = -1));
                pills[next].tabIndex = 0;
                pills[next].focus();
              }}
              onClick={() => onChange(iso)}
              aria-pressed={selected}
              aria-label={formatDateLong(iso)}
              className={`relative flex h-20 w-16 flex-col items-center justify-center rounded-2xl border text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal ${
                selected
                  ? "border-momentizing-teal bg-momentizing-teal text-white shadow-md"
                  : "border-momentizing-slate/15 bg-white text-momentizing-slate hover:border-momentizing-slate/40"
              }`}
            >
              <span className={`text-xs font-semibold uppercase ${selected ? "text-white/85" : "text-momentizing-muted"}`}>{p.weekday}</span>
              <span className="text-xl font-semibold">{p.day}</span>
              {marked?.has(iso) && (
                <span className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${selected ? "bg-white" : "bg-momentizing-teal"}`} aria-hidden="true" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
