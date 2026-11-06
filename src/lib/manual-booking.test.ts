import { describe, expect, it } from "vitest";
import { MAX_MANUAL_NOTE_CHARS, buildManualBookingMessage, dropPastTimes, formatManualWhen, requestedHoursSlots, toExpertClock, type ManualBookingRequest } from "./manual-booking";
import type { PublicSlots } from "./guest-booking";

const base: ManualBookingRequest = {
  specialistName: "Adeline Herdianto",
  expertTimeZone: "Asia/Jakarta",
  date: "2026-11-03",
  time: "13:00",
  fullName: " Sari ",
  whatsapp: "+62 812 3456 7890",
  answers: { firstTime: true, online: true, couple: false, adult: true, urgent: false },
  concerns: ["Anxiety", "Sleep"],
  note: "",
};

describe("buildManualBookingMessage", () => {
  it("summarises the request for the team", () => {
    const text = buildManualBookingMessage(base);
    expect(text).toContain("Specialist: Adeline Herdianto");
    expect(text).toContain("Preferred time: ");
    expect(text).toContain("1:00 PM");
    expect(text).toContain("Name: Sari");
    expect(text).toContain("WhatsApp: +62 812 3456 7890");
    expect(text).toContain("Session for a couple: No");
    expect(text).toContain("Would like support with: Anxiety, Sleep");
    expect(text).not.toContain("Note:");
  });

  it("includes a note and marks urgent answers", () => {
    const text = buildManualBookingMessage({ ...base, note: "Evenings are hard", answers: { ...base.answers, urgent: true } });
    expect(text).toContain("Note: Evenings are hard");
    expect(text).toContain("Anything urgent or unsafe right now: Yes");
  });

  it("truncates a very long note", () => {
    const text = buildManualBookingMessage({ ...base, note: "x".repeat(MAX_MANUAL_NOTE_CHARS + 200) });
    const note = text.split("\n").find((l) => l.startsWith("Note: "))!;
    expect(note.length).toBeLessThanOrEqual("Note: ".length + MAX_MANUAL_NOTE_CHARS);
    expect(note.endsWith("…")).toBe(true);
  });

  it("reports unanswered questions and omits empty concerns", () => {
    const text = buildManualBookingMessage({ ...base, concerns: [], answers: { ...base.answers, firstTime: null } });
    expect(text).toContain("therapist or counsellor: Not answered");
    expect(text).not.toContain("Would like support with");
  });
});

describe("time zones", () => {
  // vitest.setup.ts runs the suite in America/Los_Angeles (PST, UTC-8, in November) unless TEST_TZ says otherwise.
  it("converts the visitor's clock to the expert's clock", () => {
    const zoneOffsetHours = -new Date(2026, 10, 3, 12).getTimezoneOffset() / 60;
    const expectedHour = (13 - zoneOffsetHours + 7 + 24) % 24;
    expect(toExpertClock("2026-11-03", "13:00", "Asia/Jakarta")).toBe(`${String(expectedHour).padStart(2, "0")}:00`);
  });

  it("states the time on the visitor's clock and, when not on WIB, the WIB equivalent", () => {
    const when = formatManualWhen("2026-11-03", "13:00", "Asia/Jakarta");
    expect(when).toContain("1:00 PM");
    // Visitor in Los Angeles: 13:00 PST is 04:00 the next day in Jakarta. On a Jakarta clock no conversion is added.
    expect(when.includes("= ")).toBe(!/\((WIB|GMT\+7)\)/.test(when));
  });
});

describe("without a known expert zone", () => {
  it("states the time on the visitor's clock only", () => {
    const text = formatManualWhen("2026-11-03", "13:00");
    expect(text).toContain("1:00 PM");
    expect(text).not.toContain("=");
  });
});

describe("requestedHoursSlots", () => {
  it("offers the same waking-hours grid on every day of the window", () => {
    const res = requestedHoursSlots(7, "Someone", "2026-11-03", 3);
    expect(res.days.map((d) => d.date)).toEqual(["2026-11-03", "2026-11-04", "2026-11-05"]);
    expect(res.days[0].times[0]).toBe("08:00");
    expect(res.days[0].times.at(-1)).toBe("20:00");
  });
});

describe("dropPastTimes", () => {
  const slots = (): PublicSlots => ({
    specialistId: -4,
    specialistName: "Fida",
    durationMinutes: 60,
    sessionTypes: [],
    timezone: "viewer",
    days: [
      { date: "2026-11-06", times: ["09:00", "10:00", "15:00", "16:00"] },
      { date: "2026-11-07", times: ["09:00"] },
    ],
    nextAvailableDate: "2026-11-06",
  });

  it("drops times that have passed or start within the lead time, keeps later days", () => {
    const out = dropPastTimes(slots(), new Date(2026, 10, 6, 13, 33), 120);
    expect(out.days[0].times).toEqual(["16:00"]);
    expect(out.days[1].times).toEqual(["09:00"]);
    expect(out.nextAvailableDate).toBe("2026-11-06");
  });

  it("moves nextAvailableDate when today is used up, and to null when nothing is left", () => {
    expect(dropPastTimes(slots(), new Date(2026, 10, 6, 20, 0)).nextAvailableDate).toBe("2026-11-07");
    expect(dropPastTimes(slots(), new Date(2026, 10, 8, 0, 0)).nextAvailableDate).toBeNull();
  });
});

describe("formatManualWhen across the date line", () => {
  it("names the expert's day when it differs from the visitor's (suite runs in America/Los_Angeles unless TEST_TZ is set)", () => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const text = formatManualWhen("2026-11-02", "09:00", "Asia/Jakarta");
    if (zone === "America/Los_Angeles") expect(text).toMatch(/9:00 AM \(PST\) = 12:00 AM GMT\+7 on Tuesday, November 3$/);
    if (zone === "Asia/Jakarta") expect(text).toBe("Monday, November 2 at 9:00 AM (GMT+7)");
  });
});
