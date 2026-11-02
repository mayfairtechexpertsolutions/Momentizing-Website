# Team photos

Put each built-in profile's photo in `public/team/`, then set `"photo"` in `src/data/fallback-specialists.json` to the
**file name only** (e.g. `"photo": "adeline-herdianto.jpg"`).

- Portrait, 4:5 (about 800 × 1000 px), face in the upper half. JPG or WebP, under 200 KB.
- Lower-case file names with hyphens, no spaces.
- Files here are public. Only add photos the person has agreed to publish.
- Leave `"photo": ""` (or use a name that doesn't exist here) and the site shows the default portrait from
  `default/` instead, chosen by `"gender"` in the JSON: `FEMALE` → `female.svg`, `MALE` → `male.svg`, anything
  else → `neutral.svg`.
