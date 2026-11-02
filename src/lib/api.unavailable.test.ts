import { describe, expect, it } from "vitest";
import { ApiError, isBackendUnavailable } from "./api";

describe("isBackendUnavailable", () => {
  it("is true for network failures and 5xx answers", () => {
    expect(isBackendUnavailable(new TypeError("Failed to fetch"))).toBe(true);
    expect(isBackendUnavailable(new ApiError("bad gateway", 502))).toBe(true);
    expect(isBackendUnavailable(new ApiError("boom", 500))).toBe(true);
  });

  it("is false when the backend answered with a client error", () => {
    expect(isBackendUnavailable(new ApiError("not found", 404))).toBe(false);
    expect(isBackendUnavailable(new ApiError("invalid", 400))).toBe(false);
    expect(isBackendUnavailable(new ApiError("slow down", 429))).toBe(false);
  });

  it("is false for non-error values", () => {
    expect(isBackendUnavailable(undefined)).toBe(false);
    expect(isBackendUnavailable("oops")).toBe(false);
  });
});
