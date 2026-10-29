import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingFonts } from "./MarketingFonts";

describe("MarketingFonts", () => {
  it("adds the icon-font stylesheet once, without rendering a blocking <link precedence> into the page", () => {
    const { container, unmount } = render(<MarketingFonts />);
    expect(container.querySelector("link")).toBeNull();
    const links = document.head.querySelectorAll('link[href*="font-awesome"]');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("precedence")).toBeNull();
    unmount();
    render(<MarketingFonts />);
    expect(document.head.querySelectorAll('link[href*="font-awesome"]')).toHaveLength(1);
  });
});
