import Link from "next/link";
import { T } from "@/i18n/LocaleBoundary";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-momentizing-cream font-marketing-sans text-momentizing-slate">
      <main id="main" className="mx-auto flex max-w-md flex-col items-center px-6 pt-40 pb-24 text-center">
        <p className="text-xs font-bold tracking-[0.3em] text-momentizing-slate/70 uppercase"><T k="site.notFound.eyebrow" /></p>
        <h1 className="mt-3 font-marketing-serif text-3xl text-momentizing-slate"><T k="site.notFound.title" /></h1>
        <p className="mt-3 text-sm text-momentizing-muted">
          <T k="site.notFound.body" />
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full bg-momentizing-teal px-6 text-xs font-bold tracking-widest text-white uppercase"
          >
            <T k="site.common.backHome" />
          </Link>
          <Link
            href="/book"
            className="inline-flex min-h-11 items-center rounded-full border border-momentizing-slate/40 px-6 text-xs font-bold tracking-widest text-momentizing-slate uppercase"
          >
            <T k="site.notFound.book" />
          </Link>
        </div>
      </main>
    </div>
  );
}
