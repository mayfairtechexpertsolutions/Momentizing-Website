import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import LegalPage from "./page";

afterEach(() => {
  cleanup();
  window.location.hash = "";
});

describe("LegalPage", () => {
  it("opens on the Terms by default", () => {
    render(<LegalPage />);
    expect(screen.getByRole("heading", { level: 2, name: /Terms & Conditions/ })).toBeTruthy();
  });

  it("opens the Terms from #terms, with the not-an-emergency clause", () => {
    window.location.hash = "terms";
    render(<LegalPage />);
    expect(screen.getByRole("heading", { level: 2, name: /Terms & Conditions/ })).toBeTruthy();
    expect(screen.getByText(/not equipped for emergencies/i)).toBeTruthy();
  });

  it("opens the Privacy Policy from #privacy, and states that we set no cookies of our own", () => {
    window.location.hash = "privacy";
    render(<LegalPage />);
    expect(screen.getByRole("heading", { level: 2, name: "Privacy Policy" })).toBeTruthy();
    expect(screen.getByText(/do not set cookies of our own/i)).toBeTruthy();
  });
});
