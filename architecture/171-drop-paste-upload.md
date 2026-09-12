# 171 · Drop, paste or upload a picture of a problem; drafts stream into unconfirmed tiles

Route: `/teacher/assignments/create` (the create screen), in front of `POST /api/extract` (ticket 170).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/assignments/create/CreateAssignment.tsx` | The editor's list is now `Item[]` (`lib/upload`): question tiles, a pending marker per file being read, a message tile per file that failed. The grid's wrapper is the drop target (`data-dropzone`; an overlay "Drop to add questions" while a file is dragged over, absolutely placed so no tile moves); a document `paste` listener takes clipboard images; a hidden file input (`data-file-input`, images only) is opened by the ghost's Upload link. `addFiles` partitions a drop, stores each accepted file in IndexedDB with a thumbnail, inserts a marker per file before the ghost in drop order, then `run`s them in parallel: each draft the route streams is inserted before its file's marker as an unconfirmed tile; the marker goes at the end, or becomes a message tile (`failureMessage`) with Try again where it could help. `edit` (the teacher's hand) clears the undo line and the drop note; `patch` (a file arriving) leaves them. The bar gains "Discard N" and "Add N" (the `sky` variant) beside Continue while any tile is unconfirmed, plus the drop note in a paper pill; Continue stays live and confirms everything (`confirmAll`) on the way through. `draftOf` keeps an uploaded question's provenance (`uploaded`, `confirmed`, `sourceId`, `name`, `thumb`, `page`, `label`) in the classroom store and `itemOf` reads it back, so a reload keeps the tint and the thumbnails. |
| `app/teacher/assignments/create/QuestionTile.tsx` | Takes the `QuestionItem` rather than its text. The ghost's placeholder is "Type a question, or drop a picture" (the textarea's while focused, the view's while not) with an Upload link under it while empty (its mousedown swallowed so the click does not blur the tile away from under it). An unconfirmed tile is tinted `standout-soft` with a `standout-line` border, a ✓ (`data-keep`) and a × (discard) always showing; an uploaded tile carries its thumbnail 40 px bottom-right (`data-thumb`, titled with the file name) and, when the sheet printed a number, that label in small standout type beside the tile label (`data-source-label`, "4(a) · p. 2" with a page). A paste with files in it is left to the screen. |
| `app/teacher/assignments/create/UploadTiles.tsx` | `PendingTile`: the next label muted, three shimmer lines the shape of a question, "Reading name…", the thumbnail. `MessageTile`: the failure's words, Try again when offered, Dismiss. Neither lifts for a drag (`useReorder` ignores `[data-pending], [data-message]`). |
| `lib/upload.ts` | Pure: `partitionDrop` (images up to twenty per drop, ten MB each; PDFs "not yet" until ticket 172; the rest unsupported; a refused file never refuses the drop), `dropNote` (the bar's words), the `Item` union with `isQuestion`/`isUnconfirmed`, `insertBefore`/`updateQuestion`/`replaceItem`/`removeItem`, `confirmAll`/`discardUnconfirmed`/`unconfirmedCount`, `draftItem` (a streamed draft as an unconfirmed tile, text = `draftText`), `failureMessage`/`messageItem`/`pendingItem`. |
| `lib/sources.ts` | The browser's store of dropped files: IndexedDB (`edexia-sources`), a Map where there is none (tests, the server); `putSource`/`getSource`/`deleteSource`; `thumbOf` draws a 160 px JPEG data URL with `createImageBitmap` and a canvas, `thumbSize` the pure scaling. |
| `lib/extractClient.ts` | `fileToSource` (a blob as a base64 image source, `bytesToBase64` in chunks), `extractSource` (one source posted, the route's events yielded as they arrive; a non-2xx answer is an `ExtractError` with the route's failure, no answer `network`, a streamed `error` `declined`). |
| `lib/mathInput.ts` | Two additions the uploaded tile's text needs: a run between dollars is maths by declaration (`segmentText`, an explicit inline segment kept as written, never taken as the centred expression; the whitespace around it kept), and a line that is already TeX (`isTex`: a `\command` or a brace group) passes through `toTex` untouched. `draftText(stem, tex)` is the tile's text for a question that arrived as a stem and an expression: the stem, a newline, the TeX; a prose-only stem ends in a newline so its last word is never read as the expression. |
| `lib/classroom.ts` | `DraftQuestion` carries the provenance fields above, all optional; a typed question stores none. |
| `lib/upload.test.ts`, `lib/sources.test.ts`, `lib/extractClient.test.ts`, `lib/mathInput.test.ts` | 21 new tests: the partition and every reason, the note's wording, the list operations, the unconfirmed bookkeeping, `draftItem`, every failure's words and retry, the marker round trip; the store's stand-in and the thumbnail scaling; the client against a fake fetch (events, the failure statuses, network, abort); the dollar runs, the TeX pass-through, `draftText` and its round trip through `parseQuestion`. |

## How it connects

```
 a screenshot ── drag over the grid ──▶ overlay (nothing moves) ── drop ─┐
 ⌘V with an image on the clipboard ── document paste ────────────────────┤
 the ghost's Upload link ── hidden <input type=file multiple> ────────────┘
                                       │ File[]
                                       ▼
 CreateAssignment.addFiles ── partitionDrop ──▶ accepted (≤ 20 images, ≤ 10 MB) · left ──▶ dropNote ──▶ the bar's pill
        │ per accepted file: putSource (IndexedDB) · thumbOf (160 px JPEG) · a PendingItem inserted before the ghost, in drop order
        ▼
 run(marker, blob)  ── fileToSource ──▶ extractSource ── POST /api/extract {sources:[image]} ──▶ readExtractEvents
        │ draft ──▶ draftItem ──▶ insertBefore(marker)  → an unconfirmed QuestionItem: text = "stem\ntex", uploaded, confirmed:false, sourceId, thumb, page?, label?
        │ done  ──▶ removeItem(marker)   (or messageItem "No questions found in …" when nothing came)
        │ 503 / 429 / 502 / network / error ──▶ messageItem: "Upload needs the model. Not configured." · "Couldn't read …" + Try again · "The model declined …"
        ▼
 the grid  [Q1 … Q10 typed] [Q11 unconfirmed ✓ ×] [Q12 unconfirmed ✓ ×] [Q13 ▒ pending "Reading sheet.png…"] [Q14 ghost: "Type a question, or drop a picture" · Upload]
 the bar   (note pill)  [Discard 2]  [Add 2]  [Continue]      ← Continue never gated: it confirms all and goes to the review step
        │ keep ✓ → confirmed · × → removed (undo line) · Add N → confirmAll · Discard N → discardUnconfirmed
        ▼
 draftOf ──▶ classroom.draft.questions (DraftQuestion + uploaded/confirmed/sourceId/name/thumb/page/label) ──▶ the review step's grid (parseQuestion reads "stem\ntex" back)
```

The tile's text contract: a typed tile holds the teacher's shorthand as before; an uploaded tile holds the model's stem on one line and its TeX on the next, which `parseQuestion`'s newline form reads back, `isTex` keeping the TeX as written and `$…$` in the stem staying inline. Editing either line re-renders like any typed tile.

Was: the grid took typed text only; a screenshot had nowhere to go; a PDF still has nowhere to go until ticket 172 (its name is in the bar's note as "not yet").

## Verified by

vitest (496), eslint, tsc, `next build`; `upload171.mjs` (session `28d378ac-…`'s scratchpad, app on 3312 / CDP 9612, `cdp.mjs` beside it), 36 checks in fixture mode at 1400×1000: the seeded ten and the ghost; the ghost's placeholder and Upload link focused (on load) and blurred; a file dragged over shows the overlay with every tile's rect unchanged and hides on leave; `one-problem.png` dropped → a pending tile named for the file before the ghost → one tinted tile with thumbnail, ✓ and ×, reading the fixture's stem and expression, the bar "Discard 1 · Add 1 · Continue" live; `worksheet.png` → four more in order with sheet labels 1–4, the graph question third, the bar counting five; × discards one (the undo line offers it), ✓ keeps one, "Add 3" clears every tint and the bar is Continue alone; a 21-image drop reads twenty ("Twenty at a time; 1 not added"), the unknown files as "No fixture for …" tiles, "Discard 20" removes them; an 11 MB PNG, a PDF and a text file are named in the note and nothing is added; ⌘V with an image reads it (thumbnail titled clip.png) and pasted text still splits into tiles; the file input reads a file and the Upload link clicks it; an uploaded tile's textarea holds "Solve for x.\nx^2 + 5x + 6 = 0" and editing the TeX re-renders; Continue with one unconfirmed lands on the review step with all six uploaded questions stored confirmed with source ids and thumbnails, the review grid showing eighteen; a reload keeps them; at 1280×800 the bar with Add / Discard sits inside the window. Plain mode (no key, no flag), 7 checks: the drop yields the "Upload needs the model. Not configured." tile with Dismiss and no Try again, and Dismiss removes it. Screenshots `171-ghost.png`, `171-overlay.png`, `171-one.png`, `171-worksheet.png`, `171-added.png`, `171-note.png`, `171-review.png`, `171-1280.png`, `171-not-configured.png` read by eye.
