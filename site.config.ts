/**
 * Website configuration — the one file to edit when the website is pointed at a different backend.
 *
 * Values are baked in at build time, so restart `npm run dev` (or re-run `npm run build`) after changing them.
 * Each value can also be overridden from the environment (e.g. `.env.local` or the host's env settings),
 * which wins over what is written here.
 */
export const siteConfig = {
  /**
   * Base URL of the Momentizing CRMS backend API, including the `/api/v1` prefix and no trailing slash.
   *   local dev  -> http://localhost:8080/api/v1
   *   production -> https://api.your-domain.com/api/v1
   * Override: NEXT_PUBLIC_API_BASE_URL
   */
  apiBaseUrl: "http://localhost:8080/api/v1",

  /**
   * Where the CRMS web app (client login/register, specialist sign-up, install page) lives. The website's
   * "Login", "Create an account" and "Get the app" links point here. No trailing slash.
   * Override: NEXT_PUBLIC_APP_URL
   */
  appUrl: "http://localhost:3000",

  /**
   * Cloudflare Turnstile site key for the public booking form. Leave empty to skip the challenge (local dev);
   * the backend must then not require it either.
   * Override: NEXT_PUBLIC_TURNSTILE_SITE_KEY
   */
  turnstileSiteKey: "",
};

const trimSlash = (url: string) => url.replace(/\/+$/, "");

// Next only inlines `process.env.NEXT_PUBLIC_*` when written out in full, so each is referenced literally here.
export const API_BASE_URL = trimSlash(process.env.NEXT_PUBLIC_API_BASE_URL || siteConfig.apiBaseUrl);
export const APP_URL = trimSlash(process.env.NEXT_PUBLIC_APP_URL || siteConfig.appUrl);
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || siteConfig.turnstileSiteKey;

/** Absolute link into the CRMS web app, e.g. `appLink("/login")`. */
export const appLink = (path: string) => `${APP_URL}${path}`;
