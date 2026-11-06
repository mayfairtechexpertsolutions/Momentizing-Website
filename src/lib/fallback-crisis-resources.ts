/**
 * Helplines shown on /help when the backend cannot be reached, so a person in distress never lands on an empty page.
 * Same entries the backend seeds for the Indonesia and international regions (migration V13); if Admin edits the live
 * list, update this file too. Contacts that start with "http" are websites, anything else is a phone number.
 */
export interface CrisisResource {
  name: string;
  contact: string;
}

export const FALLBACK_CRISIS_RESOURCES: CrisisResource[] = [
  { name: "Kemenkes SEJIWA Hotline", contact: "119 ext. 8" },
  { name: "Into The Light Indonesia", contact: "https://intothelightid.org" },
  { name: "Findahelpline.com", contact: "https://findahelpline.com" },
  { name: "988 Suicide & Crisis Lifeline (US)", contact: "988" },
];

/** A tappable link for a contact: websites open normally, phone numbers dial (extension text is dropped). */
export function crisisContactHref(contact: string): string {
  if (/^https?:\/\//i.test(contact)) return contact;
  return `tel:${contact.replace(/\s*ext\..*$/i, "").replace(/[^\d+]/g, "")}`;
}

/** The Indonesian helplines (first two built-in entries) and the international ones (the rest). */
export const FALLBACK_ID_RESOURCES: CrisisResource[] = FALLBACK_CRISIS_RESOURCES.slice(0, 2);
export const FALLBACK_INTL_RESOURCES: CrisisResource[] = FALLBACK_CRISIS_RESOURCES.slice(2);

/**
 * The list /help shows: Indonesian helplines first, then international ones, each from the live backend list when it
 * answered and from the built-in list when it did not. The backend returns only one region per request (and the
 * international list when a region has none), so entries repeated across the two are dropped by contact.
 */
export function mergeCrisisResources(live: { id?: CrisisResource[] | null; intl?: CrisisResource[] | null }): CrisisResource[] {
  const seen = new Set<string>();
  return [...(live.id ?? FALLBACK_ID_RESOURCES), ...(live.intl ?? FALLBACK_INTL_RESOURCES)].filter((r) => {
    const key = r.contact.replace(/\s+/g, "").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
