import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { getFallbackSpecialist, toPublicCard } from "@/lib/fallback-specialists";
import { ManualReview } from "./ManualReview";
import { ManualTimeStep } from "./ManualTimeStep";
import { EMPTY_DRAFT, type Draft } from "./wizard-state";

const adeline = toPublicCard(getFallbackSpecialist(-1)!);
// 2026-11-03 is a Tuesday (Adeline works Tuesdays 1–3 PM WIB).
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

beforeAll(() => {
  // jsdom has no matchMedia / scrollTo; DateStrip uses both to keep the chosen day in view.
  window.matchMedia = ((query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })) as unknown as typeof window.matchMedia;
  Element.prototype.scrollTo = vi.fn();
});

describe("ManualTimeStep", () => {
  it("shows the usual hours and warns, without blocking, when the time is outside them", () => {
    const onNext = vi.fn();
    render(<ManualTimeStep draft={{ ...draft, time: "19:00" }} patch={vi.fn()} headingRef={createRef()} onNext={onNext} />);
    expect(screen.getByText(/usual hours/i, { selector: "p" })).toBeTruthy();
    expect(screen.getByText(/outside Adeline's usual hours/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onNext).toHaveBeenCalled();
  });

  it("does not warn inside the usual hours and blocks Continue until a time is chosen", () => {
    const { rerender } = render(<ManualTimeStep draft={draft} patch={vi.fn()} headingRef={createRef()} onNext={vi.fn()} />);
    expect(screen.queryByText(/outside Adeline's usual hours/i)).toBeNull();
    rerender(<ManualTimeStep draft={{ ...draft, time: null }} patch={vi.fn()} headingRef={createRef()} onNext={vi.fn()} />);
    expect((screen.getByRole("button", { name: "Continue" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

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
