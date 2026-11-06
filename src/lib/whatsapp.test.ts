import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import * as api from "./api";
import { resetBackendStatusForTests, probeBackend, reportBackendUnavailable } from "./backend-status";
import { MOMENTIZING_WHATSAPP_NUMBER } from "./whatsapp-constants";
import { useWhatsAppLink } from "./whatsapp";

vi.mock("./api", async (orig) => ({ ...(await orig<typeof import("./api")>()), apiFetch: vi.fn() }));
const apiFetch = vi.mocked(api.apiFetch);

describe("useWhatsAppLink", () => {
  beforeEach(() => {
    resetBackendStatusForTests();
    apiFetch.mockReset();
  });

  it("uses the built-in number while the backend is down, then the live number as soon as it answers (no reload)", async () => {
    apiFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const { result } = renderHook(() => useWhatsAppLink());
    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    expect(result.current("Hi")).toContain(`wa.me/${MOMENTIZING_WHATSAPP_NUMBER}`);

    apiFetch.mockResolvedValue({ whatsappNumber: "+62 811 1111 2222" });
    await probeBackend();
    await waitFor(() => expect(result.current("Hi")).toContain("wa.me/6281111112222"));
  });

  it("picks the live number up even while a failed request is holding the site offline", async () => {
    reportBackendUnavailable(); // status is offline, so mounting the hook does not probe on its own
    apiFetch.mockResolvedValue({ whatsappNumber: "628199" });
    const { result } = renderHook(() => useWhatsAppLink());
    await probeBackend();
    await waitFor(() => expect(result.current()).toBe("https://wa.me/628199"));
  });
});
