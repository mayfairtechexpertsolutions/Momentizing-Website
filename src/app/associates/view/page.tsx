"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MobileBookBar, SpecialistBookingPanel } from "@/components/marketing/SpecialistBookingPanel";
import { SpecialistCard } from "@/components/marketing/SpecialistCard";
import { SpecialistReviews } from "@/components/marketing/SpecialistReviews";
import { ProfileNav } from "@/components/marketing/specialist/ProfileNav";
import { ProfileHero } from "@/components/marketing/specialist/ProfileHero";
import {
  AboutSection,
  CredentialsSection,
  ClosingCta,
  ExpectSection,
  LocationSection,
  SectionCard,
} from "@/components/marketing/specialist/ProfileSections";
import { useMarketingDirectory, useMarketingSpecialist, formatSessionFee } from "@/lib/marketing-directory";

/** The profile id comes from `?id=` (not a `[id]` segment) so the site can be statically exported for GitHub Pages;
 * the Suspense boundary is required for `useSearchParams` under static prerendering. */
export default function AssociateDetailPage() {
  return (
    <Suspense
      fallback={
        <div role="status" className="flex min-h-dvh items-center justify-center bg-momentizing-cream font-marketing-serif text-lg text-momentizing-muted">
          Loading profile…
        </div>
      }
    >
      <AssociateDetail />
    </Suspense>
  );
}

function AssociateDetail() {
  const searchParams = useSearchParams();
  const psychId = Number(searchParams.get("id"));

  const { data: psych, error, isLoading, refetch } = useMarketingSpecialist(psychId);
  const { data: others } = useMarketingDirectory(4);

  // Only a genuine 404 means "no such associate"; any other failure is a load problem and must not say the person doesn't exist.
  const loadFailed = !!error && !/not found/i.test(error);
  const otherAssociates = (others?.content ?? []).filter((p) => p.id !== psychId).slice(0, 3);
  const fee = psych ? formatSessionFee(psych.sessionFeeCents, psych.sessionFeeCurrency) : null;

  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">
      {isLoading && (
        <p role="status" className="px-6 pt-48 pb-24 text-center font-marketing-serif text-lg text-momentizing-muted">
          Loading profile…
        </p>
      )}

      {!isLoading && !psych && loadFailed && (
        // Anything other than a genuine 404 is a load failure — don't tell the visitor the specialist doesn't exist.
        <div role="alert" className="px-6 pt-48 pb-24 text-center">
          <p className="mb-2 font-marketing-serif text-2xl">We couldn&apos;t load this profile just now.</p>
          <p className="mb-6 text-sm text-momentizing-muted">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="min-h-12 rounded-full bg-momentizing-teal px-8 py-3 text-sm font-bold text-white transition hover:bg-momentizing-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-momentizing-teal"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !psych && !loadFailed && (
        <div className="px-6 pt-48 pb-24 text-center">
          <p className="mb-4 font-marketing-serif text-2xl text-momentizing-muted">Associate not found</p>
          <Link href="/associates" className="inline-flex min-h-11 items-center font-bold text-momentizing-teal underline">
            Back to all associates
          </Link>
        </div>
      )}

      {psych && (
        <>
          <ProfileHero specialist={psych} />

          <ProfileNav
            items={[
              { id: "about", label: "About" },
              { id: "expect", label: "What to expect" },
              ...(psych.locations.length > 0 ? [{ id: "where", label: "Location" }] : []),
              ...(psych.licenceNumber || psych.credentialsSummary?.trim() ? [{ id: "credentials", label: "Credentials" }] : []),
              { id: "reviews", label: "Reviews" },
            ]}
          />

          <main id="main" className="mx-auto max-w-6xl px-6 py-12 pb-28 lg:pb-16">
            {/* minmax(0, 1fr): a bare 1fr track can't shrink below its content's min-width and would stretch the page on phones. */}
            <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
              <div className="space-y-6">
                <AboutSection specialist={psych} />
                <ExpectSection specialist={psych} />
                <LocationSection specialist={psych} />
                <CredentialsSection specialist={psych} />
                <SectionCard id="reviews" icon="fa-star" title="Reviews">
                  <SpecialistReviews specialistId={psych.id} specialistName={psych.name} averageRating={psych.averageRating} reviewCount={psych.reviewCount} />
                </SectionCard>
                <ClosingCta specialist={psych} fee={fee} />
              </div>

              <aside id="book" aria-label="Book a session" className="scroll-mt-12 lg:sticky lg:top-36 lg:self-start">
                <SpecialistBookingPanel
                  specialistId={psych.id}
                  specialistName={psych.name}
                  acceptingNewClients={psych.acceptingNewClients}
                  fee={fee}
                  freeFirstSession={psych.freeFirstSession}
                />
              </aside>
            </div>
          </main>

          {otherAssociates.length > 0 && (
            <section aria-labelledby="others-title" className="bg-momentizing-mint px-6 py-16 pb-28 lg:pb-16">
              <div className="mx-auto max-w-6xl">
                <h2 id="others-title" className="mb-2 font-marketing-serif text-3xl font-bold text-momentizing-gold-deep">
                  Other specialists you may like
                </h2>
                <p className="mb-8 text-momentizing-muted">Finding the right person matters. Take your time.</p>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {otherAssociates.map((a) => (
                    <SpecialistCard key={a.id} specialist={a} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {psych.acceptingNewClients && <MobileBookBar specialistId={psych.id} fee={fee} />}
        </>
      )}
    </div>
  );
}
