import { describe, expect, it } from "vitest";
import fallbackData from "@/data/fallback-events.json";
import {
  FALLBACK_EVENT_NOT_FOUND,
  getFallbackEvent,
  getFallbackEvents,
  isFallbackEventId,
  selectEventsPage,
  toPublicEvent,
  validateRecord,
  type FallbackEventRecord,
} from "./fallback-events";

const record = (over: Partial<FallbackEventRecord> = {}): FallbackEventRecord => ({
  id: -1,
  title: "Calm Mind Evening",
  format: "ONLINE",
  priceType: "FREE",
  timeZone: "Asia/Jakarta",
  poster: "calm.jpg",
  sessions: [{ date: "2027-01-15", startTime: "19:00", endTime: "21:00" }],
  ...over,
});

const NOW = new Date("2027-01-10T00:00:00Z");

describe("validateRecord", () => {
  it("accepts a well-formed entry", () => {
    expect(() => validateRecord(record(), new Set())).not.toThrow();
  });

  it.each([
    ["a positive id", { id: 3 }, /negative/],
    ["a bad format", { format: "WEBINAR" }, /format/],
    ["a bad price type", { priceType: "DONATION" }, /priceType/],
    ["an abbreviation time zone", { timeZone: "WIB" }, /IANA/],
    ["no sessions", { sessions: [] }, /no sessions/],
    ["a bad date", { sessions: [{ date: "15/01/2027", startTime: "19:00", endTime: "21:00" }] }, /YYYY-MM-DD/],
    ["a bad time", { sessions: [{ date: "2027-01-15", startTime: "7pm", endTime: "21:00" }] }, /HH:mm/],
    ["an end before the start", { sessions: [{ date: "2027-01-15", startTime: "21:00", endTime: "19:00" }] }, /before it starts/],
    ["a poster with a folder", { poster: "img/calm.jpg" }, /file name only/],
    ["a registration link that is not http(s)", { registrationUrl: "javascript:alert(1)" }, /http/],
  ])("rejects %s", (_name, over, message) => {
    expect(() => validateRecord(record(over as Partial<FallbackEventRecord>), new Set())).toThrow(message);
  });

  it("rejects a repeated id", () => {
    const seen = new Set<number>();
    validateRecord(record(), seen);
    expect(() => validateRecord(record({ title: "Other" }), seen)).toThrow(/unique/);
  });
});

describe("toPublicEvent", () => {
  it("shapes the entry like the live response, on the event's own clock", () => {
    const e = toPublicEvent(record({ registrationUrl: "https://example.com/r" }), NOW);
    expect(e.sessions[0].startTime).toBe("19:00:00");
    expect(e.sessions[0].startsAt).toBe("2027-01-15T12:00:00.000Z"); // 19:00 WIB = 12:00 UTC
    expect(e.timezoneLabel).toBe("WIB");
    expect(e.registrationUrl).toBe("https://example.com/r");
    expect(e.past).toBe(false);
    expect(e.nextStartsAt).toBe("2027-01-15T12:00:00.000Z");
  });

  it("points the poster at public/events/, or none when blank", () => {
    expect(toPublicEvent(record(), NOW).posterUrl).toMatch(/\/events\/calm\.jpg$/);
    expect(toPublicEvent(record({ poster: "" }), NOW).posterUrl).toBeNull();
  });

  it("works out past from the clock", () => {
    expect(toPublicEvent(record(), new Date("2027-02-01T00:00:00Z")).past).toBe(true);
  });
});

describe("selectEventsPage", () => {
  const upcomingSoon = toPublicEvent(record({ id: -1, title: "Soon" }), NOW);
  const upcomingLater = toPublicEvent(record({ id: -2, title: "Later", format: "IN_PERSON", sessions: [{ date: "2027-03-01", startTime: "10:00", endTime: "12:00" }] }), NOW);
  const hybrid = toPublicEvent(record({ id: -3, title: "Both", format: "HYBRID", sessions: [{ date: "2027-02-01", startTime: "10:00", endTime: "12:00" }] }), NOW);
  const past = toPublicEvent(record({ id: -4, title: "Done", sessions: [{ date: "2026-12-01", startTime: "10:00", endTime: "12:00" }] }), NOW);
  const all = [upcomingLater, past, hybrid, upcomingSoon];

  it("lists upcoming events soonest first and keeps past ones out", () => {
    expect(selectEventsPage(all, "upcoming", null, 24).content.map((e) => e.title)).toEqual(["Soon", "Both", "Later"]);
  });

  it("lists past events", () => {
    expect(selectEventsPage(all, "past", null, 24).content.map((e) => e.title)).toEqual(["Done"]);
  });

  it("filters by format, letting hybrid events appear under both", () => {
    expect(selectEventsPage(all, "upcoming", "ONLINE", 24).content.map((e) => e.title)).toEqual(["Soon", "Both"]);
    expect(selectEventsPage(all, "upcoming", "IN_PERSON", 24).content.map((e) => e.title)).toEqual(["Both", "Later"]);
  });

  it("respects the page size and reports the total", () => {
    const page = selectEventsPage(all, "upcoming", null, 1);
    expect(page.content).toHaveLength(1);
    expect(page.totalElements).toBe(3);
  });

  it("serves later pages and flags the first and last", () => {
    const second = selectEventsPage(all, "upcoming", null, 2, 1);
    expect(second.content).toHaveLength(1);
    expect(second).toMatchObject({ number: 1, totalPages: 2, first: false, last: true });
  });

  it("returns an empty page, not an error, when nothing matches", () => {
    expect(selectEventsPage([], "upcoming", null, 24)).toMatchObject({ content: [], totalElements: 0, totalPages: 0 });
  });
});

describe("the shipped file", () => {
  it("loads and shows exactly the enabled entries, keeping disabled ones out of the site", () => {
    const records = (fallbackData as { events: { id: number; enabled?: boolean }[] }).events;
    const enabled = records.filter((r) => r.enabled !== false).map((r) => r.id);
    expect(getFallbackEvents(NOW).map((e) => e.id).sort()).toEqual([...enabled].sort());
    for (const r of records.filter((x) => x.enabled === false)) {
      expect(getFallbackEvent(r.id, NOW)).toBeNull();
    }
  });

  it("knows built-in ids by their sign", () => {
    expect(isFallbackEventId(-1)).toBe(true);
    expect(isFallbackEventId(12)).toBe(false);
    expect(FALLBACK_EVENT_NOT_FOUND).toMatch(/not found/i);
  });
});
