import { describe, expect, it } from "vitest";
import { newIdempotencyKey, verificationLink } from "./guest-booking";
import { answersToRecord, looksLikePhone } from "@/components/marketing/booking/wizard-state";

describe("guest booking helpers", () => {
  it("builds the WhatsApp verification link from the number the SERVER names", () => {
    const url = verificationLink({ verificationWhatsapp: "+6285702200701", verificationMessage: "Hi, my code is MOM-ABC234" });
    expect(url.startsWith("https://wa.me/6285702200701?text=")).toBe(true);
    expect(decodeURIComponent(url.split("?text=")[1])).toBe("Hi, my code is MOM-ABC234");
  });

  it("falls back to the configured business number when the server sends none", () => {
    expect(verificationLink({ verificationWhatsapp: "", verificationMessage: "x" })).toContain("wa.me/6285702200701");
  });

  it("generates a distinct idempotency key every call", () => {
    const keys = new Set(Array.from({ length: 50 }, () => newIdempotencyKey()));
    expect(keys.size).toBe(50);
  });

  it("does a loose sanity check on phone numbers without rejecting real formats", () => {
    for (const ok of ["0812 5550 4321", "+62 812-5550-4321", "62812 5550 4321", "+1 (415) 555-2671"]) {
      expect(looksLikePhone(ok)).toBe(true);
    }
    for (const bad of ["", "abc", "1234", "0812", "hello world 123"]) {
      expect(looksLikePhone(bad)).toBe(false);
    }
  });

  it("records the visitor's answers for staff, skipping unanswered ones", () => {
    const rec = answersToRecord({ firstTime: true, online: false, couple: null, adult: true, urgent: false }, ["Sleep", "Anxiety"]);
    expect(rec).toMatchObject({ firstTimeInTherapy: "yes", prefersOnline: "no", forCouple: "", adult: "yes", urgentConcern: "no", concerns: "Sleep, Anxiety" });
  });
});

import { friendlyError } from "./guest-booking";
import { ApiError } from "./api";

describe("friendlyError", () => {
  it("turns a raw network failure into words a person can act on", () => {
    expect(friendlyError(new TypeError("Failed to fetch"))).toMatch(/can't reach the server/i);
    expect(friendlyError(new Error("Load failed"))).toMatch(/can't reach the server/i);
  });
  it("keeps the server's own message for API errors", () => {
    expect(friendlyError(new ApiError("That time is no longer available.", 409))).toBe("That time is no longer available.");
  });
  it("uses the fallback for unknown values", () => {
    expect(friendlyError("boom", "Try again")).toBe("Try again");
  });
});
