import { describe, expect, it } from "vitest";
import {
  FALLBACK_SPECIALISTS,
  fallbackDirectoryPage,
  formatClock,
  formatWorkingWindow,
  getFallbackSpecialist,
  isFallbackSpecialistId,
  isWithinWorkingHours,
  toPublicCard,
} from "./fallback-specialists";

describe("fallback specialists data", () => {
  it("has the five team profiles with unique negative ids", () => {
    expect(FALLBACK_SPECIALISTS).toHaveLength(5);
    const ids = FALLBACK_SPECIALISTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(5);
    expect(ids.every(isFallbackSpecialistId)).toBe(true);
  });

  it("gives every profile a name, specialities, and valid working windows", () => {
    for (const s of FALLBACK_SPECIALISTS) {
      expect(s.name).toBeTruthy();
      expect(s.specialisation).toBeTruthy();
      expect(s.workingHours.length).toBeGreaterThan(0);
      for (const w of s.workingHours) {
        expect(w.from < w.to).toBe(true);
        expect(w.days.every((d) => d >= 0 && d <= 6)).toBe(true);
      }
    }
  });

  it("only Fida accepts couples", () => {
    expect(FALLBACK_SPECIALISTS.filter((s) => s.acceptsCouple).map((s) => s.name)).toEqual(["Fida Muljono"]);
  });

  it("looks profiles up by id", () => {
    expect(getFallbackSpecialist(-1)?.name).toBe("Adeline Herdianto");
    expect(getFallbackSpecialist(-99)).toBeNull();
    expect(getFallbackSpecialist(1)).toBeNull();
  });

  it("shapes a directory page and a booking card", () => {
    expect(fallbackDirectoryPage(3).content).toHaveLength(3);
    expect(fallbackDirectoryPage(50).totalElements).toBe(5);
    const card = toPublicCard(FALLBACK_SPECIALISTS[3]);
    expect(card.acceptsCouple).toBe(true);
    expect(card.id).toBe(-4);
  });
});

describe("working hours", () => {
  const adeline = getFallbackSpecialist(-1)!;

  it("formats clock times like the posters", () => {
    expect(formatClock("13:00")).toBe("1:00 PM");
    expect(formatClock("09:30")).toBe("9:30 AM");
    expect(formatClock("00:00")).toBe("12:00 AM");
    expect(formatClock("12:00")).toBe("12:00 PM");
  });

  it("formats a window", () => {
    expect(formatWorkingWindow(getFallbackSpecialist(-4)!.workingHours[0])).toBe("Wednesday & Friday · 9:00 AM – 11:00 AM");
  });

  it("detects whether a day and time fall inside the posted hours", () => {
    // 2026-11-03 is a Tuesday.
    expect(isWithinWorkingHours(adeline.workingHours, "2026-11-03", "13:00")).toBe(true);
    expect(isWithinWorkingHours(adeline.workingHours, "2026-11-03", "15:00")).toBe(false);
    expect(isWithinWorkingHours(adeline.workingHours, "2026-11-04", "13:00")).toBe(false);
  });
});
