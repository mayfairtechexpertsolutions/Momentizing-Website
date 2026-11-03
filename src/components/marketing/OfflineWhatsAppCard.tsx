"use client";

import { t } from "@/i18n";
import { useWhatsAppLink } from "@/lib/whatsapp";
import { BookCard } from "./booking/ui";

/** What a page shows in place of a backend-only feature while the backend is down: say what to do, then open WhatsApp. */
export function OfflineWhatsAppCard({ title, body, message, as: Heading = "h2" }: { title: string; body: string; message: string; as?: "h1" | "h2" }) {
  const whatsAppLink = useWhatsAppLink();
  return (
    <BookCard>
      <Heading className="font-marketing-serif text-2xl font-semibold">{title}</Heading>
      <p className="mt-2 text-momentizing-muted">{body}</p>
      <a
        href={whatsAppLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-momentizing-teal px-6 py-3 text-sm font-semibold text-white transition hover:bg-momentizing-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal"
      >
        <i aria-hidden="true" className="fab fa-whatsapp text-lg" /> {t("site.offline.whatsappButton")}
        <span className="sr-only"> {t("site.common.newTab")}</span>
      </a>
    </BookCard>
  );
}
