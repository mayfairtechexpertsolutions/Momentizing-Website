import { BASE_PATH } from "./base-path";

/** Public origin the site is served from, no trailing slash. Used for canonical URLs, the sitemap, Open Graph and
 * structured data. Override: NEXT_PUBLIC_SITE_URL (set it to the custom domain once there is one). */
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || "https://mayfairtechexpertsolutions.github.io").replace(
  /\/+$/,
  "",
);

/** Site root including any deploy prefix, no trailing slash (e.g. `https://<user>.github.io/<repo>`). */
export const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;

/** Absolute URL for a site path such as `/about/` (trailing slash matches `trailingSlash: true`). */
export const absoluteUrl = (path = "/") => `${SITE_URL}${path === "/" ? "/" : path}`;

export const SITE_NAME = "Momentizing";
export const SITE_DESCRIPTION =
  "Culturally-attuned counseling, coaching and psychological assessment online for expats, international students, cross-cultural couples and the global diaspora.";
