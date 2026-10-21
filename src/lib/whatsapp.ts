"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api";

/** Fallback business number, in wa.me click-to-chat format (digits only, country code, no "+"). The live value is
 * edited by the Super Admin (Admin → Settings → WhatsApp) and fetched from /public/contact-info; this is only used
 * until that loads or if it fails. */
export const MOMENTIZING_WHATSAPP_NUMBER = "6285702200701";

/** The same number as people read and type it (used in copy, so it can never drift from the wa.me number above). */
export const MOMENTIZING_WHATSAPP_DISPLAY = "+62 857 0220 0701";

/** Builds a wa.me click-to-chat link, optionally pre-filling the chat with `message`. */
export function buildWhatsAppLink(message?: string, number: string = MOMENTIZING_WHATSAPP_NUMBER): string {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

let loaded: string | null = null;
let inflight: Promise<string> | null = null;

function loadNumber(): Promise<string> {
  inflight ??= apiFetch<{ whatsappNumber: string }>("/public/contact-info", { anonymous: true })
    .then((info) => {
      loaded = info.whatsappNumber.replace(/\D/g, "") || MOMENTIZING_WHATSAPP_NUMBER;
      return loaded;
    })
    .catch(() => {
      inflight = null; // try again on the next mount
      return MOMENTIZING_WHATSAPP_NUMBER;
    });
  return inflight;
}

/** wa.me link builder bound to the business number currently configured in Admin (fetched once per page load). */
export function useWhatsAppLink(): (message?: string) => string {
  const [number, setNumber] = useState<string>(loaded ?? MOMENTIZING_WHATSAPP_NUMBER);
  useEffect(() => {
    let cancelled = false;
    loadNumber().then((n) => {
      if (!cancelled) setNumber(n);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return (message?: string) => buildWhatsAppLink(message, number);
}
