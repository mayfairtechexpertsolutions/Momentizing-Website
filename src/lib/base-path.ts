/** Deploy prefix (e.g. `/Momentizing-Website` on GitHub Pages project sites; empty elsewhere). Set via NEXT_PUBLIC_BASE_PATH.
 * `next/link` adds it automatically; use `withBase` for plain `<img src>` / `<a href>` / `window.location` paths. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const withBase = (path: string) => `${BASE_PATH}${path}`;
