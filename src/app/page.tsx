"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { appLink } from "@config";
import { JsonLd } from "@/components/marketing/JsonLd";
import { faqPageSchema } from "@/lib/structured-data";
import { BrandIllustration } from "@/components/marketing/BrandIllustration";
import { BookingModal } from "@/components/marketing/BookingModal";
import { MOMENTIZING_WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { SpecialistCard } from "@/components/marketing/SpecialistCard";
import { useMarketingDirectory, specialisationTags } from "@/lib/marketing-directory";
import { usePackages, formatPackagePrice } from "@/lib/session-packages";

// Mirrors the "Our service" row on the brand's Instagram artwork.
const OFFERINGS = [
  { label: "Counseling", icon: "fas fa-comments", tone: "bg-momentizing-mint-deep text-momentizing-teal" },
  { label: "Coaching", icon: "fas fa-clipboard-list", tone: "bg-momentizing-peach text-momentizing-gold-deep" },
  { label: "Psychological Assessment", icon: "fas fa-spa", tone: "bg-momentizing-mint-deep text-momentizing-teal" },
  { label: "Support Group Facilitation", icon: "fas fa-users", tone: "bg-momentizing-peach text-momentizing-gold-deep" },
];

const FAQ_ITEMS = [
  {
    question: "How do I choose the right package?",
    answer:
      "Most clients begin with a single session for an intake assessment. If you're planning on long-term support, the 5 or 10 session packages offer significant cost reductions and priority scheduling.",
  },
  {
    question: "What happens if I don't use all the sessions in my package?",
    answer:
      "Package sessions don't expire on a rigid schedule — you and your specialist set the cadence together. If your circumstances change, reach out via your account or WhatsApp and our team will help you adjust.",
  },
  {
    question: "Are these services global?",
    answer:
      "Yes. We specialize in the diaspora. All sessions are conducted via secure, HIPAA-compliant video conferencing accessible from anywhere in the world.",
  },
  {
    question: "What timezone are sessions scheduled in?",
    answer:
      "You pick a time in your own local timezone when booking — the system handles the conversion with your specialist automatically. We have associates across multiple time zones so early-morning and late-evening slots are usually available.",
  },
  {
    question: "How are Momentizing specialists vetted?",
    answer:
      "Every associate submits their licence number and credentials during registration, and our team verifies them before the profile is approved and made visible in the directory. Unapproved or rejected applicants are never shown to clients.",
  },
  {
    question: "Is my information confidential?",
    answer:
      "Yes. Sessions, journal entries, and messages are private between you and your specialist. We never share your personal health information with third parties without your consent, except where required by law.",
  },
  {
    question: "What if I need to cancel or reschedule a session?",
    answer:
      "You can cancel or reschedule directly from your bookings page. We ask for as much notice as possible so your specialist's time can be offered to someone else — check your confirmation for the specific notice window.",
  },
  {
    question: "Do you accept insurance, or provide receipts?",
    answer:
      "We don't bill insurance directly today, but every completed session generates a receipt you can submit to your insurer or employer for reimbursement, available from your account.",
  },
  {
    question: "Can I switch specialists if it's not the right fit?",
    answer:
      "Absolutely — fit matters more than momentum. Message our support team or use \"Match me instead\" from your account and we'll connect you with someone new, no awkward conversation required.",
  },
  {
    question: "What do I need for a video session?",
    answer:
      "Just a stable internet connection and a device with a camera and microphone — laptop, tablet, or phone all work. We'll send a secure video link ahead of your appointment; no extra software to install.",
  },
  {
    question: "Do you offer support for organizations and teams?",
    answer:
      "Yes — we provide Mental Health First Aid training, EAP frameworks, and burnout-prevention workshops for distributed teams. Use \"Inquire for Corporate\" below or reach out via WhatsApp to start the conversation.",
  },
  {
    question: "Is Momentizing a crisis or emergency service?",
    answer:
      "No — Momentizing is not equipped for emergencies or immediate crisis intervention. If you're in danger or need urgent support, please contact local emergency services or visit our Crisis Resources page, available anytime without an account.",
  },
  {
    question: "Can I book a session via WhatsApp instead of the website?",
    answer:
      `Yes. Tap the WhatsApp icon in the navigation or footer to chat directly with our team on ${MOMENTIZING_WHATSAPP_DISPLAY}. When you book on the website you'll also confirm your booking on WhatsApp, so both routes end up in the same place.`,
  },
  {
    question: "How quickly will I be confirmed?",
    answer:
      "Straight away. Choose a real open time on the website, then confirm it with one WhatsApp message — no account and no waiting. If you can't find a time that suits you, tell us and our team will contact you on WhatsApp, typically within one business day.",
  },
  {
    question: "How do I get in touch with support?",
    answer:
      `Message us on WhatsApp at ${MOMENTIZING_WHATSAPP_DISPLAY}, use the "Ask our team" form, or, once you have an account, use in-app messaging — our support team monitors all three.`,
  },
];

export default function MarketingHomePage() {
  const router = useRouter();

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPackageId, setBookingPackageId] = useState<number | undefined>(undefined);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { data: directoryPage } = useMarketingDirectory(50);
  const associates = directoryPage?.content ?? [];
  const specialties = [...new Set(associates.flatMap((a) => specialisationTags(a.specialisation)))].slice(0, 6);
  // Highest-rated first (no-review associates sort last); review count breaks ties between equal averages.
  const topRatedAssociates = [...associates]
    .sort((a, b) => {
      const ratingDiff = (b.averageRating ?? -1) - (a.averageRating ?? -1);
      return ratingDiff !== 0 ? ratingDiff : b.reviewCount - a.reviewCount;
    })
    .slice(0, 8);
  const { data: packages, isLoading: packagesLoading } = usePackages();

  const openBooking = (packageId?: number) => {
    setBookingPackageId(packageId);
    setBookingOpen(true);
  };

  return (
    <div className="marketing-root bg-momentizing-cream font-marketing-sans text-momentizing-slate">

      <JsonLd data={faqPageSchema(FAQ_ITEMS)} />
      <main id="main">
      <header className="relative mx-auto max-w-7xl px-6 pt-36 pb-20 md:pt-44 md:pb-24">
        <div aria-hidden="true" className="pointer-events-none absolute -top-10 -left-24 -z-10 h-80 w-80 rounded-full bg-momentizing-mint blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute right-0 bottom-0 -z-10 h-72 w-72 rounded-full bg-momentizing-peach blur-2xl" />
        <div className="grid items-center gap-16 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-momentizing-mint px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-momentizing-teal uppercase">
              Empowering the Global Diaspora
            </span>
            <h1 className="mt-6 mb-8 font-marketing-serif text-5xl leading-[1.08] font-bold text-momentizing-gold-deep md:text-7xl">
              Healing Without <span className="text-momentizing-teal">Borders.</span>
            </h1>
            <p className="mb-10 max-w-lg text-lg leading-relaxed text-momentizing-muted">
              Culturally-attuned psychological support for individuals and organizations navigating life across
              cultures.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/book"
                className="rounded-full bg-momentizing-teal px-8 py-4 font-bold text-white shadow-md shadow-momentizing-teal/25 transition hover:bg-momentizing-slate"
              >
                Book a Session
              </Link>
              <a
                href="#packages"
                className="rounded-full border-2 border-momentizing-gold-deep px-8 py-4 font-bold text-momentizing-gold-deep transition hover:bg-momentizing-gold-deep hover:text-white"
              >
                View Packages
              </a>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[3rem] border-8 border-white shadow-2xl shadow-momentizing-teal/15">
            <div className="aspect-[12/11] w-full" role="img" aria-label="Illustration of a heart held in caring hands, surrounded by leaves">
              <BrandIllustration variant="care" />
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="what-we-offer" className="bg-momentizing-mint px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 id="what-we-offer" className="mb-8 text-center font-marketing-sans text-xs font-bold tracking-[0.25em] text-momentizing-teal uppercase">
            How we can support you
          </h2>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {OFFERINGS.map((o) => (
              <li key={o.label} className="flex flex-col items-center gap-3 rounded-3xl bg-white/70 px-4 py-6 text-center">
                <span className={`flex h-14 w-14 items-center justify-center rounded-full text-xl ${o.tone}`}>
                  <i className={o.icon} aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-momentizing-slate">{o.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="services" className="px-6 py-24">
        <div data-reveal className="mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <h2 className="font-marketing-serif text-4xl text-momentizing-gold-deep">Clinical Excellence</h2>
            <p className="mt-2 text-xs font-bold tracking-[0.2em] text-momentizing-muted uppercase">
              Specialized Individual &amp; Family Care
            </p>
          </div>
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-momentizing-teal/10 text-momentizing-teal">
                  <i className="fas fa-brain" />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-bold tracking-wider text-momentizing-slate uppercase">
                    Psychological Assessment
                  </h4>
                  <p className="text-sm leading-relaxed text-momentizing-muted">
                    In-depth clinical evaluation for ADHD, anxiety, depression, and cross-cultural adjustment
                    issues.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-momentizing-gold/10 text-momentizing-gold-deep">
                  <i className="fas fa-heart" />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-bold tracking-wider text-momentizing-slate uppercase">
                    Intercultural Relationship Therapy
                  </h4>
                  <p className="text-sm leading-relaxed text-momentizing-muted">
                    Helping couples navigate communication barriers and cultural value differences using the
                    Gottman Method.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[2.5rem] border border-momentizing-gold/10 bg-white p-10 shadow-xl shadow-momentizing-gold/5">
              <h3 className="mb-6 font-marketing-serif text-2xl">Our Individual Approach</h3>
              <p className="mb-6 text-sm leading-relaxed text-momentizing-muted">
                We don&apos;t believe in &quot;one size fits all.&quot; Every journey begins with a{" "}
                <strong>60-minute intake session</strong> to map your history, triggers, and goals.
              </p>
              <ul className="space-y-3 text-sm font-bold text-momentizing-teal">
                <li>
                  <i className="fas fa-check mr-2" /> Evidence-Based CBT &amp; DBT
                </li>
                <li>
                  <i className="fas fa-check mr-2" /> Multi-Lingual Support
                </li>
                <li>
                  <i className="fas fa-check mr-2" /> Trauma-Informed Framework
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
              Born between two cultures, built for many.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-momentizing-muted">
              Momentizing grew from one person&apos;s life as an expat in Taiwan into a team supporting people who live between
              cultures. Read how it began.
            </p>
          </div>
          <Link
            href="/about"
            className="inline-flex min-h-12 flex-shrink-0 items-center rounded-full border-2 border-momentizing-gold-deep px-8 py-3 font-bold text-momentizing-gold-deep transition hover:bg-momentizing-gold-deep hover:text-white"
          >
            Our story
          </Link>
        </div>
      </section>

      <section id="packages" className="on-dark bg-momentizing-slate px-6 py-24 text-white">
        <div data-reveal className="mx-auto max-w-7xl text-center">
          <h2 className="mb-12 font-marketing-serif text-4xl text-momentizing-gold">Care Packages</h2>
          {!packagesLoading && (packages ?? []).length === 0 ? (
            <div className="mx-auto max-w-md">
              <p className="mb-8 text-sm text-white/85">
                Our package catalog is being finalized — reach out and our team will put together the right plan
                for you.
              </p>
              <button
                onClick={() => openBooking()}
                className="rounded-full bg-momentizing-gold-deep px-10 py-4 text-xs font-bold tracking-widest text-white uppercase shadow-lg shadow-momentizing-gold/20"
              >
                Talk to Our Team
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {(packages ?? []).map((pkg) => {
              const popular = Boolean(pkg.badgeLabel);
              return (
                <div
                  key={pkg.id}
                  className={
                    popular
                      ? "marketing-card relative rounded-[2.5rem] border border-momentizing-gold bg-white/10 p-10 shadow-2xl"
                      : "marketing-card relative rounded-[2.5rem] border border-white/20 bg-white/5 p-10 transition hover:border-momentizing-gold"
                  }
                >
                  {popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-momentizing-gold-deep px-4 py-1 text-xs font-bold tracking-widest text-white uppercase">
                      {pkg.badgeLabel}
                    </div>
                  )}
                  <h4
                    className={`mb-4 text-xs font-bold tracking-widest uppercase ${
                      popular ? "text-momentizing-mint-deep" : "text-momentizing-gold"
                    }`}
                  >
                    {pkg.name}
                  </h4>
                  <div className="mb-6 font-marketing-serif text-4xl">{formatPackagePrice(pkg)}</div>
                  {pkg.description && <p className="mb-8 text-sm text-white/85">{pkg.description}</p>}
                  <button
                    onClick={() => (pkg.sessionCount === 1 ? router.push("/book") : openBooking(pkg.id))}
                    className={
                      popular
                        ? "w-full rounded-full bg-momentizing-gold-deep py-4 text-xs font-bold tracking-widest text-white uppercase shadow-lg shadow-momentizing-gold/20 transition"
                        : "w-full rounded-full bg-white/15 py-4 text-xs font-bold tracking-widest uppercase transition hover:bg-white hover:text-momentizing-slate"
                    }
                  >
                    {pkg.sessionCount === 1 ? "Book a Session" : "Ask About This Package"}
                  </button>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </section>

      <section id="corporate" className="px-6 py-24">
        <div data-reveal className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
          <div className="overflow-hidden rounded-[3rem]">
            <div className="aspect-[12/11] w-full" role="img" aria-label="Illustration of a connected team supported by care">
              <BrandIllustration variant="team" />
            </div>
          </div>
          <div>
            <span className="text-xs font-bold tracking-[0.3em] text-momentizing-teal uppercase">
              For Organizations
            </span>
            <h2 className="mt-4 mb-6 font-marketing-serif text-4xl text-momentizing-gold-deep">
              Strategic Wellbeing
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-momentizing-muted">
              Momentizing provides corporate entities with <strong>Mental Health First Aid</strong> training, EAP
              frameworks, and proactive burnout prevention workshops. We help distributed teams maintain high
              empathy and performance across time zones.
            </p>
            <div className="mb-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-momentizing-peach/60 p-4 text-center">
                <span className="block font-marketing-serif text-xl text-momentizing-gold-deep">By appointment</span>
                <span className="text-xs tracking-widest uppercase">Scheduled sessions</span>
              </div>
              <div className="rounded-2xl bg-momentizing-peach/60 p-4 text-center">
                <span className="block font-marketing-serif text-xl text-momentizing-gold-deep">Custom</span>
                <span className="text-xs tracking-widest uppercase">EAP Dashboards</span>
              </div>
            </div>
            <button
              onClick={() => openBooking()}
              className="rounded-full bg-momentizing-teal px-10 py-4 text-xs font-bold tracking-widest text-white uppercase"
            >
              Inquire for Corporate
            </button>
          </div>
        </div>
      </section>

      <section id="associates-preview" className="bg-momentizing-peach/60 px-6 py-24">
        <div data-reveal className="mx-auto max-w-7xl text-center">
          <h2 className="mb-3 font-marketing-serif text-3xl text-momentizing-gold-deep">Our Top-Rated Specialists</h2>
          <p className="mx-auto mb-8 max-w-lg text-sm text-momentizing-muted">
            Our highest-rated associates, based on real client reviews — see their experience and fees, then
            request a preferred date and time. No account needed to get started.
          </p>

          {specialties.length > 0 && (
            <div className="mb-12 flex flex-wrap justify-center gap-2">
              {specialties.map((tag) => (
                <Link
                  key={tag}
                  href={`/associates?specialisation=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-momentizing-gold/20 bg-white px-4 py-2 text-xs font-bold tracking-widest text-momentizing-gold-deep uppercase transition hover:bg-momentizing-gold-deep hover:text-white"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          <div className="mb-16 grid grid-cols-2 gap-4 text-left sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-6">
            {topRatedAssociates.map((associate) => (
              <SpecialistCard key={associate.id} specialist={associate} size="compact" />
            ))}
          </div>
          <Link
            href="/associates"
            className="inline-flex items-center rounded-full bg-momentizing-teal px-10 py-4 text-xs font-bold tracking-widest text-white uppercase transition hover:bg-momentizing-teal"
          >
            View All Associates <i className="fas fa-arrow-right ml-3" />
          </Link>
        </div>
      </section>

      <section id="faq" className="px-6 py-24">
        <div data-reveal className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center font-marketing-serif text-3xl text-momentizing-gold-deep">
            Common Inquiries
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

      <section className="border-t border-momentizing-gold/10 bg-white px-6 py-20 text-center">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
          <h2 className="font-marketing-serif text-2xl text-momentizing-slate">
            Already working with an associate?
          </h2>
          <p className="text-sm text-momentizing-muted">
            Log in to your Momentizing account to message your specialist, track your mood, and use your ADHD
            tools.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            <a
              href={appLink("/register")}
              className="rounded-full bg-momentizing-gold-deep px-8 py-4 text-xs font-bold tracking-widest text-white uppercase"
            >
              Create an Account
            </a>
            <a
              href={appLink("/login")}
              className="rounded-full border border-momentizing-slate px-8 py-4 text-xs font-bold tracking-widest text-momentizing-slate uppercase"
            >
              Login
            </a>
          </div>
          <a href={appLink("/register/specialist")} className="mt-2 inline-flex min-h-11 items-center text-sm text-momentizing-muted underline">
            I&apos;m a specialist — register my practice
          </a>
        </div>
      </section>
      </main>


      <BookingModal open={bookingOpen} initialPackageId={bookingPackageId} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
