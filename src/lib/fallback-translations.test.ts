import { afterEach, describe, expect, it } from "vitest";
import fallbackData from "@/data/fallback-specialists.json";
import eventData from "@/data/fallback-events.json";
import { setLocale } from "@/i18n";
import { FALLBACK_SPECIALISTS, fallbackDirectoryPage, fallbackSpecialists, getFallbackSpecialist } from "./fallback-specialists";
import { getFallbackPackages } from "./fallback-packages";
import { toPublicEvent, type FallbackEventRecord } from "./fallback-events";

afterEach(() => setLocale("en"));

describe("built-in specialists in Indonesian", () => {
  it("every profile has an Indonesian bio and lists that line up with the English ones", () => {
    for (const r of fallbackData.specialists as unknown as { name: string; areasOfExpertise: string[]; credentials: string[]; translations?: { id?: { bio?: string; areasOfExpertise?: string[]; credentials?: string[] } } }[]) {
      const id = r.translations?.id;
      expect(id?.bio, r.name).toBeTruthy();
      expect(id?.areasOfExpertise?.length, r.name).toBe(r.areasOfExpertise.length);
      expect(id?.credentials?.length, r.name).toBe(r.credentials.length);
    }
  });

  it("serves English by default and Indonesian when the site is read in Indonesian", () => {
    expect(getFallbackSpecialist(-4)?.bio).toBe("Intercultural mixed couple coach of Momentizing.");
    setLocale("id");
    const fida = getFallbackSpecialist(-4)!;
    expect(fida.bio).toBe("Coach pasangan campuran lintas budaya di Momentizing.");
    expect(fida.specialisation).toContain("Pola asuh");
    expect(fida.languages).toBe("Bahasa Indonesia, Inggris, Prancis");
    expect(fallbackDirectoryPage(3).content[0].bio).toMatch(/Pendiri/);
    // Names, ids, photos, hours and places do not change with the language.
    const en = FALLBACK_SPECIALISTS.find((s) => s.id === -4)!;
    expect(fida.name).toBe(en.name);
    expect(fida.weeklySlots).toEqual(en.weeklySlots);
    expect(fida.locations).toEqual(en.locations);
    expect(fallbackSpecialists()).toHaveLength(FALLBACK_SPECIALISTS.length);
  });
});

describe("built-in events in Indonesian", () => {
  const record = { ...(eventData.events[0] as unknown as FallbackEventRecord), enabled: true };

  it("uses translations.id when the site is Indonesian and falls back to English field by field", () => {
    expect(toPublicEvent(record).summary).toBe(record.summary);
    setLocale("id");
    const event = toPublicEvent(record);
    expect(event.summary).toBe(record.translations!.id!.summary);
    expect(event.title).toBe(record.title); // no translated title in the sample: English shown
    const partial = toPublicEvent({ ...record, translations: { id: { summary: "Ringkas" } } });
    expect(partial.summary).toBe("Ringkas");
    expect(partial.description).toBe(record.description);
  });
});

describe("profession labels", () => {
  it("translates every built-in profession type", async () => {
    const { professionLabel } = await import("./marketing-directory");
    const types = [...new Set((fallbackData.specialists as { professionType: string }[]).map((s) => s.professionType))];
    expect(types.map((t) => professionLabel(t))).toEqual(["Clinical psychologist", "Counselor", "Coach", "Wellness practitioner"]);
    setLocale("id");
    expect(types.map((t) => professionLabel(t))).toEqual(["Psikolog klinis", "Konselor", "Coach", "Praktisi kesejahteraan"]);
  });
});

describe("built-in packages in Indonesian", () => {
  it("keeps names and prices, translates description and badge", () => {
    const en = getFallbackPackages();
    setLocale("id");
    const id = getFallbackPackages();
    expect(id.map((p) => p.name)).toEqual(en.map((p) => p.name));
    expect(id.map((p) => p.priceCents)).toEqual(en.map((p) => p.priceCents));
    expect(id.every((p, i) => p.description && p.description !== en[i].description)).toBe(true);
    expect(id.find((p) => p.badgeLabel)?.badgeLabel).toBe("Paling Populer");
  });
});
