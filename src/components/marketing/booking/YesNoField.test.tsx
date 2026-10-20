import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YesNoField } from "./YesNoField";

describe("YesNoField", () => {
  it("is a labelled radio group and reports the choice", async () => {
    const onChange = vi.fn();
    render(<YesNoField name="q" legend="Are you 18 or older?" value={null} onChange={onChange} />);
    expect(screen.getByRole("group", { name: "Are you 18 or older?" })).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Yes"));
    expect(onChange).toHaveBeenCalledWith(true);
    await userEvent.click(screen.getByLabelText("No"));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("marks the current answer and announces an error", () => {
    render(<YesNoField name="q" legend="Q?" value={false} onChange={() => {}} error="Please choose yes or no." />);
    expect(screen.getByLabelText("No")).toBeChecked();
    expect(screen.getByLabelText("Yes")).not.toBeChecked();
    expect(screen.getByRole("alert")).toHaveTextContent("Please choose yes or no.");
  });
});
