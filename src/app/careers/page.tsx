"use client";

import { CareerForm } from "@/components/marketing/careers/CareerForm";
import { OfflineWhatsAppCard } from "@/components/marketing/OfflineWhatsAppCard";
import { OnlineOnly } from "@/components/marketing/OnlineOnly";
import { t } from "@/i18n";

const STEPS = ["apply", "review", "meet", "join"];

export default function CareersPage() {
  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">
      <main id="main" className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6">
        <p className="text-xs font-bold tracking-widest text-momentizing-muted uppercase">{t("site.nav.careers")}</p>
        <h1 className="font-marketing-serif mt-2 text-4xl leading-tight font-semibold sm:text-5xl">{t("site.careers.title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-momentizing-muted">
          {t("site.careers.intro")}
        </p>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s} className="rounded-3xl border border-momentizing-slate/10 bg-white p-5">
              <span className="text-xs font-bold tracking-widest text-momentizing-muted uppercase">{t("site.careers.stepN", { n: i + 1 })}</span>
              <h2 className="font-marketing-serif mt-1 text-xl font-semibold">{t(`site.careers.step.${s}.title`)}</h2>
              <p className="mt-1 text-sm leading-relaxed text-momentizing-muted">{t(`site.careers.step.${s}.body`)}</p>
            </li>
          ))}
        </ol>

        <section id="apply" aria-labelledby="apply-heading" className="mt-12 scroll-mt-28">
          <h2 id="apply-heading" className="font-marketing-serif text-3xl font-semibold">
            {t("site.careers.applyNow")}
          </h2>
          <div className="mt-6">
            <OnlineOnly
              offline={
                <OfflineWhatsAppCard
                  title={t("site.offline.careersTitle")}
                  body={t("site.offline.careersBody")}
                  message={t("site.offline.careersMessage")}
                />
              }
            >
              <CareerForm />
            </OnlineOnly>
          </div>
        </section>
      </main>
    </div>
  );
}
