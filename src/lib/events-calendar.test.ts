import { describe, expect, it } from "vitest";
import { addMonths, dateKey, entriesByDate, monthWeeks } from "./events-calendar";
import type { PublicEvent } from "./events";

const session = (id: number, date: string, startTime: string) => ({ id, date, startTime, endTime: "23:00:00", startsAt: "", endsAt: "" });
const event = (id: number, sessions: ReturnType<typeof session>[]) => ({ id, title: `E${id}`, sessions }) as unknown as PublicEvent;

describe("monthWeeks", () => {
  it("starts on Monday and pads with the neighbouring months", () => {
    const weeks = monthWeeks(2026, 10); // November 2026 starts on a Sunday
    expect(weeks[0][0]).toBe("2026-10-26");
    expect(weeks[0][6]).toBe("2026-11-01");
    expect(weeks.at(-1)?.[6]).toBe("2026-12-06");
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });

  it("uses only the weeks a month needs", () => {
    expect(monthWeeks(2027, 1)).toHaveLength(4); // Feb 2027: Monday 1st, 28 days
    expect(monthWeeks(2026, 2)).toHaveLength(6); // Mar 2026 starts on a Sunday
  });
});

describe("addMonths", () => {
  it("rolls over the year", () => {
    expect(addMonths(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(addMonths(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });
});

describe("entriesByDate", () => {
  it("puts a multi-date event on every date and sorts a day by start time", () => {
    const a = event(1, [session(1, "2026-11-10", "18:00:00"), session(2, "2026-11-12", "09:00:00")]);
    const b = event(2, [session(3, "2026-11-10", "09:00:00")]);
    const map = entriesByDate([a, b]);
    expect(map.get("2026-11-10")?.map((e) => e.event.id)).toEqual([2, 1]);
    expect(map.get("2026-11-12")?.map((e) => e.event.id)).toEqual([1]);
    expect(map.has("2026-11-11")).toBe(false);
  });
});

describe("dateKey", () => {
  it("pads month and day", () => expect(dateKey(2026, 0, 5)).toBe("2026-01-05"));
});
