import type { PublicEvent } from "./events";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "./site-url";
import { MOMENTIZING_WHATSAPP_NUMBER } from "./whatsapp";

/** Organization + WebSite graph, rendered on every page from the root layout. */
export const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": absoluteUrl("/#organization"),
      name: "Momentizing Holistic Center",
      alternateName: SITE_NAME,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/icon-192.png"),
      description: SITE_DESCRIPTION,
      slogan: "Healing Without Borders",
      areaServed: "Worldwide",
      knowsLanguage: ["en", "id"],
      serviceType: ["Counseling", "Coaching", "Psychological Assessment", "Support Group Facilitation"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: `https://wa.me/${MOMENTIZING_WHATSAPP_NUMBER}`,
        availableLanguage: ["English", "Indonesian"],
      },
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: absoluteUrl("/"),
      name: SITE_NAME,
      publisher: { "@id": absoluteUrl("/#organization") },
      inLanguage: "en",
    },
  ],
};

export const faqPageSchema = (items: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((i) => ({
    "@type": "Question",
    name: i.question,
    acceptedAnswer: { "@type": "Answer", text: i.answer },
  })),
});

/** schema.org Event for an event detail page. Times are the session instants (UTC), which search engines localize. */
export const eventSchema = (e: PublicEvent, pageUrl: string) => {
  const first = e.sessions[0];
  const last = e.sessions[e.sessions.length - 1];
  const place = {
    "@type": "Place",
    name: e.venueName ?? e.city ?? "Momentizing",
    address: [e.address, e.city].filter(Boolean).join(", ") || undefined,
  };
  const virtual = { "@type": "VirtualLocation", url: e.onlineUrl ?? pageUrl };
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.summary ?? e.description ?? undefined,
    url: pageUrl,
    image: e.posterUrl ? [e.posterUrl] : undefined,
    startDate: first?.startsAt,
    endDate: last?.endsAt,
    eventStatus: e.cancelled ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    eventAttendanceMode:
      e.format === "ONLINE"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : e.format === "HYBRID"
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
    location: e.format === "ONLINE" ? virtual : e.format === "HYBRID" ? [place, virtual] : place,
    isAccessibleForFree: e.priceType === "FREE",
    organizer: { "@id": absoluteUrl("/#organization") },
    offers: e.registrationUrl ? { "@type": "Offer", url: e.registrationUrl, availability: "https://schema.org/InStock" } : undefined,
  };
};
