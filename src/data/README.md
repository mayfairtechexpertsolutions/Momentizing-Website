# Event posters (built-in events)

Built-in events live in `src/data/fallback-events.json` and are shown **only when the backend is unavailable**. To add one,
copy the disabled sample, change it and set `"enabled": true`. The `_help` text in the file explains every field.
Put its poster in `public/events/` and set `"poster"` to the **file name only** (e.g. `"poster": "calm-mind-evening.jpg"`).

- Portrait 4:5 (about 800 × 1000 px). JPG or WebP, under 300 KB. Lower-case file names with hyphens, no spaces.
- Leave `"poster": ""` (or use a name that doesn't exist there) and the site shows the default brand poster.
- Files in `public/` are public. A bad date, time, time zone, format or id fails the build with a message naming the event.
- Upcoming/past is worked out from today's date, so finished events move to *Past events* by themselves.

# Team photos

Put each built-in profile's photo in `public/team/`, then set `"photo"` in `src/data/fallback-specialists.json` to the
**file name only** (e.g. `"photo": "adeline-herdianto.jpg"`).

- Portrait, 4:5 (about 800 × 1000 px), face in the upper half. JPG or WebP, under 200 KB.
- Lower-case file names with hyphens, no spaces.
- Files here are public. Only add photos the person has agreed to publish.
- Leave `"photo": ""` (or use a name that doesn't exist here) and the site shows the default portrait from
  `default/` instead, chosen by `"gender"` in the JSON: `FEMALE` → `female.svg`, `MALE` → `male.svg`, `NEUTRAL` → `neutral.svg`.
