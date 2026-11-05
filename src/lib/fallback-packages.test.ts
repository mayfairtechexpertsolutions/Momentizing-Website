import { describe, expect, it } from "vitest";
import { getFallbackPackages, isFallbackPackageId, toSessionPackage, validateRecord, type FallbackPackageRecord } from "./fallback-packages";

const record = (over: Partial<FallbackPackageRecord> = {}): FallbackPackageRecord => ({
  id: -1,
  name: "Healing Journey",
  sessionCount: 5,
  price: 550,
  currency: "USD",
  discountPercent: 10,
  description: "Save 10%.",
  badge: "Most Popular",
  ...over,
});

describe("validateRecord", () => {
  it("accepts a well-formed entry", () => {
    expect(() => validateRecord(record(), new Set())).not.toThrow();
  });

  it.each([
    ["a positive id", { id: 3 }, /negative/],
    ["no name", { name: " " }, /no name/],
    ["zero sessions", { sessionCount: 0 }, /sessionCount/],
    ["a negative price", { price: -5 }, /price/],
    ["a lower-case currency", { currency: "usd" }, /currency/],
    ["a discount over 99", { discountPercent: 100 }, /discountPercent/],
  ])("rejects %s", (_label, over, message) => {
    expect(() => validateRecord(record(over as Partial<FallbackPackageRecord>), new Set())).toThrow(message);
  });

  it("rejects a repeated id", () => {
    const seen = new Set<number>();
    validateRecord(record(), seen);
    expect(() => validateRecord(record({ name: "Other" }), seen)).toThrow(/unique/);
  });
});

describe("toSessionPackage", () => {
  it("matches the live response shape, with the price in cents", () => {
    expect(toSessionPackage(record(), 1)).toEqual({
      id: -1,
      name: "Healing Journey",
      sessionCount: 5,
      priceCents: 55000,
      currency: "USD",
      discountPercent: 10,
      description: "Save 10%.",
      badgeLabel: "Most Popular",
      active: true,
      sortOrder: 2,
    });
  });

  it("turns blank text into null", () => {
    const pkg = toSessionPackage(record({ description: "", badge: "", discountPercent: null }), 0);
    expect(pkg).toMatchObject({ description: null, badgeLabel: null, discountPercent: null });
  });
});

describe("the shipped file", () => {
  it("loads valid, enabled packages with negative ids", () => {
    const packages = getFallbackPackages();
    expect(packages.length).toBeGreaterThan(0);
    expect(packages.every((p) => isFallbackPackageId(p.id))).toBe(true);
  });
});
