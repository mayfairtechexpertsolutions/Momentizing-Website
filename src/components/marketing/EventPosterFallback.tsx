import type { EventFormat } from "@/lib/events";

const FORMAT_EYEBROW: Record<EventFormat, string> = { IN_PERSON: "In person", ONLINE: "Online", HYBRID: "In person & online" };

/** Three brand palettes; text colours are AA on their own background (the circles stay clear of the text). */
const PALETTES = [
  { bg: "bg-momentizing-cream", big: "bg-momentizing-gold", small: "bg-momentizing-mint-deep", title: "text-momentizing-gold-deep", eyebrow: "text-momentizing-teal" },
  { bg: "bg-momentizing-mint", big: "bg-momentizing-teal", small: "bg-momentizing-peach", title: "text-momentizing-gold-deep", eyebrow: "text-momentizing-teal" },
  { bg: "bg-momentizing-peach", big: "bg-momentizing-gold-deep", small: "bg-momentizing-mint", title: "text-momentizing-slate", eyebrow: "text-momentizing-gold-deep" },
];

/**
 * The poster shown when an event has none: a typographic card in the brand palette (title, format, wordmark, soft
 * circles like the hero art). The palette is picked from the title, so a page of events varies, one event always looks
 * the same, and the admin preview matches the website before the event is even saved. Sized in container units, so it reads the same as a list thumbnail or a full detail poster. It fills
 * its parent (give the parent the 4:5 frame) and is decorative: the title is always printed next to it.
 * Mirrored in `CRM/Frontend/src/components/admin/events/EventPosterFallback.tsx` for the admin preview — keep in step.
 */
export function EventPosterFallback({ title, format }: { title: string; format: EventFormat }) {
  const hash = [...title.trim().toLowerCase()].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 0);
  const p = PALETTES[Math.abs(hash) % PALETTES.length];
  return (
    <div aria-hidden="true" className={`@container relative h-full w-full overflow-hidden ${p.bg}`}>
      <span className={`absolute -top-[18%] -right-[22%] aspect-square w-[78%] rounded-full opacity-90 ${p.big}`} />
      <span className={`absolute -right-[12%] -bottom-[14%] aspect-square w-[46%] rounded-full ${p.small}`} />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-[3cqw] p-[8cqw] pr-[30cqw]">
        <span className={`font-marketing-sans text-[max(12px,3.6cqw)] font-bold tracking-[0.18em] uppercase ${p.eyebrow}`}>{FORMAT_EYEBROW[format]}</span>
        <span className={`line-clamp-4 font-marketing-serif text-[9.5cqw] leading-[1.08] font-semibold ${p.title}`}>{title || "Momentizing event"}</span>
        <span className="mt-[4cqw] font-marketing-sans text-[max(12px,3.4cqw)] font-bold tracking-[0.3em] text-momentizing-muted uppercase">Momentizing</span>
      </div>
    </div>
  );
}
