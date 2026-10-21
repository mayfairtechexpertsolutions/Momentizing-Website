# Momentizing Website

Docs: [CLAUDE.md](CLAUDE.md) (working rules) · [PRD.md](PRD.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [template.md](template.md) (theme & templates).

The public marketing site and no-account booking flow, split out of the CRMS frontend. It talks to the CRMS backend over its public API only.

Pages: `/` (home), `/associates`, `/associates/view?id=<id>`, `/book`, `/about`, `/careers`, `/legal`, `/help`.
Login, registration, specialist sign-up and the app-install page stay in the CRMS app; the website links to them.

## Point it at a backend

Edit **[site.config.ts](site.config.ts)**:

| Setting | What it is | Env override |
|---|---|---|
| `apiBaseUrl` | Backend API base, with `/api/v1`, no trailing slash | `NEXT_PUBLIC_API_BASE_URL` |
| `appUrl` | Where the CRMS web app lives (Login / Create account / Get the app links) | `NEXT_PUBLIC_APP_URL` |
| `turnstileSiteKey` | Cloudflare Turnstile key for the booking form (empty = off) | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` |

Values are baked in at build time: restart `npm run dev` or rebuild after changing them.

The backend must list the website's origin under `cors.allowed-origins` (`application.yml`; dev already allows `http://localhost:3000` and `:3001`).

## Run

```bash
npm install
npm run dev      # http://localhost:3001
npm run build && npm start
npm test
```

## Deploy to GitHub Pages

The site is a static export (`output: "export"`), deployed by [.github/workflows/deploy.yml](.github/workflows/deploy.yml) on every push to `main`.

1. Push to `https://github.com/mayfairtechexpertsolutions/Momentizing-Website`.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Repo **Settings → Secrets and variables → Actions → Variables**, add (all public, baked into the bundle):
   `API_BASE_URL` (public **https** backend incl. `/api/v1`), `APP_URL`, `TURNSTILE_SITE_KEY` (optional).
   Using a custom domain? Also add `CUSTOM_DOMAIN` = `true` (serves from `/` instead of `/<repo-name>`).
4. Set repo variable `SITE_URL` to the public origin (e.g. `https://momentizing.com`) once there is a custom domain; it feeds canonical URLs, the sitemap and structured data. Unset, it defaults to the `github.io` origin.
5. The backend must list the Pages origin (`https://mayfairtechexpertsolutions.github.io`, or your custom domain) under `cors.allowed-origins`.

Local check of the Pages build: `NEXT_PUBLIC_BASE_PATH=/Momentizing-Website npm run build && npx serve out` (served under that prefix).

Because Pages is static, the associate profile is `/associates/view?id=<id>` rather than `/associates/<id>`.

## Notes
- The guest-booking claim token is handed to the app's register page in the URL fragment, and also via `sessionStorage` when the website and the app share an origin. If the hand-off fails the booking still succeeds but won't auto-link to the new account.
- The old static site's git history in this folder is untouched.

## Colour & type

The look follows the brand's Instagram artwork: mint wash, rust headlines, peach tints, deep sage, cream paper.
Tokens live in `src/app/globals.css` (`--momentizing-*`); use these, not raw greys or hex.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `slate` | `#24382f` | body text, dark bands | 11.5:1 on cream |
| `teal` | `#3b6b58` | primary buttons, eyebrows, links, icons | 5.7:1 on cream, 6.1:1 white-on-it |
| `gold-deep` | `#9a3f1a` | headlines, secondary buttons, badges | 6.3:1 on cream |
| `muted` | `#4a5d54` | secondary text (replaces all grey-400..700) | 6.5:1 on cream |
| `gold` | `#e8a07e` | borders, rings, text **on dark green only** | 5.8:1 on slate; never use on light |
| `cream` / `mint` / `peach` | `#fbf5ec` / `#e6f0ea` / `#fbe6d8` | backgrounds | — |

Fonts: Fraunces (headings) + Nunito (body), via `next/font`. Keep text at 12px or larger.
Before shipping a colour change, re-check pairings against WCAG AA (4.5:1 text, 3:1 large text and UI).
