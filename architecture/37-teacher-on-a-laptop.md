# 37 · Teacher on a laptop: full width, and a viewport guard over every teacher route

Routes: `/` (the teacher card), `/teacher`, `/teacher/assignments/new`, `/teacher/report`,
`/teacher/mistakes`, `/teacher/compare`, `/teacher/groups`, `/teacher/whole-class`,
`/teacher/board`. Nothing in the teacher pages changed: they were already frameless and full
width, and the measurement found no overflow at either laptop size. What this ticket adds is
the copy and the guard that keeps it so.

## Files touched

| File | What it does |
|---|---|
| `scripts/laptop-check.mjs` | The guard. A dependency-free CDP script (Node's global `WebSocket` and `fetch`): checks the app answers and the CDP port is free, launches headless Chrome on a throwaway profile, and for each size (`1440x900`, `1280x800`; `LAPTOP_CHECK_SIZES` to try others) opens one tab via `Target.createTarget`, sets `Emulation.setDeviceMetricsOverride`, disables the cache, navigates to each of the eight teacher routes, waits for `[data-teacher-root]` or `[data-board]` (hydrated), and measures: `documentElement.scrollWidth` and `body.scrollWidth` against `clientWidth`, and every visible element whose box ends more than 1 px past it, measured at the cut of any `overflow: hidden`/`clip` ancestor (KaTeX's `\sqrt` is a 400 000-unit path in a clipping svg) but not of a scrollable one. Prints `ok`/`FAIL` per route and size with the offending elements (tag, id, `data-*`, classes, right edge, width); exit 1 on any failure. `finally` and SIGINT/SIGTERM: `Browser.close`, SIGKILL, profile deleted |
| `package.json` (+ root) | `check:laptop` → `node scripts/laptop-check.mjs`; the root script delegates |
| `app/page.tsx` | The teacher card reads "Teacher · Laptop" and "Full width on a laptop, no frame. …"; the intro says the teacher's laptop moves with the student |
| `README.md` | The run block lists the check beside lint, tsc and build |

## How it connects

```
 npx next build && npx next start -p 3121              (or LAPTOP_CHECK_URL=http://localhost:<port>)
                    │
 npm run check:laptop ──▶ scripts/laptop-check.mjs
                    │  assertApp(BASE) · assertFree(CDP_PORT)
                    ▼
        headless Chrome ── --user-data-dir=<fresh tmp dir> --disk-cache-size=1 --remote-debugging-port=9381
                    │  Browser websocket: Target.createTarget → attach (flat) → one tab per size
                    ▼
   ┌─ 1440 × 900 ──┐   ┌─ 1280 × 800 ──┐          Emulation.setDeviceMetricsOverride
   │ /teacher       │   │ /teacher       │          Network.setCacheDisabled
   │ /…/assignments/new  /…/assignments/new        Page.navigate → wait for [data-teacher-root] | [data-board]
   │ /teacher/report│   │ …              │          Runtime.evaluate(MEASURE)
   │ /teacher/mistakes   …                            vw = documentElement.clientWidth
   │ /teacher/compare    …                            scrollWidth (document, body) > vw ?
   │ /teacher/groups     …                            ∀ el: min(right, clipRight(el)) > vw + 1 ?
   │ /teacher/whole-class                             clipRight = nearest overflow hidden|clip ancestor's right
   │ /teacher/board │   │ /teacher/board │
   └────────────────┘   └────────────────┘
                    │
                    ▼  ok / FAIL per route × size, offenders named; exit 1 on any FAIL
        finally: Browser.close → SIGKILL → rmSync(profile)

 The pages measured (unchanged here):
   TeacherChrome  min-h-screen [zoom:0.8] · max-w-[1640px] px-6      → Class · Mistakes · Groups · Report · New assignment · Whole-class setup
   Board          h-screen grid [1fr 400px]                          → the projected surface, measured as a teacher route too
   The home card (app/page.tsx) names the laptop, as the student card names the iPad.
```

## Verified by

`npm run check:laptop` against a production build on port 3137 (`LAPTOP_CHECK_URL`, CDP on
9381, profile `/tmp/edexia-cdp-t37-run2`): all 16 route/size checks fit, scrollWidth equal to
the viewport on every one. The first run flagged two `<path>` elements 4754 px wide on
`/teacher/whole-class` at both sizes; a probe showed them to be KaTeX `\sqrt` glyphs inside a
22 px, overflow-hidden svg (`viewBox 0 0 400000 1080`), clipped by design, which is why the
measure now takes a clipping ancestor's edge. Negative test with `LAPTOP_CHECK_SIZES=900x800`:
`/teacher/assignments/new` fails (document scrollWidth 1031 > 900, the unit-focus card, pathway
map and Create button named), exit code 1. After every run: no Chrome left
(`pgrep -f edexia-cdp-t37`), the profile dir gone, CDP port free. Home page at 1440 × 900:
"Teacher · Laptop" and the laptop copy, both cards level. `npx tsc --noEmit`, `npx eslint .`
(covers the `.mjs`), `npx vitest run` (213 tests), `next build`.
