import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as query from "./use-api-query";
import * as fallback from "./fallback-events";
import { useEvent, useEvents } from "./events";

vi.mock("./use-api-query", () => ({ useApiQuery: vi.fn() }));
const useApiQuery = vi.mocked(query.useApiQuery);

const state = (over: Partial<ReturnType<typeof query.useApiQuery>>) => ({ data: null, error: null, isLoading: false, unavailable: false, refetch: vi.fn(), ...over }) as ReturnType<typeof query.useApiQuery>;

describe("events hooks", () => {
  beforeEach(() => useApiQuery.mockReset());

  it("uses the built-in events only when the backend is unavailable", () => {
    const spy = vi.spyOn(fallback, "fallbackEventsPage");
    useApiQuery.mockReturnValue(state({ unavailable: true, error: "Can't reach the server" }));
    const { result } = renderHook(() => useEvents("upcoming", null));
    expect(spy).toHaveBeenCalledWith("upcoming", null, 12, expect.any(Date), 0);
    expect(result.current).toMatchObject({ isFallback: true, error: null, isLoading: false });
  });

  it("never swaps in built-in events for a 4xx or an empty live list", () => {
    useApiQuery.mockReturnValue(state({ error: "Forbidden", unavailable: false }));
    expect(renderHook(() => useEvents("upcoming", null)).result.current).toMatchObject({ isFallback: false, error: "Forbidden" });
    useApiQuery.mockReturnValue(state({ data: { content: [], totalElements: 0 } as never }));
    expect(renderHook(() => useEvents("upcoming", null)).result.current.isFallback).toBe(false);
  });

  it("resolves a negative id locally, with no request", () => {
    useApiQuery.mockReturnValue(state({}));
    const { result } = renderHook(() => useEvent(-5));
    expect(useApiQuery).toHaveBeenCalledWith(null, expect.anything(), [-5]);
    expect(result.current.error).toMatch(/not found/i); // unknown built-in id is a 404, not a load failure
  });

  it("requests a real id from the backend", () => {
    useApiQuery.mockReturnValue(state({}));
    renderHook(() => useEvent(12));
    expect(useApiQuery).toHaveBeenCalledWith("/public/events/12", expect.anything(), [12]);
  });
});
