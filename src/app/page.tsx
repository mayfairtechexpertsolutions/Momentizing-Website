"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { appLink } from "@config";
import { JsonLd } from "@/components/marketing/JsonLd";
import { faqPageSchema } from "@/lib/structured-data";
import { BrandIllustration } from "@/components/marketing/BrandIllustration";
import { BookingModal } from "@/components/marketing/BookingModal";
import { MOMENTIZING_WHATSAPP_DISPLAY } from "@/lib/whatsapp-constants";
import { SpecialistCard } from "@/components/marketing/SpecialistCard";
import { UpcomingEventsBand } from "@/components/marketing/UpcomingEventsBand";
import { useMarketingDirectory } from "@/lib/marketing-directory";
import { usePackages } from "@/lib/session-packages";
import { t } from "@/i18n";
import { PackagesSection } from "@/components/marketing/PackagesSection";
import { OnlineOnly } from "@/components/marketing/OnlineOnly";

// Mirrors the "Our service" row on the brand's Instagram artwork.
const OFFERINGS = [
  { labelKey: "site.home.offer.counseling", icon: "fas fa-comments", tone: "bg-momentizing-mint-deep text-momentizing-teal" },
  { labelKey: "site.home.offer.coaching", icon: "fas fa-clipboard-list", tone: "bg-momentizing-peach text-momentizing-gold-deep" },
  { labelKey: "site.home.offer.assessment", icon: "fas fa-spa", tone: "bg-momentizing-mint-deep text-momentizing-teal" },
  { labelKey: "site.home.offer.supportGroup", icon: "fas fa-users", tone: "bg-momentizing-peach text-momentizing-gold-deep" },
];

const FAQ_KEYS = ["choosePackage", "unusedSessions", "global", "timezone", "vetted", "confidential", "cancel", "insurance", "switch", "video", "teams", "crisis", "whatsapp", "quick", "support"];

/** Read at render time so the answers follow the chosen language. */
function faqItems() {
  return FAQ_KEYS.map((k) => ({
    question: t(`site.home.faq.${k}.q`),
    answer: t(`site.home.faq.${k}.a`, { number: MOMENTIZING_WHATSAPP_DISPLAY }),
  }));
}

export default function MarketingHomePage() {
  const router = useRouter();
  const FAQ_ITEMS = faqItems();

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPackageId, setBookingPackageId] = useState<number | undefined>(undefined);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { data: directoryPage, isLoading: directoryLoading, error: directoryError, refetch: refetchDirectory } = useMarketingDirectory(50);
  const associates = directoryPage?.content ?? [];
  // Highest-rated first (no-review associates sort last); review count breaks ties between equal averages.
  const topRatedAssociates = [...associates]
    .sort((a, b) => {
      const ratingDiff = (b.averageRating ?? -1) - (a.averageRating ?? -1);
      return ratingDiff !== 0 ? ratingDiff : b.reviewCount - a.reviewCount;
    })
    .slice(0, 8);
  const { data: packages, isLoading: packagesLoading, error: packagesError, refetch: refetchPackages } = usePackages();

  const openBooking = (packageId?: number) => {
    setBookingPackageId(packageId);
    setBookingOpen(true);
  };

  return (
    <div className="marketing-root bg-momentizing-cream font-marketing-sans text-momentizing-slate">

      <JsonLd data={faqPageSchema(FAQ_ITEMS)} />
      <main id="main">
      <header className="relative mx-auto max-w-7xl px-6 pt-28 pb-20 md:pt-32 md:pb-24">
        <div aria-hidden="true" className="pointer-events-none absolute -top-10 -left-24 -z-10 h-80 w-80 rounded-full bg-momentizing-mint blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute right-0 bottom-0 -z-10 h-72 w-72 rounded-full bg-momentizing-peach blur-2xl" />
        <div className="grid items-center gap-16 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-momentizing-mint px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-momentizing-teal uppercase">
              {t("site.home.eyebrow")}
            </span>
            <h1 className="mt-6 mb-8 font-marketing-serif text-5xl leading-[1.08] font-bold text-momentizing-gold-deep md:text-7xl">
              {t("site.home.heroTitleA")} <span className="text-momentizing-teal">{t("site.home.heroTitleB")}</span>
            </h1>
            <p className="mb-10 max-w-lg text-lg leading-relaxed text-momentizing-muted">
              {t("site.home.heroBody")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/book"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-momentizing-teal px-8 py-4 font-bold text-white shadow-md shadow-momentizing-teal/25 transition hover:bg-momentizing-slate"
              >
                {t("site.nav.bookSession")}
              </Link>
              <a
                href="#packages"
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-momentizing-gold-deep px-8 py-4 font-bold text-momentizing-gold-deep transition hover:bg-momentizing-gold-deep hover:text-white"
              >
                {t("site.home.viewPackages")}
              </a>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[3rem] border-8 border-white shadow-2xl shadow-momentizing-teal/15">
            <div className="aspect-[12/11] w-full" role="img" aria-label={t("site.home.heroArt")}>
              <BrandIllustration variant="care" />
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="what-we-offer" className="bg-momentizing-mint px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 id="what-we-offer" className="mb-8 text-center font-marketing-sans text-xs font-bold tracking-[0.25em] text-momentizing-teal uppercase">
            {t("site.home.supportHeading")}
          </h2>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {OFFERINGS.map((o) => (
              <li key={o.labelKey} className="flex flex-col items-center gap-3 rounded-3xl bg-white/70 px-4 py-6 text-center">
                <span className={`flex h-14 w-14 items-center justify-center rounded-full text-xl ${o.tone}`}>
                  <i className={o.icon} aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-momentizing-slate">{t(o.labelKey)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="services" className="px-6 py-24">
        <div data-reveal className="mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <h2 className="font-marketing-serif text-4xl text-momentizing-gold-deep">{t("site.home.clinicalTitle")}</h2>
            <p className="mt-2 text-xs font-bold tracking-[0.2em] text-momentizing-muted uppercase">
              {t("site.home.clinicalSub")}
            </p>
          </div>
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-momentizing-teal/10 text-momentizing-teal">
                  <i aria-hidden="true" className="fas fa-brain" />
                </div>
                <div>
                  <h3 className="mb-2 font-marketing-sans text-sm font-bold tracking-wider text-momentizing-slate uppercase">
                    {t("site.home.offer.assessment")}
                  </h3>
                  <p className="text-sm leading-relaxed text-momentizing-muted">
                    {t("site.home.assessmentBody")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-momentizing-gold/10 text-momentizing-gold-deep">
                  <i aria-hidden="true" className="fas fa-heart" />
                </div>
                <div>
                  <h3 className="mb-2 font-marketing-sans text-sm font-bold tracking-wider text-momentizing-slate uppercase">
                    {t("site.home.relationshipTitle")}
                  </h3>
                  <p className="text-sm leading-relaxed text-momentizing-muted">
                    {t("site.home.relationshipBody")}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[2.5rem] border border-momentizing-gold/10 bg-white p-10 shadow-xl shadow-momentizing-gold/5">
              <h3 className="mb-6 font-marketing-serif text-2xl">{t("site.home.approachTitle")}</h3>
              <p className="mb-6 text-sm leading-relaxed text-momentizing-muted">
                {t("site.home.approachA")}{" "}
                <strong>{t("site.home.approachStrong")}</strong> {t("site.home.approachB")}
              </p>
              <ul className="space-y-3 text-sm font-bold text-momentizing-teal">
                <li>
                  <i aria-hidden="true" className="fas fa-check mr-2" /> {t("site.home.check1")}
                </li>
                <li>
                  <i aria-hidden="true" className="fas fa-check mr-2" /> {t("site.home.check2")}
                </li>
                <li>
                  <i aria-hidden="true" className="fas fa-check mr-2" /> {t("site.home.check3")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="our-story" className="bg-momentizing-mint px-6 py-20">
        <div data-reveal className="mx-auto flex max-w-5xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 id="our-story" className="font-marketing-serif text-3xl leading-snug font-semibold text-momentizing-gold-deep md:text-4xl">
              {t("site.home.storyTitle")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-momentizing-muted">
              {t("site.home.storyBody")}
            </p>
          </div>
          <Link
            href="/about"
            className="inline-flex min-h-12 flex-shrink-0 items-center rounded-full border-2 border-momentizing-gold-deep px-8 py-3 font-bold text-momentizing-gold-deep transition hover:bg-momentizing-gold-deep hover:text-white"
          >
            {t("site.home.storyCta")}
          </Link>
        </div>
      </section>

      <PackagesSection
        packages={packages}
        loading={packagesLoading}
        error={packagesError}
        onRetry={refetchPackages}
        onEnquire={openBooking}
        onBookSession={() => router.push("/book")}
      />

      <section id="corporate" className="px-6 py-24">
        <div data-reveal className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
          <div className="overflow-hidden rounded-[3rem]">
            <div className="aspect-[12/11] w-full" role="img" aria-label={t("site.home.teamArt")}>
              <BrandIllustration variant="team" />
            </div>
          </div>
          <div>
            <span className="text-xs font-bold tracking-[0.3em] text-momentizing-teal uppercase">
              {t("site.home.forOrgs")}
            </span>
            <h2 className="mt-4 mb-6 font-marketing-serif text-4xl text-momentizing-gold-deep">
              {t("site.home.strategicTitle")}
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-momentizing-muted">
              {t("site.home.corporateA")} <strong>{t("site.home.corporateStrong")}</strong> {t("site.home.corporateB")}
            </p>
            <div className="mb-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-momentizing-peach/60 p-4 text-center">
                <span className="block font-marketing-serif text-xl text-momentizing-gold-deep">{t("site.home.byAppointment")}</span>
                <span className="text-xs tracking-widest uppercase">{t("site.home.scheduledSessions")}</span>
              </div>
              <div className="rounded-2xl bg-momentizing-peach/60 p-4 text-center">
                <span className="block font-marketing-serif text-xl text-momentizing-gold-deep">{t("site.home.custom")}</span>
                <span className="text-xs tracking-widest uppercase">{t("site.home.eapDashboards")}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openBooking()}
              className="min-h-12 w-full rounded-full bg-momentizing-teal px-10 py-4 text-xs font-bold tracking-widest text-white uppercase transition hover:bg-momentizing-slate sm:w-auto"
            >
              {t("site.home.inquireCorporate")}
            </button>
          </div>
        </div>
      </section>

      <section id="associates-preview" className="bg-momentizing-peach/60 px-6 py-24">
        <div data-reveal className="mx-auto max-w-7xl text-center">
          <h2 className="mb-3 font-marketing-serif text-3xl text-momentizing-gold-deep">{t("site.home.topRatedTitle")}</h2>
          <p className="mx-auto mb-8 max-w-lg text-sm text-momentizing-muted">
            {t("site.home.topRatedBody")}
          </p>

          {directoryLoading ? (
            <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4" aria-busy="true">
              <span className="sr-only" role="status">{t("site.home.loadingSpecialists")}</span>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} aria-hidden="true" className={`aspect-[3/5] animate-pulse rounded-3xl bg-white/70 motion-reduce:animate-none ${i === 3 ? "hidden lg:block" : i === 2 ? "hidden sm:block" : ""}`} />
              ))}
            </div>
          ) : directoryError ? (
            <div role="alert" className="mx-auto mb-16 max-w-md rounded-3xl bg-white/70 p-8">
              <p className="font-marketing-serif text-xl text-momentizing-slate">{t("site.home.specialistsError")}</p>
              <p className="mt-2 text-sm text-momentizing-muted">{t("site.common.checkConnection")}</p>
              <button
                type="button"
                onClick={refetchDirectory}
                className="mt-6 min-h-12 rounded-full border-2 border-momentizing-gold-deep px-8 py-3 text-xs font-bold tracking-widest text-momentizing-gold-deep uppercase transition hover:bg-momentizing-gold-deep hover:text-white"
              >
                {t("site.common.tryAgain")}
              </button>
            </div>
          ) : topRatedAssociates.length > 0 ? (
            <div className="mb-16 grid grid-cols-2 gap-4 text-left sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-6">
              {topRatedAssociates.map((associate) => (
                <SpecialistCard key={associate.id} specialist={associate} size="compact" />
              ))}
            </div>
          ) : (
            <p className="mx-auto mb-12 max-w-md text-momentizing-muted">
              {t("site.home.specialistsEmpty")}
            </p>
          )}
          <Link
            href="/associates"
            className="inline-flex min-h-12 items-center rounded-full bg-momentizing-teal px-10 py-4 text-xs font-bold tracking-widest text-white uppercase transition hover:bg-momentizing-slate"
          >
            {t("site.home.viewAllAssociates")} <i aria-hidden="true" className="fas fa-arrow-right ml-3" />
          </Link>
        </div>
      </section>

      <UpcomingEventsBand />

      <section id="faq" className="px-6 py-24">
        <div data-reveal className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center font-marketing-serif text-3xl text-momentizing-gold-deep">
            {t("site.home.faqTitle")}
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div key={item.question} className="overflow-hidden rounded-2xl border border-momentizing-mint-deep">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-panel-${index}`}
                  id={`faq-button-${index}`}
                  className="flex min-h-14 w-full items-center justify-between gap-4 bg-white p-6 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-momentizing-teal"
                >
                  <span className="text-base font-bold text-momentizing-slate">{item.question}</span>
                  <i
                    aria-hidden="true"
                    className={`fas fa-plus flex-shrink-0 text-momentizing-gold-deep transition-transform ${
                      openFaq === index ? "rotate-45" : ""
                    }`}
                  />
                </button>
                {/* Always in the HTML (collapsed with `hidden`) so crawlers and AI answer engines can read every answer. */}
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-button-${index}`}
                  hidden={openFaq !== index}
                  className="bg-white px-6 pb-8 text-base leading-relaxed text-momentizing-muted"
                >
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OnlineOnly>
        <section className="border-t border-momentizing-gold/10 bg-white px-6 py-20 text-center">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
            <h2 className="font-marketing-serif text-2xl text-momentizing-slate">
              {t("site.home.alreadyTitle")}
            </h2>
            <p className="text-sm text-momentizing-muted">
              {t("site.home.alreadyBody")}
            </p>
            <div className="mt-2 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <a
                href={appLink("/register")}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-momentizing-gold-deep px-8 py-4 text-xs font-bold tracking-widest text-white uppercase transition hover:bg-momentizing-slate"
              >
                {t("site.home.createAccount")}
              </a>
              <a
                href={appLink("/login")}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-momentizing-slate px-8 py-4 text-xs font-bold tracking-widest text-momentizing-slate uppercase transition hover:bg-momentizing-slate hover:text-white"
              >
                {t("site.home.login")}
              </a>
            </div>
            <a href={appLink("/register/specialist")} className="mt-2 inline-flex min-h-11 items-center text-sm text-momentizing-muted underline">
              {t("site.home.registerPractice")}
            </a>
          </div>
        </section>
      </OnlineOnly>
      </main>


      <BookingModal open={bookingOpen} initialPackageId={bookingPackageId} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
