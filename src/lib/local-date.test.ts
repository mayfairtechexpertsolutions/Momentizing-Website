import { describe, expect, it } from "vitest";
import { addDaysIso, dateParts, formatTime, icsStamp, parseIsoLocal, toIsoLocal } from "./local-date";

describe("local-date", () => {
  it("parses a bare date as a LOCAL calendar date (the UTC-midnight bug shows the previous day west of UTC)", () => {
    // Regression: `new Date("2026-10-03")` is UTC midnight -> Oct 2 in America/Los_Angeles.
    expect(new Date("2026-10-03").getDate()).toBe(2);
    expect(parseIsoLocal("2026-10-03").getDate()).toBe(3);
    expect(dateParts("2026-10-03").day).toBe("3");
  });

  it("round-trips a date without drifting a day", () => {
    for (const iso of ["2026-01-01", "2026-03-08", "2026-11-01", "2026-12-31", "2028-02-29"]) {
      expect(toIsoLocal(parseIsoLocal(iso))).toBe(iso);
    }
  });

  it("adds days across month, year and daylight-saving boundaries", () => {
    expect(addDaysIso("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDaysIso("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysIso("2026-03-07", 2)).toBe("2026-03-09"); // spring-forward weekend in the US
    expect(addDaysIso("2026-10-31", 2)).toBe("2026-11-02"); // fall-back weekend
    expect(addDaysIso("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("formats a wall-clock time for display", () => {
    expect(formatTime("09:00")).toMatch(/9:00/);
    expect(formatTime("13:30:00")).toMatch(/1:30/);
  });

  it("builds an iCalendar UTC stamp from the platform's UTC wall-clock time", () => {
    expect(icsStamp("2026-10-02", "10:00")).toBe("20261002T100000Z");
    expect(icsStamp("2026-10-02", "10:00", 60)).toBe("20261002T110000Z");
    expect(icsStamp("2026-10-02", "23:30", 60)).toBe("20261003T003000Z"); // rolls into the next day
  });
});
