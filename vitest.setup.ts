import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// A zone WEST of UTC on purpose: it is where `new Date("2026-10-03")` (parsed as UTC midnight) renders as the 2nd.
// Date helpers that pass here are correct for every visitor, whatever their local time zone.
process.env.TZ = process.env.TEST_TZ ?? "America/Los_Angeles"; // TEST_TZ=Asia/Jakarta npm test re-runs the suite in another zone

afterEach(() => cleanup());
