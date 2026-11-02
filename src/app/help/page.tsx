"use client";

import { useRouter } from "next/navigation";
import { useApiQuery } from "@/lib/use-api-query";
import { Card } from "@/components/ui/Card";
import { MarketingFonts } from "@/components/marketing/MarketingFonts";
import { WhatsAppFloatingButton } from "@/components/marketing/WhatsAppFloatingButton";
import { withBase } from "@/lib/base-path";
import { t } from "@/i18n";

interface CrisisResource {
  name: string;
  contact: string;
}

interface CrisisResourcesResponse {
  region: string;
  resources: CrisisResource[];
}

// Deliberately minimal — no nav links, packages, or CTAs. A visitor here needs calm and a fast
// path to a real resource, not marketing chrome. Only the logo carries brand trust.
export default function HelpPage() {
  const router = useRouter();
  const { data, error, isLoading, refetch } = useApiQuery<CrisisResourcesResponse>("/safety/crisis-resources", { anonymous: true });

  return (
    <div className="min-h-screen bg-momentizing-cream font-marketing-sans">
      <MarketingFonts />
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-5 pt-8 pb-10">
        <div className="flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase("/website/momentizing-logo.jpeg")} alt="Momentizing" className="h-9" />
          <button
            onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
            className="inline-flex min-h-11 items-center text-sm text-momentizing-muted hover:text-momentizing-slate"
          >
            ← {t("site.common.back")}
          </button>
        </div>

        <div>
          <h1 className="font-marketing-serif text-2xl text-momentizing-slate">{t("site.help.title")}</h1>
          <p className="mt-2 text-sm text-momentizing-muted">
            {t("site.help.body")}
          </p>
        </div>

        {isLoading && <p className="text-sm text-momentizing-muted">{t("site.help.loading")}</p>}

        {error && !isLoading && (
          <Card className="border border-red-200 bg-red-50" role="alert">
            <p className="text-sm text-momentizing-slate">
              {t("site.help.loadErrorA")}{" "}
              <strong>{t("site.help.loadErrorStrong")}</strong>.
            </p>
            <button
              onClick={refetch}
              className="mt-3 inline-flex min-h-11 items-center rounded-full border border-momentizing-slate/40 px-5 text-xs font-bold tracking-widest text-momentizing-slate uppercase"
            >
              {t("site.common.tryAgain")}
            </button>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {data?.resources.map((r) => (
            <Card key={r.name} className="border border-red-200 bg-red-50">
              <p className="font-marketing-serif text-lg text-momentizing-slate">{r.name}</p>
              <a href={`tel:${r.contact}`} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-red-700 underline">
                {r.contact}
              </a>
            </Card>
          ))}
        </div>

        {data && data.resources.length === 0 && !isLoading && (
          <Card className="text-center text-sm text-momentizing-muted">
            {t("site.help.none")}
          </Card>
        )}
        <WhatsAppFloatingButton />
      </main>
    </div>
  );
}
