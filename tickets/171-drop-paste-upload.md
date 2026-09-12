# 171: Drop, paste or upload a picture of a problem; drafts stream into unconfirmed tiles

**What to build:** On the create screen the whole tile grid is a drop target, the ghost tile reads "Type a question, or drop a picture" with an "Upload" link that opens Finder, and ⌘V pastes a screenshot. Each dropped image goes to the extraction route (ticket 170) and its drafts stream in as tinted, unconfirmed tiles with keep and discard controls; the pinned bar gains "Add N" and "Discard" while Continue stays live. Images only in this ticket; PDFs are ticket 172.

**Blocked by:** 170.

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "a teacher can take a screenshot elsewhere & drag & drop to the box to upload. so, in addition to 'type a question', have a prompt 'upload a picture of a problem to upload'. (also a traditional click, upload via finder setting)."

The interview settled: the grid is the drop target and the ghost tile carries the prompt (Q14); drafts land inline as unconfirmed tiles rather than on a separate review screen, and one action confirms them all (Q4); Continue is never gated on confirming them (Q15, the standing no-confirm-gates rule); drafts stream in with a shimmer holding the place (Q16); a screenshot of four questions gives four drafts (Q2); ⌘V is a route in (Q7); with no key the drop still works and says the model is not configured (Q22); sources stay in the browser (Q12).

## Solution

- **Drop target.** `dragenter`/`dragover`/`dragleave`/`drop` on the grid's wrapper in `CreateAssignment.tsx`; while a file is over it an inset overlay (dashed `standout-line` border, "Drop to add questions" centred) over the grid, the tiles beneath unchanged: assert before and after geometry, nothing in the grid moves. A hidden `<input type="file" multiple accept="image/*">` opened by the ghost tile's "Upload" link (a real link-styled button inside the ghost tile, under the placeholder). `paste` on the editor: clipboard image files go the same way as a drop; multi-line text keeps the existing `splitPaste` into tiles.
- **Caps per drop.** Twenty images, ten MB each; extras are not added and the bar says so ("Twenty at a time; 3 not added"). Non-image files are named in the same note ("worksheet.pdf: not yet"; ticket 172 lifts this).
- **Sources.** `lib/sources.ts`: IndexedDB (`edexia-sources`, one store, key an id, value the Blob plus name and mime). A draft carries `sourceId` and `thumb` (a small data URL, at most 160 px on the long side) so the tile's thumbnail needs no async read; the Blob is kept for figure crops and Fix (ticket 173). LocalStorage cannot hold five ten-MB files, so the classroom store's draft holds references only (decision log).
- **Client.** `lib/extractClient.ts`: `extract(sources, onEvent, signal)` posts to the route, reads the NDJSON stream with `parseExtractLine` from ticket 170, and dispatches per line. Files in one drop go in one request each (parallel), each reserving its group position in the grid in drop order.
- **Tiles.** `DraftQuestion` gains `origin: "typed" | "upload"`, `confirmed: boolean`, `sourceId?`, `page?`, `label?`, `thumb?`. A shimmer tile per file at the end of the grid while its request runs; each draft becomes a tile inserted at its file's group position, `data-unconfirmed`, tinted `standout-soft` with a `standout-line` border, the source thumbnail 40 px in the top-right corner, keep (✓) and discard (×) controls in the tile's corner on hover and focus. An uploaded tile's text is the model's TeX (Q18); `lib/mathInput.ts` passes a line through untouched when it is already TeX (a backslash command or a brace group), so editing the TeX directly re-renders.
- **The bar.** While unconfirmed tiles exist: "Add 6" (confirms all) and "Discard 6" beside Continue, with the caps note when there is one. Continue stays enabled and confirms everything on the way through. When none are unconfirmed the bar is as today.
- **Failures.** 503 `not-configured`: the shimmer tile becomes a message tile "Upload needs the model. Not configured." with a dismiss. `busy`/`unavailable`: "Couldn't read this. Try again" with a retry that re-posts the same source. A stream that ends with no draft: "No questions found in screenshot.png".
- **Tests.** The reducer for unconfirmed drafts (insert at group position, keep, discard, add all, continue confirms), the cap logic, the TeX pass-through in `mathInput`, `extractClient` against a fake stream.
- **Docs.** This ticket, `architecture/171.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [ ] `/teacher/assignments/create` in fixture mode: the ghost tile reads "Type a question, or drop a picture" with Upload beneath; dragging a file over shows the overlay with no tile moving; dropping `one-problem.png` shows a shimmer tile then one tinted tile with the thumbnail; `worksheet.png` gives four tiles in reading order; Upload via the file input does the same
- [ ] discard removes one tile; "Add 4" clears the tint on the rest; Continue with unconfirmed tiles present carries them all to the review step confirmed
- [ ] a 21-image drop adds twenty and the bar names the one left out; a ten-MB-plus file is refused by name
- [ ] a pasted screenshot (synthetic clipboard event with a file) goes through the same path; pasted text still splits into tiles
- [ ] with no key and no flag: the message tile with "Not configured" and a dismiss; nothing else on the screen changes
- [ ] editing an uploaded tile's TeX re-renders it; typed tiles unchanged
- [ ] vitest, eslint, tsc, `next build`, headless click-through (`upload171.mjs`) at 1400×1000 and 1280×800
