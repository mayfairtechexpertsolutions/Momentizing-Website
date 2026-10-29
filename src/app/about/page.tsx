import Link from "next/link";
import { HeroGlobe } from "@/components/marketing/about/AboutArt";
import { JourneyTimeline } from "@/components/marketing/about/JourneyTimeline";

const VALUES = ["Diversity", "Resilience", "Caring", "Relationship", "Trustworthy"];

const GROUPS = [
  { icon: "fas fa-globe-asia", title: "Diaspora communities", body: "Keeping roots and building a life far from home." },
  { icon: "fas fa-suitcase-rolling", title: "Expatriates", body: "Working and living abroad, and finding your footing." },
  { icon: "fas fa-graduation-cap", title: "International students", body: "Studying across borders, often far from family." },
  { icon: "fas fa-heart", title: "Cross-cultural couples", body: "Kawin campur: love that crosses culture, faith or nationality." },
];

const SUPPORT_DETAIL = [
  "Students and professionals across borders, living in different cities, islands or countries.",
  "People in mixed marriages with contrasting backgrounds, such as age, education, occupation, ethnicity, religion, race or nationality.",
  "Anyone exposed to diverse cultures or systems who is facing challenges of adjustment and relationships.",
];

const MISSION = [
  "Provide information and consultation about global relationships.",
  "Enhance collaborative performance to share cross-cultural experiences.",
  "Enable people to navigate life in a way that fits their cultural identity and values.",
];

const COMMITMENTS = [
  { icon: "fas fa-leaf", title: "Culturally responsive care", body: "Honoring diverse backgrounds and life experiences." },
  { icon: "fas fa-heart", title: "Holistic support", body: "For individuals, couples and families across life stages." },
  { icon: "fas fa-users", title: "Community and collaboration", body: "Working with partners, associates and the wider community." },
  { icon: "fas fa-globe", title: "A more inclusive future", body: "Continuing to create safe spaces for everyone, everywhere." },
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
                Celebrating our differences, savoring the present.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-momentizing-muted">
                Momentizing Holistic Center offers mental health consulting and counseling for people living between cultures.
                We work with individuals, couples, families, institutions and organizations whose different backgrounds shape
                how they relate, work and heal.
              </p>
              <ul className="mt-8 flex max-w-xl flex-wrap gap-x-5 gap-y-2 font-marketing-serif text-lg font-semibold text-momentizing-teal">
                {VALUES.map((value) => (
                  <li key={value} className="flex items-center gap-2">
                    <svg viewBox="0 0 12 12" className="h-3 w-3 text-momentizing-gold" aria-hidden="true" focusable="false">
                      <path d="M6 0 C 11 2 11 8 6 12 C 1 8 1 2 6 0 Z" fill="currentColor" />
                    </svg>
                    {value}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-[3rem] border-8 border-white shadow-2xl shadow-momentizing-teal/15">
              <div className="aspect-[12/11] w-full" role="img" aria-label="Illustration of a globe with routes linking four places, and a paper plane">
                <HeroGlobe />
              </div>
            </div>
          </div>
        </header>

        <section aria-labelledby="who-we-support" className="bg-momentizing-mint px-6 py-24">
          <div data-reveal className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 id="who-we-support" className="font-marketing-serif text-3xl leading-tight font-semibold text-momentizing-gold-deep md:text-4xl">
                Who we support
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-momentizing-muted">
                Life across cultures can be rich and tiring at the same time. We keep company with people who are adjusting,
                belonging and building relationships in more than one world.
              </p>
              <ul className="mt-8 max-w-md space-y-4 border-l-2 border-momentizing-gold pl-5 leading-relaxed text-momentizing-slate">
                {SUPPORT_DETAIL.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {GROUPS.map((group, i) => (
                <li
                  key={group.title}
                  className={`rounded-3xl bg-white/80 p-6 shadow-[0_8px_30px_rgba(47,62,70,0.06)] ${i % 2 ? "sm:translate-y-6" : ""}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-momentizing-peach text-lg text-momentizing-gold-deep">
                    <i className={group.icon} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-marketing-serif text-xl font-semibold">{group.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-momentizing-muted">{group.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="vision-mission" className="bg-momentizing-peach/60 px-6 py-24">
          <h2 id="vision-mission" className="sr-only">
            Our vision and mission
          </h2>
          <div data-reveal className="mx-auto grid max-w-7xl gap-14 md:grid-cols-2 md:gap-20">
            <div>
              <h3 className="font-marketing-serif text-2xl font-semibold text-momentizing-teal">Our vision</h3>
              <p className="mt-4 max-w-lg font-marketing-serif text-3xl leading-snug font-semibold text-momentizing-gold-deep md:text-4xl">
                Empower global citizens to create memorable moments while encountering intercultural relationships.
              </p>
            </div>
            <div>
              <h3 className="font-marketing-serif text-2xl font-semibold text-momentizing-teal">Our mission</h3>
              <ul className="mt-4 max-w-lg divide-y divide-momentizing-gold/40">
                {MISSION.map((line) => (
                  <li key={line} className="flex gap-4 py-4 text-lg leading-relaxed first:pt-0">
                    <svg viewBox="0 0 12 12" className="mt-2.5 h-3 w-3 flex-shrink-0 text-momentizing-teal" aria-hidden="true" focusable="false">
                      <path d="M6 0 C 11 2 11 8 6 12 C 1 8 1 2 6 0 Z" fill="currentColor" />
                    </svg>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="journey" aria-labelledby="journey-heading" className="relative overflow-hidden px-6 py-24">
          <div data-reveal className="mx-auto max-w-3xl text-center">
            <h2 id="journey-heading" className="font-marketing-serif text-3xl font-semibold text-momentizing-gold-deep md:text-4xl">
              Our journey
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-momentizing-muted">
              From Taiwan to Indonesia and across the globe: different places, shared human stories.
            </p>
          </div>
          <JourneyTimeline />
        </section>

        <section aria-labelledby="commitments" className="on-dark bg-momentizing-slate px-6 py-24 text-white">
          <div data-reveal className="mx-auto max-w-7xl">
            <h2 id="commitments" className="font-marketing-serif text-3xl font-semibold text-momentizing-gold md:text-4xl">
              Our commitment moving forward
            </h2>
            <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {COMMITMENTS.map((item) => (
                <li key={item.title} className="border-t border-white/20 pt-6">
                  <i className={`${item.icon} inline-block h-6 w-6 text-xl text-momentizing-gold`} aria-hidden="true" />
                  <h3 className="mt-4 font-marketing-serif text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-white/80">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="about-cta" data-reveal className="bg-momentizing-mint px-6 py-24 text-center">
          <h2 id="about-cta" className="font-marketing-serif text-3xl font-semibold text-momentizing-gold-deep md:text-4xl">
            A safer space for your next chapter.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-momentizing-muted">
            Talk with someone who understands life between cultures. Pick a time that suits you, no account needed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex min-h-12 items-center rounded-full bg-momentizing-teal px-8 py-3 font-bold text-white shadow-md shadow-momentizing-teal/25 transition hover:bg-momentizing-slate"
            >
              Book a Session
            </Link>
            <Link
              href="/associates"
              className="inline-flex min-h-12 items-center rounded-full border-2 border-momentizing-gold-deep px-8 py-3 font-bold text-momentizing-gold-deep transition hover:bg-momentizing-gold-deep hover:text-white"
            >
              Find an Associate
            </Link>
          </div>
        </section>
      </main>

    </div>
  );
}
