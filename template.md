# Momentizing Website — Design Template

The visual and content system for the public website. **The client loves this theme**, so this file is the single source of truth for keeping it consistent and for reusing it (new pages, the CRMS app, future brand surfaces). Tokens live in `src/app/globals.css`; the rationale for colours is also in [README.md](README.md). Product rules: [PRD.md](PRD.md). Build details: [ARCHITECTURE.md](ARCHITECTURE.md).

> **Protected asset.** Don't change palette, fonts, radii or the overall mood without the client's sign-off. Add to the system; don't drift from it.

---

## 1. Brand feel

Warm, caring, calm, non-judgmental. Sampled from the brand's Instagram artwork: a **mint wash**, **rust headlines**, **peach tints**, **deep sage** actions on **cream paper**. Soft organic shapes (leaf sprigs, blurred mint/peach blobs), big rounded corners, pill buttons. Nothing sharp, nothing loud, nothing clinical.

Voice: second person, plain words, reassuring ("You're not alone", "a safe space for your mind to feel and grow"). Never shame, never diagnose, never pressure.

## 2. Colour tokens

Defined as CSS variables in `:root` and exposed to Tailwind through `@theme inline` (`bg-momentizing-cream`, `text-momentizing-gold-deep`, …).

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--momentizing-cream` | `#fbf5ec` | Page background, input fill | base |
| `--momentizing-mint` | `#e6f0ea` | Washes, eyebrow pills, section bands | — |
| `--momentizing-mint-deep` | `#cfe3d8` | Borders, input borders, disabled fills | — |
| `--momentizing-peach` | `#fbe6d8` | Warm tint bands/cards (`/60` for softness) | — |
| `--momentizing-slate` | `#24382f` | Body text, dark bands, hover for primary | 11.5:1 on cream |
| `--momentizing-teal` | `#3b6b58` | **Primary** actions, eyebrows, links, icons, focus ring | 5.7:1 on cream; 6.1:1 white-on-it |
| `--momentizing-gold-deep` | `#9a3f1a` | **Headlines**, secondary buttons, badges | 6.3:1 on cream |
| `--momentizing-muted` | `#4a5d54` | Secondary text (replaces all grey-400..700) | 6.5:1 on cream |
| `--momentizing-gold` | `#e8a07e` | Decorative: borders, rings, underline accents; **text only on slate** | 5.8:1 on slate — never on light |

Status colours (errors, warnings) come from the neutral `--crms-red` etc. in `globals.css` only where a form needs them; keep them AA-darkened.

**Rules**
- Use tokens, never raw hex or Tailwind greys. (`BrandIllustration` SVG fills are the one place hex is inlined.)
- Gold `#e8a07e` is never text on a light background.
- Primary button = teal fill + white text → hover slate. Secondary = rust outline/text (or white with slate border) → hover fill.
- Dark bands (`bg-momentizing-slate text-white`) get the `on-dark` class so focus rings switch to gold; headings there use `text-momentizing-gold`.
- Re-check WCAG AA (4.5:1 text, 3:1 large text/UI) for any new pairing before shipping.

## 3. Typography

| Use | Font | Notes |
|---|---|---|
| Headings (`h1–h3`, `font-marketing-serif`) | **Fraunces** | Soft, warm serif close to the brand slides. Rust (`gold-deep`) on light, `gold` on slate. |
| Body, labels, buttons (`font-marketing-sans`) | **Nunito** | Friendly rounded sans; legible small. |

Loaded with `next/font/google` in `layout.tsx` (variables `--font-fraunces`, `--font-nunito`). Body 16px / 1.6 line height. Nothing below 12px. Form inputs are 16px (prevents iOS focus zoom).

Scale used on the home page: hero `text-5xl md:text-7xl` bold; section titles `text-3xl–4xl`; eyebrows `text-xs font-bold tracking-[0.18–0.25em] uppercase text-teal`.

## 4. Shape, depth, motion

| Element | Pattern |
|---|---|
| Buttons | `rounded-full`, `px-6–8 py-3–4`, bold; min height 48px (`min-h-12`) |
| Cards | `rounded-3xl`, white (or `white/70` on mint), border `slate/10`, soft shadow `0 8px 30px rgba(47,62,70,0.06)` |
| Hero image frame | `rounded-[3rem] border-8 border-white shadow-2xl shadow-teal/15` |
| Inputs | `.marketing-input`: cream fill, `1.5px` mint-deep border, `1.25rem` radius; on focus white fill, teal border + `0 0 0 3px rgba(59,107,88,.35)` ring |
| Chips / eyebrows | `rounded-full bg-mint px-4 py-1.5 text-xs font-bold uppercase text-teal` |
| Section rhythm | `px-6 py-24`; content `max-w-7xl mx-auto`; alternate cream / mint / peach / slate bands |
| Decoration | Blurred mint and peach circles behind the hero (`aria-hidden`), leaf sprigs via `BrandIllustration` |
| Hover | `.marketing-card:hover` scale 1.02 over 0.4s; buttons colour-shift, no jumps |
| Motion | Calm; `scroll-behavior: smooth`; all animation collapses under `prefers-reduced-motion`. Scroll effects are subtle and one-shot: add `data-reveal` to a below-the-fold block and render `<ScrollReveal />` on the page (fade + 18px rise, `globals.css`). Used on `/` and `/about` only; keep `/book`, `/my-bookings`, `/help`, `/legal` free of scroll effects. |

## 5. Components to reuse (don't re-invent)

| Need | Use |
|---|---|
| Booking-flow button / card / field | `components/marketing/booking/ui.tsx` (`BookButton` primary/secondary/ghost with loading, `BookCard`, labelled field helpers) |
| Generic white card | `components/ui/Card.tsx` |
| Bottom/side sheet | `booking/Sheet.tsx` |
| Step indicator | `booking/Stepper.tsx` |
| Yes/No question | `booking/YesNoField.tsx` |
| Star rating, specialist card | `StarRating.tsx`, `SpecialistCard.tsx` |
| Hero art | `BrandIllustration` (`care` / `team`); About page art in `about/AboutArt.tsx` (SVG colours via `var(--momentizing-*)`, not hex) |
| Nav, footer, WhatsApp button | `MarketingNav`, `MarketingFooter`, `WhatsAppFloatingButton` |

New components follow the same ingredients: tokens only, `rounded-full` actions, `rounded-3xl` cards, visible focus ring, ≥ 44px targets.

## 6. Accessibility checklist (every page)

- [ ] Contrast AA for every text/background pair (use §2 table).
- [ ] Visible keyboard focus: `.marketing-root` 3px teal outline (gold on `.on-dark`).
- [ ] Skip link present; one `h1` per page; landmarks (`main#main`, `nav`, `footer`).
- [ ] Every input has a visible label (placeholders are never the only label), errors wired by id and `role`/`aria-live` where dynamic.
- [ ] Decorative graphics `aria-hidden`; meaningful images have `role="img"` + `aria-label`.
- [ ] Touch targets ≥ 44px; no horizontal scroll at 375px.
- [ ] `prefers-reduced-motion` respected; no autoplay.
- [ ] Works with `localStorage`/`sessionStorage` blocked; failures show an error, never an empty "no data".

## 7. Page template (copy for a new page)

```tsx
// src/app/<route>/layout.tsx
export const metadata = { title: "<Page title>", description: "<one calm sentence>" };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }

// src/app/<route>/page.tsx
"use client";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { WhatsAppFloatingButton } from "@/components/marketing/WhatsAppFloatingButton";

export default function Page() {
  return (
    <>
      <MarketingNav />
      <main id="main" className="mx-auto w-full max-w-7xl px-6 pt-36 pb-24">
        <span className="inline-block rounded-full bg-momentizing-mint px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-momentizing-teal uppercase">
          Eyebrow
        </span>
        <h1 className="mt-6 mb-4 font-marketing-serif text-5xl font-bold text-momentizing-gold-deep">Calm, clear headline</h1>
        <p className="max-w-xl text-lg text-momentizing-muted">One reassuring sentence about what happens here.</p>
        {/* sections alternate: cream · mint · peach/60 · slate (on-dark) */}
      </main>
      <MarketingFooter />
      <WhatsAppFloatingButton />
    </>
  );
}
```

There is no shared shell layout: each page renders its own `MarketingNav` (`variant="full"` or a simple back-link variant, e.g. `/help`, `/book`), `MarketingFooter` and `WhatsAppFloatingButton`, as `app/page.tsx` and `app/legal/page.tsx` do. For data, use `useApiQuery`; show loading, error and empty states. Add the page to the nav/footer, to [PRD.md](PRD.md) §4 and [ARCHITECTURE.md](ARCHITECTURE.md) §4.

## 8. Section template (home-style band)

```tsx
<section id="<anchor>" className="bg-momentizing-peach/60 px-6 py-24">
  <div className="mx-auto max-w-7xl">
    <h2 className="mb-3 font-marketing-serif text-3xl text-momentizing-gold-deep">Section title</h2>
    <p className="mb-10 max-w-2xl text-momentizing-muted">Supporting line.</p>
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(47,62,70,0.06)]">…</div>
    </div>
  </div>
</section>
```

Dark variant: `className="on-dark bg-momentizing-slate px-6 py-24 text-white"` with `text-momentizing-gold` headings.

## 9. Content template

| Element | Guidance |
|---|---|
| Headline | ≤ 8 words, human, benefit first. Rust. |
| Eyebrow | 2–4 words, uppercase, teal ("Empowering the Global Diaspora"). |
| Body | Short sentences, everyday words, "you". No jargon or clinical labels. |
| CTA | Verb + outcome: "Book a Session", "View Packages". One primary per section. |
| Errors | Say what happened and what to do next, never blame ("We couldn't upload your resume. Please try again."). |
| Crisis / urgent | Always link to `/help`; never hide behind a small link. |
| Times | Show "UTC" until the timezone decision is made. |

## 10. Reusing this theme in other projects (e.g. the CRMS app)

1. Copy the `--momentizing-*` variables and the `@theme inline` mappings from `src/app/globals.css`, plus `.marketing-input`, the `.marketing-root` focus rules, `.skip-link` and the reduced-motion block.
2. Load Fraunces + Nunito and set `--font-fraunces`, `--font-nunito`.
3. Apply `marketing-root` and `bg-momentizing-cream text-momentizing-slate` on `<body>` of the surface.
4. Keep names identical so docs and components stay interchangeable. `../CRM/template.md` tracks where the CRMS app still differs.
