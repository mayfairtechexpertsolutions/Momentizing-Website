"use client";

import { useEffect, useSyncExternalStore } from "react";
import { apiFetch, isBackendUnavailable } from "./api";

/**
 * Whether the CRMS backend is answering. Everything that needs it (account links, the app download, booking holds,
 * the careers form) is shown only while this is "online"; while it is "offline" the site offers WhatsApp instead.
 * "checking" is the state before the first answer; it shows neither the backend features nor the offline alternative.
 */
export type BackendStatus = "checking" | "online" | "offline";

/** How often an offline site asks again whether the backend is back (also re-checked when the tab regains focus). */
const RECHECK_INTERVAL_MS = 30_000;

/** A backend that hangs counts as down: without this the probe could stay "checking" for minutes. */
const PROBE_TIMEOUT_MS = 8_000;

const CONTACT_INFO_PATH = "/public/contact-info";

let status: BackendStatus = "checking";
let whatsappNumber: string | null = null;
let inflight: Promise<string | null> | null = null;
const listeners = new Set<() => void>();

function setStatus(next: BackendStatus) {
  if (next === status) return;
  status = next;
  listeners.forEach((listener) => listener());
}

/**
 * Asks the backend for the business WhatsApp number, which doubles as the health check. Concurrent callers share one
 * request. Resolves to the number (digits only) or null when the backend could not answer.
 */
export function probeBackend(): Promise<string | null> {
  inflight ??= apiFetch<{ whatsappNumber: string }>(CONTACT_INFO_PATH, { anonymous: true, signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) })
    .then((info) => {
      whatsappNumber = info.whatsappNumber.replace(/\D/g, "") || null;
      setStatus("online");
      return whatsappNumber;
    })
    .catch((err) => {
      // A 4xx is still the backend answering; only silence or a 5xx means it is down.
      setStatus(isBackendUnavailable(err) ? "offline" : "online");
      return null;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** The business number the backend last reported, or null before the first answer. */
export function knownWhatsAppNumber(): string | null {
  return whatsappNumber;
}

/** Called when a real request fails because the backend is down, so the whole site reacts at once. */
export function reportBackendUnavailable() {
  setStatus("offline");
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Live backend status; the first user on a page triggers the probe and an offline site keeps re-checking. */
export function useBackendStatus(): BackendStatus {
  const current = useSyncExternalStore(subscribe, () => status, () => "checking" as BackendStatus);

  useEffect(() => {
    if (status === "checking") void probeBackend();
  }, []);

  useEffect(() => {
    if (current !== "offline") return;
    const recheck = () => {
      if (document.visibilityState === "visible") void probeBackend();
    };
    const timer = window.setInterval(recheck, RECHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [current]);

  return current;
}

/** Test hook: back to the initial "checking" state. */
export function resetBackendStatusForTests() {
  status = "checking";
  whatsappNumber = null;
  inflight = null;
  listeners.clear();
}
