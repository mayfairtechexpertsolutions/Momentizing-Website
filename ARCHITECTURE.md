# Momentizing Website — Architecture

**Reconciled against the code on 2026-10-21.** Product scope lives in [PRD.md](PRD.md); the visual system in [template.md](template.md); agent rules in [CLAUDE.md](CLAUDE.md); setup/deploy steps in [README.md](README.md). The backend this site calls is documented in `../CRM/ARCHITECTURE.md`.

---

## 1. System overview

```
 Visitor's browser (phone-first)                         GitHub Pages / any static host
 ┌─────────────────────────────────┐   static HTML/JS/CSS   ┌──────────────────────────┐
 │ Next.js 16 static export        │ ◀───────────────────── │ out/  (npm run build)    │
 │  React 19 · Tailwind 4          │                        └──────────────────────────┘
 │  client-side fetch, no server   │
 └───────┬──────────────┬──────────┘
         │ anonymous     │ links out (no shared session)
         │ HTTPS / JSON  ▼
         │        CRMS web app (APP_URL): /login /register /download
         ▼
 ┌─────────────────────────┐   webhook   ┌──────────────┐
 │ CRMS API  /api/v1/public│◀────────────│ Twilio       │  WhatsApp reply proves number ownership
 │ Spring Boot 4.1 · PG 16 │             └──────────────┘
 └───────┬─────────────────┘
         │ presigned PUT (resumes)         Cloudflare Turnstile (optional, bot challenge)
         ▼                                 wa.me (click-to-chat; no WhatsApp Business API)
     AWS S3  (private prefix careers/*)
```

The website is a **thin, stateless, public client**. It has no backend of its own, no accounts and no cookies. All business logic (matching, slot availability, holds, verification, rate limiting, abuse protection) lives in the CRMS backend; the website renders it and gathers input.

## 2. Repository layout

```
Website/
├── CLAUDE.md · AGENTS.md · PRD.md · ARCHITECTURE.md · template.md · README.md
├── site.config.ts            # API/app URLs + Turnstile key (env overrides win); exports API_BASE_URL, APP_URL, appLink()
├── next.config.ts            # output: "export", trailingSlash, unoptimized images, optional basePath
├── tsconfig.json             # alias @ → src, @config → site.config.ts
├── vitest.config.mts · vitest.setup.ts
├── .github/workflows/deploy.yml
├── public/                   # icon-192.png, website/ (static imagery)
└── src/
    ├── app/                  # routes (below) + globals.css (design tokens), layout, error, not-found
    ├── components/
    │   ├── marketing/        # MarketingNav/Footer/Fonts, SpecialistCard/BookingPanel/Reviews, BookingModal,
    │   │                     # StarRating, BrandIllustration, WhatsAppFloatingButton
    │   │   ├── booking/      # /book wizard (see §5)
    │   │   ├── about/        # AboutArt (SVG), JourneyTimeline, Reveal
    │   │   └── careers/      # CareerForm
    │   └── ui/Card.tsx
    └── lib/                  # api, use-api-query, typed endpoint wrappers, helpers (+ tests)
```

## 3. Technology stack

| | |
|---|---|
| Framework | Next.js 16.3 (App Router, **static export**), React 19.2, TypeScript 5 |
| Styling | Tailwind CSS 4 (`@import "tailwindcss"`, tokens via `@theme inline`), `next/font/google` (Fraunces, Nunito) |
| Tests | Vitest 3 + jsdom + Testing Library |
| Lint | ESLint 9 + `eslint-config-next` (known pre-existing `set-state-in-effect` errors in the CRMS app; see its QA log) |
| Hosting | GitHub Pages via Actions (Node 22); any static host works |
| Runtime deps | `next`, `react`, `react-dom` only — keep it that way |

## 4. Routes

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Home: hero, what we offer, services, care packages (live from API), corporate wellness, top-rated specialists, FAQ, final CTA. Anchored sections `#services #packages #corporate #associates-preview #faq`. |
| `/associates` | `app/associates/page.tsx` | Specialist directory: search, filters, favorites, cards. |
| `/associates/view?id=<id>` | `app/associates/view/page.tsx` | Specialist profile, reviews, booking panel. Query string instead of `/[id]` because a static export cannot serve unknown ids. |
| `/book` | `app/book/page.tsx` | Guest booking wizard (§5). |
| `/about` | `app/about/page.tsx` | Static brand-story page. Journey timeline is `components/marketing/about/JourneyTimeline.tsx` (desktop road segments + pins, mobile dashed rail); art is inline SVG in `AboutArt.tsx` using `--momentizing-*` tokens; `ScrollReveal.tsx` (shared, renders nothing) fades in `[data-reveal]` blocks once on `/` and `/about`; `Reveal.tsx` sets `data-seen` once on scroll and `globals.css` (`.journey-road`, `.journey-pin`) animates the road/pins, with a reduced-motion fallback. |
| `/careers` | `app/careers/page.tsx` | Expert application form with resume upload (§6). |
| `/my-bookings` | `app/my-bookings/page.tsx` | Upcoming sessions by phone number + WhatsApp code (`MyBookingsPanel.tsx`): `POST /public/my-bookings/request-code` (form token, Turnstile when enabled) → `POST …/verify` → list; the 15-minute `viewToken` is kept in `sessionStorage` and sent as `X-Lookup-Token` to `GET /public/my-bookings` after a reload. Times shown on the visitor's clock; offers *Create a free account* (claim link) or login. Not indexed. |
| `/legal` | `app/legal/page.tsx` | FAQ, Terms, Privacy. Active tab is read from the URL hash via `useSyncExternalStore`; the two documents are in `components/marketing/legal/LegalDocuments.tsx`. |
| `/help` | `app/help/page.tsx` | Crisis resources and support. |
| 404 / error | `not-found.tsx`, `error.tsx` | Branded fallbacks. |

Each section folder's `layout.tsx` sets page metadata (title template `%s | Momentizing`). There is no shared shell layout: each page renders its own `MarketingNav` (`full` or simple back-link variant; the full bar shows only Services · Packages · Corporate · Find an Associate · About · My bookings · Login · Book a Session from 1280 px up and a grouped hamburger menu below — *Get the App* and *Careers* live in the footer and mobile menu, so keep new links out of the bar; the bar gains a shadow once scrolled, on `/` it underlines the section in view, and on other pages the section links point to `/#id`), `MarketingFooter` and `WhatsAppFloatingButton`; a skip link and `.marketing-root` focus styles come from `globals.css`.

## 5. Guest booking (`/book`)

Five steps defined in `booking/wizard-state.ts`: **Pick a day → About you → Your specialist → Choose a time → Review**, then a confirmation screen.

1. **Form token** — `GET /public/booking-flow/form-token` (anti-bot token; Turnstile widget when a site key is configured).
2. **Suggestions** — `POST /public/booking-flow/suggestions` with the short answers (first time, online, couple, adult, urgent) and concerns → 3 matched specialists. Or `GET /public/specialists/search?q=` for a known name.
3. **Slots** — `GET /public/specialists/{id}/slots?from=&days=`; `SlotPicker` fetches one UTC day either side of the chosen local day and regroups the slots by the **visitor's** local date (`toViewerSlots`), so times appear on the visitor's own clock with their zone named; the wizard stores the pick locally and converts to UTC (`localToUtc`) only when posting. Confirmation screens use `formatSessionWhen`.
4. **Create** — `POST /public/guest-bookings` with `Idempotency-Key` → `AWAITING_VERIFICATION`, 30-minute hold.
5. **Verify** — the visitor opens a pre-filled `wa.me` link (`verificationLink()`), sending a `MOM-XXXXXX` code **from their own number** to the business line. The wizard polls `GET /public/guest-bookings/status` (header `X-Guest-Token: <claimToken>`) until the backend reports `CONFIRMED` (or `EXPIRED`/`CANCELLED`).
6. **Optional account** — `WhyJoinCard` hands the claim token to the CRMS register page (URL fragment, plus `sessionStorage` when same-origin) so the guest booking links to the new account.
7. **Escape hatch** — `HelpSheet` ("I can't find my schedule") → `POST /public/booking-help` (`NEEDS_HELP` for staff follow-up on WhatsApp).

Status type: `AWAITING_VERIFICATION | CONFIRMED | EXPIRED | CANCELLED`. State machine, rate limits and verification rules are owned by the backend; the frontend never infers confirmation.

**Client state:** `Draft` (step, date, name, WhatsApp, answers, concerns, consent, chosen specialist/time) and `ActiveBooking` (booking + claim token) are persisted to `sessionStorage` via guarded helpers in `wizard-state.ts` so a refresh or WhatsApp round-trip doesn't lose progress; storage failure degrades silently. `BookingWizard.tsx` (~1100 lines) is the integration point; pure pieces (`SlotPicker`, `YesNoField`, `DateStrip`, `Stepper`, `Sheet`, `ui.tsx` primitives) are split out and tested.

## 6. Careers (`/careers`)

`CareerForm` → `GET /public/careers/form-token` → optional `POST /public/careers/resume-upload` (filename, MIME, size, form token, honeypot `website`) returning a presigned S3 `uploadUrl` → browser `PUT` of the file directly to storage (`putResume`) → `POST /public/careers/applications` with `Idempotency-Key`. Client pre-checks (`resumeProblem`): PDF or DOCX, ≤ 5 MB, non-empty; the server enforces the same. Staff manage applicants at `/admin/careers` in the CRMS app. **Resume upload has not been tested against a real bucket** (CRM `QA-CHECKLIST.md` §17.7).

## 7. API access layer (`src/lib`)

| Module | Role |
|---|---|
| `api.ts` | `apiFetch<T>(path, opts)` → unwraps the CRMS envelope `{success, data, message}`; throws `ApiError(message, status)`. Never sends credentials; `anonymous` is accepted for call-site parity with the CRMS app. |
| `use-api-query.ts` | Small data-fetching hook (loading / error / data). |
| `guest-booking.ts` | Types + wrappers for the booking endpoints, `friendlyError()`, `newIdempotencyKey()`, `verificationLink()`. |
| `careers.ts` | Profession list, resume rules, careers endpoint wrappers, `putResume`. |
| `marketing-directory.ts` | `useMarketingDirectory`, `useMarketingSpecialist`, `useSpecialistReviews` (`/specialist/directory…`), label/format helpers. |
| `session-packages.ts` | `usePackages()` → `GET /packages`; price formatting. |
| `favorites.ts` | Device-local favorites in `localStorage` (no account). |
| `local-date.ts` | Date helpers for the day strip, plus `utcToLocal` / `localToUtc` / `zoneLabel` / `formatSessionWhen` for UTC↔visitor-clock conversion. |
| `whatsapp.ts` | Fallback business number (`+62 857 0220 0701`), `buildWhatsAppLink()` and the `useWhatsAppLink()` hook (live number from `/public/contact-info`). |
| `base-path.ts` | `BASE_PATH`, `withBase()` for non-`Link` URLs. |
| `site-url.ts` | `SITE_URL` / `absoluteUrl()` for canonicals, sitemap, Open Graph and JSON-LD; shared site name + description. |
| `structured-data.ts` | schema.org JSON-LD: Organization + WebSite graph (root layout) and `faqPageSchema()` (home). Rendered by `components/marketing/JsonLd.tsx`. |
| `types.ts` | Shared `ApiEnvelope`, `PageResponse`. |

The WhatsApp links (`WhatsAppFloatingButton`, `MarketingFooter`, `SpecialistBookingPanel`, `BookingModal`) read the business number from `GET /public/contact-info` via `useWhatsAppLink()` in `lib/whatsapp.ts` (set in CRMS Admin → Settings → WhatsApp); the constant in that file is only the fallback.

Other endpoint used directly: `POST /public/booking-inquiries` from `BookingModal` (package/corporate enquiries).

All calls target `API_BASE_URL` = `…/api/v1`. **CORS:** the backend must list the website origin under `cors.allowed-origins`. New public endpoints must also be permitted in the backend's `SecurityConfig` and, for anonymous writes, `RateLimitFilter`.

## 8. Configuration & environments

`site.config.ts` holds defaults; environment variables override.

| Setting | Env var | Default | Notes |
|---|---|---|---|
| API base | `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080/api/v1` | Must be public **https** in production |
| App URL | `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Login / register / download links |
| Turnstile site key | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | empty (off) | Backend must not require a challenge when off |
| Base path | `NEXT_PUBLIC_BASE_PATH` | empty | `/<repo>` on a GitHub Pages project site |
| Site origin | `NEXT_PUBLIC_SITE_URL` | `https://mayfairtechexpertsolutions.github.io` | Public origin for canonical URLs, sitemap, Open Graph, JSON-LD. Set to the custom domain (repo variable `SITE_URL`) at launch |

Everything is inlined at build time and public. Restart `npm run dev` or rebuild after changing any value. Note local dev defaults to port **3001** and the CRMS app to **3000**; backend dev often runs on **18080** on this machine (see CRM docs) — set `NEXT_PUBLIC_API_BASE_URL` accordingly.

## SEO & GEO

- Root `layout.tsx` sets `metadataBase`, default title/description, Open Graph, Twitter card and the site JSON-LD; each route layout sets its own title, description and `canonical: "./"`. `/my-bookings` and `/associates/view` are `noindex` (private / client-fetched).
- `app/robots.ts`, `app/sitemap.ts` and `app/llms.txt/route.ts` are `force-static` and emitted into `out/`. robots allows all crawlers (including AI ones) except the two noindex routes. New indexable pages must be added to `sitemap.ts` and `llms.txt`.
- Home FAQ answers are always in the HTML (collapsed with `hidden`) and mirrored as `FAQPage` JSON-LD.
- Open Graph image is `public/website/heart-psychology.png` (780×541); a 1200×630 image would be better.

## 9. Build & deploy

- `next build` with `output: "export"` writes `out/`. `trailingSlash: true` gives GitHub Pages-friendly `dir/index.html`.
- `.github/workflows/deploy.yml`: on push to `main` (or manual dispatch) → `npm ci` → `npm test` → `npm run build` (env from repo **Variables** `API_BASE_URL`, `APP_URL`, `TURNSTILE_SITE_KEY`, `CUSTOM_DOMAIN`, `SITE_URL`) → upload `out/` → `deploy-pages`. A failing test blocks the deploy.
- Project site → `https://<user>.github.io/Momentizing-Website` (base path set automatically). Custom domain → set `CUSTOM_DOMAIN=true`.
- Local Pages check: `NEXT_PUBLIC_BASE_PATH=/Momentizing-Website npm run build && npx serve out`.

## 10. Security & privacy model

- **No secrets in the bundle.** All config is public by design. Secret keys (Turnstile secret, Twilio, S3) exist only on the backend.
- **Abuse resistance is server-side:** form tokens, honeypot field, Turnstile, per-IP rate limits, idempotency keys, ownership proof via WhatsApp. The frontend supplies the signals.
- **Anonymous only:** no cookies, no auth headers; a logged-in CRMS session is never read.
- **PII on the client:** name + WhatsApp number live only in the `sessionStorage` draft until booking creation; favorites are specialist ids only. Nothing is sent to third-party analytics (none installed).
- **External links:** `wa.me` for WhatsApp. Third-party scripts: only Turnstile, only when configured.
- **Content safety:** `/help` crisis resources and the "urgent" answer path in `/book` are part of the safety design (see PRD §7).

## 11. Cross-project coupling (check when changing either side)

| Website depends on | Where it's defined (CRM) |
|---|---|
| `/public/**` endpoints and response shapes | `ARCHITECTURE.md` §5; controllers under `…/crms/` |
| Business WhatsApp number & verification code format `MOM-XXXXXX` | Twilio webhook config; `src/lib/whatsapp.ts` here |
| CORS allow-list | `application.yml` `cors.allowed-origins` |
| Register page accepting the claim token fragment | `CRM/Frontend/src/app/register` |
| Careers storage (S3 CORS PUT from website origin) | `CRM/QA-CHECKLIST.md` §17.7 |

## 12. Known gaps

1. ~~Availability shown in UTC~~ — done: experts set their zone (CRMS V52) and visitors see their own clock. Still open: default zone for new experts.
2. Claim-token linking to a new account only auto-works when the app is reachable via the URL-fragment hand-off; same-origin `sessionStorage` is a secondary path.
3. Turnstile site key not provisioned; WhatsApp business line must be wired to the Twilio webhook for automatic verification (otherwise staff use "Verify manually").
4. Careers resume upload untested against real S3.
5. `BookingWizard.tsx` is large; extract steps into components as it grows.
6. Content is English only; Bahasa Indonesia is a stated market priority (PRD §10).
7. No analytics or error reporting; no automated E2E (Playwright) suite.
8. Careers work, nav and footer edits are uncommitted in this repo.
