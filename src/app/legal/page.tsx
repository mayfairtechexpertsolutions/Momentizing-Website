"use client";

import { useState } from "react";
import { MarketingFonts } from "@/components/marketing/MarketingFonts";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { WhatsAppFloatingButton } from "@/components/marketing/WhatsAppFloatingButton";

type Tab = "faq" | "terms" | "privacy";

const TABS: { id: Tab; label: string }[] = [
  { id: "faq", label: "FAQ" },
  { id: "terms", label: "Terms & Conditions" },
  { id: "privacy", label: "Privacy Policy" },
];

const LEGAL_FAQS = [
  {
    question: "Are sessions confidential?",
    answer:
      "Yes. Confidentiality is the cornerstone of our practice. Information is only shared if there is a legal requirement or an immediate risk of harm to yourself or others.",
  },
];

export default function LegalPage() {
  const [tab, setTab] = useState<Tab>("faq");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-momentizing-cream font-marketing-sans text-momentizing-slate">
      <MarketingFonts />
      <MarketingNav variant="simple" simpleLabel="Back to Site" />

      <header className="bg-white/50 px-6 pt-40 pb-20 text-center">
        <span className="text-xs font-bold tracking-[0.3em] text-momentizing-teal uppercase">
          Governance &amp; Support
        </span>
        <h1 className="mt-4 font-marketing-serif text-5xl text-momentizing-gold-deep">Transparency Hub</h1>
      </header>

      <main className="mx-auto grid max-w-6xl gap-16 px-6 py-20 md:grid-cols-[280px_1fr]">
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
          {tab === "faq" && (
            <section>
              <h2 className="mb-10 font-marketing-serif text-3xl">Frequently Asked Questions</h2>
              <div className="space-y-2">
                {LEGAL_FAQS.map((item, index) => (
                  <div
                    key={item.question}
                    className="overflow-hidden rounded-2xl border border-momentizing-mint-deep bg-white shadow-sm"
                  >
                    <button
                      className="flex w-full items-center justify-between p-6 text-left"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <span className="text-sm font-bold tracking-wider text-momentizing-slate uppercase">
                        {item.question}
                      </span>
                      <i
                        className={`fas fa-plus text-xs text-momentizing-gold-deep transition-transform ${
                          openFaq === index ? "rotate-45" : ""
                        }`}
                      />
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6">
                        <p className="text-sm leading-relaxed text-momentizing-muted">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === "terms" && (
            <section>
              <div className="mb-10 flex items-center justify-between">
                <h2 className="font-marketing-serif text-3xl">Terms &amp; Conditions</h2>
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-momentizing-teal/30 px-4 py-2 text-xs font-bold tracking-widest text-momentizing-teal uppercase transition hover:bg-momentizing-teal hover:text-white"
                >
                  <i className="fas fa-download mr-2" /> Save PDF
                </button>
              </div>
              <div className="prose-custom space-y-6 text-sm leading-relaxed text-momentizing-muted">
                <p className="text-xs tracking-widest text-momentizing-muted uppercase">Effective Date: March 10, 2026</p>
                <div>
                  <h3 className="mb-2 font-marketing-serif text-xl">1. Professional Boundaries</h3>
                  <p>
                    Momentizing provides psychological coaching and therapy. Our associates are licensed
                    professionals in their respective jurisdictions. We do not provide emergency psychiatric
                    services.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-marketing-serif text-xl">2. Billing &amp; Payments</h3>
                  <p>
                    Payments are processed securely via Payoneer. Sessions must be paid in full 24 hours prior to
                    the scheduled &quot;moment&quot; to confirm your specialist&apos;s availability.
                  </p>
                </div>
              </div>
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
                  <i className="fas fa-download mr-2" /> Save PDF
                </button>
              </div>
              <div className="prose-custom space-y-6 text-sm leading-relaxed text-momentizing-muted">
                <div>
                  <h3 className="mb-2 font-marketing-serif text-xl">Data Sovereignty</h3>
                  <p>
                    We respect your &quot;right to be forgotten.&quot; All clinical notes are stored on encrypted
                    servers separate from your billing and contact information to ensure maximum privacy.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <MarketingFooter />
      <WhatsAppFloatingButton />
    </div>
  );
}
