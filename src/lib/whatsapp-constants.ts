/**
 * The business WhatsApp number and link builder. Deliberately NOT a "use client" module: server code (llms.txt,
 * JSON-LD, the static legal pages) imports these, and a value imported from a client module becomes an unusable
 * client reference on the server. The React hook that reads the live number lives in `whatsapp.ts`.
 */

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
