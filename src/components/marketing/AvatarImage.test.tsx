import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AvatarImage } from "./AvatarImage";

describe("AvatarImage", () => {
  it("shows the photo, and swaps to the fallback when the file cannot be loaded", () => {
    render(<AvatarImage src="/team/missing.jpg" fallbackSrc="/team/default/neutral.svg" alt="Portrait of Sari" />);
    const img = screen.getByAltText("Portrait of Sari");
    expect(img).toHaveAttribute("src", "/team/missing.jpg");
    fireEvent.error(img);
    expect(img).toHaveAttribute("src", "/team/default/neutral.svg");
  });

  it("leaves a photo without a fallback alone (live profiles)", () => {
    render(<AvatarImage src="https://cdn.example/a.jpg" alt="A" />);
    const img = screen.getByAltText("A");
    fireEvent.error(img);
    expect(img).toHaveAttribute("src", "https://cdn.example/a.jpg");
  });
});
