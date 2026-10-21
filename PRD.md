# Momentizing Website — Product Requirements Document

**Status:** Current-state spec, reconciled against the code on 2026-10-21
**Owner:** MayfairTech Expert Solutions
**Companion docs:** [ARCHITECTURE.md](ARCHITECTURE.md) · [template.md](template.md) · [CLAUDE.md](CLAUDE.md) · CRM product spec: `../CRM/PRD.md`

This document describes what the public website **is and must do today**. Each capability carries a build status:

| Tag | Meaning |
|---|---|
| **Built** | Implemented end-to-end in code |
| **Stubbed** | Works in the UI but depends on a backend/integration that runs on a fallback until configured |
| **Not built** | Specified, no implementation yet |

---

## 1. Summary

The Momentizing website is the **front door** to the platform: *"a safe space for your mind to feel and grow"*, positioned as **"Healing Without Borders"** — culturally attuned psychological support for individuals and organizations living across cultures (the global diaspora; Indonesia first).

It lets a visitor, **without creating an account**: learn what Momentizing offers, browse and choose specialists, book a session that is confirmed automatically once they prove they own their WhatsApp number, enquire about packages or corporate programmes, find crisis help, and read the legal terms. It also lets prospective experts apply to join. Everything that needs an identity (login, wallet, journaling, messaging, specialist and admin consoles) lives in the CRMS app (`../CRM`), which the site links to.

## 2. Goals

1. **Trust first.** A visitor should feel safe, welcomed and un-judged within seconds. The warm mint / rust / sage look the client loves is part of the product (see [template.md](template.md)).
2. **Booking with the least friction.** From landing to a confirmed slot in a few calm steps on a phone, no account, no admin work.
3. **Protect against scam, bot and malicious bookings** without making honest users jump through hoops (ownership proof, not passwords).
4. **Convert interest into relationships:** account sign-up after booking, corporate and package enquiries, WhatsApp as the human fallback.
5. **Recruit experts** through a simple, secure application with resume upload.
6. **Always accessible.** WCAG AA, readable at 375px, works with slow networks and blocked storage.

**Non-goals:** accounts or login on the website; payments (guest payment is "pay later on WhatsApp"); clinical content or advice; real-time chat; a CMS; WhatsApp Business API (click-to-chat only); server-side rendering or API routes.

## 3. Audience

| Visitor | Needs |
|---|---|
| **Individual seeking support** (often on a phone, often anxious) | Quick reassurance, a specialist that fits, a time, certainty it's booked. Crisis help if urgent. |
| **Couple / family** | Know whether couple sessions are offered and who offers them. |
| **Corporate / organization buyer** | Understand programmes, request a conversation. |
| **Prospective expert** (psychologist, therapist/counsellor, psychiatrist, coach) | Apply with a resume; hear back. |
| **Returning visitor** | Find a favourite specialist, log in to the app, get the app. |
| **Momentizing staff** | Receive structured booking, help and application records in the CRMS Admin. |

## 4. Site map & pages

| Page | Status | Requirements |
|---|---|---|
| **Home `/`** | Built | Hero ("Healing Without Borders", Book a Session + View Packages), what-we-offer strip, Services ("Clinical Excellence": individual approach and more), **Care Packages** (live from the API; dark band), Corporate wellness with enquiry, Top-Rated Specialists preview, FAQ, final CTA. In-page anchors from the nav. |
| **Find a specialist `/associates`** | Built | Directory of approved specialists with search and filters, specialisation/language tags, session fee, practice mode, location, rating; device-local favorites. |
| **Specialist profile `/associates/view?id=`** | Built | Bio, specialisation, languages, locations, active days, fee, paginated reviews, booking panel. |
| **Book `/book`** | Built | No-account guest booking wizard (§5). |
| **My bookings `/my-bookings`** | Built | See upcoming sessions by phone number after a WhatsApp code; no history without an account. |
| **About `/about`** | Built | Brand story: tagline and values, who we support (diaspora, expatriates, international students, cross-cultural couples), vision and mission, the "Our journey" timeline (2019 Taiwan → 2020–22 FIP → 2022 Jakarta → Now) and four commitments. All graphics are original SVG, no photos. Founder name/credentials are deliberately absent until the Team section. Bahasa Indonesia version not built. Home has a short "Our story" teaser linking here. |
| **Careers `/careers`** | Built (resume upload untested against real S3) | Expert application with resume (§6). |
| **Legal `/legal`** ("Transparency Hub") | Built | FAQ, Terms & Conditions, Privacy Policy. |
| **Help `/help`** ("You're not alone") | Built | Crisis resources and support contacts, always reachable from nav/footer. |
| **404 / error** | Built | Branded, with a way home. |

**Global chrome (Built):** fixed nav with anchors and links to Associates, Careers, Login, Get the App, and a primary *Book* button (mobile menu included); footer; floating WhatsApp button; skip-to-content link. Login, Create account and Get the app link to the CRMS app (`APP_URL`).

## 5. Guest booking — Built

**Promise to the visitor:** *pick a day, tell us a little, get matched, choose a real time, prove it's you on WhatsApp, and you're booked.*

### 5.1 Flow
1. **Pick a day** — date strip of upcoming days.
2. **About you** — name, WhatsApp number, five short yes/no questions (first time? online? couple? adult? urgent?), optional concerns and note, consent.
3. **Your specialist** — three matched suggestions with reasons, **or** search by full name.
4. **Choose a time** — real open slots only; times shown on the **visitor's own clock** with the zone named (experts' hours are entered in their own zone).
5. **Review** — summary, consent, optional Turnstile challenge, confirm.
6. **Verify on WhatsApp** — the booking is held for **30 minutes**. The visitor taps a button that opens WhatsApp with a pre-filled `MOM-XXXXXX` code to send **from their own number** to the business line **+62 857-0220-0701**. When the backend receives it, the booking auto-confirms and the screen updates (polling).
7. **Confirmed** — summary, an "Add to my calendar" (.ics) download, and an optional **"Why join us?"** card offering an account that is linked to this booking.

### 5.2 Rules
- **Never confirmed by the browser.** Confirmation only happens when the backend verifies WhatsApp ownership. Status shown: `AWAITING_VERIFICATION → CONFIRMED`, or `EXPIRED` / `CANCELLED`.
- **Ownership proof is the anti-scam control.** Honeypot, form token, optional Turnstile, rate limits and idempotency back it up (server-side).
- **Idempotent:** double-taps and retries never create two bookings.
- **Progress survives** refresh and the WhatsApp round-trip (draft and active booking in `sessionStorage`); works if storage is blocked.
- **"I can't find my schedule"** (help sheet) sends a `NEEDS_HELP` request for staff to follow up on WhatsApp; **"urgent = yes"** steers to crisis resources and human help rather than a normal booking.
- **Guest payment:** pay later on WhatsApp (assumption; the user skipped this question). In-CRMS payment records are a CRM-side decision.
- **Manual fallback:** if the Twilio webhook isn't wired, staff verify manually in Admin.

### 5.3 Quality bar
- Calm, one primary action per screen, no dead ends; plain-language errors (`friendlyError`).
- Mobile and desktop both first-class; 44px targets; visible focus; AA contrast.
- Each step is reachable and reversible; back never loses entered data.

## 6. Careers — Built (resume upload not verified against real storage)

- General expert application: full name, email, WhatsApp, profession (Psychologist, Therapist/Counsellor, Psychiatrist, Coach), optional licence number, years of experience, languages, short bio and portfolio link, consent, and a **resume as PDF or DOCX, ≤ 5 MB**.
- File uploads **directly to private storage** via a time-limited signed URL; the site never handles the file bytes through the API.
- Instant client-side validation with the same rules the server enforces; honeypot and form token; idempotent submit.
- Staff handle applicants in CRMS Admin (`/admin/careers`): stages, notes, resume link, **Hire** sends the specialist invite. A hired expert lands in `PENDING_APPROVAL` after registering.
- **Owed before cloud deployment:** bucket env vars, CORS `PUT` from the website origin, IAM on `careers/*`, private prefix, 12-month lifecycle, and a real upload test (CRM QA §17.7).

## 7. Safety & trust requirements

1. `/help` crisis resources are one tap from every page and always accurate and current. Momentizing is **not** an emergency service and says so plainly.
2. The "urgent" answer in `/book` never results in a silent, ordinary booking.
3. Language is warm, non-judgmental, never shaming; no diagnosis or clinical claims.
4. Consent is explicit before personal data is sent; privacy and terms are linked from the booking flow and footer.
5. The site collects only what the backend needs; no third-party analytics or ad trackers. WhatsApp numbers are used for verification and follow-up only.
6. Specialist information shown publicly is limited to what specialists have approved for the directory.

## 8. Design system

Authoritative detail in [template.md](template.md). In short: **mint wash, rust headlines, peach tints, deep sage actions, cream paper**; Fraunces headings + Nunito body; large rounded corners and pill buttons; calm motion. **The client loves this theme — change it only with their sign-off.** Every colour pairing is WCAG AA-checked.

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| Accessibility | WCAG 2.1 AA: contrast, focus, labels, skip link, reduced motion, keyboard operable, text ≥ 12px, inputs 16px. |
| Responsiveness | Designed at 375px up; no horizontal scroll; touch targets ≥ 44px. |
| Performance | Static HTML, no runtime server; only `next`, `react`, `react-dom` as runtime deps; fonts via `next/font`; images unoptimized-static so keep assets small. |
| Availability | Static hosting (GitHub Pages or equivalent) — the site must still render and show friendly errors when the API is down. |
| Security | No secrets in the bundle; HTTPS API only in production; CORS allow-list on the backend; no cookies, no stored credentials. |
| Browser support | Current Safari (iOS), Chrome (Android/desktop), Firefox, Edge. Works with `sessionStorage`/`localStorage` blocked. |
| Localisation | **English today.** Bahasa Indonesia is a market priority (§10). |
| Quality gate | `npm test` and `npm run build` must pass; CI blocks deploy on failure. |

## 10. Integrations & dependencies

| Dependency | Use | Status |
|---|---|---|
| CRMS API `/api/v1/public/**`, `/packages`, `/specialist/directory` | All dynamic data and writes | Built |
| WhatsApp click-to-chat (`wa.me`) | Ownership proof, human support, floating button | Built (automatic verification needs Twilio webhook wired — **Stubbed** until then) |
| Cloudflare Turnstile | Bot challenge on booking form | **Not provisioned** (site key empty = off) |
| AWS S3 (presigned PUT) | Resume storage | **Untested** against a real bucket |
| CRMS web app (`APP_URL`) | Login, register, specialist sign-up, install page | Built (separate app) |
| GitHub Pages + Actions | Hosting & CI | Built |

## 11. Open decisions & known gaps

1. **Time zone:** resolved — experts choose their zone; visitors see their own clock. Open: default zone for newly registered experts.
2. **Business WhatsApp number** must be wired to the Twilio webhook for automatic verification (else staff use "Verify manually").
3. **Turnstile** keys not provisioned.
4. **Guest payment** is "pay later on WhatsApp" — assumed; confirm or add in-CRMS payment records.
5. **Claim-token hand-off** to the register page relies on the URL fragment (and `sessionStorage` only if same origin); confirm the register page behaviour end to end on separate origins.
6. **Careers S3 setup** (see §6).
7. **Bahasa Indonesia** content and locale switch not built.
8. **Theme alignment:** the CRMS app's login/register pages still use an older gold/teal palette and look different from this site — see `../CRM/template.md` §6. Needs the client's call.
9. **Analytics / error reporting** not installed (deliberate until privacy position is set).
10. **Automated E2E tests** (Playwright) for the booking flow not built.
11. Public copy (FAQ, packages, legal) needs client/legal review before launch; legal text here is not legal advice.
12. Uncommitted work: careers feature, nav and footer changes.

## 12. Phasing

| Phase | Scope | Status |
|---|---|---|
| 1 | Marketing pages, directory, profiles, legal, help | Built |
| 2 | No-account guest booking with WhatsApp verification | Built |
| 3 | Careers + hiring pipeline | Built, S3 pending |
| 4 | Provision Turnstile, wire Twilio, resolve timezone, S3 real test, production deploy | Not started |
| 5 | Bahasa Indonesia, analytics (privacy-reviewed), E2E suite, custom domain | Not built |

## 13. Risks

| Risk | Mitigation |
|---|---|
| Bots / scam bookings | Server-side ownership proof, tokens, rate limits, Turnstile once provisioned |
| Wrong-time bookings from UTC confusion | Label times clearly; resolve §11.1 |
| Theme drift between site and app | Single source of truth in `template.md`; client sign-off for changes |
| Static-hosting limits (no server redirects, no dynamic routes) | Query-string profile URLs; client-side fetch; revisit hosting if SEO per-profile pages are needed |
| API outage makes site look empty | Error states everywhere, never "no data" |
| Crisis content out of date | Review `/help` on a schedule; owner named in the client's ops plan |
