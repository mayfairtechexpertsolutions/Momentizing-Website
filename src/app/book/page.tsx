import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketingFonts } from "@/components/marketing/MarketingFonts";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { BookingWizard } from "@/components/marketing/booking/BookingWizard";

export const metadata: Metadata = {
  title: "Book a Session",
  alternates: { canonical: "./" },
  description: "Pick a day, meet the right specialist and book a session in a few gentle steps. No account needed.",
};

/**
 * Public booking wizard. No WhatsApp floating button here on purpose: it would sit on top of the fixed
 * Back/Continue bar on phones (QA §13.2 — floating buttons must never overlap content), and the flow has its own
 * "help me find a schedule" and WhatsApp-verification paths.
 */
export default function BookPage() {
  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">
      <MarketingFonts />
      <MarketingNav variant="simple" simpleLabel="Back Home" />
      <main className="mx-auto max-w-2xl px-4 pt-28 pb-40 sm:px-6 md:pb-20">
        <Suspense
          fallback={
            <div className="flex min-h-[50dvh] items-center justify-center" aria-busy="true">
              <p className="text-momentizing-muted">Getting things ready…</p>
            </div>
          }
        >
          <BookingWizard />
        </Suspense>
      </main>
    </div>
  );
}
