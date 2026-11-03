import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ApiError } from "./api";
import * as api from "./api";
import { probeBackend, reportBackendUnavailable, resetBackendStatusForTests, useBackendStatus } from "./backend-status";

vi.mock("./api", async (orig) => ({ ...(await orig<typeof import("./api")>()), apiFetch: vi.fn() }));
const apiFetch = vi.mocked(api.apiFetch);

describe("backend status", () => {
  beforeEach(() => {
    resetBackendStatusForTests();
    apiFetch.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it("starts as checking, then goes online and remembers the WhatsApp number", async () => {
    apiFetch.mockResolvedValue({ whatsappNumber: "+62 811 2233" });
    const { result } = renderHook(() => useBackendStatus());
    expect(result.current).toBe("checking");
    await waitFor(() => expect(result.current).toBe("online"));
    expect(await probeBackend()).toBe("628112233");
  });

  it("goes offline when the backend cannot be reached or answers 5xx", async () => {
    apiFetch.mockRejectedValue(new TypeError("Failed to fetch"));
    const { result } = renderHook(() => useBackendStatus());
    await waitFor(() => expect(result.current).toBe("offline"));
  });

  it("treats a 4xx as the backend answering", async () => {
    apiFetch.mockRejectedValue(new ApiError("nope", 404));
    const { result } = renderHook(() => useBackendStatus());
    await waitFor(() => expect(result.current).toBe("online"));
  });

  it("can be flipped offline by a failed real request", async () => {
    apiFetch.mockResolvedValue({ whatsappNumber: "628112233" });
    const { result } = renderHook(() => useBackendStatus());
    await waitFor(() => expect(result.current).toBe("online"));
    act(() => reportBackendUnavailable());
    expect(result.current).toBe("offline");
  });

  it("comes back online by itself when the backend recovers", async () => {
    vi.useFakeTimers();
    apiFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const { result } = renderHook(() => useBackendStatus());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current).toBe("offline");
    apiFetch.mockResolvedValue({ whatsappNumber: "628112233" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(result.current).toBe("online");
  });

  it("stays offline for a while after a real request failed, even if the probe still answers", async () => {
    vi.useFakeTimers();
    apiFetch.mockResolvedValue({ whatsappNumber: "628112233" });
    const { result } = renderHook(() => useBackendStatus());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current).toBe("online");
    act(() => reportBackendUnavailable());
    await act(async () => {
      await probeBackend();
    });
    expect(result.current).toBe("offline");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(result.current).toBe("online");
  });
});
