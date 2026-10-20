"use client";

import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "@config";

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = TURNSTILE_SITE_KEY;
export const TURNSTILE_ENABLED = Boolean(SITE_KEY);
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? Object.assign(document.createElement("script"), { src: SCRIPT_SRC, async: true, defer: true });
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Security check failed to load")), { once: true });
    if (!existing) document.head.appendChild(script);
  });
}

/**
 * Cloudflare Turnstile bot challenge (privacy-friendly, usually invisible to real people). Renders nothing — and
 * reports an empty token — when NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't configured (local dev); the server, when
 * Turnstile is enabled there, then rejects the request, so a misconfiguration fails closed, not open.
 * A Turnstile token is single-use: bump `resetSignal` after every submit attempt to get a fresh one.
 */
export function TurnstileWidget({
  onToken,
  onError,
  resetSignal = 0,
}: {
  onToken: (token: string) => void;
  onError?: (message: string) => void;
  resetSignal?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onTokenRef.current = onToken;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!SITE_KEY) {
      onTokenRef.current("");
      return;
    }
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !host.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(host.current, {
          sitekey: SITE_KEY,
          callback: (t: string) => onTokenRef.current(t),
          "expired-callback": () => onTokenRef.current(""),
          "error-callback": () => {
            onTokenRef.current("");
            onErrorRef.current?.("The security check couldn't run. Please refresh the page.");
          },
        });
      })
      .catch((e: Error) => onErrorRef.current?.(e.message));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetSignal > 0 && widgetId.current && window.turnstile) {
      onTokenRef.current("");
      window.turnstile.reset(widgetId.current);
    }
  }, [resetSignal]);

  return SITE_KEY ? <div ref={host} className="min-h-[65px]" /> : null;
}
