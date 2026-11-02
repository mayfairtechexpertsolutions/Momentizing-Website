import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { getFallbackSpecialist, toPublicCard } from "@/lib/fallback-specialists";
import { ManualReview } from "./ManualReview";
import { EMPTY_DRAFT, type Draft } from "./wizard-state";

const adeline = toPublicCard(getFallbackSpecialist(-1)!);
const draft: Draft = {
  ...EMPTY_DRAFT,
  step: "time",
  specialist: adeline,
  mode: "SPECIFIC",
  date: "2026-11-03",
  time: "13:00",
  fullName: "Sari",
  whatsapp: "+62 812 3456 7890",
  answers: { firstTime: true, online: true, couple: false, adult: true, urgent: false },
};

describe("ManualReview", () => {
  it("opens WhatsApp with the summary, clears the draft and says it is not confirmed", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const onSent = vi.fn();
    render(<ManualReview draft={draft} headingRef={createRef()} onBack={vi.fn()} onEdit={vi.fn()} onSent={onSent} onStartOver={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Send request on WhatsApp" }));
    const url = decodeURIComponent(String(open.mock.calls[0][0]));
    expect(url).toContain("https://wa.me/");
    expect(url).toContain("Specialist: Adeline Herdianto");
    expect(url).toContain("Name: Sari");
    expect(onSent).toHaveBeenCalledOnce();
    expect(screen.getByText(/isn't confirmed yet/i)).toBeTruthy();
    open.mockRestore();
  });
});
