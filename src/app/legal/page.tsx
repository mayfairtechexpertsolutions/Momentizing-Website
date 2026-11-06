"use client";

import { useSyncExternalStore } from "react";
import { PrivacyDocument, TermsDocument } from "@/components/marketing/legal/LegalDocuments";
import { PrivacyDocumentId, TermsDocumentId } from "@/components/marketing/legal/LegalDocumentsId";
import { t, useLocale } from "@/i18n";

type Tab = "terms" | "privacy";

// The active tab lives in the URL hash so /legal/#terms and /legal/#privacy can be linked to (booking form, footer).
const subscribeToHash = (notify: () => void) => {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
};
const readHash = () => window.location.hash.slice(1);

const TABS: { id: Tab; label: string }[] = [
  { id: "terms", label: "site.legal.terms" },
  { id: "privacy", label: "site.legal.privacy" },
];

/** Shown above the Indonesian documents until a lawyer has reviewed the translation (Terms §17: English governs). */
function TranslationNotice() {
  return (
    <p role="note" className="mb-8 rounded-2xl border border-momentizing-gold/20 bg-momentizing-peach/60 p-4 text-sm leading-relaxed text-momentizing-slate">
      {t("site.legal.translationNotice")}
    </p>
  );
}

export default function LegalPage() {
  const hash = useSyncExternalStore(subscribeToHash, readHash, () => "");
  const indonesian = useLocale() === "id";
  const tab: Tab = hash === "privacy" ? "privacy" : "terms";
  const setTab = (next: Tab) => {
    history.pushState(null, "", `#${next}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">

      <header className="bg-white/50 px-6 pt-32 pb-20 text-center">
        <span className="text-xs font-bold tracking-[0.3em] text-momentizing-teal uppercase">
          {t("site.legal.eyebrow")}
        </span>
        <h1 className="mt-4 font-marketing-serif text-5xl text-momentizing-gold-deep">{t("site.legal.title")}</h1>
      </header>

      <main id="main" className="mx-auto grid max-w-6xl gap-16 px-6 py-20 md:grid-cols-[280px_1fr]">
        <aside className="hidden h-fit md:sticky md:top-32 md:block">
          <div className="space-y-2">
            {TABS.map((item) => (
              <button
                key={item.id}
                aria-pressed={tab === item.id}
                onClick={() => {
                  setTab(item.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`block w-full rounded-xl px-4 py-3 text-left text-xs font-bold tracking-widest uppercase transition ${
                  tab === item.id
                    ? "bg-momentizing-gold-deep text-white"
                    : "text-momentizing-muted hover:bg-momentizing-gold/5"
                }`}
              >
                {t(item.label)}
              </button>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-momentizing-gold/10 bg-momentizing-gold/5 p-6">
            <p className="mb-3 text-xs font-bold tracking-widest text-momentizing-gold-deep uppercase">
              {t("site.legal.support")}
            </p>
            <p className="mb-4 text-xs leading-relaxed text-momentizing-muted">
              {t("site.legal.supportBody")}
            </p>
            <a
              href="mailto:legal@momentizing.com"
              className="text-xs font-bold text-momentizing-slate underline transition hover:text-momentizing-gold-deep"
            >
              legal@momentizing.com
            </a>
          </div>
        </aside>

        <div className="md:hidden">
          <div className="mb-8 flex gap-2 overflow-x-auto">
            {TABS.map((item) => (
              <button
                key={item.id}
                aria-pressed={tab === item.id}
                onClick={() => setTab(item.id)}
                className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase ${
                  tab === item.id ? "bg-momentizing-gold-deep text-white" : "bg-momentizing-cream text-momentizing-muted"
                }`}
              >
                {t(item.label)}
              </button>
            ))}
          </div>
        </div>

        <div>
          {tab === "terms" && (
            <section>
              <div className="mb-10 flex items-center justify-between">
                <h2 className="font-marketing-serif text-3xl">{t("site.legal.terms")}</h2>
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-momentizing-teal/30 px-4 py-2 text-xs font-bold tracking-widest text-momentizing-teal uppercase transition hover:bg-momentizing-teal hover:text-white"
                >
                  <i aria-hidden="true" className="fas fa-download mr-2" /> {t("site.legal.savePdf")}
                </button>
              </div>
              {indonesian && <TranslationNotice />}
              {indonesian ? <TermsDocumentId /> : <TermsDocument />}
            </section>
          )}

          {tab === "privacy" && (
            <section>
              <div className="mb-10 flex items-center justify-between">
                <h2 className="font-marketing-serif text-3xl">{t("site.legal.privacy")}</h2>
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-momentizing-teal/30 px-4 py-2 text-xs font-bold tracking-widest text-momentizing-teal uppercase transition hover:bg-momentizing-teal hover:text-white"
                >
                  <i aria-hidden="true" className="fas fa-download mr-2" /> {t("site.legal.savePdf")}
                </button>
              </div>
              {indonesian && <TranslationNotice />}
              {indonesian ? <PrivacyDocumentId /> : <PrivacyDocument />}
            </section>
          )}
        </div>
      </main>

    </div>
  );
}
