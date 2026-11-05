import { useApiQuery } from "./use-api-query";
import { intlLocale, t } from "@/i18n";
import { getFallbackPackages } from "./fallback-packages";

/** Mirrors SessionPackageResponse on the backend — was previously hardcoded twice on the frontend
 * (BookingModal's PACKAGES array and the pricing cards on the marketing homepage). */
export interface SessionPackage {
  id: number;
  name: string;
  sessionCount: number;
  priceCents: number;
  currency: string;
  discountPercent: number | null;
  description: string | null;
  badgeLabel: string | null;
  active: boolean;
  sortOrder: number;
}

/**
 * Public marketing pages (homepage, booking modal) — no auth required, backed by the real catalog. While the backend
 * is unavailable the built-in packages from `src/data/fallback-packages.json` are shown instead.
 */
export function usePackages() {
  const result = useApiQuery<SessionPackage[]>("/packages", { anonymous: true });
  if (!result.unavailable) return { ...result, isFallback: false };
  return { ...result, data: getFallbackPackages(), error: null, isLoading: false, isFallback: true };
}

export type PackageGroup = "individual" | "couple" | "assessment";

/** Packages carry no category in the catalog, so cards are grouped by the words admins already put in the name. */
export function packageGroup(pkg: SessionPackage): PackageGroup {
  if (/assess/i.test(pkg.name)) return "assessment";
  if (/couple/i.test(pkg.name)) return "couple";
  return "individual";
}

/** The amount only ("Rp 700,000"); the card puts "Start from" above it and the unit beside it. */
export function formatPackageAmount(pkg: SessionPackage): string {
  const amount = (pkg.priceCents / 100).toLocaleString(intlLocale(), {
    minimumFractionDigits: pkg.priceCents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const symbol = pkg.currency === "USD" ? "$" : pkg.currency === "IDR" ? "Rp " : pkg.currency + " ";
  return symbol + amount;
}

/** "/session" for one session, "/3 Sessions" for a bundle, nothing for an assessment (it is not a 60-minute session). */
export function packageUnit(pkg: SessionPackage): string {
  if (packageGroup(pkg) === "assessment") return "";
  return pkg.sessionCount === 1 ? t("site.pkg.perSession") : t("site.pkg.perSessions", { n: pkg.sessionCount });
}
