"use client";

import { useSyncExternalStore } from "react";
import { PrivacyDocument, TermsDocument } from "@/components/marketing/legal/LegalDocuments";

type Tab = "terms" | "privacy";

// The active tab lives in the URL hash so /legal/#terms and /legal/#privacy can be linked to (booking form, footer).
const subscribeToHash = (notify: () => void) => {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
};
const readHash = () => window.location.hash.slice(1);

const TABS: { id: Tab; label: string }[] = [
  { id: "terms", label: "Terms & Conditions" },
  { id: "privacy", label: "Privacy Policy" },
];

export default function LegalPage() {
  const hash = useSyncExternalStore(subscribeToHash, readHash, () => "");
  const tab: Tab = hash === "privacy" ? "privacy" : "terms";
  const setTab = (next: Tab) => {
    history.pushState(null, "", `#${next}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">

      <header className="bg-white/50 px-6 pt-40 pb-20 text-center">
        <span className="text-xs font-bold tracking-[0.3em] text-momentizing-teal uppercase">
          Governance &amp; Support
        </span>
        <h1 className="mt-4 font-marketing-serif text-5xl text-momentizing-gold-deep">Transparency Hub</h1>
      </header>

      <main id="main" className="mx-auto grid max-w-6xl gap-16 px-6 py-20 md:grid-cols-[280px_1fr]">
        <aside className="hidden h-fit md:sticky md:top-32 md:block">
          <div className="space-y-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`block w-full rounded-xl px-4 py-3 text-left text-xs font-bold tracking-widest uppercase transition ${
                  tab === t.id
                    ? "bg-momentizing-gold-deep text-white"
                    : "text-momentizing-muted hover:bg-momentizing-gold/5"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-momentizing-gold/10 bg-momentizing-gold/5 p-6">
            <p className="mb-3 text-xs font-bold tracking-widest text-momentizing-gold-deep uppercase">
              Direct Support
            </p>
            <p className="mb-4 text-xs leading-relaxed text-momentizing-muted">
              Questions about your data or a specific policy?
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
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase ${
                  tab === t.id ? "bg-momentizing-gold-deep text-white" : "bg-momentizing-cream text-momentizing-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          {tab === "terms" && (
            <section>
              <div className="mb-10 flex items-center justify-between">
                <h2 className="font-marketing-serif text-3xl">Terms &amp; Conditions</h2>
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-momentizing-teal/30 px-4 py-2 text-xs font-bold tracking-widest text-momentizing-teal uppercase transition hover:bg-momentizing-teal hover:text-white"
                >
                  <i aria-hidden="true" className="fas fa-download mr-2" /> Save PDF
                </button>
              </div>
              <TermsDocument />
            </section>
          )}

          {tab === "privacy" && (
            <section>
              <div className="mb-10 flex items-center justify-between">
                <h2 className="font-marketing-serif text-3xl">Privacy Policy</h2>
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-momentizing-teal/30 px-4 py-2 text-xs font-bold tracking-widest text-momentizing-teal uppercase transition hover:bg-momentizing-teal hover:text-white"
                >
                  <i aria-hidden="true" className="fas fa-download mr-2" /> Save PDF
                </button>
              </div>
              <PrivacyDocument />
            </section>
          )}
        </div>
      </main>

    </div>
  );
}
