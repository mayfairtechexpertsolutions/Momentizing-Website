import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingModal } from "./BookingModal";

vi.mock("@/lib/session-packages", () => ({
  usePackages: () => ({
    data: [
      { id: -1, name: "Single Session" },
      { id: -2, name: "Caring Session" },
    ],
  }),
}));
vi.mock("@/lib/whatsapp", () => ({ useWhatsAppLink: () => (m?: string) => `https://wa.me/1?text=${encodeURIComponent(m ?? "")}` }));
vi.mock("@/lib/api", () => ({ apiFetch: vi.fn().mockRejectedValue(new Error("offline")), errorMessage: () => "offline" }));

describe("BookingModal topic", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
    HTMLDialogElement.prototype.showModal ??= function () {
      this.setAttribute("open", "");
    };
  });

  it("opened for corporate (no package) it does not default to the first package", async () => {
    render(<BookingModal open onClose={() => {}} />);
    const select = (await screen.findByLabelText(/interested in/i)) as HTMLSelectElement;
    expect(select.value).toBe("");
    await userEvent.type(screen.getByLabelText(/your name/i), "Kim");
    await userEvent.click(screen.getByRole("button", { name: /whatsapp/i }));
    expect(vi.mocked(window.open).mock.calls[0][0]).toContain(encodeURIComponent("corporate wellbeing"));
    expect(vi.mocked(window.open).mock.calls[0][0]).not.toContain("Single");
  });

  it("opened from a package card it starts on that package", async () => {
    render(<BookingModal open initialPackageId={-2} onClose={() => {}} />);
    expect(((await screen.findByLabelText(/interested in/i)) as HTMLSelectElement).value).toBe("-2");
  });
});
