import { describe, expect, it } from "vitest";
import { FALLBACK_CRISIS_RESOURCES, FALLBACK_ID_RESOURCES, crisisContactHref, mergeCrisisResources } from "./fallback-crisis-resources";

describe("crisis resources fallback", () => {
  it("lists at least one phone line and one website", () => {
    expect(FALLBACK_CRISIS_RESOURCES.some((r) => !/^https?:/.test(r.contact))).toBe(true);
    expect(FALLBACK_CRISIS_RESOURCES.some((r) => /^https?:/.test(r.contact))).toBe(true);
  });
  it("links websites as websites and phone numbers as tel: without the extension text", () => {
    expect(crisisContactHref("https://findahelpline.com")).toBe("https://findahelpline.com");
    expect(crisisContactHref("119 ext. 8")).toBe("tel:119");
    expect(crisisContactHref("988")).toBe("tel:988");
    expect(crisisContactHref("+62 21 500 454")).toBe("tel:+6221500454");
  });

  it("merges Indonesian helplines first, then international, without repeats", () => {
    const live = { id: [{ name: "SEJIWA", contact: "119 ext. 8" }], intl: [{ name: "Findahelpline.com", contact: "https://findahelpline.com" }, { name: "SEJIWA", contact: "119 ext. 8" }] };
    expect(mergeCrisisResources(live).map((r) => r.contact)).toEqual(["119 ext. 8", "https://findahelpline.com"]);
  });

  it("falls back per region: a live international list alone still shows the Indonesian helplines", () => {
    const merged = mergeCrisisResources({ id: null, intl: [{ name: "Findahelpline.com", contact: "https://findahelpline.com" }] });
    expect(merged.slice(0, FALLBACK_ID_RESOURCES.length)).toEqual(FALLBACK_ID_RESOURCES);
    expect(merged.some((r) => r.contact === "https://findahelpline.com")).toBe(true);
    expect(mergeCrisisResources({})).toEqual(FALLBACK_CRISIS_RESOURCES);
  });
});
