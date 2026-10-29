import { describe, expect, it } from "vitest";
import { professionLabel } from "./marketing-directory";

describe("professionLabel", () => {
  it("turns the backend enum into a sentence-case label", () => {
    expect(professionLabel("PSYCHOLOGIST")).toBe("Psychologist");
    expect(professionLabel("SOCIAL_WORKER")).toBe("Social worker");
  });

  it("returns null when there is nothing to show", () => {
    expect(professionLabel(null)).toBeNull();
    expect(professionLabel(undefined)).toBeNull();
    expect(professionLabel("  ")).toBeNull();
  });
});
