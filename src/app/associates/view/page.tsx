"use client";

import { initials } from "@/components/marketing/booking/SpecialistParts";
import { Suspense, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SpecialistBookingPanel } from "@/components/marketing/SpecialistBookingPanel";
import { SpecialistCard } from "@/components/marketing/SpecialistCard";
import { SpecialistReviews } from "@/components/marketing/SpecialistReviews";
import { StarRating } from "@/components/marketing/StarRating";
import {
  useMarketingDirectory,
  useMarketingSpecialist,
  specialisationTags,
  languageList,
  formatSessionFee,
  formatActiveDays,
  PRACTICE_MODE_LABEL,
} from "@/lib/marketing-directory";
import { useFavorites } from "@/lib/favorites";

const TABS = ["About", "Credentials", "What to Expect", "Reviews"] as const;

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-momentizing-gold/10 px-3 py-1 text-xs font-bold tracking-wide text-momentizing-gold-deep uppercase">
      {children}
    </span>
  );
}

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
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("About");

  const { data: psych, error, isLoading, refetch } = useMarketingSpecialist(psychId);
  const { data: others } = useMarketingDirectory(4);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Only a genuine 404 means "no such associate"; any other failure is a load problem and must not say the person doesn't exist.
  const loadFailed = !!error && !/not found/i.test(error);
  const otherAssociates = (others?.content ?? []).filter((p) => p.id !== psychId).slice(0, 3);

  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">

      <main id="main" className="mx-auto max-w-6xl px-6 pt-40 pb-24">
        {isLoading && (
          <p role="status" className="py-24 text-center font-marketing-serif text-lg text-momentizing-muted">
            Loading profile…
          </p>
        )}

        {!isLoading && !psych && loadFailed && (
          // Anything other than a genuine 404 is a load failure — don't tell the visitor the specialist doesn't exist.
          <div role="alert" className="py-24 text-center">
            <p className="mb-2 font-marketing-serif text-2xl">We couldn&apos;t load this profile just now.</p>
            <p className="mb-6 text-sm text-momentizing-muted">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="min-h-12 rounded-full bg-momentizing-teal px-8 py-3 text-sm font-semibold text-white hover:bg-momentizing-slate/90"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !psych && !loadFailed && (
          <div className="py-24 text-center">
            <p className="mb-4 font-marketing-serif text-2xl text-momentizing-muted">Associate not found</p>
            <Link href="/associates" className="text-sm text-momentizing-gold-deep underline">
              Back to all associates
            </Link>
          </div>
        )}

        {psych && (
          <>
            <Link href="/associates" className="mb-8 inline-flex items-center gap-2 text-xs text-momentizing-muted hover:text-momentizing-gold-deep">
              <i className="fas fa-arrow-left" /> All Associates
            </Link>

            {/* minmax(0, 1fr): a bare 1fr track can't shrink below its content's min-width, so the horizontally-scrolling tab strip
                used to stretch the whole page wider than the phone screen. */}
            <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div>
                <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div
                    aria-hidden="true"
                    className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-full bg-momentizing-mint font-marketing-serif text-4xl font-bold text-momentizing-teal"
                  >
                    {initials(psych.name)}
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-bold tracking-[0.3em] text-momentizing-teal uppercase">
                      {psych.specialisation ?? "Specialist"}
                    </span>
                    <div className="mb-2 flex flex-wrap items-center gap-4">
                      <h1 className="font-marketing-serif text-4xl text-momentizing-slate">{psych.name}</h1>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(psych.id)}
                        aria-label={isFavorite(psych.id) ? "Remove from favorites" : "Save to favorites"}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-momentizing-gold/10 transition hover:scale-105"
                      >
                        <i className={isFavorite(psych.id) ? "fas fa-heart text-momentizing-gold-deep" : "far fa-heart text-momentizing-muted"} />
                      </button>
                    </div>
                    <div className="mb-3">
                      <StarRating rating={psych.averageRating} reviewCount={psych.reviewCount} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {psych.yearsExperience != null && <Chip>{psych.yearsExperience} yrs experience</Chip>}
                      <Chip>{PRACTICE_MODE_LABEL[psych.practiceMode] ?? psych.practiceMode}</Chip>
                      {psych.sessionFeeCents != null && (
                        <Chip>{formatSessionFee(psych.sessionFeeCents, psych.sessionFeeCurrency)} / session</Chip>
                      )}
                      {psych.freeFirstSession && <Chip>Free first session</Chip>}
                      {psych.proBonoAvailable && <Chip>Pro-bono slots open</Chip>}
                      {!psych.acceptingNewClients && <Chip>Not accepting new clients</Chip>}
                    </div>
                  </div>
                </div>

                <div role="tablist" aria-label="Profile sections" className="mb-8 flex gap-1 overflow-x-auto border-b border-momentizing-gold/10">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      role="tab"
                      id={`tab-${tab}`}
                      aria-selected={activeTab === tab}
                      tabIndex={activeTab === tab ? 0 : -1}
                      onClick={() => setActiveTab(tab)}
                      onKeyDown={(e) => {
                        // Arrow keys move between tabs (WAI-ARIA tabs pattern).
                        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                        const i = TABS.indexOf(tab);
                        const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
                        setActiveTab(next);
                        document.getElementById(`tab-${next}`)?.focus();
                      }}
                      className={`min-h-11 flex-shrink-0 border-b-2 px-5 py-3 text-xs font-bold tracking-widest uppercase transition focus-visible:outline-2 focus-visible:outline-momentizing-teal ${
                        activeTab === tab
                          ? "border-momentizing-slate text-momentizing-slate"
                          : "border-transparent text-momentizing-muted hover:text-momentizing-slate"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === "About" && (
                  <div className="space-y-6">
                    <p className="text-sm leading-relaxed text-momentizing-muted">
                      {psych.bio ?? "This associate hasn't added a bio yet."}
                    </p>
                    {specialisationTags(psych.specialisation).length > 0 && (
                      <div>
                        <h4 className="mb-3 text-xs font-bold tracking-widest text-momentizing-slate uppercase">
                          Specialties
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {specialisationTags(psych.specialisation).map((tag) => (
                            <Chip key={tag}>{tag}</Chip>
                          ))}
                        </div>
                      </div>
                    )}
                    {languageList(psych.languages).length > 0 && (
                      <div>
                        <h4 className="mb-3 text-xs font-bold tracking-widest text-momentizing-slate uppercase">
                          Languages
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {languageList(psych.languages).map((lang) => (
                            <Chip key={lang}>{lang}</Chip>
                          ))}
                        </div>
                      </div>
                    )}
                    {psych.locations.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-bold tracking-widest text-momentizing-slate uppercase">
                          {psych.locations.length > 1 ? "Locations" : "Location"}
                        </h4>
                        <div className="space-y-3">
                          {psych.locations.map((location) => {
                            const days = formatActiveDays(location.activeDays);
                            return (
                              <p key={location.id} className="text-sm text-momentizing-muted">
                                <i className="fas fa-map-marker-alt mr-2 text-momentizing-gold-deep" />
                                {location.label && <span className="font-semibold text-momentizing-slate">{location.label}: </span>}
                                {location.address}
                                {days && <span className="ml-2 text-xs text-momentizing-gold-deep uppercase">{days}</span>}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "Credentials" && (
                  <div className="space-y-6">
                    {psych.licenceNumber && (
                      <div>
                        <h4 className="mb-2 text-xs font-bold tracking-widest text-momentizing-slate uppercase">
                          License
                        </h4>
                        <p className="text-sm text-momentizing-muted">Licensed practitioner · #{psych.licenceNumber}</p>
                      </div>
                    )}
                    {psych.credentialsSummary && (
                      <div>
                        <h4 className="mb-2 text-xs font-bold tracking-widest text-momentizing-slate uppercase">
                          Credentials &amp; Training
                        </h4>
                        <p className="text-sm leading-relaxed text-momentizing-muted">{psych.credentialsSummary}</p>
                      </div>
                    )}
                    {!psych.licenceNumber && !psych.credentialsSummary && (
                      <p className="text-sm text-momentizing-muted italic">No credentials listed yet.</p>
                    )}
                  </div>
                )}

                {activeTab === "What to Expect" && (
                  <div className="space-y-6">
                    <div className="rounded-2xl bg-momentizing-peach/60 p-6">
                      <h4 className="mb-2 text-xs font-bold tracking-widest text-momentizing-slate uppercase">
                        Session Format
                      </h4>
                      <p className="text-sm leading-relaxed text-momentizing-muted">
                        {psych.sessionFormats || (PRACTICE_MODE_LABEL[psych.practiceMode] ?? psych.practiceMode)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-momentizing-peach/60 p-6">
                      <h4 className="mb-2 text-xs font-bold tracking-widest text-momentizing-slate uppercase">
                        How Contact Works
                      </h4>
                      <p className="text-sm leading-relaxed text-momentizing-muted">
                        {psych.preferredContact === "VIA_ASSISTANT"
                          ? "This specialist coordinates through the Momentizing assistant rather than direct messaging."
                          : "You'll be able to message this specialist directly once you're connected."}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "Reviews" && (
                  <SpecialistReviews
                    specialistId={psych.id}
                    averageRating={psych.averageRating}
                    reviewCount={psych.reviewCount}
                  />
                )}

                {otherAssociates.length > 0 && (
                  <div className="mt-16 border-t border-momentizing-gold/10 pt-10">
                    <h3 className="mb-6 font-marketing-serif text-xl text-momentizing-gold-deep">
                      Other Specialists
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      {otherAssociates.map((a) => (
                        <SpecialistCard key={a.id} specialist={a} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:sticky lg:top-28 lg:self-start">
                <SpecialistBookingPanel
                  specialistId={psych.id}
                  specialistName={psych.name}
                  acceptingNewClients={psych.acceptingNewClients}
                />
              </div>
            </div>
          </>
        )}
      </main>

    </div>
  );
}
