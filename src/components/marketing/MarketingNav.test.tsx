import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarketingNav } from "./MarketingNav";
import { useBackendStatus } from "@/lib/backend-status";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/lib/backend-status", () => ({ useBackendStatus: vi.fn(() => "online") }));
const backendStatus = vi.mocked(useBackendStatus);

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

  it("drops the Account menu (bookings, login, app) while the backend is down, keeping the language switch", () => {
    backendStatus.mockReturnValue("offline");
    render(<MarketingNav />);
    expect(screen.queryByRole("button", { name: "Account" })).toBeNull();
    expect(screen.queryByRole("link", { name: /log in|get the app|my bookings/i })).toBeNull();
    expect(screen.getByRole("link", { name: "Book a Session" })).toBeTruthy();
    backendStatus.mockReturnValue("online");
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
