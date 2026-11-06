# Momentizing Website — QA Checklist (backend offline / backend online)

Scope: the public marketing site in `Website/` (static Next.js export, port 3001). The CRM app (`CRM/Frontend`) and the
backend have their own checklist: [../CRM/QA-CHECKLIST.md](../CRM/QA-CHECKLIST.md) (§9.5, §9.7 cover the website with the backend up).

Legend: `[x]` passed · `[ ]` not run yet · `[!]` failed (see "Findings") · `[~]` partly / by code reading only.

## How the site decides it is offline

- `lib/backend-status.ts` probes `GET /public/contact-info` (8 s timeout, re-checked every 30 s and when the tab regains focus).
  A refused connection, a timeout or a 5xx means **offline**; a 4xx means the backend is answering (**online**).
- A real request failing with a 5xx/network error calls `reportBackendUnavailable()`, which holds "offline" for 30 s.
- Offline, backend-only features are replaced with **WhatsApp** (`OnlineOnly` + `OfflineWhatsAppCard`) or static built-in data
  (`src/data/fallback-*.json`: specialists, packages, events; `lib/fallback-crisis-resources.ts`). Fallback records have **negative ids**.
- "checking" (before the first answer) shows neither the backend feature nor the offline alternative.

## Environment

- **Offline run:** `cd Website && npm run dev` with nothing listening on `:8080` (verify `curl -m 3 localhost:8080/api/v1/public/contact-info` fails).
  Also run the real static output: `npm run build && npx serve out`.
- **Online run:** start Postgres + backend (recipe: `CRM/QA-CHECKLIST.md` §0 and the "offline QA recipe" notes), with
  `--cors.allowed-origins=http://localhost:3001`; seed ≥2 approved specialists with an assistant, availability, a `specialist_clients` link,
  one package and one event. Turnstile key empty locally.
- Automated gate before either run: `npm test` (165 tests; the suite runs in America/Los_Angeles, `TEST_TZ=Asia/Tokyo npm test` re-runs it elsewhere — only the four tests named "tests run in America/Los_Angeles" are zone-specific), `npx tsc --noEmit`, `npx eslint`.
- Tools used for the offline run (all throwaway, in the session scratchpad): a socket that accepts and never answers (hanging backend) and a 30-line mock that answers only `/public/contact-info` (reconnect, 500 and partial-failure cases).

---

# PART A — Backend OFFLINE

Runs: **2026-11-06 pass 1** found F1–F9; **pass 2 (same day)** fixed everything fixable, re-ran every item below and added the previously unrun ones. Chromium in the Claude app (dev server, then the static `out/` served with and without `NEXT_PUBLIC_BASE_PATH`), browser in Asia/Jakarta (UTC+7), backend not running except where a step says it was mocked.
Automated after pass 2: vitest 165/165 (also green in Tokyo, Auckland, Jakarta and UTC apart from the four Los-Angeles-specific tests), `tsc` clean, eslint clean, `npm run build` ok (default and with a base path).

## A1. Global behaviour

- [x] Every route returns 200 (`/`, `/about`, `/associates`, `/associates/view`, `/book`, `/my-bookings`, `/careers`, `/legal`, `/help`, `/events`, `/events/view`, `/llms.txt`, `/robots.txt`, `/sitemap.xml`); unknown path → branded 404 (`Page not found | Momentizing`).
- [x] No blank page, no raw "Failed to fetch" / `undefined` / `NaN` / `[object` text on any page.
- [x] Console shows only the browser's own `ERR_CONNECTION_REFUSED` lines (no uncaught exceptions).
- [x] Header (desktop and 375 px menu) shows no Login / Create account / Get the app links; "Book a Session" still shown.
- [x] No dead links to `localhost:3000` anywhere (account links are hidden offline).
- [x] Floating WhatsApp button and footer "WhatsApp us" use `https://wa.me/6285702200701?text=…` (built-in number).
- [x] 375 px: no horizontal scroll on any page (decorative SVG/blur shapes and the date strip scroller are clipped/scroll inside their own box).
- [x] No text under 12 px on any page at 375 px.
- [x] Language switch (footer select) → Indonesian: `<html lang="id">`, offline cards, errors, WhatsApp prefilled text are Indonesian. Back to English resets cleanly.
- [x] Reconnect: with a mock API started while `/careers` was open offline, the card became the form in 2 s (≤30 s poll) and the **Account** menu appeared, no reload. WhatsApp links switched to the live number without a reload (F11 fixed).
- [~] Backend failing mid-flow: with the mock answering the probe but 500 on everything else, `/book` step 3 flipped to the WhatsApp list and the Account menu disappeared. Repeat with the real backend stopped mid-booking in Part B.
- [x] Hanging backend (socket accepts, never answers): `/careers` showed nothing, then the WhatsApp card at ~8.4 s after load; never stuck on "checking".
- [x] Backend 500 on everything but `/public/contact-info`: pages show the built-in packages/specialists, `/book` switches to WhatsApp requests, no error wall. 404/4xx on the probe counts as online (unit test `backend-status.test.ts`).
- [~] Observation: with the probe fine but data endpoints failing, header account links stay visible while packages/specialists show built-ins (only a failed *booking* call flips the site offline). Acceptable; the status holds 30 s after a real failure.

## A2. Home `/`

- [x] Hero, services, "Our approach", about teaser render; both hero CTAs work.
- [x] **Care Packages** come from `fallback-packages.json`: 4 Individual tabs entries ("Start from" prices in IDR), Couples and Assessments tabs, "Most popular" badge.
- [x] **Top-rated specialists** shows the 8 built-in profiles with photos, "Fee shared on WhatsApp", "View X's profile" links.
- [x] **Upcoming events** band shows enabled built-in events; with none enabled the band is hidden (home) and `/events` shows the empty state with "tell me about new events" on WhatsApp.
- [x] FAQ lists all 15 questions.
- [x] *Ask about this package* opens the "Ask our team" dialog; the package select is filled with the built-in packages.
- [x] Submitting the dialog offline shows "Can't reach the server. Check your connection and try again." and **keeps what was typed**; "Or continue on WhatsApp" stays available (enabled once a name is typed).
- [x] FAQ rows are buttons with `aria-expanded` and toggle open/closed. `prefers-reduced-motion` cannot be emulated in this browser; read from code: `globals.css` zeroes animation/transition durations and uses `scroll-behavior: auto`, and `ScrollReveal`, `DateStrip` and `ProfileNav` check `matchMedia` — ok. Anchors clear the fixed bar via `scroll-padding-top: 6rem`.
- [x] Dialog: real **Esc** closes it and focus returns to the trigger; focus is inside and `aria-labelledby` is set. *Inquire for corporate* started on the first package and wrote "question about the Single Session" (F10, fixed): it now starts on "Corporate / team wellbeing (not a package)" and the WhatsApp text is about corporate wellbeing; "Ask about this package" still starts on its package. WhatsApp button is disabled until a name is typed, opens the prefilled link and closes the dialog.

## A3. Find a specialist `/associates` and profile

- [x] 8 built-in profiles listed; each card is one link; "Accepting new clients".
- [x] Profile `?id=-4` renders hero, sections, booking panel ("Book with Fida" → `/book/?specialist=-4`, "Ask a question" → WhatsApp with the specialist's name in the text).
- [x] Missing, non-numeric or unknown built-in id (`-99`) → "Associate not found" + back link (no request). A positive id offline → "can't show this profile right now" with Try again, the directory and WhatsApp (F4 fixed).
- [x] Search narrows the list ("french" → Fida, Yudith; a city such as "bali" now matches locations, F12 fixed); no match → "No associates found matching those criteria"; *Accepting clients* and *Favorites* toggles work.
- [x] Favorite heart persists after reload (`momentizing:favorite-specialists`) and the Favorites tab lists it. The storage-blocked case is a CLAUDE.md invariant but was not run in a browser.
- [x] Built-in profiles show a "working hours" section instead of reviews (no error wall).

## A4. Booking `/book` (WhatsApp request flow)

- [x] Step 1: day strip shows today + 28 days; Continue disabled until a day is picked.
- [x] Step 2 validation: empty submit marks name + WhatsApp invalid, five yes/no questions and both consent boxes show their messages; focus/step stays.
- [x] "18 or older = No" shows the "sessions are for adults" note and **blocks Continue**.
- [x] "Urgent = Yes" shows the safety note with the help link and still allows continuing.
- [x] Step 3 shows the "Book by WhatsApp" banner and all 8 built-in specialists; **couple = Yes** marks everyone but Fida "Not available for couples" with no Choose button.
- [x] "Prefers online" = Yes marks in-person-only profiles ("In person only — no online sessions"); = No marks online-only ones (F5 fixed). Nobody is hidden.
- [x] Step 4 lists the specialist's own weekly hours (Fida: Wed/Fri 09:00 and 10:00), other days say "No open times… These days have openings" with jump links.
- [x] Today's already-passed hours are no longer offered (F3 fixed 2026-11-06: Fri 6 Nov 09:00/10:00 hidden at 13:40; times starting within 2 h also hidden).
- [x] Step 5 review shows specialist, "Wednesday, November 11 at 9:00 AM (GMT+7)", name, WhatsApp, "This is a request, not a booking… nothing to pay now"; each *Change* link returns to its step.
- [x] *Send request on WhatsApp* opens `wa.me/6285702200701` with the full prefilled message (specialist, time, name, phone, five answers, concern, closing line) and the page changes to "Almost done — press Send in WhatsApp" with *Open WhatsApp again* and *Start over*; the draft is cleared afterwards.
- [x] `/book?specialist=-4` deep link starts at "Pick a day and time" (3 steps) for that specialist.
- [x] Draft survives reload (sessionStorage `momentizing.book.draft`), holds no token.
- [x] "I can't find my schedule" opens a dialog that says help requests can't be passed on right now and offers *Message us on WhatsApp*.
- [x] Time conversion (unit-tested under Los Angeles and re-run in Tokyo): visitor time plus the expert's time; when the expert's day differs it now says so ("9:00 AM (PST) = 12:00 AM GMT+7 on Tuesday, November 3", F13 fixed). DST-day dates (8 and 29 March) convert correctly.
- [x] A 760-character note is cut to 500 with "…"; a name like `Zoë "Z" & Co #1 😀` and a note with `& = ? # %` arrive intact (URL ~1.7 KB).
- [x] Every built-in profile has weekly hours (2–25 slots/week); the generic 08:00–20:00 grid (`requestedHoursSlots`, also filtered for past times) is unit-tested and appears for a live specialist whose slots call fails.
- [x] *Back* returns one step with choices kept; refreshing restores the step from the session draft. A new `?specialist=` link beats an old draft's specialist when it can be resolved; an unresolvable one leaves the old draft.
- [x] After *Send request*, "Open WhatsApp again" is a real `wa.me` link (works when a pop-up is blocked).
- [x] `?specialist=5` (positive id, backend down), clean session → normal Step 1, no error, no crash.

## A5. My bookings `/my-bookings`

- [x] Shows only "Check your booking on WhatsApp" + *Message us on WhatsApp* (prefilled "check on my booking"); no phone/code form, no Turnstile, no `<form>`.
- [x] Page is `noindex` and disallowed in `robots.txt`.

## A6. Careers `/careers`

- [x] Four steps render; the application form is replaced by "Apply on WhatsApp" with a prefilled template (name, profession, years, CV).
- [x] No `<form>`, no file input, no upload attempt.

## A7. Events `/events`, `/events/view`

- [x] With the built-in events enabled (pass 1): Grid and Calendar views, filters, brand-poster fallback, four-date detail with "Add to calendar" and Share. Covered by `fallback-events.test.ts` / `events.fallback.test.tsx` now that both samples are disabled.
- [x] Unknown id → "We couldn't load this event just now" + *Try again*.
- [x] Built-in events with no `registrationUrl` show *Register on WhatsApp* with a prefilled message (F2 fixed 2026-11-06).
- [x] The two sample events (invented dates, price and the address "Jl. Contoh No. 1") are now `"enabled": false` in `fallback-events.json` (F6). **The team must add real events there to show any while the backend is down.**
- [x] With the sample events temporarily enabled: *Add to calendar* produced `momentizing-event--2-2026-11-12.ics` (cosmetic double dash from the negative id) with `DTSTART:20261112T123000Z` / `DTEND:…T140000Z` for 19:30–21:00 WIB, CRLF lines, escaped description and the site URL; *Share* copied the event link and showed "Link copied". The data file was restored to disabled.
- [x] Past/cancelled handling is unit-tested; with the backend, a CANCELLED event opened normally (its notice is part of the page).

## A7b. Help `/help`

- [x] Crisis list always renders from the built-in list (Kemenkes SEJIWA 119 ext 8, Into The Light, Findahelpline, 988…); shows the "couldn't load the list… call your local emergency number" notice plus *Try again*.
- [x] **Get help now** is now a footer link and a mobile-menu item (F7 fixed); the footer disclaimer still names the page in plain text, and `/legal` links it. Not added to the desktop bar (kept to five items).

## A8. About, Legal

- [x] About renders (SVG art, timeline, no broken images, no founder name).
- [x] Legal tabs render Terms (effective 22 October 2026) and Privacy; WhatsApp number shown in text is the built-in one.
- [x] `/legal/#privacy` opens Privacy; the Terms/Privacy buttons now expose `aria-pressed` and are 44 px tall on phones (F14 fixed). *Save PDF* (print) not run.
- [x] Privacy says unconfirmed holds expire after 30 minutes; Terms also say the team may confirm a booking by hand. No offline-specific contradiction found. *Owner:* have the lawyer confirm the WhatsApp-request wording.

## A9. SEO / GEO (do with `npm run build`, `out/`)

- [x] `robots.txt` allows `/`, disallows `/my-bookings/` and `/associates/view/`; sitemap lists the public pages.
- [x] `noindex` meta on `/my-bookings` and `/associates/view`.
- [x] `/llms.txt` prints `+62 857 0220 0701` (F1 fixed 2026-11-06; was a client-reference function).
- [x] JSON-LD `contactPoint.url` is `https://wa.me/6285702200701` in dev and in rebuilt `out/` (F1 fixed).
- [x] Unique `<title>` and canonical (`https://mayfairtechexpertsolutions.github.io/…`, never localhost) on all eight indexable pages; FAQPage + 15 Q&A and the ContactPoint on Home; `out/` HTML contains no `localhost`. *Event* JSON-LD is unit-tested only.
- [x] Sitemap lists exactly `/ /book/ /associates/ /events/ /about/ /help/ /careers/ /legal/`. `lastmod` is the build time (changes every build) — acceptable.
- [ ] **Production check:** the baked API and app URLs default to `localhost` unless `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_APP_URL` are set in the deploy workflow; verify the deployed bundle.

## A10. Static export / hosting

- [x] `npm run build` succeeds with the backend down (no build-time calls). Bad fallback ids/prices/dates fail with a named record (unit-tested in `fallback-*.test.ts`).
- [x] `out/` served statically: every route 200, 404 for unknown paths, `/book/?specialist=-4` and profile deep links load, fonts/Font Awesome/photos load, offline notices show.
- [x] Built with `NEXT_PUBLIC_BASE_PATH=/Momentizing-Website` and served under that path: no unprefixed `href`/`src`, team photos and logo load, no 4xx, footer Help link is `/Momentizing-Website/help/`.
- [x] Network tab (static build, offline): only the failing API calls, self-hosted fonts, Font Awesome from `public/vendor`, own chunks. No trackers, no Turnstile request. (`contact-info` is requested twice on `/book`; harmless.)

## A11. Accessibility (offline states)

- [x] Radio groups have a legend and per-option labels; validation errors are text, not colour only.
- [x] Keyboard: skip link first, visible 3 px focus ring, day strip is a roving tab stop, Enter selects a day, Continue moves focus to the new step's `<h1>`; dialogs trap focus and Esc returns it to the trigger.
- [x] Accessibility-tree audit of eleven pages (a stand-in for a screen reader): `lang` set, one `<h1>`, one `<main>`, a skip link target, no unnamed links/buttons, no unlabeled fields, no missing `alt`, no duplicate ids, no heading skips after F18, all `target=_blank` links have `noopener`, status/alert regions on the offline notices; the WhatsApp links carry a visually hidden "(opens in a new tab)". A real VoiceOver pass was **not** done.
- [x] Safari (WebKit): the profile page renders correctly (header, hero, photo, chips, WhatsApp button). One page only; Safari could be viewed but not driven.
- [x] Computed-style contrast scan (WCAG, canvas-resolved colours, 0 text nodes skipped) over ten pages: 0 failures under 4.5:1 (3:1 for large text). Gradient/image backgrounds were not present under text.

---

# PART B — Backend ONLINE

Run **2026-11-06 (pass 3)** against the real Spring Boot backend (Flyway to V73) on a throwaway Postgres 17 (`initdb`, port 15432), site on the dev server. Seeded by SQL: 2 approved, website-listed specialists with an active pool assistant, 7-day 09:00–17:00 Asia/Jakarta availability, one published event, the 3 packages the migrations ship, 1 event-organizer admin. Twilio, Resend, Turnstile, S3, Xendit are **off** (backend logs "(not enabled) would send…"), so WhatsApp verification and payment were simulated. Everything marked "built-in" in Part A was confirmed to be **live** data here.

## B1. Global

- [x] Header shows Account menu (Log in / Create account / Get the app / Specialist sign-up) pointing at `APP_URL` (`localhost:3000`); no offline wording on the page; no flash of the offline card.
- [x] Business WhatsApp number comes from `/public/contact-info` (`+6285702200701`); the site switches to a changed live number without a reload (F11). Changing it in the Admin screen itself was not clicked (the Admin UI was not run).
- [x] No `Access-Control` errors from `localhost:3001`; only the API, fonts and own assets are requested.
- [x] A 4xx never flips the site offline (unknown ids → "not found", wrong code → message). Server field errors are translated, e.g. an invalid number on `/my-bookings` in Indonesian: "Itu tampaknya bukan nomor WhatsApp seluler yang valid…".
- [x] Backend stopped at the booking review step: pressing *Hold my time* switched the page to "Check and send your request" (WhatsApp) with every detail kept and the Account menu gone; backend restarted → the page returned to *Hold my time* in ~7 s with no reload.

## B2. Home

- [x] Care Packages load from `/packages` (Healing Journey…); built-ins are not shown. Specialists and events bands show live records (no negative ids).
- [x] *Ask about this package* → select starts on the clicked package → "Request received" → row stored with that package. *Inquire for corporate* → "Corporate / team wellbeing", stored with **no** package (F10).
- [ ] Empty `/packages` list state and API-error-with-Try-again state (needs a backend with no packages / a failing endpoint). Not run.

## B3. Directory and profiles

- [x] Directory lists the two live specialists; name search narrows; no match → empty message (not an error). Unlisting a specialist in the database removes them after reload.
- [x] Profile `?id=3` shows hero, reviews section and "Book" links (`/book/?specialist=3`); `?id=999` and `?id=abc` → "Associate not found".
- [ ] Reviews with pagination (no review rows seeded). A specialist without an assistant not listed (covered by the backend's `SpecialistAssistantRuleIntegrationTest`).
- [x] Couple filter: the live list shows who accepts couples (Budi yes, Anna no) — checked through the API flag `acceptsCouple`; the "Not available for couples" chip is unit-tested.

## B4. Booking (real holds)

- [x] Real slots at 30-minute steps in the visitor's zone ("9:00 AM (GMT+7)"); stored as 02:00 UTC.
- [x] Form token loads. *Hold my time* clicked twice quickly created **one** booking (`MOM-GS78ZF`) with a 30-minute countdown.
- [x] Verify screen shows the code, *Confirm on WhatsApp* (prefilled `wa.me` with the code), *Copy the message*, *I've sent it — check now*. After the booking was marked confirmed (simulated verification) the page changed to "You're all set" with reference, time, "Add to my calendar" → `momentizing-MOM-GS78ZF.ics` with `DTSTART:20261109T020000Z` (= 09:00 WIB, same as the page); draft cleared.
- [x] Slot taken meanwhile (a competing booking inserted after the visitor picked 11:00) → "That time was just taken by someone else…" and back on the time step with a fresh list.
- [x] "I can't find my schedule" → success message; row `NEEDS_HELP` created; the pool assistant got the "Website visitor needs help finding a schedule" notification (email log).
- [ ] Turnstile token flow, per-address abuse limits (V51), blocked number — not run in the browser (Turnstile key empty; limits are covered by backend tests).
- [x] Consent text, health-data consent and the under-18 block work (same as Part A).

## B5. My bookings

- [x] Phone → code (logged by the WhatsApp stub) → wrong code "That code isn't right, or it has expired" → correct code lists the upcoming booking (time, specialist, type, reference); the token lives in `sessionStorage` only.
- [ ] 5 wrong codes lock the number; a code works once (backend integration tests cover it; not repeated in the browser).

## B6. Careers

- [x] Empty submit marks every required field with its message; bad email caught; honest "Please attach your resume".
- [x] With a résumé attached the backend answers 400 and the page says "Resume upload isn't available right now. Please try again later." (S3 is not configured locally — expected).
- [ ] Real résumé upload (needs S3 + bucket CORS for the site origin), honeypot refusal, the application appearing in Admin → Careers.
- [!] When résumé upload is unavailable the careers page offers no alternative (the WhatsApp card appears only when the whole backend is down) — see F18.

## B7. Events

- [x] Live events replace the built-in ones. An event with a `registration_url` shows **Register** → that URL; without one it shows *Register on WhatsApp*. A CANCELLED event still lists and opens (its page says so by design); an unknown id → "We couldn't find that event".
- [x] "Add to calendar" and Share verified (Part A, same code).
- [ ] Poster upload from storage (needs S3).

## B8. Help

- [!] Before the fix the live `/help` showed **only the two international lines** while the built-in list also has the two Indonesian ones (F16). Fixed: Indonesia first, then international, each falling back to the built-in entries separately; verified live (`119 ext. 8`, Into The Light, Findahelpline, 988) and with the backend down.

## B9. Cross-cutting

- [x] Indonesian: server error codes translate; dates and WhatsApp prefilled text are Indonesian (see B1).
- [x] The `contact-info` probe is requested once per page load; no request waterfall on Home (packages, directory, events in parallel).
- [x] Admin-side changes show on reload: unlisting a specialist and cancelling/publishing an event took effect in the public API at once. The Admin UI screens that make these changes were not driven.

---

# Findings from the 2026-11-06 runs (F1–F20)

| # | Severity | Finding | Where | Suggested fix |
|---|----------|---------|-------|---------------|
| F1 | **FIXED** · High (SEO/GEO) | `src/lib/whatsapp.ts` starts with `"use client"`, so server code importing its constants gets a *client reference function*. `/llms.txt` prints the function source; the site-wide JSON-LD `contactPoint.url` becomes `https://wa.me/function(){throw Error…}`. Both are in the current `out/` build. Not offline-specific — the build is static, so it affects both modes. | `lib/structured-data.ts:24`, `app/llms.txt/route.ts:31`, `lib/guest-booking.ts:143` (check this one too) | Move `MOMENTIZING_WHATSAPP_NUMBER` / `_DISPLAY` and `buildWhatsAppLink` to a file without `"use client"` (e.g. `lib/whatsapp-constants.ts`), re-export from `whatsapp.ts`; add a test that `llms.txt` contains `+62` and JSON-LD `url` matches `^https://wa.me/\d+$`. |
| F2 | **FIXED** · Medium | Offline event detail has no way to register: both built-in events have `registrationUrl: ""`, while the page says the joining link is sent "when you register". | `src/data/fallback-events.json`, `app/events/view/page.tsx:86` | When there is no `registrationUrl`, show *Register on WhatsApp* (prefilled with the event title/date), at least while offline. |
| F3 | **FIXED** · Medium | Booking wizard offers hours that already passed today (Fri 6 Nov 09:00/10:00 shown at 13:33). Built-in slots ignore the current time. | `lib/fallback-specialists.ts` (slot generator, ~l.289), `requestedHoursSlots` in `lib/manual-booking.ts` | Drop times earlier than now (+ a lead time, e.g. 2 h) for the visitor's today. Add a unit test with a fixed clock. |
| F4 | **FIXED** · Low | Unknown / missing / non-numeric profile id offline says "Can't reach the server" with *Try again*; there is nothing to retry. | `app/associates/view/page.tsx` | When offline and the id is not a built-in profile, show "This profile isn't available right now" + links to the directory and WhatsApp. |
| F5 | **FIXED** · Low | Offline specialist list ignores "prefers online sessions"; in-person-only (Yudith) and online-only (Norma) profiles are not marked. Couple filtering works. | `BookingWizard.tsx` (specialist step) | Add an "In-person only / Online only" hint, like the couples label. |
| F6 | **FIXED (data)** · Low | Built-in events are samples shipped enabled: "Jl. Contoh No. 1" ("Contoh" = "Example"), no poster, no registration. The real team must replace or disable them before launch. | `src/data/fallback-events.json` | Confirm real details, or set `"enabled": false`. |
| F7 | **FIXED** · Low | `/help` (crisis resources) is reachable only from the booking wizard. Not in header, mobile menu or footer; the footer disclaimer's "Crisis Resources page" is plain text; `CRM/QA-CHECKLIST.md` §9.7 expects it one tap from nav and footer. | `components/marketing/MarketingFooter.tsx`, `NavMenu.tsx` | Link the disclaimer text and add a "Get help now" footer link. |
| F8 | **FIXED (draft text)** · Info | Built-in event and specialist text (titles, bios, summaries) stays English when the site is Indonesian. | `src/data/*.json` | Decide whether the built-ins need `id` translations. |
| F9 | **FIXED** · Info | ESLint warning: unused `vi` import. | `src/lib/fallback-events.test.ts:1` | Remove the import. |
| F10 | **FIXED** · Medium | *Inquire for corporate* opened the enquiry on the **first package** (selected, sent as `packageId`, and quoted in the WhatsApp text), online and offline. | `BookingModal.tsx`, `app/page.tsx` | Package select has a "Corporate / team wellbeing" option and starts there; tests in `BookingModal.test.tsx`. |
| F11 | **FIXED** · Medium | After the backend came back, WhatsApp links on the open page kept the built-in number until reload (the live number was fetched but nothing re-rendered). | `lib/whatsapp.ts`, `lib/backend-status.ts` | `useWhatsAppLink` subscribes to the status store; test `whatsapp.test.ts`. |
| F12 | **FIXED** · Low | Directory search ignored locations, so "Bali" or "Jakarta" found nobody. | `app/associates/page.tsx` | Match location label/address too. |
| F13 | **FIXED** · Low | The WhatsApp request text said "9:00 AM (PST) = 12:00 AM GMT+7" without saying it is the next day there. | `lib/manual-booking.ts` | Append the expert's day when it differs; test added. |
| F14 | **FIXED** · Low | Legal Terms/Privacy buttons had no pressed state for assistive tech and were under 44 px on phones. | `app/legal/page.tsx` | `aria-pressed`, `min-h-11`. |
| F16 | **FIXED** · **High (safety)** | Live `/help` called `/safety/crisis-resources` without a region and so showed only the international lines (Findahelpline, 988); the Indonesian helplines (Kemenkes SEJIWA 119 ext 8, Into The Light) appeared only in the *offline* fallback. | `app/help/page.tsx`, `lib/fallback-crisis-resources.ts` | Request `region=ID` and `region=INTL`, show Indonesia first, fall back per region; tests added. |
| F17 | **FIXED** · Low | Favorites: toggling threw when storage is blocked (CLAUDE.md invariant 6), and the *Favorites (n)* count included hearts for profiles not in the list (a built-in saved offline). | `lib/favorites.ts`, `app/associates/page.tsx` | try/catch with an in-memory copy; count only listed profiles; `favorites.test.ts`. |
| F18 | **FIXED** (page states) · Low | Error / not-found / loading states of the profile and event pages had no `<main>` and no `<h1>`, so the skip link target did not exist; the directory jumped h1→h3. | `app/associates/view`, `app/events/view`, `app/associates` | Wrap states in `<main id="main">` with `<h1>`; hidden `<h2>` over the card grid. |
| F20 | **FIXED** · Low | Built-in package descriptions and the "Most Popular" badge stayed English in Indonesian, and the three built-in profession types (Clinical psychologist, Counselor, Wellness practitioner) showed as English. | `fallback-packages.json`, `lib/marketing-directory.ts` | `translations.id` for packages; profession keys added. |
| F19 | Open (owner) · Low | Careers: when résumé upload is unavailable (S3 down) there is no WhatsApp alternative. | `components/marketing/careers/CareerForm.tsx` | Show the WhatsApp card on that error as well. |
| F15 | Info | Partial backend failure (probe OK, data endpoints 500) keeps account links visible while built-in data is shown. | `backend-status.ts` | Left as designed; reconsider only if it confuses visitors. |

Still not run: a real screen reader (VoiceOver was not driven; an accessibility-tree audit was used instead), a real phone with WhatsApp installed, Firefox (not installed), Safari beyond one rendered page, real Twilio/Turnstile/S3/Xendit, and the Admin and CRM screens that feed the site.
