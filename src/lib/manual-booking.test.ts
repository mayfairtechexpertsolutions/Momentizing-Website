import { describe, expect, it } from "vitest";
import { MAX_MANUAL_NOTE_CHARS, buildManualBookingMessage, formatManualWhen, toExpertClock, type ManualBookingRequest } from "./manual-booking";

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
