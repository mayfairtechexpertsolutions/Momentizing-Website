"use client";

import Link from "next/link";
import { EventCard } from "./EventCard";
import { useEvents } from "@/lib/events";

/**
 * Home-page teaser for the next few events. It is optional decoration, so it renders nothing while loading, on a
 * failed request or when nothing is scheduled; the /events page itself shows those states properly.
 * No `data-reveal`: it mounts after the scroll-reveal observer has run and would otherwise stay hidden.
 */
export function UpcomingEventsBand() {
  const { data } = useEvents("upcoming", null, 3);
  const events = (data?.content ?? []).filter((e) => !e.cancelled);
  if (events.length === 0) return null;

  return (
    <section id="events" aria-labelledby="events-heading" className="bg-momentizing-mint px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 id="events-heading" className="mb-3 font-marketing-serif text-3xl text-momentizing-gold-deep">
            Upcoming Events
          </h2>
          <p className="mx-auto max-w-lg text-sm text-momentizing-muted">
            Workshops and circles to learn, connect and take a breath — join us in person or online.
          </p>
        </div>
        {/* Flex, not grid, so one or two events sit centred instead of hugging the left column. */}
        <ul className="mx-auto mb-12 flex max-w-6xl flex-wrap justify-center gap-6">
          {events.map((e) => (
            <li key={e.id} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
              <EventCard event={e} compact />
            </li>
          ))}
        </ul>
        <div className="text-center">
          <Link
            href="/events"
            className="inline-flex items-center rounded-full bg-momentizing-teal px-10 py-4 text-xs font-bold tracking-widest text-white uppercase transition hover:bg-momentizing-slate"
          >
            See All Events <i aria-hidden="true" className="fas fa-arrow-right ml-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
