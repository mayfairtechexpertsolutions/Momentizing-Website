/** Momentizing WhatsApp Business number, in wa.me click-to-chat format (digits only, country code, no "+"). */
export const MOMENTIZING_WHATSAPP_NUMBER = "6285702200701";

/** The same number as people read and type it (used in copy, so it can never drift from the wa.me number above). */
export const MOMENTIZING_WHATSAPP_DISPLAY = "+62 857 0220 0701";

/** Builds a wa.me click-to-chat link, optionally pre-filling the chat with `message`. */
export function buildWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${MOMENTIZING_WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
