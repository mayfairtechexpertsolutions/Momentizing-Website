import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import fallbackData from "@/data/fallback-specialists.json";
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
  it("has the eight team profiles with unique negative ids", () => {
    expect(FALLBACK_SPECIALISTS).toHaveLength(8);
    const ids = FALLBACK_SPECIALISTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(8);
    expect(ids.every(isFallbackSpecialistId)).toBe(true);
  });

  it("gives every profile a name and valid weekly slots (the founder and Yudith post no areas or hours as needed)", () => {
    for (const s of FALLBACK_SPECIALISTS) {
      expect(s.name).toBeTruthy();
      expect(s.durationMinutes).toBeGreaterThan(0);
      for (const w of s.weeklySlots) {
        expect(w.day >= 0 && w.day <= 6).toBe(true);
        expect(w.times.length).toBeGreaterThan(0);
        expect(w.times.every((time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time))).toBe(true);
      }
    }
  });

  it("gives every profile a valid IANA time zone", () => {
    expect(FALLBACK_SPECIALISTS.every((s) => s.timeZone === "Asia/Jakarta")).toBe(true);
  });

  it("always has a photo to show: the profile's own, or a default portrait that exists", () => {
    for (const s of FALLBACK_SPECIALISTS) {
      expect(s.avatarUrl).toBeTruthy();
      expect(s.defaultPhotoUrl).toMatch(/\/team\/default\/(female|male|neutral)\.svg$/);
      expect(existsSync(path.join(process.cwd(), "public", s.defaultPhotoUrl))).toBe(true);
    }
  });

  it("only references photo files that exist in public/team", () => {
    for (const record of fallbackData.specialists) {
      if (record.photo) expect(existsSync(path.join(process.cwd(), "public/team", record.photo))).toBe(true);
    }
  });

  it("has a valid practice mode, with a location for every on-site or hybrid profile", () => {
    for (const s of FALLBACK_SPECIALISTS) {
      expect(["ONLINE", "IN_PERSON", "HYBRID"]).toContain(s.practiceMode);
      if (s.practiceMode !== "ONLINE") expect(s.locations.length).toBeGreaterThan(0);
    }
  });

  it("keeps the session fee for the team but never exposes it to the website", () => {
    for (const s of FALLBACK_SPECIALISTS) {
      expect(s.sessionFeeCents).toBeNull();
      expect(s.recordedSessionFee.currency).toBeTruthy();
    }
  });

  it("only Fida accepts couples", () => {
    expect(FALLBACK_SPECIALISTS.filter((s) => s.acceptsCouple).map((s) => s.name)).toEqual(["Fida Muljono"]);
  });

  it("looks profiles up by id", () => {
    expect(getFallbackSpecialist(-1)?.name).toBe("Adeline Herdianto");
    expect(getFallbackSpecialist(-6)?.name).toBe("Estrelita Gracia");
    expect(getFallbackSpecialist(-99)).toBeNull();
    expect(getFallbackSpecialist(1)).toBeNull();
  });

  it("shapes a directory page and a booking card", () => {
    expect(fallbackDirectoryPage(3).content).toHaveLength(3);
    expect(fallbackDirectoryPage(50).totalElements).toBe(8);
    const card = toPublicCard(getFallbackSpecialist(-4)!);
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
    expect(describeWorkingHours(getFallbackSpecialist(-3)!)).toEqual(["Tuesday · 3:00 PM – 6:00 PM", "Saturday · 7:00 PM – 9:00 PM"]);
  });
});

describe("fallbackSlots", () => {
  const adeline = getFallbackSpecialist(-1)!;

  it("expands the weekly pattern into UTC slots like the live endpoint (WIB = UTC+7)", () => {
    // 2026-11-03 is a Tuesday: 15:30 and 16:30 WIB = 08:30 and 09:30 UTC.
    const res = fallbackSlots(adeline, "2026-11-01", 14);
    expect(res.days).toHaveLength(14);
    expect(res.days.find((d) => d.date === "2026-11-03")?.times).toEqual(["08:30", "09:30"]);
    expect(res.days.find((d) => d.date === "2026-11-04")?.times).toEqual([]);
    expect(res.days.find((d) => d.date === "2026-11-10")?.times).toEqual(["08:30", "09:30"]);
    expect(res.nextAvailableDate).toBe("2026-11-03");
    expect(res.durationMinutes).toBe(60);
  });

  it("honours the profile's own time zone, daylight saving included", () => {
    // Sydney is UTC+11 in November (AEDT): Tuesday 15:30 there = Tuesday 04:30 UTC.
    const sydney = { ...getFallbackSpecialist(-1)!, timeZone: "Australia/Sydney" };
    expect(fallbackSlots(sydney, "2026-11-01", 14).days.find((d) => d.date === "2026-11-03")?.times).toEqual(["04:30", "05:30"]);
    // ...and UTC+10 in July (AEST): the same wall time is an hour later in UTC terms.
    expect(fallbackSlots(sydney, "2026-07-01", 14).days.find((d) => d.date === "2026-07-07")?.times).toEqual(["05:30", "06:30"]);
  });

  it("lists every slot of a long day", () => {
    // Evria, Saturday 19:00 WIB = 12:00 UTC (2026-11-07 is a Saturday).
    const times = fallbackSlots(getFallbackSpecialist(-3)!, "2026-11-01", 14).days.find((d) => d.date === "2026-11-07")?.times;
    expect(times).toEqual(["12:00", "13:00"]);
  });
});
