"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MOMENTIZING_WHATSAPP_NUMBER, buildWhatsAppLink } from "./whatsapp-constants";
import { knownWhatsAppNumber, probeBackend, shouldProbeForNumber, subscribeBackendStatus } from "./backend-status";

export { MOMENTIZING_WHATSAPP_NUMBER, MOMENTIZING_WHATSAPP_DISPLAY, buildWhatsAppLink } from "./whatsapp-constants";

/** wa.me link builder bound to the business number currently configured in Admin (fetched once per page load). */
export function useWhatsAppLink(): (message?: string) => string {
  // Re-renders when the live number arrives (first answer, or the backend coming back after an outage).
  const live = useSyncExternalStore(subscribeBackendStatus, knownWhatsAppNumber, () => null);
  const number = live ?? MOMENTIZING_WHATSAPP_NUMBER;
  useEffect(() => {
    if (shouldProbeForNumber()) void probeBackend();
  }, []);
  return (message?: string) => buildWhatsAppLink(message, number);
}
