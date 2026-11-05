"use client";

import { useState } from "react";
import { EventCard } from "@/components/marketing/EventCard";
import { EventsCalendar } from "@/components/marketing/EventsCalendar";
import { useCalendarEvents } from "@/lib/events-calendar";
import { useEvents, EVENTS_PAGE_SIZE, type EventFormatFilter, type EventWhen } from "@/lib/events";
import { useWhatsAppLink } from "@/lib/whatsapp";
import { t } from "@/i18n";

type Filter = "upcoming" | "online" | "in-person" | "past";
type View = "grid" | "calendar";
type CalendarFilter = "all" | "online" | "in-person";

const CALENDAR_FILTERS: { value: CalendarFilter; labelKey: string; format: EventFormatFilter }[] = [
  { value: "all", labelKey: "site.events.filter.all", format: null },
  { value: "online", labelKey: "site.events.format.ONLINE", format: "ONLINE" },
  { value: "in-person", labelKey: "site.events.format.IN_PERSON", format: "IN_PERSON" },
];

const FILTERS: { value: Filter; labelKey: string; when: EventWhen; format: EventFormatFilter }[] = [
  { value: "upcoming", labelKey: "site.events.filter.upcoming", when: "upcoming", format: null },
  { value: "online", labelKey: "site.events.format.ONLINE", when: "upcoming", format: "ONLINE" },
  { value: "in-person", labelKey: "site.events.format.IN_PERSON", when: "upcoming", format: "IN_PERSON" },
  { value: "past", labelKey: "site.events.filter.past", when: "past", format: null },
];

function FilterPill({ pressed, label, onClick }: { pressed: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`min-h-11 rounded-full px-5 py-3 text-xs font-bold tracking-widest uppercase transition ${
        pressed ? "bg-momentizing-teal text-white" : "bg-white text-momentizing-muted hover:bg-momentizing-mint"
      }`}
    >
      {label}
    </button>
  );
}

const pagerClass =
  "min-h-11 rounded-full bg-white px-6 py-2 text-xs font-bold tracking-widest text-momentizing-teal uppercase transition hover:bg-momentizing-mint disabled:cursor-not-allowed disabled:opacity-40";

export default function EventsPage() {
  const [filter, setFilter] = useState<Filter>("upcoming");
  const active = FILTERS.find((f) => f.value === filter) ?? FILTERS[0];
  const [page, setPage] = useState(0);
  const [view, setView] = useState<View>("grid");
  const [calendarFilter, setCalendarFilter] = useState<CalendarFilter>("all");
  const calendarFormat = CALENDAR_FILTERS.find((f) => f.value === calendarFilter)?.format ?? null;
  const calendar = useCalendarEvents(view === "calendar", calendarFormat);
  // The list only loads while it is on screen, so switching views never fetches both.
  const list = useEvents(active.when, active.format, EVENTS_PAGE_SIZE, page, view === "grid");
  const { data, error: listError, isLoading: listLoading, refetch: listRefetch } = list;
  const error = view === "calendar" ? calendar.error : listError;
  const isLoading = view === "calendar" ? calendar.isLoading : listLoading;
  const refetch = view === "calendar" ? calendar.refetch : listRefetch;
  const whatsAppLink = useWhatsAppLink();
  const events = data?.content ?? [];
  const changePage = (next: number) => {
    setPage(next);
    document.getElementById("events-list")?.scrollIntoView({ block: "start" });
  };

  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">
      <header className="px-6 pt-32 pb-12 text-center">
        <span className="inline-block rounded-full bg-momentizing-mint px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-momentizing-teal uppercase">
          {t("site.nav.events")}
        </span>
        <h1 className="mt-5 mb-4 font-marketing-serif text-5xl text-momentizing-gold-deep">{t("site.events.title")}</h1>
        <p className="mx-auto max-w-xl text-base text-momentizing-muted">
          {t("site.events.intro")}
        </p>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-8 flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div role="group" aria-label={t("site.events.view.label")} className="inline-flex rounded-full bg-white p-1 shadow-sm">
            {(["grid", "calendar"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-xs font-bold tracking-widest uppercase transition ${
                  view === v ? "bg-momentizing-teal text-white" : "text-momentizing-muted hover:bg-momentizing-mint"
                }`}
              >
                <i aria-hidden="true" className={`fas ${v === "grid" ? "fa-table-cells-large" : "fa-calendar-days"}`} />
                {t(`site.events.view.${v}`)}
              </button>
            ))}
          </div>
          <div role="group" aria-label={t("site.events.filterLabel")} className="flex flex-wrap justify-center gap-2">
            {view === "grid"
              ? FILTERS.map((f) => (
                  <FilterPill
                    key={f.value}
                    pressed={filter === f.value}
                    label={t(f.labelKey)}
                    onClick={() => {
                      setFilter(f.value);
                      setPage(0);
                    }}
                  />
                ))
              : CALENDAR_FILTERS.map((f) => <FilterPill key={f.value} pressed={calendarFilter === f.value} label={t(f.labelKey)} onClick={() => setCalendarFilter(f.value)} />)}
          </div>
        </div>

        {isLoading ? (
          <div role="status" className="py-24 text-center font-marketing-serif text-lg text-momentizing-muted">
            {t("site.events.loading")}
          </div>
        ) : error ? (
          <div role="alert" className="mx-auto max-w-md py-24 text-center">
            <p className="font-marketing-serif text-xl">{t("site.events.loadError")}</p>
            <p className="mt-2 text-sm text-momentizing-muted">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-6 min-h-12 rounded-full bg-momentizing-teal px-8 py-3 text-sm font-semibold text-white transition hover:bg-momentizing-slate"
            >
              {t("site.common.tryAgain")}
            </button>
          </div>
        ) : view === "calendar" ? (
          <EventsCalendar events={calendar.events} />
        ) : events.length === 0 ? (
          <div className="mx-auto max-w-md py-20 text-center">
            <p className="font-marketing-serif text-2xl text-momentizing-gold-deep">
              {active.when === "past" ? t("site.events.noPast") : t("site.events.noUpcoming")}
            </p>
            {active.when === "upcoming" && (
              <>
                <p className="mt-3 text-momentizing-muted">{t("site.events.addedOften")}</p>
                <a
                  href={whatsAppLink(t("site.whatsapp.eventGreeting"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-momentizing-teal px-8 py-3 text-sm font-semibold text-white hover:bg-momentizing-slate"
                >
                  <i aria-hidden="true" className="fab fa-whatsapp" /> {t("site.events.tellMe")}
                </a>
              </>
            )}
          </div>
        ) : (
          <div id="events-list" className="scroll-mt-28">
            <ul className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events.map((e) => (
                <li key={e.id}>
                  <EventCard event={e} />
                </li>
              ))}
            </ul>
            {data && data.totalPages > 1 && (
              <nav aria-label={t("site.events.pages")} className="mt-10 flex items-center justify-center gap-4">
                <button type="button" disabled={data.first} onClick={() => changePage(page - 1)} className={pagerClass}>
                  {t("site.common.previous")}
                </button>
                <span className="text-sm text-momentizing-muted">{t("site.common.pageOf", { page: data.number + 1, total: data.totalPages })}</span>
                <button type="button" disabled={data.last} onClick={() => changePage(page + 1)} className={pagerClass}>
                  {t("site.common.next")}
                </button>
              </nav>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
