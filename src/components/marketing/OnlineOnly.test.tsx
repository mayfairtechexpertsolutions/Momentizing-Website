import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnlineOnly } from "./OnlineOnly";
import { useBackendStatus } from "@/lib/backend-status";

vi.mock("@/lib/backend-status", () => ({ useBackendStatus: vi.fn() }));
const status = vi.mocked(useBackendStatus);

const renderIt = () => render(<OnlineOnly offline={<p>use WhatsApp</p>}><a href="/login">Log in</a></OnlineOnly>);

describe("OnlineOnly", () => {
  beforeEach(() => status.mockReset());

  it("shows the backend feature while the backend answers", () => {
    status.mockReturnValue("online");
    renderIt();
    expect(screen.getByRole("link", { name: "Log in" })).toBeTruthy();
    expect(screen.queryByText("use WhatsApp")).toBeNull();
  });

  it("swaps in the alternative when the backend is down", () => {
    status.mockReturnValue("offline");
    renderIt();
    expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
    expect(screen.getByText("use WhatsApp")).toBeTruthy();
  });

  it("shows neither before the first answer, so nothing flashes", () => {
    status.mockReturnValue("checking");
    renderIt();
    expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
    expect(screen.queryByText("use WhatsApp")).toBeNull();
  });
});
