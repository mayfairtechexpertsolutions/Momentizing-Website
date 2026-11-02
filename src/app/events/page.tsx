"use client";

import { useState } from "react";
import { EventCard } from "@/components/marketing/EventCard";
import { useEvents, type EventFormatFilter, type EventWhen } from "@/lib/events";
import { useWhatsAppLink } from "@/lib/whatsapp";
import { t } from "@/i18n";

type Filter = "upcoming" | "online" | "in-person" | "past";

const FILTERS: { value: Filter; labelKey: string; when: EventWhen; format: EventFormatFilter }[] = [
  { value: "upcoming", labelKey: "site.events.filter.upcoming", when: "upcoming", format: null },
  { value: "online", labelKey: "site.events.format.ONLINE", when: "upcoming", format: "ONLINE" },
  { value: "in-person", labelKey: "site.events.format.IN_PERSON", when: "upcoming", format: "IN_PERSON" },
  { value: "past", labelKey: "site.events.filter.past", when: "past", format: null },
];

export default function EventsPage() {
  const [filter, setFilter] = useState<Filter>("upcoming");
  const active = FILTERS.find((f) => f.value === filter) ?? FILTERS[0];
  const { data, error, isLoading, refetch } = useEvents(active.when, active.format);
  const whatsAppLink = useWhatsAppLink();
  const events = data?.content ?? [];
  // Feature the soonest upcoming event that is still on; past lists stay a plain grid.
  const featured = active.when === "upcoming" ? events.find((e) => !e.cancelled) : undefined;
  const rest = featured ? events.filter((e) => e.id !== featured.id) : events;

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
        <div role="group" aria-label={t("site.events.filterLabel")} className="mb-10 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`min-h-11 rounded-full px-5 py-3 text-xs font-bold tracking-widest uppercase transition ${
                filter === f.value ? "bg-momentizing-teal text-white" : "bg-white text-momentizing-muted hover:bg-momentizing-mint"
              }`}
            >
              {t(f.labelKey)}
            </button>
          ))}
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
          <div className="flex flex-col gap-8">
            {featured && <EventCard event={featured} featured />}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
