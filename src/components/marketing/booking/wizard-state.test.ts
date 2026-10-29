import { describe, expect, it } from "vitest";
import { COUPLE_MISMATCH_CODES, EMPTY_DRAFT, couplesMismatch } from "./wizard-state";

const answers = (couple: boolean | null) => ({ ...EMPTY_DRAFT.answers, couple });

describe("couplesMismatch", () => {
  it("flags a couple session with a specialist who doesn't accept couples", () => {
    expect(couplesMismatch(answers(true), { acceptsCouple: false })).toBe(true);
  });
  it("allows a couple session with a couples-friendly specialist", () => {
    expect(couplesMismatch(answers(true), { acceptsCouple: true })).toBe(false);
  });
  it("ignores individual or unanswered sessions", () => {
    expect(couplesMismatch(answers(false), { acceptsCouple: false })).toBe(false);
    expect(couplesMismatch(answers(null), { acceptsCouple: false })).toBe(false);
  });
  it("ignores a missing specialist", () => {
    expect(couplesMismatch(answers(true), null)).toBe(false);
  });
});

describe("COUPLE_MISMATCH_CODES", () => {
  it("lists the server's codes for a couple/individual mismatch", () => {
    expect(COUPLE_MISMATCH_CODES).toContain("BOOKING_NO_COUPLE_SESSIONS");
    expect(COUPLE_MISMATCH_CODES).toContain("BOOKING_NO_INDIVIDUAL_SESSIONS");
  });
});
