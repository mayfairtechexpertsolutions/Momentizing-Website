import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarketingNav } from "./MarketingNav";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("MarketingNav", () => {
  it("shows Events in the bar", () => {
    render(<MarketingNav />);
    expect(screen.getAllByRole("link", { name: "Events" })[0].getAttribute("href")).toBe("/events");
  });

  it("opens the Services menu and closes it with Escape, returning focus", () => {
    render(<MarketingNav />);
    const trigger = screen.getByRole("button", { name: /services/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const panel = document.getElementById(trigger.getAttribute("aria-controls")!)!;
    expect(within(panel).getByRole("link", { name: /packages/i }).getAttribute("href")).toBe("#packages");
    trigger.blur();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("keeps My bookings and Log in under Account", () => {
    render(<MarketingNav />);
    const trigger = screen.getByRole("button", { name: "Account" });
    fireEvent.click(trigger);
    const panel = document.getElementById(trigger.getAttribute("aria-controls")!)!;
    expect(within(panel).getByRole("link", { name: /my bookings/i }).getAttribute("href")).toBe("/my-bookings");
    expect(within(panel).getByRole("link", { name: /log in/i }).getAttribute("href")).toContain("/login");
  });

  it("lists Events in the mobile menu", () => {
    // jsdom has no matchMedia; the menu only uses it to close itself when the viewport grows to desktop width.
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    render(<MarketingNav />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = document.getElementById("marketing-mobile-menu")!;
    expect(within(menu).getByRole("link", { name: "Events" }).getAttribute("href")).toBe("/events");
    expect(within(menu).getByRole("link", { name: "Careers" })).toBeTruthy();
  });
});
