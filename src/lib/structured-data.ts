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
