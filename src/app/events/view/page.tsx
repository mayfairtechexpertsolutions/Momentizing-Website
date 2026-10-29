"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EventPosterFallback } from "@/components/marketing/EventPosterFallback";
import { JsonLd } from "@/components/marketing/JsonLd";
import { absoluteUrl } from "@/lib/site-url";
import { eventSchema } from "@/lib/structured-data";
import {
  buildIcs,
  FORMAT_LABEL,
  formatEventDate,
  placeText,
  priceText,
  timeRange,
  useEvent,
  videoEmbedUrl,
  type PublicEvent,
  type PublicEventSession,
} from "@/lib/events";

/** The event id comes from `?id=` (not a `[id]` segment) so the site can be statically exported; the Suspense
 * boundary is required for `useSearchParams` under static prerendering. */
export default function EventDetailPage() {
  return (
    <Suspense
      fallback={
        <div role="status" className="flex min-h-dvh items-center justify-center bg-momentizing-cream font-marketing-serif text-lg text-momentizing-muted">
          Loading event…
        </div>
      }
    >
      <EventDetail />
    </Suspense>
  );
}

function EventDetail() {
  const id = Number(useSearchParams().get("id")) || null;
  const { data: e, error, isLoading, refetch } = useEvent(id);
  // Only a genuine 404 means "no such event"; anything else is a load problem and gets a retry.
  const notFound = !id || (!!error && /not found|tidak ditemukan/i.test(error));

  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">
      {isLoading && (
        <p role="status" className="px-6 pt-48 pb-24 text-center font-marketing-serif text-lg text-momentizing-muted">
          Loading event…
        </p>
      )}

      {!isLoading && !e && notFound && (
        <div className="px-6 pt-48 pb-24 text-center">
          <p className="mb-4 font-marketing-serif text-2xl text-momentizing-muted">We couldn&apos;t find that event</p>
          <Link href="/events" className="inline-flex min-h-11 items-center font-bold text-momentizing-teal underline">
            See all events
          </Link>
        </div>
      )}

      {!isLoading && !e && !notFound && error && (
        <div role="alert" className="px-6 pt-48 pb-24 text-center">
          <p className="mb-2 font-marketing-serif text-2xl">We couldn&apos;t load this event just now.</p>
          <p className="mb-6 text-sm text-momentizing-muted">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="min-h-12 rounded-full bg-momentizing-teal px-8 py-3 text-sm font-bold text-white transition hover:bg-momentizing-slate"
          >
            Try again
          </button>
        </div>
      )}

      {e && <EventBody event={e} />}
    </div>
  );
}

function EventBody({ event: e }: { event: PublicEvent }) {
  const pageUrl = absoluteUrl(`/events/view/?id=${e.id}`);
  const embed = videoEmbedUrl(e.videoUrl);
  const now = new Date();
  const canRegister = !!e.registrationUrl && !e.cancelled && !e.past;

  return (
    <>
      <JsonLd data={eventSchema(e, pageUrl)} />
      <main id="main" className="mx-auto max-w-6xl px-6 pt-32 pb-32 md:pb-24">
        <Link href="/events" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-momentizing-teal hover:underline">
          <i aria-hidden="true" className="fas fa-arrow-left" /> All events
        </Link>

        {e.cancelled && (
          <p role="status" className="mb-6 rounded-3xl bg-momentizing-slate px-6 py-4 text-sm font-semibold text-white">
            This event has been cancelled. We&apos;re sorry for any inconvenience.
          </p>
        )}
        {e.past && !e.cancelled && (
          <p className="mb-6 rounded-3xl bg-momentizing-mint px-6 py-4 text-sm font-semibold text-momentizing-teal">
            This event has finished. <Link href="/events" className="underline">See what&apos;s coming up</Link>.
          </p>
        )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-3xl border border-momentizing-mint-deep bg-white">
              {e.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.posterUrl} alt={`Poster for ${e.title}`} className="h-auto w-full" />
              ) : (
                <div className="aspect-[4/5]">
                  <EventPosterFallback title={e.title} format={e.format} />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-momentizing-mint px-3 py-1 text-momentizing-teal">{FORMAT_LABEL[e.format]}</span>
              <span className="rounded-full bg-white px-3 py-1 text-momentizing-gold-deep">{priceText(e)}</span>
              {e.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white px-3 py-1 text-momentizing-muted">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-marketing-serif text-4xl leading-tight text-momentizing-gold-deep md:text-5xl">{e.title}</h1>
            {e.summary && <p className="text-lg leading-relaxed text-momentizing-muted">{e.summary}</p>}

            <section aria-labelledby="when-heading" className="rounded-3xl bg-white p-6">
              <h2 id="when-heading" className="mb-3 text-xs font-bold tracking-[0.18em] text-momentizing-teal uppercase">
                {e.sessions.length > 1 ? "Dates" : "When"}
              </h2>
              <ul className="flex flex-col divide-y divide-momentizing-mint">
                {e.sessions.map((s) => (
                  <SessionRow key={s.id} event={e} session={s} pageUrl={pageUrl} ended={new Date(s.endsAt) <= now} />
                ))}
              </ul>
            </section>

            <section aria-labelledby="where-heading" className="rounded-3xl bg-white p-6">
              <h2 id="where-heading" className="mb-3 text-xs font-bold tracking-[0.18em] text-momentizing-teal uppercase">
                Where
              </h2>
              {e.format !== "ONLINE" && (
                <div className="mb-2">
                  <p className="font-semibold">{e.venueName || placeText(e)}</p>
                  {e.address && <p className="text-sm text-momentizing-muted">{[e.address, e.city].filter(Boolean).join(", ")}</p>}
                  {e.mapUrl && (
                    <a href={e.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-momentizing-teal underline">
                      <i aria-hidden="true" className="fas fa-map-location-dot" /> Open map
                    </a>
                  )}
                </div>
              )}
              {e.format !== "IN_PERSON" &&
                (e.onlineUrl ? (
                  <a href={e.onlineUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-momentizing-teal underline">
                    <i aria-hidden="true" className="fas fa-video" /> Join online
                  </a>
                ) : (
                  <p className="text-sm text-momentizing-muted">
                    <i aria-hidden="true" className="fas fa-video mr-2 text-momentizing-teal" />
                    Online — the joining link is sent when you register.
                  </p>
                ))}
            </section>

            {e.description && (
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className="mb-3 font-marketing-serif text-2xl text-momentizing-gold-deep">
                  About this event
                </h2>
                <p className="leading-relaxed whitespace-pre-line text-momentizing-slate">{e.description}</p>
              </section>
            )}

            {(embed || e.videoFileUrl) && (
              <section aria-labelledby="video-heading">
                <h2 id="video-heading" className="mb-3 font-marketing-serif text-2xl text-momentizing-gold-deep">
                  Watch
                </h2>
                {embed ? (
                  <iframe
                    src={embed}
                    title={`Video: ${e.title}`}
                    loading="lazy"
                    className="aspect-video w-full rounded-3xl border border-momentizing-mint-deep"
                    allow="encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  e.videoFileUrl && (
                    <video src={e.videoFileUrl} controls preload="none" poster={e.posterUrl ?? undefined} className="aspect-video w-full rounded-3xl bg-momentizing-slate" />
                  )
                )}
              </section>
            )}

            <div className="hidden flex-wrap gap-3 md:flex">
              {canRegister && <RegisterButton url={e.registrationUrl!} />}
              <ShareButton title={e.title} url={pageUrl} />
            </div>
          </div>
        </div>
      </main>

      {/* Phones: keep the main action in reach while reading. pr-24 leaves room for the floating WhatsApp button. */}
      <div className="fixed inset-x-0 bottom-0 z-[80] flex gap-3 border-t border-momentizing-mint-deep bg-white/95 py-3 pr-24 pl-4 backdrop-blur-md md:hidden">
        {canRegister ? <RegisterButton url={e.registrationUrl!} full /> : <ShareButton title={e.title} url={pageUrl} full />}
        {canRegister && <ShareButton title={e.title} url={pageUrl} iconOnly />}
      </div>
    </>
  );
}

function SessionRow({ event, session: s, pageUrl, ended }: { event: PublicEvent; session: PublicEventSession; pageUrl: string; ended: boolean }) {
  function download() {
    const blob = new Blob([buildIcs(event, s, pageUrl)], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `momentizing-event-${event.id}-${s.date}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return (
    <li className={`flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0 ${ended ? "opacity-60" : ""}`}>
      <div>
        <p className="font-semibold">
          {formatEventDate(s.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          {s.label && <span className="font-normal text-momentizing-muted"> · {s.label}</span>}
        </p>
        <p className="text-sm text-momentizing-muted">{timeRange(s, event.timezoneLabel)}</p>
      </div>
      {!ended && !event.cancelled && (
        <button
          type="button"
          onClick={download}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-momentizing-teal/40 px-4 text-xs font-bold text-momentizing-teal transition hover:bg-momentizing-mint"
        >
          <i aria-hidden="true" className="far fa-calendar-plus" /> Add to calendar
        </button>
      )}
    </li>
  );
}

function RegisterButton({ url, full = false }: { url: string; full?: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-momentizing-teal px-8 py-3 text-sm font-bold tracking-widest text-white uppercase transition hover:bg-momentizing-slate ${full ? "flex-1" : ""}`}
    >
      Register <i aria-hidden="true" className="fas fa-arrow-up-right-from-square text-xs" />
    </a>
  );
}

function ShareButton({ title, url, full = false, iconOnly = false }: { title: string; url: string; full?: boolean; iconOnly?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // The visitor closed the share sheet, or the clipboard is blocked: nothing to report.
    }
  }
  return (
    <button
      type="button"
      onClick={share}
      aria-label={iconOnly ? "Share this event" : undefined}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-momentizing-slate/30 px-6 py-3 text-sm font-bold text-momentizing-slate transition hover:bg-momentizing-mint ${
        full ? "flex-1" : ""
      } ${iconOnly ? "w-12 px-0" : ""}`}
    >
      <i aria-hidden="true" className="fas fa-share-nodes" />
      {!iconOnly && <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>}
    </button>
  );
}
