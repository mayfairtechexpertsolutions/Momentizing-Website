"use client";

import { useState } from "react";
import { EventPosterFallback } from "./EventPosterFallback";
import type { PublicEvent } from "@/lib/events";

/** The event's poster, or the default brand poster when it has none or the image file can't be loaded (a misspelt name). */
export function EventPoster({ event, alt, className, framedFallback = false }: { event: Pick<PublicEvent, "title" | "format" | "posterUrl">; alt: string; className: string; framedFallback?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!event.posterUrl || failedSrc === event.posterUrl) {
    const fallback = <EventPosterFallback title={event.title} format={event.format} />;
    // Where the image sizes itself (no fixed frame), the default poster needs its own 4:5 frame.
    return framedFallback ? <div className="aspect-[4/5]">{fallback}</div> : fallback;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={event.posterUrl} alt={alt} loading="lazy" className={className} onError={() => setFailedSrc(event.posterUrl ?? null)} />;
}
