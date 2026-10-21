import { MarketingFonts } from "@/components/marketing/MarketingFonts";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CareerForm } from "@/components/marketing/careers/CareerForm";

const STEPS = [
  { title: "Apply", body: "Tell us about your practice and attach your resume. It takes about five minutes." },
  { title: "We review", body: "Our team checks your credentials and experience. We reply to every application." },
  { title: "Meet us", body: "Shortlisted experts have a conversation with our team, online." },
  { title: "Join", body: "We send you an invite to create your Momentizing expert profile." },
];

export default function CareersPage() {
  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">
      <MarketingFonts />
      <MarketingNav variant="simple" simpleLabel="Back Home" />
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6">
        <p className="text-xs font-bold tracking-widest text-momentizing-muted uppercase">Careers</p>
        <h1 className="font-marketing-serif mt-2 text-4xl leading-tight font-semibold sm:text-5xl">Join Momentizing as an expert</h1>
        <p className="mt-4 text-lg leading-relaxed text-momentizing-muted">
          We connect people with psychologists, therapists, psychiatrists and coaches they can trust. If that is the work you
          do, we would like to hear from you.
        </p>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-3xl border border-momentizing-slate/10 bg-white p-5">
              <span className="text-xs font-bold tracking-widest text-momentizing-muted uppercase">Step {i + 1}</span>
              <h2 className="font-marketing-serif mt-1 text-xl font-semibold">{s.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-momentizing-muted">{s.body}</p>
            </li>
          ))}
        </ol>

        <section id="apply" aria-labelledby="apply-heading" className="mt-12 scroll-mt-28">
          <h2 id="apply-heading" className="font-marketing-serif text-3xl font-semibold">
            Apply now
          </h2>
          <div className="mt-6">
            <CareerForm />
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
