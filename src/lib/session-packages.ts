import { useApiQuery } from "./use-api-query";

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

/** Public marketing pages (homepage, booking modal) — no auth required, backed by the real catalog. */
export function usePackages() {
  return useApiQuery<SessionPackage[]>("/packages", { anonymous: true });
}

export function formatPackagePrice(pkg: SessionPackage): string {
  const amount = (pkg.priceCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: pkg.priceCents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const unit = pkg.sessionCount === 1 ? "/hr" : `/${pkg.sessionCount} Sessions`;
  return `${pkg.currency === "USD" ? "$" : pkg.currency + " "}${amount} ${unit}`;
}
