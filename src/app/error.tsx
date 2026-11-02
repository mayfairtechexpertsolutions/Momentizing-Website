"use client";

import Link from "next/link";
import { t } from "@/i18n";

export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center text-momentizing-slate">
      <h1 className="font-heading text-2xl">{t("site.error.title")}</h1>
      <p className="mt-3 text-sm text-momentizing-muted">
        {t("site.error.body")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-full bg-momentizing-teal px-6 text-xs font-bold tracking-widest text-white uppercase"
        >
          {t("site.common.tryAgain")}
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border border-momentizing-slate/40 px-6 text-xs font-bold tracking-widest uppercase"
        >
          {t("site.common.backHome")}
        </Link>
      </div>
    </main>
  );
}
