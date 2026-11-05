import Link from "next/link";
import { EventPoster } from "./EventPoster";
import { formatLabel, formatEventDate, headlineSession, placeText, priceText, timeRange, type PublicEvent } from "@/lib/events";
import { t } from "@/i18n";

/**
 * One event on /events and the home "Upcoming events" band. Posters are usually portrait, so the 4:5 frame letterboxes
 * on cream rather than cropping. The default card is small enough for a 4-column grid; `compact` is the poster-less home band ticket.
 */
export function EventCard({ event: e, compact = false }: { event: PublicEvent; compact?: boolean }) {
  const s = headlineSession(e);
  const more = Math.max(0, e.sessions.filter((x) => !e.past && new Date(x.endsAt) > new Date()).length - 1);
  if (compact) {
    // Home band "date ticket": the date leads instead of the poster (that stays on the event page), so cards are short
    // and equal height. The tile is visual only; screen readers get the full date.
    return (
      <Link
        href={`/events/view?id=${e.id}`}
        className="group flex h-full flex-col gap-4 rounded-3xl border border-momentizing-mint-deep bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div className="flex items-start justify-between gap-3">
          {s && (
            <div aria-hidden="true" className="flex w-20 flex-shrink-0 flex-col items-center rounded-2xl bg-momentizing-peach px-2 py-3 text-momentizing-gold-deep">
              <span className="font-marketing-serif text-3xl leading-none font-semibold">{formatEventDate(s.date, { day: "numeric" })}</span>
              <span className="mt-1 text-xs font-bold tracking-widest uppercase">{formatEventDate(s.date, { month: "short" })}</span>
              <span className="text-xs">{formatEventDate(s.date, { weekday: "short" })}</span>
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-2 text-xs font-bold">
            <span className="rounded-full bg-momentizing-mint px-3 py-1 text-momentizing-teal">{formatLabel(e.format)}</span>
            <span className="rounded-full bg-momentizing-cream px-3 py-1 text-momentizing-gold-deep">{priceText(e)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {s && <span className="sr-only">{formatEventDate(s.date)}</span>}
          <h3 className="font-marketing-serif text-xl leading-snug font-semibold text-momentizing-gold-deep group-hover:underline">{e.title}</h3>
          {e.summary && <p className="line-clamp-2 text-sm leading-relaxed text-momentizing-muted">{e.summary}</p>}
        </div>
        <div className="mt-auto flex flex-col gap-1 border-t border-momentizing-mint-deep pt-4 text-sm">
          {s && (
            <p className="font-semibold text-momentizing-slate">
              <i aria-hidden="true" className="far fa-clock mr-2 w-4 text-momentizing-teal" />
              {timeRange(s, e.timezoneLabel)}
              {more > 0 && <span className="font-normal text-momentizing-muted"> · {t("site.events.more", { n: more })}</span>}
            </p>
          )}
          <p className="truncate text-momentizing-muted">
            <i aria-hidden="true" className={`fas ${e.format === "ONLINE" ? "fa-video" : "fa-location-dot"} mr-2 w-4 text-momentizing-teal`} />
            {placeText(e)}
          </p>
        </div>
        <span className="inline-flex items-center text-xs font-bold tracking-widest text-momentizing-teal uppercase">
          {t("site.events.viewDetails")}
          <i aria-hidden="true" className="fas fa-arrow-right ml-2 transition group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </Link>
    );
  }
  return (
    <Link
      href={`/events/view?id=${e.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-momentizing-mint-deep bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[4/5] flex-shrink-0 bg-momentizing-cream">
        <EventPoster event={e} alt="" className="h-full w-full object-contain" />
        {s && (
          <span className="absolute top-3 left-3 rounded-xl bg-momentizing-peach px-2.5 py-1 text-xs font-bold text-momentizing-gold-deep shadow-sm">
            {formatEventDate(s.date, { day: "numeric", month: "short" })}
          </span>
        )}
        {e.cancelled && (
          <span className="absolute top-3 right-3 rounded-full bg-momentizing-slate px-2.5 py-1 text-xs font-bold text-white">{t("site.events.cancelled")}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          <span className="rounded-full bg-momentizing-mint px-2.5 py-0.5 text-momentizing-teal">{formatLabel(e.format)}</span>
          <span className="rounded-full bg-momentizing-cream px-2.5 py-0.5 text-momentizing-gold-deep">{priceText(e)}</span>
        </div>
        <h3
          className={`line-clamp-2 font-marketing-serif text-lg leading-snug font-semibold text-momentizing-gold-deep group-hover:underline ${
            e.cancelled ? "line-through decoration-1" : ""
          }`}
        >
          {e.title}
        </h3>
        <div className="mt-auto flex flex-col gap-0.5 pt-1 text-sm">
          {s && (
            <p className="truncate font-semibold text-momentizing-slate">
              {s && <span className="sr-only">{formatEventDate(s.date)}. </span>}
              <i aria-hidden="true" className="far fa-clock mr-2 w-4 text-momentizing-teal" />
              {timeRange(s, e.timezoneLabel)}
              {more > 0 && <span className="font-normal text-momentizing-muted"> · {t("site.events.more", { n: more })}</span>}
            </p>
          )}
          <p className="truncate text-momentizing-muted">
            <i aria-hidden="true" className={`fas ${e.format === "ONLINE" ? "fa-video" : "fa-location-dot"} mr-2 w-4 text-momentizing-teal`} />
            {placeText(e)}
          </p>
        </div>
      </div>
    </Link>
  );
}
