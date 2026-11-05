import fallbackData from "@/data/fallback-packages.json";
import type { SessionPackage } from "./session-packages";

/**
 * Static Care Packages shown ONLY when the backend is unreachable or broken (see `isBackendUnavailable`), so the home
 * page never shows an empty price list. The team edits `src/data/fallback-packages.json`; the live packages always win
 * when the backend answers. Same idea as `fallback-events.ts`: negative ids, validated when the site loads, so a typo
 * fails the build instead of reaching visitors.
 */

const FILE = "fallback-packages.json";

/** Fallback ids are negative so they can never collide with a real backend id. */
export const isFallbackPackageId = (id: number): boolean => id < 0;

/** One entry of `src/data/fallback-packages.json` — the file the team edits. */
export interface FallbackPackageRecord {
  id: number;
  enabled?: boolean;
  name: string;
  sessionCount: number;
  price: number;
  currency: string;
  discountPercent?: number | null;
  description?: string;
  badge?: string;
}

function fail(who: string, problem: string): never {
  throw new Error(`${FILE}: "${who}" ${problem}`);
}

/** Throws a readable error for anything that would show wrongly on the site. */
export function validateRecord(record: FallbackPackageRecord, seenIds: Set<number>): void {
  const who = record.name || `id ${record.id}`;
  if (!Number.isInteger(record.id) || record.id >= 0) fail(who, `has id ${record.id} (must be a negative whole number such as -1)`);
  if (seenIds.has(record.id)) fail(who, `repeats id ${record.id} (every id must be unique)`);
  seenIds.add(record.id);
  if (!record.name?.trim()) fail(who, "has no name");
  if (!Number.isInteger(record.sessionCount) || record.sessionCount < 1) fail(who, `has sessionCount ${record.sessionCount} (must be a whole number, 1 or more)`);
  if (typeof record.price !== "number" || !Number.isFinite(record.price) || record.price < 0) fail(who, `has price ${record.price} (must be a number, 0 or more)`);
  if (!/^[A-Z]{3}$/.test(record.currency ?? "")) fail(who, `has currency "${record.currency}" (use a 3-letter capital code such as "USD" or "IDR")`);
  const discount = record.discountPercent;
  if (discount != null && (!Number.isInteger(discount) || discount < 1 || discount > 99)) fail(who, `has discountPercent ${discount} (use 1 to 99, or null for none)`);
}

const RECORDS = fallbackData.packages as unknown as FallbackPackageRecord[];
(() => {
  const seen = new Set<number>();
  RECORDS.forEach((r) => validateRecord(r, seen));
})();

/** The entry shaped like the live `/packages` response, so callers need no special case. */
export function toSessionPackage(record: FallbackPackageRecord, index: number): SessionPackage {
  return {
    id: record.id,
    name: record.name,
    sessionCount: record.sessionCount,
    priceCents: Math.round(record.price * 100),
    currency: record.currency,
    discountPercent: record.discountPercent ?? null,
    description: record.description || null,
    badgeLabel: record.badge || null,
    active: true,
    sortOrder: index + 1,
  };
}

/** Every enabled built-in package, in the order the file lists them. */
export function getFallbackPackages(): SessionPackage[] {
  return RECORDS.filter((r) => r.enabled !== false).map(toSessionPackage);
}
