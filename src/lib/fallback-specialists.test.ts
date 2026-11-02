import { describe, expect, it } from "vitest";
import {
  FALLBACK_SPECIALISTS,
  fallbackDirectoryPage,
  formatClock,
  describeWorkingHours,
  fallbackSlots,
  getFallbackSpecialist,
  isFallbackSpecialistId,
  toPublicCard,
} from "./fallback-specialists";

describe("fallback specialists data", () => {
  it("has the five team profiles with unique negative ids", () => {
    expect(FALLBACK_SPECIALISTS).toHaveLength(5);
    const ids = FALLBACK_SPECIALISTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(5);
    expect(ids.every(isFallbackSpecialistId)).toBe(true);
  });

  it("gives every profile a name, specialities, and valid weekly slots", () => {
    for (const s of FALLBACK_SPECIALISTS) {
      expect(s.name).toBeTruthy();
      expect(s.specialisation).toBeTruthy();
      expect(s.durationMinutes).toBeGreaterThan(0);
      expect(s.weeklySlots.length).toBeGreaterThan(0);
      for (const w of s.weeklySlots) {
        expect(w.day >= 0 && w.day <= 6).toBe(true);
        expect(w.times.length).toBeGreaterThan(0);
        expect(w.times.every((time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time))).toBe(true);
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
  it("formats clock times like the posters", () => {
    expect(formatClock("13:00")).toBe("1:00 PM");
    expect(formatClock("09:30")).toBe("9:30 AM");
    expect(formatClock("00:00")).toBe("12:00 AM");
    expect(formatClock("12:00")).toBe("12:00 PM");
  });

  it("describes the posted hours, grouping days that share them", () => {
    expect(describeWorkingHours(getFallbackSpecialist(-4)!)).toEqual(["Wednesday & Friday · 9:00 AM – 11:00 AM"]);
    expect(describeWorkingHours(getFallbackSpecialist(-3)!)).toEqual(["Tuesday · 3:00 PM – 6:00 PM", "Saturday · 7:00 AM – 9:00 PM"]);
  });
});

describe("fallbackSlots", () => {
  const adeline = getFallbackSpecialist(-1)!;

  it("expands the weekly pattern into UTC slots like the live endpoint (WIB = UTC+7)", () => {
    // 2026-11-03 is a Tuesday: 13:00 and 14:00 WIB = 06:00 and 07:00 UTC.
    const res = fallbackSlots(adeline, "2026-11-01", 14);
    expect(res.days).toHaveLength(14);
    expect(res.days.find((d) => d.date === "2026-11-03")?.times).toEqual(["06:00", "07:00"]);
    expect(res.days.find((d) => d.date === "2026-11-04")?.times).toEqual([]);
    expect(res.days.find((d) => d.date === "2026-11-10")?.times).toEqual(["06:00", "07:00"]);
    expect(res.nextAvailableDate).toBe("2026-11-03");
    expect(res.durationMinutes).toBe(60);
  });

  it("keeps the earliest WIB slot on its own UTC date and lists every slot of a long day", () => {
    // Eivria, Saturday 07:00 WIB = 00:00 UTC (2026-11-07 is a Saturday).
    const times = fallbackSlots(getFallbackSpecialist(-3)!, "2026-11-01", 14).days.find((d) => d.date === "2026-11-07")?.times;
    expect(times).toHaveLength(14);
    expect(times?.[0]).toBe("00:00");
  });
});
