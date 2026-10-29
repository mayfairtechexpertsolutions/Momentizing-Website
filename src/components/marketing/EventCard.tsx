import Link from "next/link";
import { EventPosterFallback } from "./EventPosterFallback";
import { FORMAT_LABEL, formatEventDate, headlineSession, placeText, priceText, timeRange, type PublicEvent } from "@/lib/events";

/**
 * One event on /events and the home "Upcoming events" band. Posters are usually portrait, so the 4:5 frame letterboxes
 * on cream rather than cropping. `featured` lays the card out wide (poster beside text) from `md` up.
 */
export function EventCard({ event: e, featured = false, compact = false }: { event: PublicEvent; featured?: boolean; compact?: boolean }) {
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
            <span className="rounded-full bg-momentizing-mint px-3 py-1 text-momentizing-teal">{FORMAT_LABEL[e.format]}</span>
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
              {more > 0 && <span className="font-normal text-momentizing-muted"> · +{more} more</span>}
            </p>
          )}
          <p className="truncate text-momentizing-muted">
            <i aria-hidden="true" className={`fas ${e.format === "ONLINE" ? "fa-video" : "fa-location-dot"} mr-2 w-4 text-momentizing-teal`} />
            {placeText(e)}
          </p>
        </div>
        <span className="inline-flex items-center text-xs font-bold tracking-widest text-momentizing-teal uppercase">
          View details
          <i aria-hidden="true" className="fas fa-arrow-right ml-2 transition group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </Link>
    );
  }
  return (
    <Link
      href={`/events/view?id=${e.id}`}
      className={`group flex overflow-hidden rounded-3xl border border-momentizing-mint-deep bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        featured ? "flex-col md:flex-row" : "flex-col"
      }`}
    >
      {/* Featured: a fixed poster column keeps the wide card from growing taller than the screen. */}
      <div className={`relative aspect-[4/5] flex-shrink-0 bg-momentizing-cream ${featured ? "md:w-80 lg:w-96" : ""}`}>
        {e.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.posterUrl} alt="" loading="lazy" className="h-full w-full object-contain" />
        ) : (
          <EventPosterFallback title={e.title} format={e.format} />
        )}
        {s && (
          <span className="absolute top-4 left-4 rounded-2xl bg-momentizing-peach px-3 py-1.5 text-xs font-bold text-momentizing-gold-deep shadow-sm">
            {formatEventDate(s.date)}
          </span>
        )}
        {e.cancelled && (
          <span className="absolute top-4 right-4 rounded-full bg-momentizing-slate px-3 py-1.5 text-xs font-bold text-white">Cancelled</span>
        )}
      </div>
      <div className={`flex flex-1 flex-col gap-3 ${featured ? "p-6 md:p-10" : "p-5"}`}>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-momentizing-mint px-3 py-1 text-momentizing-teal">{FORMAT_LABEL[e.format]}</span>
          <span className="rounded-full bg-momentizing-cream px-3 py-1 text-momentizing-gold-deep">{priceText(e)}</span>
        </div>
        <h3
          className={`font-marketing-serif leading-snug font-semibold text-momentizing-gold-deep group-hover:underline ${
            featured ? "text-2xl md:text-3xl" : "text-xl"
          } ${e.cancelled ? "line-through decoration-1" : ""}`}
        >
          {e.title}
        </h3>
        {e.summary && <p className={`leading-relaxed text-momentizing-muted ${featured ? "text-base" : "text-sm"}`}>{e.summary}</p>}
        <div className="mt-auto flex flex-col gap-1 pt-2 text-sm">
          {s && (
            <p className="font-semibold text-momentizing-slate">
              <i aria-hidden="true" className="far fa-clock mr-2 text-momentizing-teal" />
              {timeRange(s, e.timezoneLabel)}
              {more > 0 && <span className="font-normal text-momentizing-muted"> · +{more} more {more === 1 ? "date" : "dates"}</span>}
            </p>
          )}
          <p className="text-momentizing-muted">
            <i aria-hidden="true" className={`fas ${e.format === "ONLINE" ? "fa-video" : "fa-location-dot"} mr-2 text-momentizing-teal`} />
            {placeText(e)}
          </p>
        </div>
        {featured && (
          <span className="mt-2 inline-flex min-h-11 w-fit items-center rounded-full bg-momentizing-teal px-6 py-3 text-xs font-bold tracking-widest text-white uppercase">
            See details
          </span>
        )}
      </div>
    </Link>
  );
}
