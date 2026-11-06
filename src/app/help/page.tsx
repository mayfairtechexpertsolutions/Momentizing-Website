"use client";

import { useRouter } from "next/navigation";
import { useApiQuery } from "@/lib/use-api-query";
import { Card } from "@/components/ui/Card";
import { MarketingFonts } from "@/components/marketing/MarketingFonts";
import { WhatsAppFloatingButton } from "@/components/marketing/WhatsAppFloatingButton";
import { withBase } from "@/lib/base-path";
import { crisisContactHref, mergeCrisisResources, type CrisisResource } from "@/lib/fallback-crisis-resources";
import { t } from "@/i18n";

interface CrisisResourcesResponse {
  region: string;
  resources: CrisisResource[];
}

// Deliberately minimal — no nav links, packages, or CTAs. A visitor here needs calm and a fast
// path to a real resource, not marketing chrome. Only the logo carries brand trust.
export default function HelpPage() {
  const router = useRouter();
  // Our visitors are mostly in Indonesia, so the Indonesian helplines come first and the international ones follow
  // (the endpoint answers one region per request and would otherwise show only the international two).
  const indonesia = useApiQuery<CrisisResourcesResponse>("/safety/crisis-resources?region=ID", { anonymous: true });
  const international = useApiQuery<CrisisResourcesResponse>("/safety/crisis-resources?region=INTL", { anonymous: true });
  const isLoading = indonesia.isLoading || international.isLoading;
  // Only a total failure is an error: if one list loads, the other falls back to the built-in entries silently.
  const error = indonesia.error && international.error ? indonesia.error : null;
  const refetch = () => {
    indonesia.refetch();
    international.refetch();
  };
  const data = indonesia.data ?? international.data;

  // The live lists win; whatever can't be loaded is replaced by the saved list so the page is never empty.
  const resources: CrisisResource[] | undefined = isLoading ? undefined : mergeCrisisResources({ id: indonesia.data?.resources, intl: international.data?.resources });

  return (
    <div className="min-h-screen bg-momentizing-cream font-marketing-sans">
      <MarketingFonts />
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-5 pt-8 pb-10">
        <div className="flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase("/website/momentizing-logo.jpeg")} alt="Momentizing" className="h-12 mix-blend-multiply" />
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
            <p className="mt-2 text-xs text-momentizing-muted">{t("site.help.builtIn")}</p>
            <button
              onClick={refetch}
              className="mt-3 inline-flex min-h-11 items-center rounded-full border border-momentizing-slate/40 px-5 text-xs font-bold tracking-widest text-momentizing-slate uppercase"
            >
              {t("site.common.tryAgain")}
            </button>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {resources?.map((r) => (
            <Card key={r.name} className="border border-red-200 bg-red-50">
              <p className="font-marketing-serif text-lg text-momentizing-slate">{r.name}</p>
              <a href={crisisContactHref(r.contact)} {...(/^https?:/i.test(r.contact) ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-red-700 underline">
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
