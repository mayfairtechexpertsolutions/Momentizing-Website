"use client";

import Link from "next/link";
import { HeroGlobe } from "@/components/marketing/about/AboutArt";
import { JourneyTimeline } from "@/components/marketing/about/JourneyTimeline";
import { t } from "@/i18n";

// Keys only: the text is read at render time so it follows the chosen language.
const VALUES = ["diversity", "resilience", "caring", "relationship", "trustworthy"];

const GROUPS = [
  { key: "diaspora", icon: "fas fa-globe-asia" },
  { key: "expats", icon: "fas fa-suitcase-rolling" },
  { key: "students", icon: "fas fa-graduation-cap" },
  { key: "couples", icon: "fas fa-heart" },
];

const SUPPORT_DETAIL = ["site.about.support1", "site.about.support2", "site.about.support3"];

const MISSION = ["site.about.mission1", "site.about.mission2", "site.about.mission3"];

const COMMITMENTS = [
  { key: "responsive", icon: "fas fa-leaf" },
  { key: "holistic", icon: "fas fa-heart" },
  { key: "community", icon: "fas fa-users" },
  { key: "inclusive", icon: "fas fa-globe" },
];

export default function AboutPage() {
  return (
    <div className="marketing-root min-h-dvh overflow-x-clip bg-momentizing-cream font-marketing-sans text-momentizing-slate">

      <main id="main">
        <header className="relative isolate mx-auto max-w-7xl px-6 pt-28 pb-20 md:pt-32 md:pb-24">
          <div aria-hidden="true" className="pointer-events-none absolute -top-10 -left-24 -z-10 h-80 w-80 rounded-full bg-momentizing-mint blur-2xl" />
          <div aria-hidden="true" className="pointer-events-none absolute right-0 bottom-0 -z-10 h-72 w-72 rounded-full bg-momentizing-peach blur-2xl" />
          <div className="grid items-center gap-14 md:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h1 className="font-marketing-serif text-4xl leading-[1.12] font-bold text-momentizing-gold-deep sm:text-5xl md:text-6xl">
                {t("site.about.heroTitle")}
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-momentizing-muted">
                {t("site.about.heroBody")}
              </p>
              <ul className="mt-8 flex max-w-xl flex-wrap gap-x-5 gap-y-2 font-marketing-serif text-lg font-semibold text-momentizing-teal">
                {VALUES.map((value) => (
                  <li key={value} className="flex items-center gap-2">
                    <svg viewBox="0 0 12 12" className="h-3 w-3 text-momentizing-gold" aria-hidden="true" focusable="false">
                      <path d="M6 0 C 11 2 11 8 6 12 C 1 8 1 2 6 0 Z" fill="currentColor" />
                    </svg>
                    {t(`site.about.value.${value}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-[3rem] border-8 border-white shadow-2xl shadow-momentizing-teal/15">
              <div className="aspect-[12/11] w-full" role="img" aria-label={t("site.about.heroArt")}>
                <HeroGlobe />
              </div>
            </div>
          </div>
        </header>

        <section aria-labelledby="who-we-support" className="bg-momentizing-mint px-6 py-24">
          <div data-reveal className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 id="who-we-support" className="font-marketing-serif text-3xl leading-tight font-semibold text-momentizing-gold-deep md:text-4xl">
                {t("site.about.whoTitle")}
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-momentizing-muted">
                {t("site.about.supportBody")}
              </p>
              <ul className="mt-8 max-w-md space-y-4 border-l-2 border-momentizing-gold pl-5 leading-relaxed text-momentizing-slate">
                {SUPPORT_DETAIL.map((line) => (
                  <li key={line}>{t(line)}</li>
                ))}
              </ul>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {GROUPS.map((group, i) => (
                <li
                  key={group.key}
                  className={`rounded-3xl bg-white/80 p-6 shadow-[0_8px_30px_rgba(47,62,70,0.06)] ${i % 2 ? "sm:translate-y-6" : ""}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-momentizing-peach text-lg text-momentizing-gold-deep">
                    <i className={group.icon} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-marketing-serif text-xl font-semibold">{t(`site.about.group.${group.key}.title`)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-momentizing-muted">{t(`site.about.group.${group.key}.body`)}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="vision-mission" className="bg-momentizing-peach/60 px-6 py-24">
          <h2 id="vision-mission" className="sr-only">
            {t("site.about.visionMission")}
          </h2>
          <div data-reveal className="mx-auto grid max-w-7xl gap-14 md:grid-cols-2 md:gap-20">
            <div>
              <h3 className="font-marketing-serif text-2xl font-semibold text-momentizing-teal">{t("site.about.visionTitle")}</h3>
              <p className="mt-4 max-w-lg font-marketing-serif text-3xl leading-snug font-semibold text-momentizing-gold-deep md:text-4xl">
                {t("site.about.vision")}
              </p>
            </div>
            <div>
              <h3 className="font-marketing-serif text-2xl font-semibold text-momentizing-teal">{t("site.about.missionTitle")}</h3>
              <ul className="mt-4 max-w-lg divide-y divide-momentizing-gold/40">
                {MISSION.map((line) => (
                  <li key={line} className="flex gap-4 py-4 text-lg leading-relaxed first:pt-0">
                    <svg viewBox="0 0 12 12" className="mt-2.5 h-3 w-3 flex-shrink-0 text-momentizing-teal" aria-hidden="true" focusable="false">
                      <path d="M6 0 C 11 2 11 8 6 12 C 1 8 1 2 6 0 Z" fill="currentColor" />
                    </svg>
                    {t(line)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="journey" aria-labelledby="journey-heading" className="relative overflow-hidden px-6 py-24">
          <div data-reveal className="mx-auto max-w-3xl text-center">
            <h2 id="journey-heading" className="font-marketing-serif text-3xl font-semibold text-momentizing-gold-deep md:text-4xl">
              {t("site.about.journeyTitle")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-momentizing-muted">
              {t("site.about.journeyBody")}
            </p>
          </div>
          <JourneyTimeline />
        </section>

        <section aria-labelledby="commitments" className="on-dark bg-momentizing-slate px-6 py-24 text-white">
          <div data-reveal className="mx-auto max-w-7xl">
            <h2 id="commitments" className="font-marketing-serif text-3xl font-semibold text-momentizing-gold md:text-4xl">
              {t("site.about.commitTitle")}
            </h2>
            <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {COMMITMENTS.map((item) => (
                <li key={item.key} className="border-t border-white/20 pt-6">
                  <i className={`${item.icon} inline-block h-6 w-6 text-xl text-momentizing-gold`} aria-hidden="true" />
                  <h3 className="mt-4 font-marketing-serif text-xl font-semibold">{t(`site.about.commit.${item.key}.title`)}</h3>
                  <p className="mt-2 leading-relaxed text-white/80">{t(`site.about.commit.${item.key}.body`)}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="about-cta" data-reveal className="bg-momentizing-mint px-6 py-24 text-center">
          <h2 id="about-cta" className="font-marketing-serif text-3xl font-semibold text-momentizing-gold-deep md:text-4xl">
            {t("site.about.ctaTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-momentizing-muted">
            {t("site.about.ctaBody")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex min-h-12 items-center rounded-full bg-momentizing-teal px-8 py-3 font-bold text-white shadow-md shadow-momentizing-teal/25 transition hover:bg-momentizing-slate"
            >
              {t("site.nav.bookSession")}
            </Link>
            <Link
              href="/associates"
              className="inline-flex min-h-12 items-center rounded-full border-2 border-momentizing-gold-deep px-8 py-3 font-bold text-momentizing-gold-deep transition hover:bg-momentizing-gold-deep hover:text-white"
            >
              {t("site.nav.findAssociate")}
            </Link>
          </div>
        </section>
      </main>

    </div>
  );
}
