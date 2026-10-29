import { describe, expect, it } from "vitest";
import { buildIcs, formatEventDate, headlineSession, placeText, priceText, timeRange, videoEmbedUrl, type PublicEvent } from "./events";

const event: PublicEvent = {
  id: 7,
  title: "Mindful evenings; together",
  summary: "Breathe, write, rest",
  tags: [],
  format: "HYBRID",
  venueName: "Momentizing Studio",
  address: "Jl. Kemang Raya 1",
  city: "Jakarta",
  priceType: "PAID",
  priceLabel: "Rp 150.000",
  timezone: "Asia/Jakarta",
  timezoneLabel: "WIB",
  cancelled: false,
  past: false,
  sessions: [
    { id: 1, startsAt: "2026-11-12T12:00:00Z", endsAt: "2026-11-12T14:00:00Z", date: "2026-11-12", startTime: "19:00:00", endTime: "21:00:00" },
    { id: 2, startsAt: "2026-11-19T12:00:00Z", endsAt: "2026-11-19T14:00:00Z", date: "2026-11-19", startTime: "19:00:00", endTime: "21:00:00" },
  ],
};

describe("event text helpers", () => {
  it("formats the wall date and time range on the event's clock", () => {
    expect(formatEventDate("2026-11-12")).toBe("Thu, 12 Nov 2026");
    expect(timeRange(event.sessions[0], "WIB")).toBe("19:00–21:00 WIB");
  });

  it("describes price and place", () => {
    expect(priceText(event)).toBe("Rp 150.000");
    expect(priceText({ priceType: "FREE", priceLabel: "ignored" })).toBe("Free");
    expect(placeText(event)).toBe("Momentizing Studio, Jakarta · or online");
    expect(placeText({ format: "ONLINE", venueName: "x", city: "y" })).toBe("Online");
  });

  it("headlines the next session to come", () => {
    expect(headlineSession(event, new Date("2026-11-15T00:00:00Z"))?.id).toBe(2);
    expect(headlineSession(event, new Date("2027-01-01T00:00:00Z"))?.id).toBe(2);
  });

  it("only embeds YouTube and Vimeo", () => {
    expect(videoEmbedUrl("https://youtu.be/abc")).toBe("https://www.youtube-nocookie.com/embed/abc");
    expect(videoEmbedUrl("https://evil.example.com/x")).toBeNull();
  });
});

describe("buildIcs", () => {
  it("writes a UTC VEVENT with escaped text", () => {
    const ics = buildIcs(event, event.sessions[0], "https://momentizing.com/events/view/?id=7");
    expect(ics).toContain("DTSTART:20261112T120000Z");
    expect(ics).toContain("DTEND:20261112T140000Z");
    expect(ics).toContain("SUMMARY:Mindful evenings\\; together");
    expect(ics).toContain("LOCATION:Momentizing Studio\\, Jl. Kemang Raya 1\\, Jakarta");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});
