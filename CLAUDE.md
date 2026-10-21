@AGENTS.md

# CLAUDE.md — Momentizing Website

The public marketing site and no-account booking flow for Momentizing ("a safe space for your mind to feel and grow"). A static Next.js export that talks to the CRMS backend (`../CRM`) through its public, unauthenticated API only. Login, registration and the client/Admin apps live in the CRMS frontend; this site links out to them.

**The client loves this theme. Treat the look as a protected asset** — see [template.md](template.md) before touching colours, type, radii or spacing.

## Docs are part of the code (mandatory)

| Document | Update when |
|---|---|
| [PRD.md](PRD.md) | Pages, user-visible behavior, rules, copy commitments, integrations or open decisions change. Tag status: Built / Stubbed / Not built. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Routes, components, `src/lib` modules, API calls, config/env vars, build or deploy change. |
| [template.md](template.md) | A design token, component pattern, accessibility rule or content rule changes. |
| [README.md](README.md) | Setup, run or deploy steps change. |

Rules: docs match the code (code wins on disagreement); edit current-state text in place, no changelog blocks; pure refactors need no doc edit but say so; in your final message list the docs you changed (or say none needed to). The CRM side has its own docs — when this site starts depending on a new or changed backend endpoint, also update `../CRM/ARCHITECTURE.md` and `../CRM/PRD.md`.

## Commands

```bash
npm install
npm run dev          # http://localhost:3001
npm test             # vitest (jsdom + Testing Library)
npm run lint
npx tsc --noEmit     # type-check
npm run build        # static export to out/
```

CI (`.github/workflows/deploy.yml`) runs `npm ci`, `npm test`, `npm run build`, then publishes `out/` to GitHub Pages on every push to `main`. Run test + build locally before pushing.

## Layout

```
site.config.ts           the one file to edit to point at a backend (API URL, app URL, Turnstile key); env overrides win
src/app/                 App Router pages: / · /associates · /associates/view?id= · /book · /careers · /legal · /help
src/components/marketing/        nav, footer, cards, specialist UI, floating WhatsApp button
src/components/marketing/booking/  the /book wizard and its parts (wizard-state.ts holds step + draft types)
src/components/marketing/careers/  expert application form
src/components/ui/       tiny shared primitives (Card)
src/lib/                 api client, typed endpoint wrappers, hooks, pure helpers (+ *.test.ts next to them)
```

## Conventions

- **Static export** (`output: "export"`, `trailingSlash: true`). No server code, no API routes, no `cookies()`/`headers()`, no dynamic route segments that need runtime params — that is why a profile is `/associates/view?id=<id>`. Any new page must work as plain static HTML plus client-side fetching.
- **Pages that fetch are client components** using `useApiQuery` / `apiFetch`. Always render load failures as an error state, never as "no data".
- **Base path:** use `next/link` for internal links (adds the prefix automatically); use `withBase()` from `src/lib/base-path.ts` for raw `<img src>`, `<a href>` or `window.location`. Never hard-code `/Momentizing-Website`.
- **Config:** import `API_BASE_URL`, `APP_URL`, `TURNSTILE_SITE_KEY`, `appLink()` from `@config`. Each `process.env.NEXT_PUBLIC_*` must be written out literally (Next inlines them). All values are public and baked into the bundle — **never put a secret in this repo or its Actions variables**.
- **Anonymous only:** every request is unauthenticated (`apiFetch` never sends credentials). Anything needing a login belongs in the CRMS app.
- **Styling:** Tailwind 4 with the `--momentizing-*` tokens from `globals.css` (`bg-momentizing-cream`, `text-momentizing-gold-deep`, `font-marketing-serif`, …). No raw hex, no grey-400..700. Don't use the `--crms-*` / `--admin-*` tokens here; they exist only because `globals.css` was split from the CRMS app.
- **Type:** Fraunces headings (`font-marketing-serif`), Nunito body (`font-marketing-sans`), via `next/font`. Body 16px; nothing under 12px; inputs 16px (iOS zoom).
- **Accessibility is a requirement, not polish:** WCAG AA contrast, visible focus (existing `.marketing-root` rules), 44px touch targets, labels on every field, `prefers-reduced-motion` respected, skip link kept. Re-check contrast for any colour change.
- **Mobile first.** The audience is mostly on phones in Indonesia. Check every change at 375px width and at desktop.
- **Booking times** are UTC wall-clock from the backend and are labelled "UTC" in the UI. Parse with a trailing `Z`; use `src/lib/local-date.ts`.
- **Tests:** pure logic and small components get a `*.test.ts(x)` beside them. The booking wizard is large (`BookingWizard.tsx`, ~1100 lines); prefer extracting logic to `src/lib` or `wizard-state.ts` over growing it.
- This is Next.js 16 with breaking changes: read the relevant guide in `node_modules/next/dist/docs/` before changing routing, config or caching APIs (see imported AGENTS.md).

## Invariants — do not break

1. The site stays a static export deployable to GitHub Pages or any static host.
2. No secrets, no auth tokens, no PII persisted beyond the documented keys (below).
3. Guest booking is **never auto-confirmed by the frontend**: confirmation comes from the backend after the visitor proves WhatsApp ownership. The UI only reflects status.
4. Every booking/application POST carries an `Idempotency-Key` (`newIdempotencyKey()`), so double-taps and retries never create duplicates.
5. Crisis resources on `/help` and the "urgent" path in `/book` stay reachable and accurate. Never bury them.
6. Visitor data stays client-side only in: `localStorage` favorites, and in `sessionStorage` the booking draft (includes name and WhatsApp number), the active booking and its claim token. Every storage access is wrapped so the site works with storage blocked. Clear the draft once a booking is created. The claim token also travels to the app in the URL fragment (not the query string) because the app is usually a different origin.
7. The business WhatsApp number lives in one place (`src/lib/whatsapp.ts`); it must match what the backend verifies against.

## Safety
- Don't commit or paste real keys. Turnstile *site* keys are public; secret keys belong only on the backend.
- `git status` shows uncommitted work (careers feature, nav/footer edits). Don't commit, push, or force-push unless asked — a push to `main` deploys to production.
- Ask before destructive actions (deleting files, rewriting history).
- A passing local flow against a backend with `twilio.enabled=false` proves nothing about live WhatsApp verification.
