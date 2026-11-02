import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMarketingDirectory, useMarketingSpecialist } from "./marketing-directory";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

afterEach(() => vi.restoreAllMocks());

describe("useMarketingDirectory fallback", () => {
  it("serves the built-in team when the network fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    const { result } = renderHook(() => useMarketingDirectory(50));
    await waitFor(() => expect(result.current.isFallback).toBe(true));
    expect(result.current.data?.content).toHaveLength(5);
    expect(result.current.error).toBeNull();
  });

  it("serves the built-in team on a 5xx", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(503, { success: false, data: null, code: "X", timestamp: "" }));
    const { result } = renderHook(() => useMarketingDirectory(50));
    await waitFor(() => expect(result.current.isFallback).toBe(true));
  });

  it("does not use the fallback for a healthy but empty directory", async () => {
    const page = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 50, first: true, last: true };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(200, { success: true, data: page, timestamp: "" }));
    const { result } = renderHook(() => useMarketingDirectory(50));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isFallback).toBe(false);
    expect(result.current.data?.content).toHaveLength(0);
  });

  it("does not use the fallback for a 4xx answer", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(404, { success: false, data: null, code: "X", timestamp: "" }));
    const { result } = renderHook(() => useMarketingDirectory(50));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isFallback).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
});

describe("useMarketingSpecialist fallback ids", () => {
  it("resolves a built-in profile without any request", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { result } = renderHook(() => useMarketingSpecialist(-2));
    expect(result.current.data?.name).toBe("Norma Nida");
    expect(result.current.isLoading).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reports an unknown built-in id as not found", () => {
    const { result } = renderHook(() => useMarketingSpecialist(-42));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toMatch(/not found/i);
  });
});
