"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EventPoster } from "./EventPoster";
import { addMonths, dateKey, entriesByDate, monthWeeks, todayKey, type CalendarEntry } from "@/lib/events-calendar";
import { formatEventDate, formatLabel, placeText, priceText, timeRange, type EventFormat, type PublicEvent } from "@/lib/events";
import { getLocale, t } from "@/i18n";

/** Online reads mint/teal, in person peach/gold-deep (as on the cards); hybrid sits between on white. */
const CHIP: Record<EventFormat, string> = {
  ONLINE: "bg-momentizing-mint text-momentizing-teal",
  IN_PERSON: "bg-momentizing-peach text-momentizing-gold-deep",
  HYBRID: "bg-momentizing-cream text-momentizing-slate ring-1 ring-momentizing-mint-deep ring-inset",
};
const DOT: Record<EventFormat, string> = { ONLINE: "bg-momentizing-teal", IN_PERSON: "bg-momentizing-gold-deep", HYBRID: "bg-momentizing-slate" };
const MAX_CHIPS = 2;
const PREVIEW_W = 192;
const PREVIEW_H = 390;

interface Preview {
  entry: CalendarEntry;
  left: number;
  top: number;
}

/** "Date 2 of 4" for an event that runs on several dates, else null. */
const dateOf = ({ event, session }: CalendarEntry): string | null => {
  const n = event.sessions.findIndex((s) => s.id === session.id) + 1;
  return event.sessions.length > 1 && n > 0 ? t("site.events.calendar.dateOf", { n, total: event.sessions.length }) : null;
};

/** The poster preview shown beside a chip on hover or keyboard focus. Fixed so the calendar's rounded clipping can't cut it. */
function PosterPreview({ preview: { entry, left, top } }: { preview: Preview }) {
  const { event: e, session } = entry;
  const more = dateOf(entry);
  return (
    <div aria-hidden="true" style={{ left, top, width: PREVIEW_W }} className="pointer-events-none fixed z-50 overflow-hidden rounded-2xl border border-momentizing-mint-deep bg-white shadow-xl">
      <div className="aspect-[4/5] bg-momentizing-cream">
        <EventPoster event={e} alt="" className="h-full w-full object-contain" />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="font-marketing-serif text-base leading-snug font-semibold text-momentizing-gold-deep">{e.title}</p>
        <p className="text-xs font-semibold text-momentizing-slate">
          {formatEventDate(session.date, { weekday: "short", day: "numeric", month: "short" })} · {timeRange(session, e.timezoneLabel)}
        </p>
        {more && <p className="text-xs font-bold text-momentizing-teal">{more}</p>}
        <p className="text-xs text-momentizing-muted">{placeText(e)}</p>
      </div>
    </div>
  );
}

const intl = () => (getLocale() === "id" ? "id-ID" : "en-GB");

/**
 * Month view of the events. Wide screens show up to two titles in each day and link straight to the event; every
 * size can select a day (the number, the dots on a phone, "+N more") to list that day's events underneath.
 */
export function EventsCalendar({ events }: { events: PublicEvent[] }) {
  const byDate = useMemo(() => entriesByDate(events), [events]);
  const today = todayKey();
  const [shown, setShown] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);

  // A fixed preview would drift away from its chip when the page moves, so drop it on scroll.
  useEffect(() => {
    if (!preview) return;
    const hide = () => setPreview(null);
    window.addEventListener("scroll", hide, { passive: true });
    return () => window.removeEventListener("scroll", hide);
  }, [preview]);
  const showPreview = (entry: CalendarEntry, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const right = r.right + 8 + PREVIEW_W <= window.innerWidth - 8;
    setPreview({
      entry,
      left: right ? r.right + 8 : Math.max(8, r.left - 8 - PREVIEW_W),
      top: Math.min(Math.max(8, r.top - 24), Math.max(8, window.innerHeight - PREVIEW_H - 8)),
    });
  };

  const weeks = monthWeeks(shown.year, shown.month);
  const monthStart = dateKey(shown.year, shown.month, 1);
  const monthLabel = new Intl.DateTimeFormat(intl(), { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(shown.year, shown.month, 1)));
  const weekdays = weeks[0].map((d) => ({ long: formatEventDate(d, { weekday: "long" }), short: formatEventDate(d, { weekday: "short" }) }));
  const inMonth = (d: string) => d.startsWith(monthStart.slice(0, 7));
  const monthHasEvents = [...byDate.keys()].some(inMonth);
  const go = (delta: number) => {
    setShown((s) => addMonths(s.year, s.month, delta));
    setSelected(null);
  };
  const navButton =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white px-4 text-xs font-bold tracking-widest text-momentizing-teal uppercase transition hover:bg-momentizing-mint";
  const dayEntries: CalendarEntry[] = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <section aria-label={t("site.events.calendar.label")}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 aria-live="polite" className="font-marketing-serif text-2xl font-semibold text-momentizing-gold-deep capitalize sm:text-3xl">
          {monthLabel}
        </h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => go(-1)} aria-label={t("site.events.calendar.prev")} className={navButton}>
            <i aria-hidden="true" className="fas fa-chevron-left" />
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setShown({ year: now.getFullYear(), month: now.getMonth() });
              setSelected(today);
            }}
            className={navButton}
          >
            {t("site.events.calendar.today")}
          </button>
          <button type="button" onClick={() => go(1)} aria-label={t("site.events.calendar.next")} className={navButton}>
            <i aria-hidden="true" className="fas fa-chevron-right" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-momentizing-mint-deep bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-momentizing-mint-deep bg-momentizing-mint">
          {weekdays.map((d) => (
            <div key={d.long} className="py-2 text-center text-xs font-bold tracking-widest text-momentizing-teal uppercase">
              <abbr title={d.long} className="no-underline">
                {d.short}
              </abbr>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map((d, i) => {
            const entries = byDate.get(d) ?? [];
            const outside = !inMonth(d);
            const isToday = d === today;
            const isSelected = d === selected;
            const day = Number(d.slice(8));
            const label = `${formatEventDate(d, { weekday: "long", day: "numeric", month: "long" })}${entries.length ? `, ${t(entries.length === 1 ? "site.events.calendar.eventCount.one" : "site.events.calendar.eventCount.other", { n: entries.length })}` : ""}`;
            return (
              <div
                key={d}
                className={`relative min-h-16 border-momentizing-mint-deep p-1.5 md:min-h-28 md:p-2 ${i % 7 !== 0 ? "border-l" : ""} ${i >= 7 ? "border-t" : ""} ${
                  outside ? "bg-momentizing-cream/70" : ""
                } ${isSelected ? "bg-momentizing-mint" : ""}`}
              >
                {/* Phones: the whole cell is the tap target. Wide: only the day number is, so the chips stay real links. */}
                <button
                  type="button"
                  onClick={() => setSelected(isSelected ? null : d)}
                  aria-label={label}
                  aria-pressed={isSelected}
                  disabled={entries.length === 0}
                  className="absolute inset-0 rounded-none enabled:cursor-pointer md:hidden"
                />
                <span
                  aria-hidden="true"
                  className={`relative inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold ${
                    isToday ? "bg-momentizing-teal text-white" : outside ? "text-momentizing-muted" : "text-momentizing-slate"
                  }`}
                >
                  {day}
                </span>
                {entries.length > 0 && (
                  <div aria-hidden="true" className="mt-1 flex flex-wrap gap-1 md:hidden">
                    {entries.slice(0, 4).map((e) => (
                      <span key={`${e.event.id}-${e.session.id}`} className={`size-2 rounded-full ${DOT[e.event.format]}`} />
                    ))}
                  </div>
                )}
                <ul className="mt-1 hidden flex-col gap-1 md:flex">
                  {entries.slice(0, MAX_CHIPS).map((e) => (
                    <li key={`${e.event.id}-${e.session.id}`}>
                      <Link
                        href={`/events/view?id=${e.event.id}`}
                        onMouseEnter={(ev) => showPreview(e, ev.currentTarget)}
                        onMouseLeave={() => setPreview(null)}
                        onFocus={(ev) => showPreview(e, ev.currentTarget)}
                        onBlur={() => setPreview(null)}
                        className={`block truncate rounded-md px-1.5 py-0.5 text-xs font-semibold transition hover:brightness-95 ${CHIP[e.event.format]} ${e.event.cancelled ? "line-through" : ""}`}
                      >
                        <span className="font-bold">{e.session.startTime.slice(0, 5)}</span> {e.event.title}
                      </Link>
                    </li>
                  ))}
                  {entries.length > MAX_CHIPS && (
                    <li>
                      <button
                        type="button"
                        onClick={() => setSelected(d)}
                        className="rounded-md px-1.5 py-0.5 text-xs font-bold text-momentizing-teal underline-offset-2 hover:underline"
                      >
                        {t("site.events.more", { n: entries.length - MAX_CHIPS })}
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-momentizing-muted" aria-hidden="true">
        {(["ONLINE", "IN_PERSON", "HYBRID"] as const).map((f) => (
          <li key={f} className="inline-flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${DOT[f]}`} />
            {formatLabel(f)}
          </li>
        ))}
      </ul>

      {selected && (
        <div className="mt-6 rounded-2xl border border-momentizing-mint-deep bg-white p-5 shadow-sm" role="region" aria-live="polite" aria-label={formatEventDate(selected, { weekday: "long", day: "numeric", month: "long" })}>
          <h3 className="mb-3 font-marketing-serif text-xl font-semibold text-momentizing-gold-deep">{formatEventDate(selected, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h3>
          {dayEntries.length === 0 ? (
            <p className="text-sm text-momentizing-muted">{t("site.events.calendar.noEventsDay")}</p>
          ) : (
            <ul className="divide-y divide-momentizing-mint-deep">
              {dayEntries.map((e) => (
                <li key={`${e.event.id}-${e.session.id}`}>
                  <Link href={`/events/view?id=${e.event.id}`} className="group flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <span>
                      <span className={`font-marketing-serif text-lg font-semibold text-momentizing-gold-deep group-hover:underline ${e.event.cancelled ? "line-through" : ""}`}>{e.event.title}</span>
                      {e.event.cancelled && <span className="ml-2 text-xs font-bold text-momentizing-muted">{t("site.events.cancelled")}</span>}
                      <span className="mt-0.5 block text-sm text-momentizing-muted">
                        {timeRange(e.session, e.event.timezoneLabel)} · {placeText(e.event)}
                        {dateOf(e) && <span className="font-bold text-momentizing-teal"> · {dateOf(e)}</span>}
                      </span>
                    </span>
                    <span className="flex gap-1.5 text-xs font-bold">
                      <span className={`rounded-full px-2.5 py-0.5 ${CHIP[e.event.format]}`}>{formatLabel(e.event.format)}</span>
                      <span className="rounded-full bg-momentizing-cream px-2.5 py-0.5 text-momentizing-gold-deep">{priceText(e.event)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {preview && <PosterPreview preview={preview} />}

      {!monthHasEvents && <p className="mt-6 text-center text-sm text-momentizing-muted">{t("site.events.calendar.noEventsMonth")}</p>}
    </section>
  );
}
