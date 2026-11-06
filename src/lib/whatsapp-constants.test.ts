import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildWhatsAppLink, MOMENTIZING_WHATSAPP_DISPLAY, MOMENTIZING_WHATSAPP_NUMBER } from "./whatsapp-constants";
import { siteGraph } from "./structured-data";
import { GET } from "../app/llms.txt/route";

describe("business WhatsApp constants on the server", () => {
  it("whatsapp-constants is not a client module (server code imports it)", () => {
    expect(readFileSync(join(process.cwd(), "src/lib/whatsapp-constants.ts"), "utf8")).not.toMatch(/^\s*["']use client["']/);
  });

  it("builds a wa.me link", () => {
    expect(buildWhatsAppLink("Hi there")).toBe(`https://wa.me/${MOMENTIZING_WHATSAPP_NUMBER}?text=Hi%20there`);
  });

  it("llms.txt carries the readable number", async () => {
    const body = await GET().text();
    expect(body).toContain(MOMENTIZING_WHATSAPP_DISPLAY);
    expect(body).not.toMatch(/function|Attempted to call/);
  });

  it("JSON-LD contact link is a plain wa.me URL", () => {
    expect(JSON.stringify(siteGraph)).toMatch(/"url":"https:\/\/wa\.me\/\d+"/);
  });
});
