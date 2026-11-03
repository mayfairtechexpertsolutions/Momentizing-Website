"use client";

import type { ReactNode } from "react";
import { useBackendStatus } from "@/lib/backend-status";

/**
 * Renders `children` only while the backend is answering (anything that needs it: login, sign-up, the app download).
 * Shows `offline` (nothing by default) once the backend is known to be down; before the first answer it shows nothing,
 * so neither a dead link nor the offline alternative flashes up.
 */
export function OnlineOnly({ children, offline = null }: { children: ReactNode; offline?: ReactNode }) {
  const status = useBackendStatus();
  if (status === "online") return <>{children}</>;
  return status === "offline" ? <>{offline}</> : null;
}
