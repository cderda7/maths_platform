# 296: Design tuner

**What to build:** a dev-only panel (⌥C, `npm run dev`) that tunes the app's design tokens on the live page: every colour family by lightness, vividness and hue, the status markers (pill corners, dot corners, the incomplete fill as a split at any angle or hatched), and the corners of cards, buttons and chips. Hold Space to see the saved design, let go to see the proposal; Save writes the values into `app/globals.css`.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15), trying a deeper red through DevTools: the colour picker closed on every click (the Class View re-renders), and comparing old against new took checkboxes and a new style rule. "Think like Bret Victor in Inventing on Principle … creators need an immediate connection to what they create." Then: "I'm also considering moving from incomplete being a vertical line to being a diagonal. Right now the incomplete red pills look like literal pills … exactly like a pharmaceutical pill. So I also want a mode to experiment with a diagonal line instead, as well as a mode to make the borders less rounded. Just consider the most prescient design features I'd want to experiment with."

## Decisions

- Dev only: mounted by the root layout when `NODE_ENV === "development"`; the save route answers 404 otherwise. Nothing in the production build changes.
- The tuner edits tokens, never components: whatever it can tune is a CSS custom property in `app/globals.css`, so Save is a value rewrite in one file and the page and the file never disagree. The markers' corners and the incomplete fill become tokens (`--marker-*`), and the Tailwind corner steps sm–3xl are declared in `@theme` so they can be written.
- Colours are tuned in OKLCH (lightness, vividness = chroma, hue), shown as three sliders whose tracks paint the colours they lead to; values are written back as hex.
- A family's shades follow its main colour (hue shift and chroma ratio; a `-deep`/`-dark` shade also its lightness shift, a `-soft`/`-line` shade keeps its lightness). Editing a shade directly detaches it; relink returns it.
- Red is one control: `gap` and `wrong` are linked (`wrong` follows `gap` fully) with a Split toggle.
- Hold Space (outside a text field) shows the saved design; ⌘Z undoes; ⌥-click anything on the page opens the families whose colours it paints with, or the Markers section for a status marker.
- Unsaved changes survive a reload (localStorage, dev only) and a small tag says so while the panel is closed; Reset drops them.
- The incomplete line's presets are upright, corner to corner either way (`to bottom right` / `to top right`, which meet the marker's corners whatever its width) and level; an angle slider covers the rest, and Hatched stripes the whole marker.
- The route finds `app/globals.css` beside its own source, not under `process.cwd()`, so a worktree's server started from another checkout never writes that checkout's file.
- The layout imports the tuner inside the development branch, so the production bundle carries none of it.
- Leaderboard medal ribbons keep their own reds (a ribbon, not a mark).

## Acceptance

- [x] ⌥C opens and closes the panel on student, teacher and board pages; production build has no panel and the route 404s
- [x] Dragging a colour slider changes every element painted with that token as it moves; red moves gap and wrong together until Split
- [x] Space held shows the saved design, release shows the proposal
- [x] Pill corners, dot corners, incomplete split angle / hatch and the corner scale change the page live
- [x] Save writes only the changed values into `app/globals.css`; the page is unchanged after the file reloads
- [x] At the saved defaults every marker renders pixel-identical to main
- [x] vitest, eslint, tsc, next build, check:laptop; click-through
- [x] Ticket docs, architecture note, ARCHITECTURE, decision log, future features
