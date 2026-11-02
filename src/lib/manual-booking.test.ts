import { describe, expect, it } from "vitest";
import { MANUAL_TIME_OPTIONS, MAX_MANUAL_NOTE_CHARS, buildManualBookingMessage, type ManualBookingRequest } from "./manual-booking";

const base: ManualBookingRequest = {
  specialistName: "Adeline Herdianto",
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
    expect(text).toContain("1:00 PM (WIB)");
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

describe("MANUAL_TIME_OPTIONS", () => {
  it("lists half-hour starts from 06:00 to 21:30", () => {
    expect(MANUAL_TIME_OPTIONS[0]).toBe("06:00");
    expect(MANUAL_TIME_OPTIONS[1]).toBe("06:30");
    expect(MANUAL_TIME_OPTIONS.at(-1)).toBe("21:30");
  });
});
