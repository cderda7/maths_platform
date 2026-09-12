# 173 · Typed questions go through the model too; a "Fix" line corrects any draft; figures come with their problem

Route: `/teacher/assignments/create` (and the review step's grid, which now shows what the model read); `POST /api/extract` gains `mode: "fix"`.

## Files touched

| File | What it does |
|---|---|
| `lib/extract.ts` | `ExtractRequest` is now `{ mode: "extract", sources }` or `{ mode: "fix", stem, tex, instruction, source? }` (`parseExtractRequest` reads both; a fix with an empty draft or instruction is 400, a text source is not a picture, `MAX_INSTRUCTION_CHARS` 500). `extractSystem("fix")` is the fix brief: one JSON line, the correction applied and nothing else changed, a line of TeX taken as the expression, the picture read against when given. `extractMessages(request)` builds the fix turn (the draft, the picture, the correction) or the extraction turn as before. |
| `app/api/extract/route.ts` | A fix runs through the same stream with one source (index 0 whatever the model writes); fixture mode answers a fix with `fixtureFix`. |
| `data/extract-fixtures.ts` | `fixtureFix`: a line of TeX replaces the expression; "the A should be B" / "A should be B" / "replace A with B" / "A → B" swaps the first A in the expression, else in the stem; anything else leaves the draft. Deterministic for the click-through; the model reads the instruction for real. |
| `lib/extractClient.ts` | `fixDraft(fix)` posts the fix request and returns the one draft (null when none, `declined` on an error event); `extractSource` unchanged in shape, both through one `request` reader. |
| `lib/crops.ts` | `cropRect` (a normalised box as whole pixels, clamped, never empty), `cropFigure` (the box cut from a bitmap or a rendered page: the full crop as a PNG blob and a ≤ 480 px JPEG data URL), `cropFromImage`. |
| `lib/upload.ts` | `QuestionItem` gains `model` (the model's reading of a typed text, valid while `for` is the text), `reading`, `fixing`, `figure` (`{ id, url }`). `applyRead` lands a reading only if the text is still the same and turns extra drafts (a typed list) into confirmed typed tiles after it; `applyFix` replaces the text with the corrected stem then TeX and clears the model reading; `without` drops a flag; `draftItem` carries a figure. |
| `lib/classroom.ts` | `DraftQuestion` gains `figureId` and `figureUrl`; a typed question's stored `stem`/`tex` are the model's when it has read the text. |
| `app/teacher/assignments/create/QuestionTile.tsx` | The render uses `item.model` when it matches the text, else the shorthand parser. A change made while focused is sent on the way out (Enter or blur, once per change, via `focusText`), a pulsing dot beside the label while it reads. `FixLine` under the textarea on every focused tile but the ghost (placeholder "Fix: e.g. the denominator is 2x", Enter sends, Escape clears, its state dies with the focus); a shimmer over the render while the fix runs. The figure under the question while the tile is not being edited. |
| `app/teacher/assignments/create/CreateAssignment.tsx` | `read(q)`: the text as a text source, deduplicated per tile and text, the reading applied by `applyRead`; not configured or down: the parser's reading stands and one console warning. `fix(q, instruction)`: the stored stem/TeX, the instruction and `sourceFor(q)` (the image itself, or the PDF page drawn at 1.5×) to `fixDraft`, the answer applied by `applyFix`; a failure clears the flag and puts a line in the bar ("Fix needs the model. Not configured." / "Couldn't fix Qn. Try again."). `run` cuts a draft's figure (`figureFor`: from the image, or the PDF page drawn at 2×), keeps the full crop in IndexedDB and the small copy on the tile. `draftOf` stores the model's stem/TeX and the figure; `itemOf` rebuilds the reading from a stored stem/TeX that differ from the parser's. |
| `app/teacher/assignments/create/review/QuestionGrid.tsx`, `DifficultyStep.tsx`, `RecommendationsStep.tsx` | `GridItem` takes `stem`, `tex`, `figureUrl`; the tile renders the stored stem and TeX (through `draftText`) rather than re-parsing `text`, and shows the figure. |
| `lib/extract.test.ts`, `lib/upload.test.ts`, `lib/extractClient.test.ts`, `lib/crops.test.ts` | The fix request's validation, the fix brief's rules, the fix turn's blocks, `fixtureFix`'s three rules; `applyRead` (lands, dropped when the text moved, extras as tiles, no drafts), `applyFix`; `fixDraft` against a fake fetch; `cropRect` on the manifest's box and at the edges. 512 tests. |

## How it connects

```
 typing ── the shorthand parser's preview at once ── Enter / blur with a change ──▶ read(q) ── POST /api/extract { mode: "extract", sources: [text] }
        ◀── q.model = { for: text, stem, tex } ── the render and draftOf use it while the text is unchanged; extra drafts → tiles after it
        (not configured: the parser's reading stands, one console warning, nothing on screen)

 a focused tile's Fix line ── Enter ──▶ fix(q, instruction) ── POST /api/extract { mode: "fix", stem, tex, instruction, source?: the image / the PDF page at 1.5× }
        ◀── one draft ── applyFix: text = "stem\ntex", model cleared, unconfirmed stays unconfirmed, typed stays confirmed
        (a failure: the flag off, the bar says "Fix needs the model. Not configured." or "Couldn't fix Q16. Try again.")

 a draft with a figure box ── figureFor(box): cropFromImage(blob) · renderPage(doc, page, 2×) → cropFigure ──▶ putSource(full PNG) → q.figure = { id, url } ──▶ <img data-figure> under the question (not while editing)
        ──▶ draftOf: figureId / figureUrl on the stored question ──▶ the review grid shows it too
```

Was: a typed line's only reading was the shorthand parser's; a wrong extraction could only be retyped; a figure the model boxed was carried as a box and shown nowhere.

## Verified by

vitest (512), eslint, tsc, `next build`; `fix173.mjs` (session `28d378ac-…`'s scratchpad, app on 3314 / CDP 9614), 25 checks in fixture mode at 1400×1000: "half of x squared plus 3" typed into the ghost shows the parser's preview (a bare 3) at once, a reading dot on blur, then ½x² + 3 with no tint, the stem empty and the textarea still the teacher's words; the shorthand line sent on Enter lands equal to the parser's; a changed text returns to the parser's preview until the next blur, then reads again; a pasted three-line list is three confirmed typed tiles; the Fix line on the uploaded one-problem tile with "the 6 should be 8" shows the shimmer then x² + 5x + 8 = 0, still unconfirmed, the line cleared, the textarea the corrected stem then TeX, Escape clears a typed-but-unsent line; a line of TeX as the Fix on a typed tile replaces its expression and it stays confirmed; the worksheet's graph question alone gets a figure shown under the question, its crop the manifest's box on the image to the pixel (220 × 150); the PDF's figures on 5 · p. 2 and 8 · p. 3 only, the page-2 crop 330 × 224 from the page drawn at 2× (A4 1190 × 1684); the stored draft carries the model's stem and TeX with the teacher's text and three figures with ids and small copies; the review grid shows the three figures; a reload keeps the figures and the fixed TeX. Plain mode (no key, no flag), 4 checks: the typed line keeps the parser's reading with no dot, no model and no note; a Fix says "Fix needs the model. Not configured." in the bar and leaves the tile. Screenshots `173-typed.png`, `173-fixed.png`, `173-figure.png`, `173-figure-tile.png`, `173-figure-focused.png`, `173-pdf-figure.png`, `173-review.png` read by eye (the focused figure tile's sliver is what led to hiding the figure while editing).
