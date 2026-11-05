"use client";

import { useState } from "react";
import { t } from "@/i18n";
import {
  formatPackageAmount,
  packageGroup,
  packageUnit,
  type PackageGroup,
  type SessionPackage,
} from "@/lib/session-packages";

const GROUPS: PackageGroup[] = ["individual", "couple", "assessment"];

interface Props {
  packages: SessionPackage[] | null | undefined;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  /** Opens the enquiry modal, optionally for one package. */
  onEnquire: (packageId?: number) => void;
  /** Single sessions go straight to the booking page. */
  onBookSession: () => void;
}

/**
 * The home page's Care Packages band. Same cards for the live catalog and the built-in fallback; packages are grouped
 * (Individual / Couples / Assessments) behind pill tabs when more than one group exists, and every price reads
 * "Start from …" because the final fee depends on the specialist.
 */
export function PackagesSection({ packages, loading, error, onRetry, onEnquire, onBookSession }: Props) {
  const list = packages ?? [];
  const available = GROUPS.filter((g) => list.some((p) => packageGroup(p) === g));
  const [picked, setPicked] = useState<PackageGroup>("individual");
  const group = available.includes(picked) ? picked : available[0];
  const shown = available.length > 1 ? list.filter((p) => packageGroup(p) === group) : list;

  return (
    <section id="packages" className="on-dark relative overflow-hidden bg-momentizing-slate px-6 py-24 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-momentizing-teal/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-momentizing-gold/10 blur-3xl" />
      <div data-reveal className="relative mx-auto max-w-6xl text-center">
        <h2 className="font-marketing-serif text-4xl text-momentizing-gold md:text-5xl">{t("site.home.packagesTitle")}</h2>
        <p className="mx-auto mt-4 mb-10 max-w-xl text-white/85">{t("site.home.packagesSubtitle")}</p>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
            <span className="sr-only" role="status">{t("site.home.loadingPackages")}</span>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} aria-hidden="true" className="h-80 animate-pulse rounded-3xl bg-white/10 motion-reduce:animate-none" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="mx-auto max-w-md rounded-3xl border border-white/20 bg-white/5 p-8">
            <p className="mb-6 text-white/85">{t("site.home.packagesError")}</p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onRetry}
                className="min-h-12 rounded-full border border-white/40 px-8 py-3 text-xs font-bold tracking-widest text-white uppercase transition hover:bg-white hover:text-momentizing-slate"
              >
                {t("site.common.tryAgain")}
              </button>
              <button
                type="button"
                onClick={() => onEnquire()}
                className="min-h-12 rounded-full bg-momentizing-gold-deep px-8 py-3 text-xs font-bold tracking-widest text-white uppercase transition hover:bg-white hover:text-momentizing-gold-deep"
              >
                {t("site.home.talkToTeam")}
              </button>
            </div>
          </div>
        ) : list.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-white/20 bg-white/5 p-8">
            <p className="mb-6 text-sm text-white/85">{t("site.home.packagesEmpty")}</p>
            <button
              type="button"
              onClick={() => onEnquire()}
              className="min-h-12 rounded-full bg-momentizing-gold-deep px-10 py-4 text-xs font-bold tracking-widest text-white uppercase shadow-lg shadow-momentizing-gold/20 transition hover:bg-white hover:text-momentizing-gold-deep"
            >
              {t("site.home.talkToTeam")}
            </button>
          </div>
        ) : (
          <>
            {available.length > 1 && (
              <div role="group" aria-label={t("site.pkg.groupsLabel")} className="mx-auto mb-12 inline-flex max-w-full flex-wrap justify-center gap-1 rounded-full bg-white/10 p-1 sm:p-1.5">
                {available.map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={g === group}
                    onClick={() => setPicked(g)}
                    className={`min-h-11 rounded-full px-3 py-2 text-xs font-bold tracking-wider uppercase sm:px-6 sm:tracking-widest transition ${
                      g === group ? "bg-momentizing-cream text-momentizing-slate shadow" : "text-white/85 hover:bg-white/15"
                    }`}
                  >
                    {t(`site.pkg.group.${g}`)}
                  </button>
                ))}
              </div>
            )}
            <ul className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4 lg:[&:has(>li:nth-child(3):last-child)]:grid-cols-3 lg:[&:has(>li:nth-child(2):last-child)]:mx-auto lg:[&:has(>li:nth-child(2):last-child)]:max-w-3xl lg:[&:has(>li:nth-child(2):last-child)]:grid-cols-2">
              {shown.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} onEnquire={onEnquire} onBookSession={onBookSession} />
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

function PackageCard({ pkg, onEnquire, onBookSession }: { pkg: SessionPackage; onEnquire: Props["onEnquire"]; onBookSession: Props["onBookSession"] }) {
  const popular = Boolean(pkg.badgeLabel);
  const assessment = packageGroup(pkg) === "assessment";
  const single = pkg.sessionCount === 1 && !assessment;
  const unit = packageUnit(pkg);
  const sessionDots = Math.min(pkg.sessionCount, 5);

  return (
    <li
      className={`marketing-card relative flex flex-col rounded-3xl bg-momentizing-cream p-7 text-momentizing-slate ${
        popular ? "shadow-2xl ring-2 ring-momentizing-gold" : "shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
      }`}
    >
      {popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-momentizing-gold-deep px-4 py-1 text-xs font-bold tracking-widest whitespace-nowrap text-white uppercase">
          {pkg.badgeLabel}
        </span>
      )}

      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-momentizing-mint px-3 whitespace-nowrap py-1 text-xs font-bold text-momentizing-teal">
          {assessment ? (
            <>
              <i aria-hidden="true" className="fas fa-clipboard-list" />
              {t("site.pkg.assessmentTag")}
            </>
          ) : (
            <>
              <span aria-hidden="true" className="flex gap-1">
                {Array.from({ length: sessionDots }, (_, i) => (
                  <span key={i} className="size-2 rounded-full bg-momentizing-teal" />
                ))}
              </span>
              {t("site.pkg.sessionsMeta", { n: pkg.sessionCount })}
            </>
          )}
        </span>
      </div>

      <h3 className="font-marketing-serif text-2xl text-momentizing-gold-deep">{pkg.name}</h3>

      <p className="mt-5 text-xs font-bold tracking-widest text-momentizing-muted uppercase">{t("site.pkg.startFrom")}</p>
      <p className="mt-1 font-marketing-serif text-3xl leading-tight whitespace-nowrap">{formatPackageAmount(pkg)}</p>
      <p className="mt-1 min-h-5 text-sm font-semibold text-momentizing-muted">{unit}</p>

      {pkg.description && <p className="mt-3 mb-7 flex-1 text-sm leading-relaxed text-momentizing-muted">{pkg.description}</p>}
      {!pkg.description && <div className="flex-1" />}

      <button
        type="button"
        onClick={() => (single ? onBookSession() : onEnquire(pkg.id))}
        className={`min-h-12 w-full rounded-full px-6 py-3 text-xs font-bold tracking-widest uppercase transition ${
          popular
            ? "bg-momentizing-gold-deep text-white shadow-lg shadow-momentizing-gold/20 hover:bg-momentizing-slate"
            : "bg-momentizing-teal text-white hover:bg-momentizing-slate"
        }`}
      >
        {single ? t("site.nav.bookSession") : t("site.home.askPackage")}
      </button>
    </li>
  );
}
