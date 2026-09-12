# 173: Typed questions go through the model too; a "Fix" line corrects any draft; figures come with their problem

**What to build:** Three things that share the extraction route. A typed tile keeps the shorthand parser's instant preview and, on Enter or blur, sends its text through the route so plain English ("half of x squared plus 3"), calculator shorthand and TeX all come back as the same clean stem and TeX, confirmed at once. Every tile gains a one-line "Fix" field in its focused state that takes a plain-language correction or raw TeX and replaces the draft with the model's corrected one, the source crop sent along when there is one. A draft whose event carries a figure box gets the region cropped from its source (the image, or the PDF page drawn by `pdfjs-dist`) and shown under the question in the tile.

**Blocked by:** 172.

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "the type a question doesn't really work. like i have it rn as needing to type in python, but that won't work in practice."

The interview settled: typed input is plain English, shorthand or TeX auto-detected with a live preview (Q3); the parser stays as the instant preview and the model's TeX replaces it on Enter or blur (Q9, Q17); typed tiles are confirmed at once since the teacher wrote them (Q17); a bad extraction is fixed by editing the TeX or by a plain-language instruction, not by cropping (Q5); the Fix sees the source crop when one exists (Q28); a figure in a screenshot is kept as a crop rather than dropped silently (Q11).

## Solution

- **Typed through the model.** `QuestionTile` marks a typed tile `pending` when its text changes; on Enter or blur the text goes as a `{ kind: "text" }` source and the first draft back replaces the tile's `stem`/`tex` (the `text` stays the teacher's own words, so re-editing starts from what they typed). Extra drafts from one tile (a typed list) become new confirmed tiles after it. No tint at any point. Not configured, busy or unavailable: the parser's TeX simply stands, with no message, since typing worked before the model did; the failure is logged to the console once.
- **Fix.** The focused state of every tile shows one line under the textarea, placeholder "Fix: e.g. the denominator is 2x". Enter sends `{ mode: "fix", stem, tex, instruction, source? }` to the route (the route gains `mode`, the prompt a fix variant that returns exactly one draft), `source` the crop of the draft's own region when the draft has a source (the box the model returned for the problem, or the whole page when it returned none). The tile shows a shimmer over its render until the draft arrives, then the new stem and TeX; an uploaded tile stays unconfirmed until kept as before, a typed tile stays confirmed. Escape clears the field.
- **Figures.** A draft event's `figure` box is cropped from the source at full resolution (`lib/crops.ts`: image → canvas → PNG blob; PDF page via `renderPage` at scale 2) and stored in IndexedDB as its own source; the draft carries `figureId` and a small data URL for the tile. The tile shows the figure under the question, scaled to fit the tile's width below the text (the tile is a fixed square and clips, per `ASSUMPTIONS.md`). Bank problems' `figure?: FigureId` is unchanged; a draft figure never reaches a student (Create is a wall, `ASSUMPTIONS.md`).
- **Route.** `mode: "extract" | "fix"` on the request; `extractSystem("fix")` states: one draft, apply the instruction, change nothing else. Fixture mode matches a fix by its exact instruction string.
- **Tests.** The pending/confirmed transitions for typed tiles, the list case, the fix reducer, the crop geometry (a normalised box on a known image size gives the expected pixel rect), the prompt's fix rules.
- **Docs.** This ticket, `architecture/173.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [ ] in fixture mode, typing "half of x squared plus 3" shows the parser's preview at once and, on blur, the fixture's TeX (`\tfrac{1}{2}x^2 + 3`) with no tint; typing `x**2 + 5x + 6 = 0` ends with the same TeX as before this ticket; a pasted three-line list ends as three confirmed tiles
- [ ] with no key and no flag, a typed tile keeps the parser's TeX and shows no message
- [ ] Fix "the 6 should be 8" on the one-problem tile shows the shimmer then the corrected TeX, the tile still unconfirmed; the same on a typed tile leaves it confirmed; Escape clears the field
- [ ] the worksheet fixture's axes problem shows its figure crop under the question at the expected pixel rect; the PDF fixture's figure crops from the drawn page
- [ ] vitest, eslint, tsc, `next build`, headless click-through (`fix173.mjs`) at 1400×1000 and 1280×800
