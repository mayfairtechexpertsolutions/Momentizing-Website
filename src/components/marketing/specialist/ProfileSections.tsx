"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { todayIso } from "@/lib/local-date";
import { describeWorkingHours, expertZoneLabel, getFallbackSpecialist, isFallbackSpecialistId } from "@/lib/fallback-specialists";
import {
  practiceModeLabel,
  formatActiveDays,
  languageList,
  specialisationTags,
  type MarketingSpecialist,
} from "@/lib/marketing-directory";
import { t } from "@/i18n";

/** White card with a serif heading and a mint icon badge — the one container every profile section shares. */
export function SectionCard({ id, icon, title, children }: { id: string; icon: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-12 rounded-3xl border border-momentizing-slate/10 bg-white p-6 focus:outline-none shadow-[0_8px_30px_rgba(47,62,70,0.06)] sm:p-8"
    >
      <div className="mb-5 flex items-center gap-3">
        <span aria-hidden="true" className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-momentizing-mint text-momentizing-teal">
          <i aria-hidden="true" className={`fas ${icon}`} />
        </span>
        <h2 id={`${id}-title`} className="font-marketing-serif text-2xl font-bold text-momentizing-gold-deep">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-xs font-bold tracking-[0.18em] text-momentizing-muted uppercase">{children}</h3>;
}

function FitChip({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full bg-momentizing-cream px-3.5 py-1.5 text-sm font-semibold text-momentizing-slate ring-1 ring-momentizing-slate/10">
      <i aria-hidden="true" className={`fas ${icon} text-xs text-momentizing-teal`} />
      {children}
    </li>
  );
}

/** Closing nudge after the last section: a visitor who read to the end is ready, so the next step is right there. */
export function ClosingCta({ specialist: p, fee }: { specialist: MarketingSpecialist; fee: string | null }) {
  const first = p.name.split(" ")[0];
  if (!p.acceptingNewClients) return null;
  return (
    <section aria-labelledby="closing-title" className="relative overflow-hidden rounded-3xl bg-momentizing-teal p-8 text-center text-white shadow-xl shadow-momentizing-teal/20 sm:p-10">
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5" />
      <h2 id="closing-title" className="relative font-marketing-serif text-2xl font-bold sm:text-3xl">
        {t("site.spec.readyToMeet", { name: first })}
      </h2>
      <p className="relative mx-auto mt-3 max-w-md text-base leading-relaxed text-white/85">
        {p.freeFirstSession ? t("site.spec.closingFree") : fee ? t("site.spec.closingFee", { fee }) : t("site.spec.closing")}
      </p>
      <a
        href={`#book`}
        className="relative mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-bold text-momentizing-teal transition hover:bg-momentizing-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none lg:hidden"
      >
        <i aria-hidden="true" className="far fa-calendar-check" /> {t("site.spec.seeBooking")}
      </a>
      <Link
        href={`/book?specialist=${p.id}`}
        className="relative mt-6 hidden min-h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-bold text-momentizing-teal transition hover:bg-momentizing-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none lg:inline-flex"
      >
        <i aria-hidden="true" className="far fa-calendar-check" /> {isFallbackSpecialistId(p.id) ? t("site.fallback.requestTime") : t("site.spec.chooseTime")}
      </Link>
    </section>
  );
}

/** Bios longer than this are folded so the sections below stay in reach; the full text is one tap away. */
const BIO_FOLD = 600;

export function AboutSection({ specialist: p }: { specialist: MarketingSpecialist }) {
  const tags = specialisationTags(p.specialisation);
  const first = p.name.split(" ")[0];
  const langs = languageList(p.languages);
  const bio = p.bio?.trim() ?? "";
  const long = bio.length > BIO_FOLD;
  const [expanded, setExpanded] = useState(false);

  return (
    <SectionCard id="about" icon="fa-leaf" title={t("site.spec.aboutName", { name: first })}>
      {bio ? (
        <>
          <div className="relative">
            <p
              id="about-bio"
              className={`text-base leading-relaxed whitespace-pre-line text-momentizing-slate/90 ${
                long && !expanded ? "line-clamp-[8]" : ""
              }`}
            >
              {bio}
            </p>
            {long && !expanded && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
            )}
          </div>
          {long && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls="about-bio"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-momentizing-teal underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-momentizing-teal"
            >
              {expanded ? t("site.spec.showLess") : t("site.spec.readMore", { name: first })}
              <i aria-hidden="true" className={`fas fa-chevron-${expanded ? "up" : "down"} text-xs`} />
            </button>
          )}
        </>
      ) : (
        <p className="rounded-2xl bg-momentizing-peach/60 p-4 text-base leading-relaxed text-momentizing-muted">
          {t("site.spec.noBio", { name: first })}
        </p>
      )}

      {(p.acceptsIndividual || p.acceptsCouple || langs.length > 0) && (
        <div className="mt-6 border-t border-momentizing-slate/10 pt-6">
          <SubHeading>{t("site.spec.goodFit")}</SubHeading>
          <ul className="flex flex-wrap gap-2">
            {p.acceptsIndividual && <FitChip icon="fa-user">{t("site.spec.fitIndividual")}</FitChip>}
            {p.acceptsCouple && <FitChip icon="fa-user-friends">{t("site.spec.fitCouple")}</FitChip>}
            {langs.map((l) => (
              <FitChip key={l} icon="fa-comment-dots">
                {t("site.spec.fitLanguage", { language: l })}
              </FitChip>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-6">
          <SubHeading>{t("site.spec.specialties")}</SubHeading>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag} className="rounded-full bg-momentizing-mint px-3.5 py-1.5 text-sm font-bold text-momentizing-teal">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}

export function ExpectSection({ specialist: p }: { specialist: MarketingSpecialist }) {
  const first = p.name.split(" ")[0];
  const format = p.sessionFormats?.trim() || (practiceModeLabel(p.practiceMode) ?? p.practiceMode);
  const requestOnly = isFallbackSpecialistId(p.id);
  const steps = [
    requestOnly
      ? { icon: "far fa-calendar-check", title: t("site.fallback.requestTime"), body: t("site.fallback.step1", { name: first }) }
      : { icon: "far fa-calendar-check", title: t("site.spec.chooseTime"), body: t("site.spec.step1", { name: first }) },
    requestOnly
      ? { icon: "fab fa-whatsapp", title: t("site.fallback.sendOnWa"), body: t("site.fallback.step2") }
      : { icon: "fab fa-whatsapp", title: t("site.spec.confirmOnWa"), body: t("site.spec.step2") },
    { icon: "fas fa-seedling", title: t("site.spec.meetName", { name: first }), body: t("site.spec.step3", { format: format.replace(/\.$/, "") }) },
  ];

  return (
    <SectionCard id="expect" icon="fa-hands-helping" title={t("site.spec.expect")}>
      <ol className="relative grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="relative rounded-2xl bg-momentizing-peach/60 p-5">
            <div className="mb-3 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-momentizing-teal font-marketing-serif text-sm font-bold text-white"
              >
                {i + 1}
              </span>
              <i aria-hidden="true" className={`${s.icon} text-lg text-momentizing-gold-deep`} />
            </div>
            <h3 className="mb-1 font-marketing-serif text-lg font-bold text-momentizing-slate">{s.title}</h3>
            <p className="text-sm leading-relaxed text-momentizing-muted">{s.body}</p>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute top-1/2 -right-3.5 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs text-momentizing-teal shadow-md md:flex"
              >
                <i aria-hidden="true" className="fas fa-chevron-right" />
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-5 flex items-start gap-3 rounded-2xl bg-momentizing-mint/60 p-4 text-sm leading-relaxed text-momentizing-slate">
        <i aria-hidden="true" className="fas fa-comments mt-0.5 text-momentizing-teal" />
        {requestOnly
          ? t("site.fallback.contact", { name: first })
          : p.preferredContact === "VIA_ASSISTANT"
            ? t("site.spec.viaAssistant", { name: first })
            : t("site.spec.direct", { name: first })}
      </p>
    </SectionCard>
  );
}

export function LocationSection({ specialist: p }: { specialist: MarketingSpecialist }) {
  if (p.locations.length === 0) return null;
  // Primary location first, so the place they're most often at leads.
  const locations = [...p.locations].sort((a, b) => Number(b.primary) - Number(a.primary));
  return (
    <SectionCard id="where" icon="fa-map-marker-alt" title={p.locations.length > 1 ? t("site.spec.locationsTitle") : t("site.spec.location")}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {locations.map((l) => {
          const days = formatActiveDays(l.activeDays);
          return (
            <li key={l.id} className="flex items-start gap-3 rounded-2xl bg-momentizing-cream p-4 ring-1 ring-momentizing-slate/5">
              <span aria-hidden="true" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-momentizing-teal shadow-sm">
                <i aria-hidden="true" className="fas fa-map-marker-alt" />
              </span>
              <div className="min-w-0 text-base">
                <p className="flex flex-wrap items-center gap-2">
                  {l.label && <span className="font-bold text-momentizing-slate">{l.label}</span>}
                  {l.primary && p.locations.length > 1 && (
                    <span className="rounded-full bg-momentizing-mint px-2 py-0.5 text-xs font-bold text-momentizing-teal">{t("site.spec.main")}</span>
                  )}
                </p>
                <p className="text-momentizing-muted">{l.address}</p>
                {days && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-momentizing-gold-deep uppercase">
                    <i aria-hidden="true" className="far fa-calendar" /> {days}
                  </p>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex min-h-11 items-center gap-1.5 text-sm font-bold text-momentizing-teal underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-momentizing-teal"
                >
                  <i aria-hidden="true" className="fas fa-directions" /> {t("site.spec.directions")}
                  <span className="sr-only"> {t("site.spec.directionsTo", { place: l.label ?? l.address })}</span>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
      {p.practiceMode === "HYBRID" && (
        <p className="mt-4 flex items-center gap-2 text-sm text-momentizing-muted">
          <i aria-hidden="true" className="fas fa-video text-momentizing-teal" />
          {t("site.spec.alsoOnline")}
        </p>
      )}
    </SectionCard>
  );
}

export function CredentialsSection({ specialist: p }: { specialist: MarketingSpecialist }) {
  // Nothing to say → no section, rather than an apologetic empty card.
  const lines = (p.credentialsSummary ?? "")
    .split(/\n+/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  if (!p.licenceNumber && lines.length === 0) return null;
  return (
    <SectionCard id="credentials" icon="fa-certificate" title={t("site.spec.credentialsTitle")}>
      <div className="space-y-5">
        {p.licenceNumber && (
          <div className="flex items-center gap-4 rounded-2xl bg-momentizing-mint p-4">
            <span aria-hidden="true" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white text-lg text-momentizing-teal shadow-sm">
              <i aria-hidden="true" className="fas fa-shield-alt" />
            </span>
            <p className="text-sm leading-relaxed text-momentizing-slate">
              <span className="block font-bold">{t("site.spec.licensed")}</span>
              {t("site.spec.licenceOnFile")} · <span className="whitespace-nowrap">{p.licenceNumber}</span>
            </p>
          </div>
        )}
        {lines.length > 0 && (
          <ul className="space-y-3">
            {lines.map((l) => (
              <li key={l} className="flex items-start gap-3 text-base leading-relaxed text-momentizing-slate/90">
                <i aria-hidden="true" className="fas fa-graduation-cap mt-1 w-5 flex-shrink-0 text-momentizing-gold-deep" />
                {l}
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}

/** Posted working hours for a built-in profile (the live site shows real open times instead). */
export function WorkingHoursSection({ specialist: p }: { specialist: MarketingSpecialist }) {
  const fallback = getFallbackSpecialist(p.id);
  const windows = fallback ? describeWorkingHours(fallback) : [];
  if (windows.length === 0) return null;
  return (
    <SectionCard id="hours" icon="fa-clock" title={t("site.fallback.workingHours", { zone: expertZoneLabel(fallback?.timeZone ?? "UTC", todayIso()) })}>
      <ul className="space-y-2 text-base text-momentizing-slate/90">
        {windows.map((w) => (
          <li key={w} className="flex items-start gap-3">
            <i aria-hidden="true" className="far fa-calendar mt-1 w-5 flex-shrink-0 text-momentizing-gold-deep" />
            {w}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
