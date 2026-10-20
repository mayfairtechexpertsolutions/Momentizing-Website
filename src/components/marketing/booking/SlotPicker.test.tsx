import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlotPicker } from "./SlotPicker";
import * as api from "@/lib/guest-booking";

vi.mock("@/lib/guest-booking", async (orig) => ({ ...(await orig<typeof import("@/lib/guest-booking")>()), fetchSlots: vi.fn() }));
const fetchSlots = vi.mocked(api.fetchSlots);

const slots = (days: { date: string; times: string[] }[], next: string | null = null): api.PublicSlots => ({
  specialistId: 1, specialistName: "Dr A", durationMinutes: 60, sessionTypes: ["ONLINE"], timezone: "UTC", days, nextAvailableDate: next,
});

describe("SlotPicker", () => {
  beforeEach(() => fetchSlots.mockReset());

  it("shows the open times grouped by part of day and reports the pick", async () => {
    fetchSlots.mockResolvedValue(slots([{ date: "2026-10-02", times: ["09:00", "14:00", "18:00"] }]));
    const onChange = vi.fn();
    render(<SlotPicker specialistId={1} date="2026-10-02" onDateChange={() => {}} value={null} onChange={onChange} />);
    expect(await screen.findByText("Morning")).toBeInTheDocument();
    expect(screen.getByText("Afternoon")).toBeInTheDocument();
    expect(screen.getByText("Evening")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /9:00/ }));
    expect(onChange).toHaveBeenCalledWith("09:00");
  });

  it("marks the chosen time as pressed", async () => {
    fetchSlots.mockResolvedValue(slots([{ date: "2026-10-02", times: ["09:00", "10:00"] }]));
    render(<SlotPicker specialistId={1} date="2026-10-02" onDateChange={() => {}} value="10:00" onChange={() => {}} />);
    expect(await screen.findByRole("button", { name: /10:00/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /9:00/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("shows a real ERROR with a retry when loading fails — never a misleading empty list", async () => {
    fetchSlots.mockRejectedValueOnce(new Error("Network down"));
    render(<SlotPicker specialistId={1} date="2026-10-02" onDateChange={() => {}} value={null} onChange={() => {}} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't load the available times/i);
    expect(screen.queryByText(/no open times/i)).not.toBeInTheDocument();

    fetchSlots.mockResolvedValueOnce(slots([{ date: "2026-10-02", times: ["09:00"] }]));
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByRole("button", { name: /9:00/ })).toBeInTheDocument();
  });

  it("offers the next days that DO have openings when the chosen day is empty", async () => {
    fetchSlots.mockResolvedValue(slots([
      { date: "2026-10-02", times: [] },
      { date: "2026-10-03", times: [] },
      { date: "2026-10-04", times: ["09:00", "10:00"] },
    ]));
    const onDateChange = vi.fn();
    render(<SlotPicker specialistId={1} date="2026-10-02" onDateChange={onDateChange} value={null} onChange={() => {}} />);
    expect(await screen.findByText(/no open times on this day/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /2 open/ }));
    expect(onDateChange).toHaveBeenCalledWith("2026-10-04");
  });

  it("points to the next available date when nothing is open in the window", async () => {
    fetchSlots.mockResolvedValue(slots([{ date: "2026-10-02", times: [] }], "2026-10-20"));
    const onDateChange = vi.fn();
    render(<SlotPicker specialistId={1} date="2026-10-02" onDateChange={onDateChange} value={null} onChange={() => {}} />);
    await userEvent.click(await screen.findByRole("button", { name: /jump to/i }));
    expect(onDateChange).toHaveBeenCalledWith("2026-10-20");
  });

  it("re-fetches when the refresh key changes (after 'that time was just taken')", async () => {
    fetchSlots.mockResolvedValue(slots([{ date: "2026-10-02", times: ["09:00"] }]));
    const { rerender } = render(<SlotPicker specialistId={1} date="2026-10-02" onDateChange={() => {}} value={null} onChange={() => {}} refreshKey={0} />);
    await screen.findByRole("button", { name: /9:00/ });
    rerender(<SlotPicker specialistId={1} date="2026-10-02" onDateChange={() => {}} value={null} onChange={() => {}} refreshKey={1} />);
    await waitFor(() => expect(fetchSlots).toHaveBeenCalledTimes(2));
  });
});
