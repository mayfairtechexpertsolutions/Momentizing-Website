import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFavorites } from "./favorites";

describe("useFavorites", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("toggles and persists in localStorage", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggleFavorite(7));
    expect(result.current.isFavorite(7)).toBe(true);
    expect(JSON.parse(localStorage.getItem("momentizing:favorite-specialists")!)).toEqual([7]);
    act(() => result.current.toggleFavorite(7));
    expect(result.current.isFavorite(7)).toBe(false);
  });

  it("still toggles (without throwing) when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggleFavorite(9));
    expect(result.current.isFavorite(9)).toBe(true);
    act(() => result.current.toggleFavorite(9));
    expect(result.current.isFavorite(9)).toBe(false);
  });
});
